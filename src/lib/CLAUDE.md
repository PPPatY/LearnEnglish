# src/lib 模块（L2）

## 目的

提供前端核心工具：AI 调用封装、间隔重复算法（SM-2 改进版 v2）、存储抽象。

## 父文档

[`/CLAUDE.md`](../../CLAUDE.md)

## 公共 API

- **claude.ts**
  - `chat(messages, opts?): Promise<string>` —— 发送多轮对话
  - `chatJSON<T>(messages, opts?): Promise<T>` —— 期望返回结构化 JSON
- **srs.ts** (v2)
  - `initCard(word?, now?): SRSState` —— 初始化新卡片（自动计算词汇难度）
  - `reviewCard(card, grade, now?): SRSState` —— 根据评分更新 SRS 状态（SM-2 改进版）
  - `isDue(card, now?): boolean` —— 是否到期
  - `calculateInitialDifficulty(word): number` —— 计算词汇初始难度（技术词汇识别）

## 文件索引

- `claude.ts` —— 前端 AI 封装，调用 `/api/chat` 代理
- `srs.ts` —— 间隔重复算法（SM-2 改进版 v2，5 项核心优化）
- `storage.ts` —— （预留）localStorage / IndexedDB 统一接口

## SRS v2 改进点

1. **词汇难度初始化**：技术术语自动降低 easeFactor
2. **新词学习阶梯**：10 分钟 → 1 天 → 3 天（平滑过渡）
3. **遗忘后惩罚减轻**：保留 25% 进度（减少挫败感）
4. **Hard 档位优化**：间隔 * 0.7（鼓励诚实评分）
5. **困难词识别**：连续遗忘 3 次 → 限制增长速度

详细文档：`docs/srs-optimization-plan.md`

## 依赖

- **claude.ts** → `server/aiProxy` 端点
- **srs.ts** → 无外部依赖
- **被依赖** → `modules/vocabulary`、`modules/writing`、`modules/speaking`

## [PROTOCOL]

- 修改 `chat()` 请求格式 → 同步 `server/aiProxy.ts`
- 修改 `SRSState` 字段 → 同步 `modules/vocabulary/types.ts` 与 store 迁移逻辑
- 新增工具函数 → 更新本文档的公共 API 部分
- SRS 算法调参 → 更新测试用例 `test-srs-v2.js`
