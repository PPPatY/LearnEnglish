# LearnEnglish 根文档（L1）

## 项目定位

**工程师英语训练工具** —— 学习方案 + Web 应用结合，覆盖口语/听力/技术表达/词汇语法/读写，
帮助开发工程师从"简单日常对话"突破到"与外国同事流畅技术交流"的水平。

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **AI**：Claude API (claude-opus-4-8)，经 Vite 中间件代理保护 key
- **存储**：localStorage / IndexedDB（MVP 零部署，跨设备同步为后续阶段）
- **路由**：react-router-dom

## 架构概览

```
LearnEnglish/
├─ server/               # Vite 插件：AI 代理中间件（服务端转发 Claude API）
├─ src/
│  ├─ lib/               # 核心库：claude 封装、SRS 算法、storage
│  ├─ data/              # 静态资源：内置技术词汇库
│  ├─ modules/           # 三大功能模块（各有独立 L2 CLAUDE.md）
│  │  ├─ vocabulary/     # ✅ 词汇 SRS（已完成）
│  │  ├─ writing/        # ✅ 写作批改（已完成）
│  │  └─ speaking/       # ✅ 口语陪练（已完成）
│  ├─ components/        # 共享 UI：Layout 布局
│  ├─ pages/             # 页面：HomePage（今日概览 + AI 自检）
│  └─ main.tsx / App.tsx
├─ docs/                 # 学习方案与方法论文档
├─ .env.local            # API key 配置（不入库）
└─ PLAN.md              # 详细实施计划
```

## 工作模块清单（L2 入口）

- [`/server/CLAUDE.md`](server/CLAUDE.md) —— AI 代理中间件
- [`/src/lib/CLAUDE.md`](src/lib/CLAUDE.md) —— 核心工具库
- [`/src/modules/vocabulary/CLAUDE.md`](src/modules/vocabulary/CLAUDE.md) —— 词汇 SRS 模块 ✅
- [`/src/modules/writing/CLAUDE.md`](src/modules/writing/CLAUDE.md) —— 写作批改模块 ✅
- [`/src/modules/speaking/CLAUDE.md`](src/modules/speaking/CLAUDE.md) —— 口语陪练模块 ✅
- [`/src/components/CLAUDE.md`](src/components/CLAUDE.md) —— 共享组件
- [`/src/pages/CLAUDE.md`](src/pages/CLAUDE.md) —— 页面

## 开发命令

```bash
npm run dev        # 启动开发服务器（http://localhost:5173）
npm run build      # 生产构建
npm run typecheck  # 类型检查
```

## API Key 配置

1. 复制 `.env.example` 为 `.env.local`
2. 填入真实的 `ANTHROPIC_API_KEY`
3. 如果用第三方代理，修改 `ANTHROPIC_BASE_URL`
4. 重启 dev server

## 当前状态

**所有四个阶段已完成**，应用完整可用：

**✅ 阶段 0（脚手架）**：
- Vite + React + TS + Tailwind + Zustand
- AI 代理中间件（保护 API key）
- 基础布局与导航

**✅ 阶段 1（词汇 SRS）**：
- 翻面式 SRS 卡片（SM-2 算法）
- 50 个内置技术词汇
- 手动添加生词
- 持久化到 localStorage

**✅ 阶段 2（写作批改）**：
- 8 个任务模板（PR/邮件/issue/README/函数注释等）
- AI 结构化批改（语法/地道度/改写）
- 批改历史保存

**✅ 阶段 3（口语陪练）**：
- 8 个对话场景（standup/code review/技术讨论/面试/闲聊）
- Web Speech API（语音识别 + 合成）
- 多轮对话 + AI 角色扮演
- 会话结束后生成反馈报告

**✅ 阶段 4（Dashboard + 文档）**：
- 首页 Dashboard（三模块统计数据）
- 学习方案文档（`docs/learning-plan.md`）
- AI 连接自检

## [PROTOCOL]

- **代码变更** → 更新 L3 头注释（INPUT/OUTPUT/POS）
- **新增/删除文件** → 更新对应模块的 L2 CLAUDE.md
- **架构/模块/技术栈变化** → 更新本 L1 文档
- **不为生成目录（`node_modules/`、`dist/`）创建 L2 文档**
