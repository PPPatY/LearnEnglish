#!/usr/bin/env node
/**
 * SRS v2 算法测试（独立脚本）
 * 验证 5 个优化点的正确性
 */

const DAY_MS = 24 * 60 * 60 * 1000
const MINUTE_10_MS = 10 * 60 * 1000
const QUALITY = { forgot: 1, hard: 3, good: 5 }

// ===== 算法实现（复制自 src/lib/srs.ts） =====

function calculateInitialDifficulty(word) {
  let difficulty = 2.5
  if (word.length >= 10) difficulty -= 0.3  // >= 10 字符
  const techPatterns = [
    /tion$/, /ence$/, /ous$/, /ment$/, /ity$/, /ent$/,
    /^de/, /^re/, /^pre/, /^un/, /^dis/,
  ]
  if (techPatterns.some(p => p.test(word.toLowerCase()))) difficulty -= 0.2
  return Math.max(1.3, Math.min(2.5, difficulty))
}

function initCard(word = '', now = Date.now()) {
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

function reviewCard(card, grade, now = Date.now()) {
  const q = QUALITY[grade]
  const lapses = card.lapses || 0
  const maxInterval = card.maxInterval !== undefined ? card.maxInterval : card.interval  // 向后兼容

  const isHardWord = lapses >= 3
  const easeLimit = isHardWord ? 2.0 : 2.5

  let easeFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
  easeFactor = Math.min(easeLimit, easeFactor)

  if (q < 3) {
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
    const interval = Math.max(1, Math.round(card.interval * 0.7))
    const newMaxInterval = Math.max(maxInterval, interval)
    return {
      easeFactor,
      interval,
      repetitions: card.repetitions,
      dueDate: now + interval * DAY_MS,
      lapses,
      maxInterval: newMaxInterval,
      lastReviewed: now,
      initialDifficulty: card.initialDifficulty,
    }
  }

  const repetitions = card.repetitions + 1
  let interval

  if (repetitions === 1) interval = 0.007
  else if (repetitions === 2) interval = 1
  else if (repetitions === 3) interval = 3
  else interval = Math.round(card.interval * easeFactor)

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

// ===== 测试开始 =====

console.log('🧪 SRS v2 算法测试\n')

// 测试 1
console.log('📋 测试 1: 词汇难度初始化')
const tests1 = [
  { word: 'bug', expected: 2.5 },
  { word: 'idempotent', expected: 2.0 },  // 长度 10 >= 10 (-0.3), -ent 后缀 (-0.2) = 2.0
  { word: 'deprecation', expected: 2.0 },
  { word: 'refactor', expected: 2.3 },
  { word: 'async', expected: 2.5 },
]

tests1.forEach(({ word, expected }) => {
  const actual = calculateInitialDifficulty(word)
  const pass = Math.abs(actual - expected) < 0.1
  console.log(`  ${pass ? '✅' : '❌'} "${word}" → ${actual.toFixed(1)} (预期 ${expected})`)
})

// 测试 2
console.log('\n📋 测试 2: 新词学习阶梯（10分钟 → 1天 → 3天）')
let card2 = initCard('test', 1000000)
card2 = reviewCard(card2, 'good', 1000000)
console.log(`  ${card2.dueDate - 1000000 === MINUTE_10_MS ? '✅' : '❌'} 第1次 Good → ${((card2.dueDate - 1000000) / 60000).toFixed(0)} 分钟`)

card2 = reviewCard(card2, 'good', 1000000 + MINUTE_10_MS)
console.log(`  ${card2.interval === 1 ? '✅' : '❌'} 第2次 Good → ${card2.interval} 天`)

card2 = reviewCard(card2, 'good', 1000000 + MINUTE_10_MS + DAY_MS)
console.log(`  ${card2.interval === 3 ? '✅' : '❌'} 第3次 Good → ${card2.interval} 天 (优化前 6 天)`)

// 测试 3
console.log('\n📋 测试 3: 遗忘后保留 25% 进度')
let card3 = initCard('test', 1000000)
card3.interval = 30
card3.maxInterval = 30
card3.repetitions = 5
card3 = reviewCard(card3, 'forgot', 1000000)
console.log(`  ${card3.interval === 8 ? '✅' : '❌'} 遗忘后 → ${card3.interval} 天 (预期 8 天，优化前 1 天)`)
console.log(`  ${card3.lapses === 1 ? '✅' : '❌'} lapses 计数 → ${card3.lapses}`)

// 测试 4
console.log('\n📋 测试 4: Hard 档位优化（0.7 倍间隔）')
let card4 = initCard('test', 1000000)
card4.interval = 10
card4.repetitions = 3
card4 = reviewCard(card4, 'hard', 1000000)
console.log(`  ${card4.interval === 7 ? '✅' : '❌'} Hard → ${card4.interval} 天 (预期 7 天，优化前 8 天)`)

// 测试 5
console.log('\n📋 测试 5: 困难词识别（连续遗忘 3 次）')
let card5 = initCard('test', 1000000)
card5 = reviewCard(card5, 'forgot', 1000000)
card5 = reviewCard(card5, 'forgot', 1000000 + DAY_MS)
card5 = reviewCard(card5, 'forgot', 1000000 + DAY_MS * 2)
console.log(`  ${card5.lapses === 3 ? '✅' : '❌'} 连续遗忘 → lapses=${card5.lapses}`)

card5.interval = 6
card5.repetitions = 3
card5 = reviewCard(card5, 'good', 1000000 + DAY_MS * 3)
console.log(`  ${card5.easeFactor <= 2.0 ? '✅' : '❌'} 困难词 easeFactor 限制 → ${card5.easeFactor.toFixed(2)} (应 ≤ 2.0)`)

// 测试 6
console.log('\n📋 测试 6: 向后兼容（旧格式卡片）')
const oldCard = { easeFactor: 2.5, interval: 6, repetitions: 2, dueDate: 1000000 }
const upgraded = reviewCard(oldCard, 'good', 1000000)
console.log(`  ${upgraded.lapses === 0 ? '✅' : '❌'} 补充默认 lapses → ${upgraded.lapses}`)
console.log(`  ${upgraded.maxInterval === 6 ? '✅' : '❌'} 继承旧 interval 为 maxInterval → ${upgraded.maxInterval} (预期 6)`)

// 测试 7
console.log('\n📋 测试 7: 完整学习路径模拟（idempotent）')
let card7 = initCard('idempotent', 1000000)
let time = 1000000
console.log(`  初始 easeFactor: ${card7.easeFactor.toFixed(2)} (应 ≈ 2.0)`)

const actions = ['good', 'good', 'good', 'hard', 'good', 'forgot', 'good']
console.log('  学习路径:')
actions.forEach((grade, i) => {
  card7 = reviewCard(card7, grade, time)
  time = card7.dueDate
  const intervalDesc = card7.interval < 1
    ? `${Math.round(card7.interval * 24 * 60)}分钟`
    : `${card7.interval}天`
  console.log(`    ${i + 1}. ${grade} → ${intervalDesc}`)
})

console.log('\n🎉 所有测试完成！')
console.log('\n💡 预期改进效果:')
console.log('  - 新词巩固时间: 7天 → 4天 (-43%)')
console.log('  - 遗忘后恢复: 1天 → 保留25%进度')
console.log('  - 困难词自动降速')
console.log('  - Hard 档位不再停滞')
