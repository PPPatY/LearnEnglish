/**
 * [INPUT]: 依赖 zustand、zustand/middleware(persist)、lib/srs、./types、data/techWords
 * [OUTPUT]: 导出 useVocabStore —— 词卡状态、复习与增删动作，持久化到 localStorage
 * [POS]: vocabulary 模块的状态中心，被 VocabularyPage / ReviewCard 消费
 * [PROTOCOL]: 修改持久化结构时升级 version 并处理迁移
 * [VERSION]: v2 - 新增 SRS v2 字段（lapses, maxInterval 等）
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { initCard, reviewCard, isDue, type Grade } from '../../lib/srs'
import type { VocabCard } from './types'
import { TECH_WORDS } from '../../data/techWords'

interface VocabState {
  cards: VocabCard[]
  seeded: boolean
  /** 首次加载时灌入内置词库 */
  seedIfEmpty: () => void
  /** 当前到期需复习的卡片 */
  dueCards: () => VocabCard[]
  /** 评分某张卡，更新其 SRS 状态 */
  grade: (id: string, grade: Grade) => void
  /** 用户新增一个词 */
  addWord: (word: string, meaning: string, example?: string, phonetic?: string) => void
  /** 删除一个词 */
  removeWord: (id: string) => void
}

function makeCard(
  seed: { word: string; meaning: string; example?: string; phonetic?: string },
  source: 'builtin' | 'user',
): VocabCard {
  const now = Date.now()
  return {
    id: `${source}-${seed.word}-${now}-${Math.random().toString(36).slice(2, 7)}`,
    word: seed.word,
    meaning: seed.meaning,
    example: seed.example,
    phonetic: seed.phonetic,
    srs: initCard(seed.word, now), // v2: 传入 word 用于计算初始难度
    source,
    createdAt: now,
  }
}

export const useVocabStore = create<VocabState>()(
  persist(
    (set, get) => ({
      cards: [],
      seeded: false,

      seedIfEmpty: () => {
        if (get().seeded) return
        const cards = TECH_WORDS.map((w) => makeCard(w, 'builtin'))
        set({ cards, seeded: true })
      },

      dueCards: () => {
        const now = Date.now()
        return get().cards.filter((c) => isDue(c.srs, now))
      },

      grade: (id, grade) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, srs: reviewCard(c.srs, grade) } : c,
          ),
        })),

      addWord: (word, meaning, example, phonetic) =>
        set((state) => ({
          cards: [...state.cards, makeCard({ word, meaning, example, phonetic }, 'user')],
        })),

      removeWord: (id) =>
        set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),
    }),
    {
      name: 'learn-english-vocab',
      version: 2, // v2: 升级到 SRS v2
      migrate: (persistedState: any, version: number) => {
        // v1 → v2：为旧卡片添加 SRS v2 新字段
        if (version < 2) {
          const now = Date.now()
          persistedState.cards = persistedState.cards.map((c: VocabCard) => ({
            ...c,
            srs: {
              ...c.srs,
              lapses: 0,
              maxInterval: c.srs.interval || 0,
              lastReviewed: now,
              initialDifficulty: 2.5, // 旧卡片统一使用默认难度
            },
          }))
        }
        return persistedState as VocabState
      },
    },
  ),
)
