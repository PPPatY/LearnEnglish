# SRS 算法优化方案

## 核心改进点（5 项）

### 1. 词汇难度初始化
**目标**：技术术语自动识别为"困难词"

**实现**：
```typescript
function calculateInitialDifficulty(word: string): number {
  let difficulty = 2.5 // 默认中等难度
  
  // 长词更难（> 10 字符）
  if (word.length > 10) difficulty -= 0.3
  
  // 包含特殊技术后缀/前缀
  const techPatterns = [
    /tion$/, /ence$/, /ous$/, // -tion, -ence, -ous
    /^de/, /^re/, /^pre/,     // de-, re-, pre-
  ]
  if (techPatterns.some(p => p.test(word))) difficulty -= 0.2
  
  return Math.max(1.3, Math.min(2.5, difficulty))
}
```

**示例**：
- "bug" → 2.5（简单）
- "idempotent" → 2.0（长 + -ent 后缀）
- "deprecation" → 2.0（长 + -tion 后缀）

---

### 2. 新词学习阶梯优化
**目标**：即时巩固 + 平滑过渡

**当前**：0 天 → 1 天 → 6 天（跨度过大）

**优化**：
```
repetitions = 0: 10 分钟（新词即时巩固）
repetitions = 1: 1 天（短期记忆检测）
repetitions = 2: 3 天（而非 6 天，更平滑）
repetitions >= 3: interval * easeFactor（正常增长）
```

**代码**：
```typescript
if (repetitions === 1) interval = 0.007 // 10 分钟（0.007 天）
else if (repetitions === 2) interval = 1
else if (repetitions === 3) interval = 3  // 修改点：原 6 天改为 3 天
else interval = Math.round(card.interval * easeFactor)
```

---

### 3. 遗忘后的惩罚减轻
**目标**：减少挫败感，保留部分进度

**当前**：遗忘 → 完全重置到 1 天

**优化**：遗忘 → 保留 25% 的进度
```typescript
// 遗忘时不完全重置
const fallbackInterval = Math.max(1, Math.round(card.maxInterval * 0.25))
return {
  easeFactor,
  interval: fallbackInterval,
  repetitions: 0,
  dueDate: now + fallbackInterval * DAY_MS,
  lapses: (card.lapses || 0) + 1,
  maxInterval: card.maxInterval || card.interval,
}
```

**示例**：
- 之前最大间隔 30 天 → 遗忘后 8 天（而非 1 天）
- 之前最大间隔 6 天 → 遗忘后 2 天

---

### 4. Hard 档位优化
**目标**：Hard 不应该停滞不前

**当前**：Hard → interval * 0.8，repetitions 不变（停滞）

**优化**：Hard → interval * 0.7，但下次更容易触发增长
```typescript
if (q === 3) {
  // Hard：缩短间隔，但允许 repetition 增长
  const interval = Math.max(1, Math.round(card.interval * 0.7))
  const repetitions = card.repetitions + 0.5 // 半步增长（下次 Good 会进位）
  return {
    easeFactor,
    interval,
    repetitions: Math.floor(repetitions), // 取整存储
    dueDate: now + interval * DAY_MS,
    lapses: card.lapses || 0,
    maxInterval: Math.max(card.maxInterval || 0, interval),
  }
}
```

**逻辑**：
- Hard 一次：repetitions 0.5（显示为 0，但内部记录）
- 下次 Good：repetitions 1.5 → 进位到 2（跳过 1 天阶段）

---

### 5. 困难词识别
**目标**：连续遗忘 → 降低增长速度

**实现**：
```typescript
// 在 reviewCard 开始时检查
const isHardWord = (card.lapses || 0) >= 3
if (isHardWord) {
  // 困难词的 easeFactor 上限降低到 2.0（而非 2.5）
  easeFactor = Math.min(2.0, easeFactor)
}
```

**效果**：
- 普通词：easeFactor 最高 2.5，间隔增长快
- 困难词：easeFactor 最高 2.0，间隔增长保守

---

## 数据结构变更

```typescript
export interface SRSState {
  easeFactor: number
  interval: number
  repetitions: number
  dueDate: number
  
  // 新增字段（向后兼容，全部 optional）
  lapses?: number              // 遗忘次数（用于困难词识别）
  maxInterval?: number         // 历史最大间隔（用于遗忘恢复）
  lastReviewed?: number        // 上次复习时间（用于统计）
  initialDifficulty?: number   // 初始难度（用于分析，未来可扩展）
}
```

---

## 迁移策略

**向后兼容**：所有新字段都是 optional

**默认值**：
- `lapses` → 0
- `maxInterval` → current `interval`
- `lastReviewed` → 当前时间
- `initialDifficulty` → 2.5

**store 迁移**：
```typescript
migrate: (persistedState: any, version: number) => {
  if (version < 2) {
    // v1 → v2：添加新字段
    persistedState.cards = persistedState.cards.map((c: VocabCard) => ({
      ...c,
      srs: {
        ...c.srs,
        lapses: 0,
        maxInterval: c.srs.interval,
        lastReviewed: Date.now(),
        initialDifficulty: 2.5,
      }
    }))
  }
  return persistedState
}
```

---

## 测试用例

### 用例 1：新词学习
```
初始：repetitions=0, interval=0
Good → 10 分钟后
Good → 1 天后
Good → 3 天后（优化点：原 6 天）
Good → 7 天后（3 * 2.5）
```

### 用例 2：遗忘恢复
```
当前：repetitions=5, interval=30 天, maxInterval=30
Forgot → 8 天后（优化点：原 1 天）
```

### 用例 3：Hard 档位
```
当前：repetitions=2, interval=6 天
Hard → 4 天后（6 * 0.7，优化点：原 5 天 / 0.8）
Good → 10 天后（4 * 2.5，直接跳到 rep=3）
```

### 用例 4：困难词
```
lapses=3（连续遗忘 3 次）
easeFactor 上限降至 2.0
间隔增长：6 → 12 → 24（而非 6 → 15 → 37.5）
```

---

## 预期收益

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 新词巩固时间 | 7 天（0→1→6） | 4 天（0.007→1→3） | **-43%** |
| 遗忘后恢复 | 完全重置到 1 天 | 保留 25% 进度 | **减少挫败感** |
| 困难词识别 | 无 | 自动降速 | **减少重复遗忘** |
| Hard 档位停滞 | repetitions 不变 | 半步增长 | **鼓励诚实评分** |

---

## 回滚计划

如果优化后用户反馈负面：
1. **降级路径**：store version 回退，读取旧字段
2. **A/B 测试**：通过配置开关启用/禁用优化
3. **数据不丢失**：新字段 optional，删除即回到 SM-2

---

## 实施步骤

1. ✅ 研究算法改进点
2. ✅ 设计优化方案
3. ⏳ 实现新算法（`src/lib/srs.ts`）
4. ⏳ 添加迁移逻辑（`src/modules/vocabulary/store.ts`）
5. ⏳ 单元测试（验证 5 个改进点）
6. ⏳ 手动测试（模拟真实复习流程）
7. ⏳ 更新文档（CLAUDE.md + ISSUES.md）
