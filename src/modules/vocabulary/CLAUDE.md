# vocabulary 模块（L2）

## 目的

词汇 SRS（间隔重复系统）—— 基于 SM-2 算法的翻面式卡片复习，
内置 50 个技术词汇，支持用户手动添加生词，状态持久化到 localStorage。

## 父文档

[`/src/CLAUDE.md`](../CLAUDE.md) → [`/CLAUDE.md`](../../CLAUDE.md)

## 入口点

- **路由**：`/vocabulary`
- **组件**：`VocabularyPage`

## 公共 API（导出给上层）

- `useVocabStore` —— Zustand store，提供：
  - `cards: VocabCard[]` —— 全部卡片
  - `dueCards(): VocabCard[]` —— 当前到期卡片
  - `grade(id, grade)` —— 评分
  - `addWord(...)` —— 添加生词
  - `removeWord(id)` —— 删除词条
  - `seedIfEmpty()` —— 首次加载时灌入内置词库

## 文件索引

- `types.ts` —— 类型定义（`WordSeed`、`VocabCard`）
- `store.ts` —— Zustand 状态管理 + 持久化
- `VocabularyPage.tsx` —— 主页面（三标签：复习/词表/添加）
- `ReviewCard.tsx` —— 翻面式复习卡片（点击翻面 → 评分）
- `AddWordForm.tsx` —— 添加生词表单

## 依赖

- **内部**：`../../lib/srs`（SM-2 算法）、`../../lib/claude`（暂未用，为后续 AI 生成例句预留）
- **数据**：`../../data/techWords`（内置词库）
- **外部**：`zustand`、`zustand/middleware/persist`

## [PROTOCOL]

- 修改 `VocabCard` 结构 → 同步 `types.ts` 与 `store.ts` 迁移逻辑
- 新增 UI 组件 → 更新本文档的文件索引
- 修改评分档位 → 同步 `ReviewCard.tsx` 与 `lib/srs.ts`
