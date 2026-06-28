/**
 * [INPUT]: 无外部依赖（纯算法）
 * [OUTPUT]: 导出 SRSState、Grade、initCard()、reviewCard()、isDue()、calculateInitialDifficulty()
 * [POS]: src/lib 下的间隔重复算法（SM-2 改进版），被 vocabulary 模块使用
 * [PROTOCOL]: 修改算法参数后更新本头注释
 * [VERSION]: v2 - 新增困难词识别、遗忘恢复、平滑学习阶梯
 */

/** 复习评分：忘了 / 模糊 / 认识，对应 SM-2 的 quality。 */
export type Grade = 'forgot' | 'hard' | 'good'

const QUALITY: Record<Grade, number> = { forgot: 1, hard: 3, good: 5 }

export interface SRSState {
  /** 难度系数，越低越难，最低 1.3 */
  easeFactor: number
  /** 当前间隔（天） */
  interval: number
  /** 连续答对次数 */
  repetitions: number
  /** 下次复习时间戳（ms） */
  dueDate: number

  /** v2 新增：遗忘次数（用于困难词识别） */
  lapses?: number
  /** v2 新增：历史最大间隔（用于遗忘后恢复） */
  maxInterval?: number
  /** v2 新增：上次复习时间（用于统计分析） */
  lastReviewed?: number
  /** v2 新增：初始难度（用于分析） */
  initialDifficulty?: number
}

/**
 * 根据词汇特征计算初始难度系数。
 * 技术术语（长词、特殊后缀）自动降低 easeFactor。
 */
export function calculateInitialDifficulty(word: string): number {
  let difficulty = 2.5 // 默认中等难度

  // 长词更难（>= 10 字符）
  if (word.length >= 10) difficulty -= 0.3

  // 包含技术后缀/前缀
  const techPatterns = [
    /tion$/, /ence$/, /ous$/, /ment$/, /ity$/, /ent$/,  // 后缀（新增 -ent）
    /^de/, /^re/, /^pre/, /^un/, /^dis/,                 // 前缀
  ]
  if (techPatterns.some(p => p.test(word.toLowerCase()))) difficulty -= 0.2

  return Math.max(1.3, Math.min(2.5, difficulty))
}

/** 新卡片：立即到期，可马上学。 */
export function initCard(word: string = '', now: number = Date.now()): SRSState {
  const initialDifficulty = word ? calculateInitialDifficulty(word) : 2.5
  return {
    easeFactor: initialDifficulty,
    interval: 0,
    repetitions: 0,
    dueDate: now,
    lapses: 0,
    maxInterval: 0,
    lastReviewed: now,
    initialDifficulty,
  }
}

/** 是否到期可复习。 */
export function isDue(card: SRSState, now: number = Date.now()): boolean {
  return card.dueDate <= now
}

const DAY_MS = 24 * 60 * 60 * 1000
const MINUTE_10_MS = 10 * 60 * 1000

/**
 * 按 SM-2 改进版更新卡片状态。
 *
 * v2 改进点：
 * 1. 新词学习阶梯：10 分钟 → 1 天 → 3 天（平滑过渡）
 * 2. 遗忘后保留 25% 进度（减少挫败感）
 * 3. Hard 档位允许半步增长（鼓励诚实评分）
 * 4. 困难词识别：lapses >= 3 时限制 easeFactor 上限
 * 5. 记录 maxInterval 用于遗忘恢复
 */
export function reviewCard(card: SRSState, grade: Grade, now: number = Date.now()): SRSState {
  const q = QUALITY[grade]
  const lapses = card.lapses || 0
  const maxInterval = card.maxInterval !== undefined ? card.maxInterval : card.interval  // 向后兼容：旧卡片用 interval

  // 困难词检测：连续遗忘 3 次 → 降低增长速度
  const isHardWord = lapses >= 3
  const easeLimit = isHardWord ? 2.0 : 2.5

  // ease 调整公式（SM-2），但限制上限
  let easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  easeFactor = Math.min(easeLimit, easeFactor)

  if (q < 3) {
    // 答错（forgot）：遗忘后保留 25% 进度
    const fallbackInterval = Math.max(1, Math.round(maxInterval * 0.25))
    return {
      easeFactor,
      interval: fallbackInterval,
      repetitions: 0,
      dueDate: now + fallbackInterval * DAY_MS,
      lapses: lapses + 1,
      maxInterval,
      lastReviewed: now,
      initialDifficulty: card.initialDifficulty,
    }
  }

  if (q === 3) {
    // 模糊（hard）：缩短间隔但允许半步增长
    const interval = Math.max(1, Math.round(card.interval * 0.7))
    const newMaxInterval = Math.max(maxInterval, interval)
    return {
      easeFactor,
      interval,
      repetitions: card.repetitions, // 保持当前 rep（内部可以记录 0.5，但这里简化）
      dueDate: now + interval * DAY_MS,
      lapses,
      maxInterval: newMaxInterval,
      lastReviewed: now,
      initialDifficulty: card.initialDifficulty,
    }
  }

  // 答对（good）：正常进阶，优化学习阶梯
  const repetitions = card.repetitions + 1
  let interval: number

  if (repetitions === 1) {
    // 第一次答对：10 分钟后（即时巩固）
    interval = 0.007 // 10 分钟 ≈ 0.007 天
  } else if (repetitions === 2) {
    // 第二次答对：1 天后
    interval = 1
  } else if (repetitions === 3) {
    // 第三次答对：3 天后（优化：原 6 天太长）
    interval = 3
  } else {
    // 第四次及以后：正常增长
    interval = Math.round(card.interval * easeFactor)
  }

  const newMaxInterval = Math.max(maxInterval, interval)
  return {
    easeFactor,
    interval,
    repetitions,
    dueDate: now + (repetitions === 1 ? MINUTE_10_MS : interval * DAY_MS),
    lapses,
    maxInterval: newMaxInterval,
    lastReviewed: now,
    initialDifficulty: card.initialDifficulty,
  }
}
