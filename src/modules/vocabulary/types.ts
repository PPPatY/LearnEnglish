/**
 * [INPUT]: 依赖 ../../lib/srs 的 SRSState
 * [OUTPUT]: 导出 WordSeed、VocabCard 类型
 * [POS]: vocabulary 模块的类型定义，被 store/UI/data 共享
 * [PROTOCOL]: 字段变更时同步 store 迁移逻辑
 */
import type { SRSState } from '../../lib/srs'

/** 词条种子（静态库或用户新增的原始内容） */
export interface WordSeed {
  word: string
  phonetic?: string
  meaning: string
  example?: string
}

/** 带 SRS 状态的词卡（持久化存储的单元） */
export interface VocabCard extends WordSeed {
  id: string
  srs: SRSState
  /** 来源：内置库 or 用户添加 */
  source: 'builtin' | 'user'
  createdAt: number
}
