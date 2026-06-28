# speaking 模块（L2）

## 目的

口语陪练 —— 用户选择对话场景（standup/code review/技术讨论/面试等），AI 扮演角色，
通过 Web Speech API 进行语音对话（识别 + 合成），多轮交互后生成反馈报告。

## 父文档

[`/src/CLAUDE.md`](../CLAUDE.md) → [`/CLAUDE.md`](../../CLAUDE.md)

## 入口点

- **路由**：`/speaking`
- **组件**：`SpeakingPage`

## 公共 API（导出给上层）

- `useSpeakingStore` —— Zustand store，提供：
  - `sessions: Session[]` —— 对话历史
  - `currentSession: Session | null` —— 当前会话
  - `currentSceneId: string | null` —— 当前场景 ID（防止组件状态丢失）
  - `startSession(...)` —— 开始新会话
  - `addTurn(who, text)` —— 添加一轮对话
  - `endSession(feedback)` —— 结束会话并保存反馈
  - `cancelSession()` —— 放弃当前会话
- `SCENES` —— 内置场景库（8 个）
- `checkSupport()` —— 检查浏览器是否支持 Web Speech API
- `startListening()` —— 语音识别
- `speak(text)` —— 朗读 AI 回复

## 文件索引

- `types.ts` —— 类型定义（`Scene`、`Turn`、`Session`、`FeedbackReport`）
- `store.ts` —— Zustand 状态管理 + 持久化
- `scenes.ts` —— 内置场景库（standup/code review/面试/闲聊等）
- `speech.ts` —— Web Speech API 封装（SpeechRecognition / SpeechSynthesis）
- `conversation.ts` —— AI 对话管理（维护上下文、生成反馈）
- `SpeakingPage.tsx` —— 主页面（场景选择 / 对话界面 / 历史记录）

## 依赖

- **内部**：`../../lib/claude`（AI 调用）
- **外部**：`zustand`、`zustand/middleware/persist`、浏览器 Web Speech API

## 浏览器兼容性

- **SpeechRecognition**：Chrome/Edge 支持最好，Safari 部分支持
- **SpeechSynthesis**：主流浏览器都支持

入口页会检测支持度并提示用户。

## [PROTOCOL]

- 修改 `FeedbackReport` 结构 → 同步 `types.ts` 与 `conversation.ts`
- 新增场景 → 更新 `scenes.ts`
- 修改对话策略或反馈 prompt → 更新 `conversation.ts`
- 修改语音参数 → 更新 `speech.ts`
