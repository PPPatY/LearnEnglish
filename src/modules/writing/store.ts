/**
 * [INPUT]: 依赖 zustand、zustand/middleware(persist)、./types
 * [OUTPUT]: 导出 useWritingStore —— 批改会话历史、当前任务，持久化到 localStorage
 * [POS]: writing 模块的状态中心，被 WritingPage / Editor / FeedbackDisplay 消费
 * [PROTOCOL]: 修改持久化结构时升级 version 并处理迁移
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, Feedback } from './types'

interface WritingState {
  sessions: Session[]
  currentTaskId: string | null
  /** 设置当前任务 */
  setCurrentTask: (taskId: string) => void
  /** 保存一次批改会话 */
  saveSession: (taskId: string, taskTitle: string, userText: string, feedback: Feedback) => void
  /** 删除一个会话 */
  removeSession: (id: string) => void
  /** 清空历史 */
  clearHistory: () => void
}

export const useWritingStore = create<WritingState>()(
  persist(
    (set) => ({
      sessions: [],
      currentTaskId: null,

      setCurrentTask: (taskId) => set({ currentTaskId: taskId }),

      saveSession: (taskId, taskTitle, userText, feedback) =>
        set((state) => ({
          sessions: [
            {
              id: `${taskId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              taskId,
              taskTitle,
              userText,
              feedback,
              createdAt: Date.now(),
            },
            ...state.sessions,
          ].slice(0, 50), // 最多保留 50 条历史
        })),

      removeSession: (id) =>
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),

      clearHistory: () => set({ sessions: [] }),
    }),
    {
      name: 'learn-english-writing',
      version: 1,
      migrate: (persistedState: any, _version: number) => {
        // 未来版本迁移逻辑
        return persistedState as WritingState
      },
    },
  ),
)
