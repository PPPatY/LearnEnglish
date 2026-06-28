# 修复总结报告

**日期**: 2026-06-25  
**修复状态**: ✅ 3 个严重问题全部修复完成

---

## 修复清单

### ✅ 问题 #1: SpeakingPage selectedScene 状态丢失

**根因**: `selectedScene` 存储在组件 `useState` 中，异步操作期间组件重渲染可能导致状态丢失，使得第二次录音时无法找到场景信息。

**修复方案**:
1. 在 `useSpeakingStore` 中新增 `currentSceneId: string | null` 字段
2. 修改 `startSession` 同时保存 `currentSceneId`
3. 修改 `endSession` 和 `cancelSession` 清空 `currentSceneId`
4. 修改 `SpeakingPage` 组件：
   - 移除 `selectedScene` 本地状态
   - 从 store 读取 `currentSceneId` 并从 `SCENES` 恢复场景对象
   - 简化 `handleUserSpeak` 逻辑，直接使用 `currentScene`

**受影响文件**:
- `src/modules/speaking/store.ts` (添加 `currentSceneId`)
- `src/modules/speaking/SpeakingPage.tsx` (移除本地状态，改用 store)

**验证**: TypeScript 编译通过 ✅

---

### ✅ 问题 #2: 语音识别停止逻辑竞态

**根因**: `stop()` 函数中用 `setTimeout` 延迟生成 audioUrl，与 `recognition.onresult` 事件形成竞态，可能导致 promise 被 resolve 两次或丢失录音数据。

**修复方案**:
1. 添加 `isResolved` 标志防止 promise 被多次 resolve
2. 移除 `stop()` 中的 `setTimeout` 逻辑
3. 在 `recognition.onend` 事件中处理用户主动停止的情况
4. 确保 `recognition.stop()` 触发 `onend` 事件来正确结束识别流程

**受影响文件**:
- `src/modules/speaking/speech.ts` (`startListening` 函数)

**验证**: TypeScript 编译通过 ✅

---

### ✅ 问题 #3: 多轮对话上下文格式错误

**根因**: `turns` 数组的第一条是 AI 开场白（`who: 'assistant'`），直接映射到 messages 会导致数组以 `assistant` 开头，违反 Claude API 要求（必须 user 开头，且 user/assistant 交替）。

**修复方案**:
1. 在 `sendMessage()` 中用 `.slice(1)` 跳过第一条开场白
2. 从第二条对话记录开始构造 messages 数组
3. 添加注释说明 `turns[0]` 总是开场白，真正的对话从 `turns[1]` 开始

**受影响文件**:
- `src/modules/speaking/conversation.ts` (`sendMessage` 函数)

**验证**: TypeScript 编译通过 ✅

---

## 代码清理

同时清理了 `SpeakingPage.tsx` 中的调试 console.log 语句：
- 移除 `handleUserSpeak` 中的所有 console.log
- 移除 `handleStopListening` 中的 console.log
- 移除 `handleSpeakTurn` 中的 console.log
- 移除麦克风按钮 onClick 中的 console.log
- 移除 `useEffect` 中打印语音支持检测的 console.log

---

## 测试建议

### 手动测试清单

1. **场景状态持久化**:
   - [ ] 选择场景开始对话
   - [ ] 说第一句话，验证 AI 正常回复
   - [ ] 说第二句话，验证 AI 仍然能正常回复（测试 selectedScene 不丢失）
   - [ ] 说第三、四句话，验证持续正常

2. **语音识别停止**:
   - [ ] 点击麦克风开始录音
   - [ ] 说一句话，等待自动识别结束 → 验证正常
   - [ ] 点击麦克风开始录音
   - [ ] 立即点击停止按钮 → 验证提示"未识别到语音"
   - [ ] 点击麦克风开始录音
   - [ ] 说一句话后立即点击停止 → 验证能识别出部分文本

3. **多轮对话上下文**:
   - [ ] 开始对话（AI 说开场白）
   - [ ] 用户说第一句话 → 验证 API 不报错
   - [ ] 用户说第二、三句话 → 验证上下文正确传递，AI 回复有连贯性
   - [ ] 结束对话，查看反馈报告 → 验证基于完整对话生成

4. **边界情况**:
   - [ ] 拒绝麦克风权限 → 验证错误提示友好
   - [ ] 在不支持语音识别的浏览器（如 Firefox）打开 → 验证警告提示显示
   - [ ] 录音期间网络断开 → 验证错误处理

---

## 后续优化建议（非阻塞）

### P1 优先级
- [ ] 添加 audioUrl 内存回收（`URL.revokeObjectURL()`）
- [ ] 改进 chatJSON 的 JSON 解析鲁棒性
- [ ] 优化语音合成语音选择逻辑（添加超时回退）

### P2 优先级
- [ ] 添加 store 版本迁移逻辑（所有三个模块）
- [ ] 修复首页学习方案链接 404
- [ ] 添加环境变量格式验证

### P3 优先级
- [ ] 移除或控制所有 console.log
- [ ] 改进 TypeScript 类型安全（移除 `any`）
- [ ] 完善深色模式支持或移除 dark: 样式

---

## 文档同步清单

### ✅ 已更新
- [x] `src/modules/speaking/store.ts` 头注释（添加 currentSceneId 说明）
- [x] `src/modules/speaking/conversation.ts` 注释（说明 slice(1) 原因）
- [x] `src/modules/speaking/speech.ts` 注释（说明 onend 处理逻辑）

### 📝 需要同步（未在本次修复中更新）
- [ ] `/CLAUDE.md` - 更新"当前状态"部分，标记口语模块 bug 已修复
- [ ] `src/modules/speaking/CLAUDE.md` - 添加 store 新字段说明
- [ ] `PLAN.md` - 标记阶段 3 严重 bug 已修复

---

## 提交建议

```bash
git add -A
git commit -m "fix(speaking): 修复口语模块三个严重问题

- 修复 selectedScene 状态丢失导致多轮对话失败
- 修复语音识别停止逻辑竞态条件
- 修复多轮对话 API 请求格式错误（跳过 assistant 开场白）
- 清理调试 console.log 语句

Issues: #1, #2, #3
"
```

---

## 验证结果

- ✅ TypeScript 类型检查通过
- ✅ 所有修改文件的 L3 头注释已同步
- ✅ 未引入新的 lint 警告

**总结**: 三个严重问题已全部修复，项目口语模块现在应该能正常工作了！
