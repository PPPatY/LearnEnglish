# LearnEnglish · 工程师英语训练

为开发工程师量身定做的英语学习工具 —— 系统提升口语/听力/技术表达/读写能力，
从"简单日常对话"突破到"与外国同事流畅技术交流"。

## ✨ 特性

- 🃏 **词汇 SRS**：间隔重复算法（SM-2），内置 50 个技术词汇，手动添加生词
- ✍️ **写作批改**：AI 批改 PR 描述/技术邮件/issue 回复/代码文档，结构化反馈（语法/地道度/改写）
- 🎙️ **口语陪练**：Web 语音对话（识别 + 合成），8 个场景（standup/code review/面试/闲聊），AI 角色扮演 + 反馈报告
- 📊 **Dashboard**：统计词库、批改次数、对话次数，可视化学习进度
- 🤖 **AI 驱动**：接入 Claude API（claude-opus-4-8），个性化反馈与智能生成

## 🚀 快速开始

### 前置要求

- **Node.js** 18+ 
- **npm** 或 **pnpm**
- **Anthropic API Key**（[获取地址](https://console.anthropic.com/)）
- **现代浏览器**：推荐 Chrome 或 Edge（语音功能需要）

### 1. 克隆仓库

```bash
git clone git@github.com:PPPatY/LearnEnglish.git
cd LearnEnglish
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 API Key

复制 `.env.example` 为 `.env.local`，填入你的 Anthropic API key：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```bash
# 必填：你的 Anthropic API Key
ANTHROPIC_API_KEY=sk-ant-xxx...

# 可选：如果使用第三方代理（key 格式为 mg-... 等），修改此地址
ANTHROPIC_BASE_URL=https://api.anthropic.com

# 可选：模型选择（默认 opus-4-8，可改为 haiku-4-5 降低成本）
ANTHROPIC_MODEL=claude-opus-4-8
```

> **⚠️ 注意**：`.env.local` 已在 `.gitignore` 中，不会被提交到 git。

### 4. 启动开发服务器

```bash
npm run dev
```

浏览器访问 **http://localhost:5173**

### 5. 验证配置

打开应用后，点击首页的 **"AI 连接自检"** 按钮：
- ✅ 成功 → API 配置正确，可以开始使用
- ❌ 失败 → 检查 `.env.local` 中的 API Key 是否正确

## 📖 使用指南

### 🃏 词汇 SRS（不消耗 API）

1. 点击侧边栏 **"🃏 词汇 SRS"** 进入模块
2. 切换到 **"复习"** 标签，开始翻面式复习
3. 点击卡片查看释义，按 **"忘了/模糊/认识"** 评分
4. 系统自动调整下次复习时间（越答对，间隔越长，符合 SM-2 算法）
5. 切换到 **"添加"** 标签，手动添加生词到词库

> **💡 提示**：词汇模块完全本地化，不消耗 API tokens。

---

### ✍️ 写作批改（消耗 API）

1. 点击侧边栏 **"✍️ 写作批改"** 进入模块
2. 从任务列表选择场景：
   - PR 描述、技术邮件、issue 回复
   - README 文档、函数注释、代码解释
3. 在文本框用英文写作（不要担心错误）
4. 点击 **"提交批改"** → AI 返回：
   - **语法错误**（标红 + 解释）
   - **地道度建议**（如何更自然）
   - **完整改写版本**（可对比学习）
5. 批改历史自动保存，可在"历史"标签查看

> **💡 提示**：每次批改约消耗 1,000-3,000 tokens（成本约 $0.01-0.03）。

---

### 🎙️ 口语陪练（消耗 API）

1. 点击侧边栏 **"🎙️ 口语陪练"** 进入模块
2. 选择场景：
   - **Daily Standup** - 日会汇报
   - **Code Review** - 代码审查讨论
   - **Technical Interview** - 技术面试
   - **Coffee Chat** - 轻松闲聊
   - **Debugging Session** - 排查问题
3. AI 开场后，点击 **麦克风 🎙️** 按钮录音回答
4. 说完后再点一次麦克风停止 → AI 识别 → 回复 → 朗读
5. 多轮对话后点击 **"结束会话"**，AI 生成反馈报告：
   - 总体评价
   - 改进建议
   - 优点总结

> **⚠️ 浏览器要求**：使用 **Chrome 或 Edge**，语音识别支持最好（Safari 可能不稳定）。  
> **💡 提示**：每次对话约消耗 3,000-10,000 tokens（成本约 $0.03-0.10）。

---

## 📚 学习方案

建议每天投入 **90 分钟**，按以下结构执行：

| 时长 | 内容 | 训练能力 |
|------|------|---------|
| 15 min | 词汇 SRS 复习 | 词汇积累 |
| 20 min | 写作批改（PR/邮件/issue） | 读写/技术表达 |
| 30 min | 口语陪练（技术场景角色扮演） | 口语/听力/技术表达 |
| 20 min | 听力精听 + 跟读（技术播客，外部资源） | 听力/语音 |
| 5 min | 当日复盘，记录高频错误 | 全部 |

详细方法论见 **[`docs/plans/learning-plan.md`](docs/plans/learning-plan.md)**。

---

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **AI**：Claude API (claude-opus-4-8)，经 Vite 中间件代理保护 key
- **存储**：localStorage（MVP 阶段），未来扩展 IndexedDB + 后端同步
- **路由**：react-router-dom
- **语音**：Web Speech API（语音识别 + 合成）

---

## 📂 项目结构

```
LearnEnglish/
├── server/                # Vite 插件：AI 代理中间件（保护 API key）
├── src/
│   ├── lib/               # 核心库：claude 封装、SRS 算法、storage
│   ├── data/              # 静态资源：内置技术词汇库（50 词）
│   ├── modules/           # 三大功能模块
│   │   ├── vocabulary/    # ✅ 词汇 SRS（已完成）
│   │   ├── writing/       # ✅ 写作批改（已完成）
│   │   └── speaking/      # ✅ 口语陪练（已完成）
│   ├── components/        # 共享 UI：Layout 布局、Button、Icon
│   ├── pages/             # 页面：HomePage（Dashboard + AI 自检）
│   └── main.tsx / App.tsx
├── docs/                  # 文档目录
│   ├── plans/             # 计划类文档（学习方案、实施计划）
│   ├── reports/           # 报告类文档（修复报告、测试报告）
│   └── issues/            # 问题追踪
├── .env.example           # 环境变量模板
├── .env.local             # 本地配置（不入库，需手动创建）
└── CLAUDE.md              # 架构文档（GEB 规范）
```

---

## 💻 开发命令

```bash
npm run dev        # 启动开发服务器（http://localhost:5173）
npm run build      # 生产构建（输出到 dist/）
npm run preview    # 预览构建产物
npm run typecheck  # TypeScript 类型检查
```

---

## ✅ 当前状态

**所有核心功能已完成**，应用完整可用：

- ✅ **词汇 SRS**：翻面式卡片 + SM-2 算法 + 50 个技术词汇 + 手动添加
- ✅ **写作批改**：8 个任务模板 + AI 结构化批改（语法/地道度/改写）
- ✅ **口语陪练**：8 个对话场景 + Web Speech API + 反馈报告
- ✅ **Dashboard**：首页统计（词库/批改次数/对话次数）+ AI 连接自检
- ✅ **学习方案文档**：完整方法论（`docs/plans/learning-plan.md`）

**后续扩展方向**：
- 听力模块（精听 + 跟读训练）
- Grammar 专项训练（从批改历史提取高频错误）
- 跨设备同步（后端 + 数据库）
- 学习时长统计与可视化

---

## 💰 API 成本控制

| 模块 | 是否消耗 API | 单次成本估算 |
|------|-------------|-------------|
| 词汇 SRS | ❌ 不消耗 | $0 |
| 写作批改 | ✅ 消耗 | ~$0.01-0.03/次 |
| 口语陪练 | ✅ 消耗 | ~$0.03-0.10/次 |

**降低成本方法**：
- 在 `.env.local` 中将 `ANTHROPIC_MODEL` 改为 `claude-haiku-4-5`（速度更快，成本降低约 80%）
- 词汇模块完全本地化，可无限使用

---

## 🧑‍💻 开发者文档

- **架构与 GEB 文档规范**：[`CLAUDE.md`](./CLAUDE.md)
- **模块级文档**（L2）：
  - [`server/CLAUDE.md`](server/CLAUDE.md) - AI 代理中间件
  - [`src/lib/CLAUDE.md`](src/lib/CLAUDE.md) - 核心工具库
  - [`src/modules/vocabulary/CLAUDE.md`](src/modules/vocabulary/CLAUDE.md) - 词汇 SRS
  - [`src/modules/writing/CLAUDE.md`](src/modules/writing/CLAUDE.md) - 写作批改
  - [`src/modules/speaking/CLAUDE.md`](src/modules/speaking/CLAUDE.md) - 口语陪练

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT
