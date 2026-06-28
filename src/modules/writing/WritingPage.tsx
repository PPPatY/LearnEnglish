/**
 * [INPUT]: 依赖 ./store、./taskTemplates、./prompt、./types、../../components
 * [OUTPUT]: 导出 WritingPage —— 写作批改模块主页面
 * [POS]: writing 模块入口页，挂在 /writing 路由
 * [PROTOCOL]: 增减子视图时更新本头注释
 */
import { useState } from 'react'
import { useWritingStore } from './store'
import { WRITING_TASKS } from './taskTemplates'
import { correctWriting } from './prompt'
import Icon, { type IconName } from '../../components/Icon'
import Button from '../../components/Button'
import type { Feedback } from './types'

type Tab = 'tasks' | 'editor' | 'history'

// 批改问题类型 → 图标 + 标签
const ITEM_META: Record<string, { icon: IconName; label: string }> = {
  grammar: { icon: 'pencil', label: '语法' },
  style: { icon: 'target', label: '风格' },
  'word-choice': { icon: 'book', label: '用词' },
}

export default function WritingPage() {
  const { sessions, currentTaskId, setCurrentTask, saveSession, removeSession } = useWritingStore()
  const [tab, setTab] = useState<Tab>('tasks')
  const [userText, setUserText] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentTask = WRITING_TASKS.find((t) => t.id === currentTaskId)

  async function handleSubmit() {
    if (!userText.trim() || !currentTask) return
    setLoading(true)
    setError('')
    setFeedback(null)
    try {
      const result = await correctWriting(userText, currentTask.instructions)
      setFeedback(result)
      saveSession(currentTask.id, currentTask.title, userText, result)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function selectTask(taskId: string) {
    setCurrentTask(taskId)
    setTab('editor')
    setUserText('')
    setFeedback(null)
    setError('')
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">写作批改</h1>
        <p className="mt-1 text-sm text-slate-500">
          选任务 → 写英文 → AI 批改（语法/地道度/改写）
        </p>
      </header>

      <div className="mb-6 flex gap-2">
        {([
          ['tasks', '任务列表'],
          ['editor', '写作与批改'],
          ['history', `历史 (${sessions.length})`],
        ] as [Tab, string][]).map(([key, label]) => (
          <Button
            key={key}
            variant={tab === key ? 'primary' : 'secondary'}
            onClick={() => setTab(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === 'tasks' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {WRITING_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => selectTask(task.id)}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left transition-shadow hover:shadow-md"
            >
              <div className="font-semibold">{task.title}</div>
              <div className="mt-1 text-sm text-slate-500">{task.description}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <Icon name={task.category === 'work' ? 'mail' : 'code'} size={14} />
                {task.category === 'work' && '工作文档'}
                {task.category === 'code' && '代码文档'}
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === 'editor' && (
        <div className="space-y-4">
          {currentTask ? (
            <>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="font-semibold">{currentTask.title}</div>
                <div className="mt-1 text-sm text-slate-500">{currentTask.instructions}</div>
                {currentTask.example && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-brand-500">查看示例</summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded bg-slate-50 p-2 text-xs">
                      {currentTask.example}
                    </pre>
                  </details>
                )}
              </div>

              <textarea
                className="w-full rounded-xl border border-slate-300 bg-white p-4 text-sm"
                rows={10}
                placeholder="在这里写你的英文..."
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
              />

              <Button
                onClick={handleSubmit}
                disabled={!userText.trim() || loading}
                icon={loading ? 'spinner' : 'send'}
                iconSpin={loading}
              >
                {loading ? '批改中...' : '提交批改'}
              </Button>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {feedback && (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                  <div className="font-semibold">批改结果</div>

                  {feedback.summary && (
                    <p className="text-sm text-slate-600">{feedback.summary}</p>
                  )}

                  {feedback.items.length > 0 && (
                    <div>
                      <div className="mb-2 text-sm font-medium">问题列表</div>
                      <ul className="space-y-3">
                        {feedback.items.map((item, i) => {
                          const meta = ITEM_META[item.type]
                          return (
                            <li key={i} className="rounded-lg bg-slate-50 p-3 text-sm">
                              <div className="flex items-start gap-2">
                                <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
                                  {meta && <Icon name={meta.icon} size={13} />}
                                  {meta?.label}
                                </span>
                                <div className="flex-1">
                                  <div className="text-slate-600">
                                    <span className="line-through">{item.original}</span> → {item.suggestion}
                                  </div>
                                  <div className="mt-1 text-xs text-slate-400">{item.issue}</div>
                                </div>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 text-sm font-medium">改写版本</div>
                    <div className="rounded-lg bg-emerald-50 p-4 text-sm">
                      {feedback.rewrite}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400">请先从"任务列表"选择一个任务。</p>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {sessions.length === 0 && <p className="text-slate-400">还没有批改历史。</p>}
          {sessions.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{s.taskTitle}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {new Date(s.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
                <Button variant="danger" iconOnly icon="trash" onClick={() => removeSession(s.id)} title="删除" />
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <span className="text-sm font-medium">原文：</span>
                  <p className="mt-1 rounded bg-slate-50 p-2 text-sm">{s.userText}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">改写：</span>
                  <p className="mt-1 rounded bg-emerald-50 p-2 text-sm">{s.feedback.rewrite}</p>
                </div>
                {s.feedback.items.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">问题：</span>
                    <ul className="mt-1 ml-4 list-disc text-sm text-slate-600">
                      {s.feedback.items.map((item, i) => (
                        <li key={i}>{item.issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
