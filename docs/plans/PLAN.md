# LearnEnglish 实施计划

## 目标

为一名开发工程师打造「学习方案 + Web 工具」结合的英语学习项目，
覆盖口语/听力/技术表达/词汇语法/读写，每天投入约 90 分钟，长期可执行。

## 技术栈

- 前端：React 18 + TypeScript + Vite
- 样式：Tailwind CSS（快速搭 UI，开发者友好）
- AI：Claude API（claude-opus-4-8 / claude-haiku-4-5），经 Vite 中间件代理保护 key
- 存储：localStorage / IndexedDB（MVP 零部署）
- 状态：Zustand（轻量，够用）

## 架构

```
LearnEnglish/
├─ vite.config.ts          # 含 AI 代理中间件
├─ server/
│  └─ aiProxy.ts           # Vite 插件：转发 Claude API 请求，注入 key
├─ src/
│  ├─ main.tsx / App.tsx
│  ├─ lib/
│  │  ├─ claude.ts         # 前端调用代理的封装
│  │  ├─ storage.ts        # localStorage/IndexedDB 封装
│  │  └─ srs.ts            # 间隔重复算法（SM-2 简化版）
│  ├─ modules/
│  │  ├─ speaking/         # 对话陪练
│  │  ├─ writing/          # 写作批改
│  │  └─ vocabulary/       # 词汇 SRS
│  ├─ components/          # 共享 UI
│  └─ data/                # 内置技术词汇库、场景模板
├─ docs/
│  └─ learning-plan.md     # 学习方案（每日结构、方法论）
└─ .env.local             # ANTHROPIC_API_KEY（不入库）
```

## 实施阶段

### 阶段 0：脚手架与基础设施
1. 初始化 Vite + React + TS 项目
2. 接入 Tailwind、Zustand
3. 写 AI 代理中间件（vite.config.ts 插件），从 .env.local 读 key
4. 写 `lib/claude.ts` 封装，验证能调通 Claude API
5. 写 `lib/storage.ts`
6. 搭基础布局：侧边栏导航 + 三个模块入口

**验证**：能跑起来，导航可切换，调一次 AI 返回成功。

### 阶段 1：Vocabulary 词汇 SRS（最独立，先做）
1. `lib/srs.ts`：SM-2 算法（ease/interval/复习时间）
2. 内置技术词汇库（先 ~50 个常用技术词，带例句）
3. 卡片复习 UI：显示词 → 翻面 → 评分（认识/模糊/忘了）
4. 进度持久化到 IndexedDB
5. 「加生词」入口

**验证**：能完整走一轮复习，评分后下次出现时间正确变化。

### 阶段 2：Writing 写作批改
1. 任务库：PR 描述、技术邮件、issue 回复等模板
2. 写作输入区
3. AI 批改：调 Claude，结构化返回（语法错误/地道度/改写建议）
4. 批改结果展示：原文对照 + 高亮 + 建议
5. 错误收集 → 可一键加入词汇库

**验证**：提交一段中式英语，能拿到结构化批改和改写。

### 阶段 3：Speaking 对话陪练
1. 场景库：standup、code review、技术面试、日常闲聊
2. Web Speech API：语音识别（输入）+ 语音合成（AI 回复朗读）
3. 多轮对话：调 Claude 维持角色和上下文
4. 实时/结束反馈：标记表达问题，给地道说法
5. 对话历史保存

**验证**：能用语音和 AI 完成一轮 standup 角色扮演并拿到反馈。

### 阶段 4：学习方案文档 + 收尾
1. `docs/learning-plan.md`：每日 90 分钟结构、方法论、如何用本工具配合
2. 首页 Dashboard：今日任务清单、各模块进度概览
3. README

## 风险与注意

- **API key 安全**：绝不进前端 bundle，只在 Vite 中间件服务端读取。
- **Web Speech API 兼容性**：Chrome 支持最好，文档注明用 Chrome。
- **AI 成本**：批改/对话用量大，词汇生成可缓存；默认模型可配置。
- **范围控制**：先 MVP 三模块跑通，Listening/Grammar/Dashboard 高级功能后置。

## 文档同步（遵循 GEB 规范）

- 每个 module 目录建 L2 CLAUDE.md
- 源文件加 L3 头注释（INPUT/OUTPUT/POS）
- 根 CLAUDE.md 记录整体架构
