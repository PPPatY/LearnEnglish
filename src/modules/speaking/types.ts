/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 导出 Scene、Turn、Session、FeedbackReport 类型
 * [POS]: speaking 模块的类型定义，被 store/UI/speech 共享
 * [PROTOCOL]: 字段变更时同步 store 迁移逻辑与 AI prompt
 */

/** 对话场景元数据（静态模板） */
export interface Scene {
  id: string
  title: string
  category: 'work' | 'interview' | 'casual'
  description: string
  /** AI 扮演的角色 */
  aiRole: string
  /** System prompt（定义 AI 行为） */
  systemPrompt: string
  /** 开场白（AI 先说） */
  openingLine: string
}

/** 对话轮次 */
export interface Turn {
  /** 'user' | 'assistant' */
  who: 'user' | 'assistant'
  text: string
  timestamp: number
  /** 用户录音的 Blob URL（仅 user 有） */
  audioUrl?: string
  /** 中文翻译（可选，懒加载） */
  translation?: string
}

/** 反馈报告（会话结束后生成） */
export interface FeedbackReport {
  /** 总体评价 */
  summary: string
  /** 高频错误/建议 */
  suggestions: string[]
  /** 表现好的地方 */
  strengths: string[]
}

/** 一次对话会话 */
export interface Session {
  id: string
  sceneId: string
  sceneTitle: string
  turns: Turn[]
  /** 会话结束后的反馈报告（可选） */
  feedback?: FeedbackReport
  createdAt: number
  endedAt?: number
}
