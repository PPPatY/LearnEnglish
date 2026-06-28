/**
 * [INPUT]: 依赖 zustand、zustand/middleware(persist)、./types
 * [OUTPUT]: 导出 useSpeakingStore —— 对话会话历史、当前会话、当前场景 ID，持久化到 localStorage
 * [POS]: speaking 模块的状态中心，被 SpeakingPage 消费
 * [PROTOCOL]: 修改持久化结构时升级 version 并处理迁移
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, FeedbackReport } from './types'

interface SpeakingState {
  sessions: Session[]
  currentSession: Session | null
  /** 当前场景 ID（防止组件状态丢失） */
  currentSceneId: string | null
  /** 开始新会话 */
  startSession: (sceneId: string, sceneTitle: string, openingLine: string) => void
  /** 添加一轮对话 */
  addTurn: (who: 'user' | 'assistant', text: string, audioUrl?: string) => void
  /** 结束当前会话并保存反馈 */
  endSession: (feedback: FeedbackReport) => void
  /** 放弃当前会话（不保存） */
  cancelSession: () => void
  /** 删除历史会话 */
  removeSession: (id: string) => void
}

export const useSpeakingStore = create<SpeakingState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      currentSceneId: null,

      startSession: (sceneId, sceneTitle, openingLine) => {
        const now = Date.now()
        const session: Session = {
          id: `${sceneId}-${now}-${Math.random().toString(36).slice(2, 7)}`,
          sceneId,
          sceneTitle,
          turns: [{ who: 'assistant', text: openingLine, timestamp: now }],
          createdAt: now,
        }
        set({ currentSession: session, currentSceneId: sceneId })
      },

      addTurn: (who, text, audioUrl) => {
        const current = get().currentSession
        if (!current) return
        set({
          currentSession: {
            ...current,
            turns: [...current.turns, { who, text, timestamp: Date.now(), audioUrl }],
          },
        })
      },

      endSession: (feedback) => {
        const current = get().currentSession
        if (!current) return
        const finalized = { ...current, feedback, endedAt: Date.now() }
        set({
          sessions: [finalized, ...get().sessions].slice(0, 30), // 最多保留 30 次历史
          currentSession: null,
          currentSceneId: null,
        })
      },

      cancelSession: () => {
        const current = get().currentSession
        // 释放当前会话中所有录音的内存
        if (current) {
          current.turns.forEach(turn => {
            if (turn.audioUrl) {
              URL.revokeObjectURL(turn.audioUrl)
            }
          })
        }
        set({ currentSession: null, currentSceneId: null })
      },

      removeSession: (id) => {
        const session = get().sessions.find(s => s.id === id)
        // 释放该会话中所有录音的内存
        if (session) {
          session.turns.forEach(turn => {
            if (turn.audioUrl) {
              URL.revokeObjectURL(turn.audioUrl)
            }
          })
        }
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) }))
      },
    }),
    {
      name: 'learn-english-speaking',
      version: 2, // 增加版本号因为添加了 currentSceneId
      migrate: (persistedState: any, version: number) => {
        // 从 v1 升级到 v2：添加 currentSceneId 字段
        if (version < 2) {
          return {
            ...persistedState,
            currentSceneId: null, // 新增字段
          } as SpeakingState
        }
        return persistedState as SpeakingState
      },
    },
  ),
)
