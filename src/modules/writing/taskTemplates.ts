/**
 * [INPUT]: 依赖 ./types 的 WritingTask
 * [OUTPUT]: 导出 WRITING_TASKS —— 内置写作任务模板库
 * [POS]: writing 模块的静态资源；WritingPage 展示这些任务供用户选择
 * [PROTOCOL]: 增删任务只改本文件，不影响其他模块
 */
import type { WritingTask } from './types'

export const WRITING_TASKS: WritingTask[] = [
  {
    id: 'pr-description',
    title: 'Pull Request 描述',
    category: 'work',
    description: '为你的 PR 写标题和正文，说明改了什么、为什么改、怎么测试。',
    instructions: '用英文写一个 PR 描述（title + body）。包含：What（改动内容）、Why（动机/解决的问题）、How to test（测试方法）。',
    example: `Title: Fix race condition in cache invalidation

Body: The cache was not properly invalidated when multiple requests updated the same key concurrently, leading to stale data. This PR adds a distributed lock around the invalidation logic. Tested by running 100 concurrent updates in staging.`,
  },
  {
    id: 'technical-email',
    title: '技术邮件',
    category: 'work',
    description: '给同事或客户写工作邮件，汇报进度、讨论方案、反馈问题。',
    instructions: '用英文写一封技术邮件。可以是进度汇报、方案讨论、问题反馈、会议邀请等。注意礼貌和清晰。',
    example: `Hi team,

Just a quick update on the migration project. We have finished migrating 80% of the users to the new schema. The remaining 20% have custom configurations that need manual review. ETA is end of this week.

Let me know if you have concerns.

Best,
Your Name`,
  },
  {
    id: 'issue-reply',
    title: 'Issue 回复',
    category: 'work',
    description: '在 GitHub/Jira issue 里回复：报告 bug、提问、讨论方案。',
    instructions: '用英文回复一个 issue。可以是 bug 报告、feature 请求、或技术讨论。提供清晰的上下文和复现步骤（如果是 bug）。',
    example: `I can reproduce this on version 2.3.1. Steps:
1. Open the settings page
2. Change the theme to dark mode
3. Refresh the page

Expected: dark mode persists
Actual: reverts to light mode

Looks like the setting is not saved to localStorage.`,
  },
  {
    id: 'function-comment',
    title: '函数注释',
    category: 'code',
    description: '为一个函数写 JSDoc/docstring 注释，描述用途、参数、返回值。',
    instructions: '用英文为一个函数写注释。包含：函数用途、参数说明、返回值、可能抛出的异常（如果有）。',
    example: `/**
 * Fetches user data from the API and caches the result.
 * @param userId - The unique identifier of the user
 * @param ttl - Time-to-live for the cache entry in seconds (default 300)
 * @returns A promise that resolves to the user object
 * @throws {NotFoundError} If the user does not exist
 */`,
  },
  {
    id: 'readme',
    title: 'README 项目介绍',
    category: 'code',
    description: '为你的项目写 README.md 的核心部分：项目介绍、安装、使用。',
    instructions: '用英文写 README 的主要内容。包含：项目是什么、为什么做、如何安装、基本使用示例。',
    example: `# MyProject

A lightweight CLI tool for managing environment variables across multiple projects.

## Installation

\`\`\`bash
npm install -g myproject
\`\`\`

## Usage

\`\`\`bash
myproject set DATABASE_URL postgres://...
myproject get DATABASE_URL
\`\`\``,
  },
  {
    id: 'api-doc',
    title: 'API 文档',
    category: 'code',
    description: '为一个 REST API 端点写文档：路径、方法、参数、响应格式。',
    instructions: '用英文写 API 端点文档。包含：路径、HTTP 方法、请求参数、响应格式、可能的错误码。',
    example: `**GET /api/users/:id**

Fetches a single user by ID.

**Parameters:**
- \`id\` (path, required): User ID

**Response (200):**
\`\`\`json
{ "id": "123", "name": "Alice", "email": "alice@example.com" }
\`\`\`

**Errors:**
- 404: User not found
- 401: Unauthorized`,
  },
  {
    id: 'commit-message',
    title: 'Commit Message',
    category: 'code',
    description: '写一个清晰的 Git commit message（遵循 Conventional Commits 或团队规范）。',
    instructions: '用英文写 commit message。可以用 Conventional Commits 格式（如 feat:、fix:、refactor:）。简洁说明改动。',
    example: `fix: prevent crash when user avatar is missing

The avatar rendering logic did not handle null values.
Added a fallback to a default avatar image.`,
  },
  {
    id: 'meeting-summary',
    title: '会议纪要',
    category: 'work',
    description: 'Standup、设计评审会议后，写英文总结发给团队。',
    instructions: '用英文写会议纪要。包含：会议主题、关键决策、待办事项（action items）、下次会议时间。',
    example: `**Design Review - 2024-01-15**

Decisions:
- Use Postgres for the new service (vs MongoDB)
- Deploy to staging first, prod rollout next week

Action items:
- @Alice: set up staging DB
- @Bob: write migration script

Next meeting: Jan 22, 2pm`,
  },
]
