/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 导出 WritingTask、FeedbackItem、Feedback、Session 类型
 * [POS]: writing 模块的类型定义，被 store/UI/prompt 共享
 * [PROTOCOL]: 字段变更时同步 store 迁移逻辑与 AI prompt
 */

/** 写作任务元数据（静态模板） */
export interface WritingTask {
  id: string
  title: string
  category: 'work' | 'code' | 'other'
  description: string
  /** 写作提示（给用户看） */
  instructions: string
  /** 示例（可选） */
  example?: string
}

/** 单个批改点 */
export interface FeedbackItem {
  type: 'grammar' | 'style' | 'word-choice'
  /** 原文片段 */
  original: string
  /** 问题描述 */
  issue: string
  /** 建议改法 */
  suggestion: string
}

/** AI 批改结果 */
export interface Feedback {
  /** 批改点列表 */
  items: FeedbackItem[]
  /** 完整改写版本 */
  rewrite: string
  /** 总评（可选） */
  summary?: string
}

/** 一次批改会话 */
export interface Session {
  id: string
  taskId: string
  taskTitle: string
  /** 用户原文 */
  userText: string
  /** AI 反馈 */
  feedback: Feedback
  createdAt: number
}
