# LearnEnglish 项目问题汇总

**生成时间**: 2026-06-25  
**最后更新**: 2026-06-28  
**审查范围**: 全代码库静态分析 + 逻辑推理

**修复状态**: ✅ 14/16 已修复 (87.5%)

---

## 🔴 严重问题（阻塞功能）- 3/3 已修复 ✅

### 1. ✅ **SpeakingPage: selectedScene 状态丢失导致 AI 无法回复** [已修复]
**文件**: `src/modules/speaking/SpeakingPage.tsx:62-67`
**根因**: `selectedScene` 是组件内 `useState`，但在异步 `handleUserSpeak()` 执行期间，如果组件重渲染可能丢失。当用户第二次点击录音时，`selectedScene` 可能为 `null`，导致无法调用 `sendMessage()`。
**复现路径**:
1. 选择场景开始对话
2. 说第一句话 → 成功
3. 说第二句话 → 可能失败（如果 React 重渲染导致 `selectedScene` 丢失）

**修复方案**:
- ✅ 在 `useSpeakingStore` 中新增 `currentSceneId: string | null` 字段
- ✅ 从组件中移除 `selectedScene` 本地状态，改用 store 的 `currentSceneId`
- ✅ 组件根据 `currentSceneId` 从 `SCENES` 恢复场景对象

**修复文件**: `src/modules/speaking/store.ts`, `SpeakingPage.tsx`

---

### 2. ✅ **语音识别停止逻辑竞态问题** [已修复]
**文件**: `src/modules/speaking/speech.ts:86-106`
**根因**: `stop()` 函数中用 `setTimeout(200)` 延迟生成 audioUrl，但 `recognition.stop()` 应该会触发 `onresult` 或 `onerror`，这里可能导致 promise 被 resolve 两次，或者用户停止录音时文本为空。
**问题表现**:
- 用户主动停止录音时，可能显示"未识别到语音"
- 录音 blob 可能为空

**修复方案**:
- ✅ 添加 `isResolved` 标志防止 promise 被多次 resolve
- ✅ 依赖 `recognition.onend` 事件处理用户主动停止
- ✅ 移除 `stop()` 中的不确定性 `setTimeout` 逻辑

**修复文件**: `src/modules/speaking/speech.ts`

---

### 3. ✅ **conversation.ts 中多轮对话上下文格式错误** [已修复]
**文件**: `src/modules/speaking/conversation.ts:22-25`
**根因**: `turns` 数组的 `who` 字段是 `'user' | 'assistant'`，但直接映射到 `{ role: t.who, content: t.text }` 时，类型匹配。但如果第一轮是 `assistant`（AI 开场白），messages 数组会以 `assistant` 开头，这违反了 Claude API 的要求（必须 user/assistant 交替，且 user 开头）。
**问题表现**:
- 如果 AI 开场白被传入 messages，会导致 API 返回 400 错误

**修复方案**:
- ✅ 在 `sendMessage()` 中用 `.slice(1)` 跳过第一条 assistant 开场白
- ✅ 添加注释说明 `turns[0]` 总是开场白，真正的对话从 `turns[1]` 开始

**修复文件**: `src/modules/speaking/conversation.ts`

---

## 🟡 中等问题（影响体验）- 4/6 已修复 ✅

### 4. ✅ **语音合成语音选择逻辑可能失败** [已修复]
**文件**: `src/modules/speaking/speech.ts:136-167`
**根因**: `speechSynthesis.onvoiceschanged` 事件可能不会触发（某些浏览器），导致一直用系统默认语音而非优质在线语音。
**修复方案**:
- ✅ 添加 1 秒超时回退机制（用默认语音）
- ✅ 添加 `hasSpoken` 标志防止重复播放
- ✅ 在 `onvoiceschanged` 外部也尝试调用一次

**修复文件**: `src/modules/speaking/speech.ts`

---

### 5. ✅ **写作批改 JSON 解析脆弱** [已修复]
**文件**: `src/lib/claude.ts:45-49`
**根因**: `chatJSON` 用正则 `/\{[\s\S]*\}|\[[\s\S]*\]/` 提取 JSON，但这是贪婪匹配，如果 AI 回复中有多个 JSON 对象（如调试信息 + 实际结果），会提取错误的部分。
**修复方案**:
- ✅ 改进 JSON 提取算法：匹配括号深度而非贪婪正则
- ✅ 添加多策略解析（直接解析 → 提取首个 JSON）
- ✅ 在 prompt 中强制要求 AI 只返回 JSON（`IMPORTANT: Return ONLY a valid JSON object`）

**修复文件**: `src/lib/claude.ts`, `modules/writing/prompt.ts`, `modules/speaking/conversation.ts`

---

### 6. ✅ **词汇 SRS 算法边界条件** [已修复]
**文件**: `src/lib/srs.ts:40-57`
**问题**: 
- 评分为 `hard` (quality=3) 时，虽然不重置进度，但 `easeFactor` 会下降
- 但 `repetitions` 仍然 +1，这可能不符合 SM-2 原版逻辑（hard 应该不增加 repetition）

**修复方案**:
- ✅ `hard` (q=3) 不增加 repetition，重复当前间隔但缩短至 80%
- ✅ 符合 SM-2 算法原理

**修复文件**: `src/lib/srs.ts`

---

### 7. ✅ **首页学习方案链接 404** [已修复]
**文件**: `src/pages/HomePage.tsx:98`
**根因**: 链接指向占位符 GitHub URL。
**修复方案**: 
- ✅ 移除外部链接，改为提示用户查看本地 `docs/learning-plan.md` 文件

**修复文件**: `src/pages/HomePage.tsx`

---

### 8. ✅ **localStorage 持久化无版本迁移逻辑** [已修复]
**文件**: `src/modules/vocabulary/store.ts:77`, `writing/store.ts:52`, `speaking/store.ts:70`
**根因**: Zustand persist 配置了 `version: 1`，但没有 `migrate` 函数。未来修改 store 结构时，旧数据会导致崩溃。
**修复方案**:
- ✅ 为所有三个模块的 store 添加 `migrate` 函数
- ✅ speaking store 升级到 v2（添加 currentSceneId 字段迁移）

**修复文件**: `vocabulary/store.ts`, `writing/store.ts`, `speaking/store.ts`

---

### 9. ✅ **环境变量验证不足** [已修复]
**文件**: `server/aiProxy.ts:48-56`
**根因**: 只检查 `ANTHROPIC_API_KEY` 是否存在，不验证格式。
**修复方案**: 
- ✅ 添加 API key 格式校验（长度 + 字符集验证）
- ✅ 提供更友好的错误提示

**修复文件**: `server/aiProxy.ts`

---

### 10. ✅ **Web Speech API 兼容性警告不完整** [已修复]
**文件**: `src/modules/speaking/SpeakingPage.tsx:188-192`
**根因**: 只检查 `recognition` 支持，但没有检查 `synthesis` 支持。
**修复方案**: 
- ✅ 分别提示"不支持语音识别"和"不支持语音合成"

**修复文件**: `src/modules/speaking/SpeakingPage.tsx`

---

## 🟢 轻微问题（不阻塞，但需优化）- 3/7 已修复

### 11. ✅ **深色模式样式不完整** [已修复]
**文件**: 多个组件（HomePage, VocabularyPage, WritingPage, SpeakingPage, Button, Layout 等）
**根因**: 使用了 `dark:` 前缀，但项目中没有 `<html class="dark">` 的切换逻辑。
**修复方案**: 移除所有 dark 样式类（共清理约 50 处）。
**修复日期**: 2026-06-28

---

### 12. ✅ **Console.log 调试语句未清理** [已修复]
**文件**: `src/modules/speaking/SpeakingPage.tsx`（9 处）
**根因**: 生产代码中残留大量 `console.log`。
**修复方案**: 
- ✅ 已清理 `SpeakingPage.tsx` 中的 9 处 console.log
- ✅ 保留 console.error（用于错误追踪）
**修复日期**: 2026-06-26

---

### 13. ✅ **audioUrl 内存泄漏** [已修复]
**文件**: `src/modules/speaking/speech.ts:68, 98`, `SpeakingPage.tsx:89`
**根因**: 用 `URL.createObjectURL()` 创建录音 URL，但存入 store 后从未调用 `URL.revokeObjectURL()`，长期使用会内存泄漏。
**修复方案**: 
- ✅ 在 `removeSession` 时 revoke 所有 audioUrl
- ✅ 在 `cancelSession` 时清理当前会话的 audioUrl
- ✅ 在组件卸载时清理当前会话的 audioUrl
**修复文件**: `src/modules/speaking/store.ts`, `SpeakingPage.tsx`
**修复日期**: 2026-06-26

---

### 14. ✅ **错误提示不国际化** [已修复]
**文件**: 多个文件的错误消息硬编码中文
**根因**: 如 `speech.ts:34` "浏览器不支持语音识别（请使用 Chrome）"
**修复方案**: 添加注释说明目标用户为中文用户，保持中文错误消息（更友好）。
**修复文件**: `src/modules/speaking/speech.ts`, `SpeakingPage.tsx`
**修复日期**: 2026-06-28

---

### 15. ✅ **TypeScript 类型安全问题** [已修复]
**文件**: `src/modules/speaking/speech.ts`
**根因**: 用了大量 `any` 类型（`recognition: any`, `event: any`）
**修复方案**: 
- ✅ 创建 `src/types/speech.d.ts` 类型声明文件
- ✅ 定义 `SpeechRecognition`、`SpeechRecognitionEvent`、`SpeechRecognitionErrorEvent` 接口
- ✅ 替换所有 `any` 为正确的类型
- ⚠️ store migrate 函数保留 `any`（Zustand 官方推荐，旧数据结构未知）
**修复文件**: `src/types/speech.d.ts`, `src/modules/speaking/speech.ts`
**修复日期**: 2026-06-28

---

### 16. ✅ **词汇 SRS 优化** [已完成]
**文件**: `src/lib/srs.ts`, `src/modules/vocabulary/store.ts`
**根因**: SM-2 算法较基础，可以进一步优化
**优化方案**: SM-2 改进版（5 项核心改进）
- ✅ **词汇难度初始化**：技术术语（长词、特殊后缀）自动降低 easeFactor
- ✅ **新词学习阶梯**：10 分钟 → 1 天 → 3 天（平滑过渡，优化前 0→1→6 天）
- ✅ **遗忘后惩罚减轻**：保留 25% 进度（减少挫败感，优化前完全重置到 1 天）
- ✅ **Hard 档位优化**：间隔 * 0.7（鼓励诚实评分，优化前 * 0.8 且停滞）
- ✅ **困难词识别**：连续遗忘 3 次 → 限制 easeFactor 上限为 2.0
**数据迁移**: v1 → v2，向后兼容，自动补充新字段
**测试**: 7 个测试用例全部通过 ✅
**预期收益**:
- 新词巩固时间：7 天 → 4 天 (-43%)
- 遗忘后恢复：1 天 → 保留 25% 进度
- 困难词自动降速，减少重复遗忘
**修复日期**: 2026-06-28

---

## 📊 统计

- 🔴 严重: 3 个 → ✅ 3 个已修复 (100%)
- 🟡 中等: 6 个 → ✅ 6 个已修复 (100%)
- 🟢 轻微: 7 个 → ✅ 7 个已修复 (100%)
- **总计**: 16 个 → ✅ **16 个已修复 (100%)** 🎉

---

## 🎯 建议修复优先级

1. **P0（立即修复）**: #1, #2, #3
2. **P1（本周修复）**: #4, #5, #6, #13
3. **P2（下个迭代）**: #7, #8, #9, #10, #11
4. **P3（打磨阶段）**: #12, #14, #15
