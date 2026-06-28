# writing 模块（L2）

## 目的

写作批改 —— 用户选择任务模板（PR 描述/邮件/issue 等），写英文，AI 返回结构化批改：
语法错误、地道度建议、完整改写版本。帮助工程师在真实工作场景中提升技术写作能力。

## 父文档

[`/src/CLAUDE.md`](../CLAUDE.md) → [`/CLAUDE.md`](../../CLAUDE.md)

## 入口点

- **路由**：`/writing`
- **组件**：`WritingPage`

## 公共 API（导出给上层）

- `useWritingStore` —— Zustand store，提供：
  - `sessions: Session[]` —— 批改历史
  - `currentTaskId: string | null` —— 当前选中的任务
  - `setCurrentTask(taskId)` —— 设置当前任务
  - `saveSession(...)` —— 保存一次批改会话
  - `removeSession(id)` —— 删除历史记录
- `WRITING_TASKS` —— 内置任务模板（8 个）
- `correctWriting(userText, taskContext?)` —— 调用 AI 批改

## 文件索引

- `types.ts` —— 类型定义（`WritingTask`、`Feedback`、`Session`）
- `store.ts` —— Zustand 状态管理 + 持久化
- `taskTemplates.ts` —— 内置任务模板库（PR/邮件/issue/README/函数注释等）
- `prompt.ts` —— AI prompt 封装，调用 `chatJSON<Feedback>()`
- `WritingPage.tsx` —— 主页面（任务列表 / 写作编辑器 / 批改结果 / 历史记录）

## 依赖

- **内部**：`../../lib/claude`（AI 调用）
- **外部**：`zustand`、`zustand/middleware/persist`

## [PROTOCOL]

- 修改 `Feedback` 结构 → 同步 `types.ts` 与 `prompt.ts` 的 AI prompt
- 新增任务模板 → 更新 `taskTemplates.ts`
- 修改批改策略 → 更新 `prompt.ts`
