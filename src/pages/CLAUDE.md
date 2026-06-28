# pages 模块（L2）

## 目的

提供顶层页面组件（与路由一一对应）。

## 父文档

[`/src/CLAUDE.md`](../CLAUDE.md) → [`/CLAUDE.md`](../../CLAUDE.md)

## 公共 API

- `HomePage` —— 首页（今日概览 + AI 连接自检 + 模块卡片入口）

## 文件索引

- `HomePage.tsx` —— 唯一文件，挂在 `/` 路由

## 依赖

- **内部**：`../lib/claude`（AI 自检）、`../modules/vocabulary/store`（读取词库统计）
- **外部**：`react-router-dom`（`Link`）

## [PROTOCOL]

- 新增页面 → 创建文件、更新 `App.tsx` 路由表、更新本文档索引
- 修改 AI 自检逻辑 → 同步 `HomePage.tsx` 与 `lib/claude.ts`
