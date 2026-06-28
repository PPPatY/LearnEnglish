# server 模块（L2）

## 目的

提供 Vite 开发服务器插件，在 `/api/chat` 端点上转发 Claude Messages API 请求。
保护 API key（仅存在服务端 `process.env`，绝不进前端 bundle）。

## 父文档

[`/CLAUDE.md`](../CLAUDE.md)

## 公共 API

- `aiProxy(): Plugin` —— Vite 插件，注册在 `vite.config.ts` 的 `plugins` 数组
- 端点：`POST /api/chat`  
  - 请求体：`{ messages, system?, model?, max_tokens?, temperature? }`
  - 响应：`{ text }` 或 `{ error }`

## 文件索引

- `aiProxy.ts` —— 唯一文件，导出 `aiProxy()` 插件函数

## 依赖

- **外部**：Vite Plugin 接口、Node.js `http` 模块、`process.env`（读取 `.env.local`）
- **上游**：Claude API (`https://api.anthropic.com/v1/messages` 或自定义 base URL)

## [PROTOCOL]

- 修改端点路径/请求结构 → 同步更新 `src/lib/claude.ts` 与本文档
- 修改环境变量名 → 同步更新 `.env.example` 与 `vite.config.ts`
