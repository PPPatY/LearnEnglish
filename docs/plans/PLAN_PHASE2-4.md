# 阶段 2-4 实施计划：写作批改 + 口语陪练 + Dashboard

## 目标

完成剩余三个核心功能，让 LearnEnglish 成为完整可用的学习工具。

## 阶段 2：写作批改模块

### 功能设计

用户选择任务模板 → 写英文 → 提交批改 → AI 返回结构化反馈：
- **语法错误**：拼写、时态、主谓一致等
- **地道度**：中式英语识别、更地道的说法
- **改写建议**：完整改写版本
- **高频错误标记**：可一键加入词汇库

### 任务模板库

**日常工作文档**（主场景）：
- PR 描述（title + body，说明改了什么、为什么、怎么测）
- 技术邮件（进度汇报、方案讨论、问题反馈）
- Issue 回复（bug 报告、feature 请求、讨论）

**代码文档**：
- 函数注释（描述参数、返回值、用途）
- README（项目介绍、安装、使用）
- API 文档（端点说明）

### 实施步骤

1. **类型定义**（`modules/writing/types.ts`）
   - `WritingTask` 任务元数据（id/title/template/instructions）
   - `Feedback` 批改结果（grammar/style/rewrite）

2. **任务库**（`modules/writing/taskTemplates.ts`）
   - 8-10 个任务模板（PR/邮件/issue/README/函数注释等）
   - 每个任务带示例和写作提示

3. **状态管理**（`modules/writing/store.ts`）
   - 历史批改记录
   - 当前任务
   - 持久化到 localStorage

4. **AI Prompt 工程**（`modules/writing/prompt.ts`）
   - 构造批改 prompt（要求返回结构化 JSON）
   - 调用 `chatJSON<Feedback>()`

5. **UI 组件**
   - `WritingPage.tsx` —— 主页面（任务列表 / 写作区 / 批改结果）
   - `TaskSelector.tsx` —— 任务选择器
   - `Editor.tsx` —— 写作输入框
   - `FeedbackDisplay.tsx` —— 批改结果展示（原文 vs 改写、错误高亮）

**验证**：提交一段中式英语，拿到结构化批改 + 改写建议。

---

## 阶段 3：口语陪练模块

### 功能设计

选择场景 → AI 扮演角色开场 → 用户语音输入 → AI 语音回复 → 多轮对话 → 结束后反馈报告。

### 技术栈

- **Web Speech API**：
  - `SpeechRecognition`（语音识别，用户说话转文本）
  - `SpeechSynthesis`（语音合成，AI 回复朗读）
- **浏览器兼容性**：Chrome/Edge 支持最好，Safari 部分支持

### 场景库

**日常工作场景**（主场景）：
- Daily standup（AI 是 Scrum Master，问你昨天做了啥、今天计划、有无阻塞）
- Code review（AI 是 reviewer，问你设计决策、讨论优化）
- 技术讨论（AI 是同事，debate 两种方案优劣）

**技术面试**：
- 算法题讲解（AI 是面试官，让你讲思路）
- 系统设计（AI 追问 trade-off）

**日常交流**：
- Coffee chat（闲聊周末、兴趣）

### 实施步骤

1. **类型定义**（`modules/speaking/types.ts`）
   - `Scene` 场景元数据（id/title/aiRole/systemPrompt）
   - `Turn` 对话轮次（who/text/timestamp）
   - `Session` 会话（scene/turns/feedback）

2. **场景库**（`modules/speaking/scenes.ts`）
   - 6-8 个场景，每个带 system prompt（定义 AI 角色、对话目标）

3. **状态管理**（`modules/speaking/store.ts`）
   - 当前会话
   - 历史会话
   - 持久化

4. **语音封装**（`modules/speaking/speech.ts`）
   - `startListening(): Promise<string>` —— 录音 → 识别 → 返回文本
   - `speak(text: string)` —— 朗读 AI 回复
   - 浏览器兼容性检测

5. **AI 对话管理**（`modules/speaking/conversation.ts`）
   - 维护多轮上下文（system prompt + turns）
   - 调用 `chat(messages)`
   - 结束时生成反馈报告（高频错误、地道说法建议）

6. **UI 组件**
   - `SpeakingPage.tsx` —— 主页面（场景选择 / 对话界面 / 历史记录）
   - `SceneSelector.tsx` —— 场景选择器
   - `Conversation.tsx` —— 对话界面（显示对话历史、录音按钮、AI 回复）
   - `FeedbackReport.tsx` —— 反馈报告（结束后展示）

**验证**：能用语音完成一轮 standup 角色扮演并拿到反馈。

---

## 阶段 4：Dashboard + 学习方案文档

### Dashboard 功能

首页增强，展示：
- 今日任务清单（待复习词卡数 / 今日是否已写作 / 今日是否已口语练习）
- 各模块进度概览（词库数量、批改次数、对话次数）
- 学习时长统计（简单累加）
- 高频错误词 Top 10（从批改/对话反馈中提取）

### 学习方案文档

`docs/learning-plan.md` —— 详细每日 90 分钟结构、方法论：
- 为什么这样安排时间？
- 每模块的使用建议
- 如何坚持、如何调整
- 进阶路线图

### 实施步骤

1. **统计数据收集**
   - 扩展各模块 store，记录使用次数、时长
   - 聚合到全局 `src/store/stats.ts`

2. **Dashboard UI**（`pages/HomePage.tsx` 扩展）
   - 今日任务卡片
   - 进度可视化（简单进度条或数字）
   - 高频错误词列表（可点击跳转词汇库）

3. **学习方案文档**
   - `docs/learning-plan.md` —— markdown 文档
   - 在首页加"查看学习方案"入口

**验证**：首页能看到统计数据，文档可读。

---

## 实施顺序

1. **写作批改**（独立，不依赖其他模块）
2. **口语陪练**（独立，稍复杂因为涉及语音 API）
3. **Dashboard + 文档**（依赖前两个模块的数据）

## 风险控制

- **Web Speech API 兼容性**：在口语模块入口检测浏览器支持，不支持则提示用 Chrome
- **AI 返回格式不稳定**：`chatJSON()` 容错处理，提取失败时提示用户重试
- **语音识别噪音**：提示用户在安静环境使用，或提供文字输入兜底
- **API 成本**：写作批改和口语陪练会频繁调用 AI，建议在 `.env.local` 中改用 `claude-haiku-4-5` 降低成本

## 文档同步（遵循 GEB 规范）

- 新增 `modules/writing/` 和 `modules/speaking/` 各创建 L2 CLAUDE.md
- 所有新建源文件加 L3 头注释
- 完成后更新根 CLAUDE.md 和 README.md
