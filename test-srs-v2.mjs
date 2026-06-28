/**
 * SRS v2 算法测试
 * 验证 5 个优化点的正确性
 */

import { initCard, reviewCard, calculateInitialDifficulty } from './dist/assets/index-BDhcbnOH.js'

const DAY_MS = 24 * 60 * 60 * 1000
const MINUTE_10_MS = 10 * 60 * 1000

console.log('🧪 SRS v2 算法测试\n')

// ===== 测试 1: 词汇难度初始化 =====
console.log('📋 测试 1: 词汇难度初始化')
const tests1 = [
  { word: 'bug', expected: 2.5 },
  { word: 'idempotent', expected: 2.0 }, // 长 + -ent
  { word: 'deprecation', expected: 2.0 }, // 长 + -tion
  { word: 'refactor', expected: 2.3 }, // re- 前缀
  { word: 'async', expected: 2.5 }, // 短，无特殊模式
]

tests1.forEach(({ word, expected }) => {
  const actual = calculateInitialDifficulty(word)
  const pass = Math.abs(actual - expected) < 0.1
  console.log(`  ${pass ? '✅' : '❌'} "${word}" → ${actual.toFixed(1)} (预期 ${expected})`)
})

// ===== 测试 2: 新词学习阶梯 =====
console.log('\n📋 测试 2: 新词学习阶梯（10分钟 → 1天 → 3天）')
let card2 = initCard('test', 1000000)
const now2 = 1000000

// 第一次 Good
card2 = reviewCard(card2, 'good', now2)
const interval1 = card2.dueDate - now2
console.log(`  ${interval1 === MINUTE_10_MS ? '✅' : '❌'} 第1次 Good → ${(interval1 / 60000).toFixed(0)} 分钟 (预期 10 分钟)`)

// 第二次 Good
card2 = reviewCard(card2, 'good', now2 + MINUTE_10_MS)
const interval2 = card2.interval
console.log(`  ${interval2 === 1 ? '✅' : '❌'} 第2次 Good → ${interval2} 天 (预期 1 天)`)

// 第三次 Good
card2 = reviewCard(card2, 'good', now2 + MINUTE_10_MS + DAY_MS)
const interval3 = card2.interval
console.log(`  ${interval3 === 3 ? '✅' : '❌'} 第3次 Good → ${interval3} 天 (预期 3 天，优化前 6 天)`)

// ===== 测试 3: 遗忘后的惩罚减轻 =====
console.log('\n📋 测试 3: 遗忘后保留 25% 进度')
let card3 = initCard('test', 1000000)
const now3 = 1000000

// 拟学到 30 天间隔
card3.interval = 30
card3.maxInterval = 30
card3.repetitions = 5

// 遗忘
card3 = reviewCard(card3, 'forgot', now3)
const fallback = card3.interval
const expected3 = Math.round(30 * 0.25) // 7.5 → 8
console.log(`  ${fallback === expected3 ? '✅' : '❌'} 遗忘后 → ${fallback} 天 (预期 ${expected3} 天，优化前 1 天)`)
console.log(`  ${card3.lapses === 1 ? '✅' : '❌'} lapses 计数 → ${card3.lapses} (预期 1)`)

// ===== 测试 4: Hard 档位优化 =====
console.log('\n📋 测试 4: Hard 档位优化（0.7 倍间隔）')
let card4 = initCard('test', 1000000)
const now4 = 1000000
card4.interval = 10
card4.repetitions = 3

// Hard
card4 = reviewCard(card4, 'hard', now4)
const hardInterval = card4.interval
const expected4 = Math.round(10 * 0.7) // 7
console.log(`  ${hardInterval === expected4 ? '✅' : '❌'} Hard → ${hardInterval} 天 (预期 ${expected4} 天，优化前 8 天 / 0.8)`)

// ===== 测试 5: 困难词识别 =====
console.log('\n📋 测试 5: 困难词识别（连续遗忘 3 次）')
let card5 = initCard('test', 1000000)
const now5 = 1000000

// 连续遗忘 3 次
card5 = reviewCard(card5, 'forgot', now5)
card5 = reviewCard(card5, 'forgot', now5 + DAY_MS)
card5 = reviewCard(card5, 'forgot', now5 + DAY_MS * 2)
console.log(`  ${card5.lapses === 3 ? '✅' : '❌'} 连续遗忘 → lapses=${card5.lapses} (预期 3)`)

// 现在答对，easeFactor 应该被限制在 2.0
card5.interval = 6
card5.repetitions = 3
card5 = reviewCard(card5, 'good', now5 + DAY_MS * 3)
const limitedEase = card5.easeFactor <= 2.0
console.log(`  ${limitedEase ? '✅' : '❌'} 困难词 easeFactor 限制 → ${card5.easeFactor.toFixed(2)} (应 ≤ 2.0)`)

// ===== 测试 6: 向后兼容 =====
console.log('\n📋 测试 6: 向后兼容（旧格式卡片）')
const oldCard = {
  easeFactor: 2.5,
  interval: 6,
  repetitions: 2,
  dueDate: 1000000,
}

// 旧卡片缺少新字段，应该能正常 review
const upgraded = reviewCard(oldCard, 'good', 1000000)
console.log(`  ${upgraded.lapses === 0 ? '✅' : '❌'} 补充默认 lapses → ${upgraded.lapses}`)
console.log(`  ${upgraded.maxInterval === 3 ? '✅' : '❌'} 补充 maxInterval → ${upgraded.maxInterval}`)
console.log(`  ${upgraded.lastReviewed === 1000000 ? '✅' : '❌'} 补充 lastReviewed → ${upgraded.lastReviewed}`)

// ===== 测试 7: 完整学习路径模拟 =====
console.log('\n📋 测试 7: 完整学习路径模拟（idempotent）')
let card7 = initCard('idempotent', 1000000)
let time = 1000000
const path = []

console.log(`  初始 easeFactor: ${card7.easeFactor.toFixed(2)} (应 ≈ 2.0，因为是技术词)`)

// 模拟真实学习路径
const actions = ['good', 'good', 'good', 'hard', 'good', 'forgot', 'good']
actions.forEach((grade, i) => {
  card7 = reviewCard(card7, grade, time)
  time = card7.dueDate
  const intervalDesc = card7.interval < 1 ? `${Math.round(card7.interval * 24 * 60)}分钟` : `${card7.interval}天`
  path.push(`${grade} → ${intervalDesc}`)
})

console.log('  学习路径:')
path.forEach((p, i) => console.log(`    ${i + 1}. ${p}`))

console.log('\n🎉 所有测试完成！')
console.log('\n💡 预期改进效果:')
console.log('  - 新词巩固时间: 7天 → 4天 (-43%)')
console.log('  - 遗忘后恢复: 1天 → 保留25%进度')
console.log('  - 困难词自动降速')
console.log('  - Hard 档位不再停滞')
