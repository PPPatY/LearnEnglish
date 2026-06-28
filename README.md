# LearnEnglish · 工程师英语训练

为开发工程师量身定做的英语学习工具 —— 系统提升口语/听力/技术表达/读写能力，
从"简单日常对话"突破到"与外国同事流畅技术交流"。

## 特性

- 🃏 **词汇 SRS**：间隔重复算法（SM-2），内置 50 个技术词汇，手动添加生词
- ✍️ **写作批改**：AI 批改 PR 描述/技术邮件/issue 回复/代码文档，结构化反馈（语法/地道度/改写）
- 🎙️ **口语陪练**：Web 语音对话（识别 + 合成），8 个场景（standup/code review/面试/闲聊），AI 角色扮演 + 反馈报告
- 📊 **Dashboard**：统计词库、批改次数、对话次数，可视化学习进度
- 🤖 **AI 驱动**：接入 Claude API，个性化反馈与智能生成

## 快速开始

### 1. 克隆仓库

```bash
git clone <this-repo>
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
# 编辑 .env.local，填入真实的 ANTHROPIC_API_KEY
```

如果你用的是第三方代理网关（key 格式为 `mg-...` 等非官方格式），
记得同时修改 `ANTHROPIC_BASE_URL` 为网关地址。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173，点击首页的"AI 连接自检"按钮验证配置是否正确。

## 使用

### 词汇 SRS

1. 进入"🃏 词汇 SRS"模块
2. 点击"复习"标签，开始翻面式复习
3. 点击卡片查看释义，按"忘了/模糊/认识"评分
4. 系统自动调整下次复习时间（越答对，间隔越长）
5. "添加"标签可手动添加生词

### 写作批改

1. 进入"✍️ 写作批改"模块
2. 从任务列表选择场景（PR 描述、技术邮件、issue 回复、README、函数注释等）
3. 用英文写作（不要担心错误）
4. 提交批改 → AI 返回：语法错误、地道度建议、完整改写版本
5. 对比学习，提取高频错误加入词汇库

### 口语陪练

1. 进入"🎙️ 口语陪练"模块
2. 选择场景（Daily standup、Code review、技术面试、Coffee chat 等）
3. AI 开场，点击麦克风 🎙️ 用英文回答
4. 多轮对话（AI 识别你的语音 → 回复 → 朗读）
5. 结束时 AI 生成反馈报告（总评、建议、优点）

**注意**：使用 **Chrome 或 Edge** 浏览器，语音识别支持最好。

### 学习方案

建议每天投入 90 分钟，按以下结构执行：

| 时长 | 内容 | 能力 |
|------|------|------|
| 15 min | 词汇 SRS 复习 | 词汇 |
| 20 min | 写作批改（PR/邮件/issue） | 读写/技术表达 |
| 30 min | 口语陪练（技术场景角色扮演） | 口语/听力/技术表达 |
| 20 min | 听力精听 + 跟读（技术播客，外部资源） | 听力/语音 |
| 5 min | 当日复盘，记录高频错误 | 全部 |

详细方法论见 [`docs/learning-plan.md`](docs/learning-plan.md)。

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **AI**：Claude API (claude-opus-4-8)，经 Vite 中间件代理保护 key
- **存储**：localStorage（MVP），IndexedDB（后续）

## 开发命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run preview    # 预览构建产物
npm run typecheck  # TypeScript 类型检查
```

## 项目结构

```
LearnEnglish/
├─ server/               # Vite 插件：AI 代理中间件
├─ src/
│  ├─ lib/               # 核心库：claude 封装、SRS 算法
│  ├─ data/              # 静态资源：内置技术词汇库
│  ├─ modules/           # 三大功能模块
│  │  ├─ vocabulary/     # ✅ 词汇 SRS（已实现）
│  │  ├─ writing/        # ⏳ 写作批改（待开发）
│  │  └─ speaking/       # ⏳ 口语陪练（待开发）
│  ├─ components/        # 共享 UI：Layout 布局
│  ├─ pages/             # 页面：HomePage
│  └─ main.tsx / App.tsx
├─ docs/                 # 学习方案与方法论文档
└─ .env.local            # API key 配置（不入库）
```

## 当前状态

**所有核心功能已完成**，应用完整可用：

- ✅ 词汇 SRS（翻面式卡片，SM-2 算法，50 个技术词汇）
- ✅ 写作批改（8 个任务模板，AI 结构化批改）
- ✅ 口语陪练（8 个对话场景，语音识别 + 合成，反馈报告）
- ✅ Dashboard（三模块统计数据）
- ✅ 学习方案文档（`docs/learning-plan.md`）
- ✅ AI 连接自检

**后续扩展方向**：
- 听力模块（精听 + 跟读）
- Grammar 专项训练
- 跨设备同步（后端 + 数据库）
- 学习时长统计与可视化

## API 成本控制

- 词汇模块不调用 AI，零成本
- 后续写作批改/口语陪练会消耗 API tokens
- 可在 `.env.local` 中将 `ANTHROPIC_MODEL` 改为 `claude-haiku-4-5` 降低成本

## 开发者

详细架构与 GEB 文档规范见 [`CLAUDE.md`](./CLAUDE.md)。

## License

MIT
