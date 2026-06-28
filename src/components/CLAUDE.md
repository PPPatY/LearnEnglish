# components 模块（L2）

## 目的

提供跨页面共享的 UI 组件：全局布局、统一按钮、SVG 线性图标。
全站按钮与图标统一从此处引入，确保视觉一致。

## 父文档

[`/src/CLAUDE.md`](../CLAUDE.md) → [`/CLAUDE.md`](../../CLAUDE.md)

## 公共 API

- `Layout` —— 侧边栏导航 + 内容区（Outlet），包裹所有路由页面
- `Button` —— 统一按钮，props：`variant`(primary/secondary/ghost/danger/success/icon)、`size`(sm/md/lg)、`icon`、`iconOnly`、`iconSpin`、`fullWidth`、`active`
- `Icon` —— SVG 线性图标，props：`name`(IconName)、`size`、`spin`、`className`
- `IconName` —— 可用图标名称的联合类型

## 文件索引

- `Layout.tsx` —— 全局布局，侧边栏导航用 SVG 图标
- `Button.tsx` —— 统一按钮组件，含变体/尺寸/图标
- `Icon.tsx` —— SVG 线性图标库（PATHS 注册表，24x24 stroke 风格）

## 依赖

- **外部**：`react-router-dom`（`NavLink`、`Outlet`）
- **内部**：`Button` 依赖 `Icon`；`Layout` 依赖 `Icon`
- **被依赖**：`App.tsx`、各模块页面（HomePage / VocabularyPage / WritingPage / SpeakingPage / ReviewCard / AddWordForm）

## 主题色

`src/index.css` 中通过 `@theme` 定义 `brand-*`（品牌色，基于 indigo），
按钮 primary/icon 变体与交互高亮统一使用 `bg-brand-*` / `text-brand-*`。

## [PROTOCOL]

- 新增共享组件 → 创建文件并更新本文档索引
- 新增图标 → 在 `Icon.tsx` 的 `PATHS` 注册表加一条
- 新增按钮变体 → 更新 `Button.tsx` 的 `VARIANTS` / `SIZES`
- 修改导航项 → 同步 `App.tsx` 路由表
