/**
 * [INPUT]: 依赖 ./store、./scenes、./conversation、./speech、./types、../../components
 * [OUTPUT]: 导出 SpeakingPage —— 口语陪练模块主页面
 * [POS]: speaking 模块入口页，挂在 /speaking 路由
 * [PROTOCOL]: 增减子视图时更新本头注释
 */
import { useState, useEffect, useRef } from 'react'
import { useSpeakingStore } from './store'
import { SCENES } from './scenes'
import { sendMessage, generateFeedback } from './conversation'
import { checkSupport, startListening, speak, stopSpeaking } from './speech'
import { translate } from '../../lib/claude'
import Icon, { type IconName } from '../../components/Icon'
import Button from '../../components/Button'
import type { Scene, Turn } from './types'

type Tab = 'scenes' | 'conversation' | 'history'

// 场景类目 → 图标 + 标签
const CATEGORY_META: Record<string, { icon: IconName; label: string }> = {
  work: { icon: 'briefcase', label: '日常工作' },
  interview: { icon: 'target', label: '技术面试' },
  casual: { icon: 'coffee', label: '日常交流' },
}

export default function SpeakingPage() {
  const { sessions, currentSession, currentSceneId, startSession, addTurn, endSession, cancelSession, removeSession } = useSpeakingStore()
  const [tab, setTab] = useState<Tab>('scenes')
  const [listening, setListening] = useState(false)
  const [aiThinking, setAiThinking] = useState(false)
  const [error, setError] = useState('')
  const [support] = useState(checkSupport())
  const [speakingTurnIndex, setSpeakingTurnIndex] = useState<number | null>(null)
  const [translations, setTranslations] = useState<{ [key: string]: string }>({})
  const [translating, setTranslating] = useState<{ [key: string]: boolean }>({})
  const [stopListening, setStopListening] = useState<(() => void) | null>(null)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const conversationEndRef = useRef<HTMLDivElement>(null)

  // 从 store 和 SCENES 恢复当前场景
  const currentScene = currentSceneId ? SCENES.find((s) => s.id === currentSceneId) : null

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentSession?.turns])

  useEffect(() => {
    return () => {
      if (currentSession) {
        currentSession.turns.forEach((turn) => {
          if (turn.audioUrl) URL.revokeObjectURL(turn.audioUrl)
        })
      }
    }
  }, [currentSession])

  function handleSelectScene(scene: Scene) {
    startSession(scene.id, scene.title, scene.openingLine)
    setTab('conversation')
    setError('')
    speak(scene.openingLine).catch(() => {})
  }

  async function handleUserSpeak() {
    if (!currentSession || !currentScene) {
      setError('场景信息丢失，请重新选择场景')
      return
    }
    setListening(true)
    setError('')
    try {
      const { promise, stop } = startListening()
      setStopListening(() => stop)
      const result = await promise
      setStopListening(null)
      setListening(false)
      if (!result.text.trim()) {
        setError('未识别到语音，请重新录音')
        return
      }
      addTurn('user', result.text, result.audioUrl)
      setAiThinking(true)
      const aiReply = await sendMessage(currentScene.systemPrompt, currentSession.turns, result.text)
      addTurn('assistant', aiReply)
      setAiThinking(false)
      speak(aiReply).catch((err) => console.error('朗读失败:', err))
    } catch (err) {
      console.error('语音识别错误:', err)
      setError((err as Error).message)
      setListening(false)
      setStopListening(null)
      setAiThinking(false)
    }
  }

  function handleStopListening() {
    if (stopListening) stopListening()
  }

  async function handleSpeakTurn(turn: Turn, index: number) {
    if (speakingTurnIndex !== null) return
    setSpeakingTurnIndex(index)
    try {
      if (turn.who === 'user' && turn.audioUrl) {
        await playAudio(turn.audioUrl)
      } else {
        await speak(turn.text)
      }
    } catch (err) {
      console.error('播放失败:', err)
    } finally {
      setSpeakingTurnIndex(null)
    }
  }

  function playAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url)
      audio.onended = () => resolve()
      audio.onerror = (err) => reject(err)
      audio.play().catch(reject)
    })
  }

  async function handleTranslateText(text: string, key: string) {
    if (translations[key] || translating[key]) return
    setTranslating((t) => ({ ...t, [key]: true }))
    try {
      const result = await translate(text)
      setTranslations((t) => ({ ...t, [key]: result }))
    } catch (err) {
      console.error('翻译失败:', err)
      setTranslations((t) => ({ ...t, [key]: '翻译失败' }))
    } finally {
      setTranslating((t) => ({ ...t, [key]: false }))
    }
  }

  async function handleEndSession() {
    if (!currentSession) return
    stopSpeaking()
    setAiThinking(true)
    setError('')
    try {
      const feedback = await generateFeedback(currentSession.sceneTitle, currentSession.turns)
      endSession(feedback)
      setAiThinking(false)
      setTab('history')
    } catch (err) {
      setError((err as Error).message)
      setAiThinking(false)
    }
  }

  function handleCancel() {
    stopSpeaking()
    cancelSession()
    setTab('scenes')
  }

  // 可复用的翻译块：显示翻译按钮 / 翻译中 / 翻译结果
  function TranslateBlock({ text, tkey, tone = 'normal' }: { text: string; tkey: string; tone?: 'normal' | 'onBrand' }) {
    const btnCls = tone === 'onBrand'
      ? 'text-brand-200 hover:text-white'
      : 'text-blue-500 hover:text-blue-600'
    const resultCls = tone === 'onBrand' ? 'text-brand-100' : 'text-slate-500'
    if (translations[tkey]) {
      return <div className={`mt-1 text-xs ${resultCls}`}>{translations[tkey]}</div>
    }
    if (translating[tkey]) {
      return (
        <div className={`mt-1 flex items-center gap-1 text-xs ${tone === 'onBrand' ? 'text-brand-200' : 'text-slate-400'}`}>
          <Icon name="spinner" size={12} spin /> 翻译中...
        </div>
      )
    }
    return (
      <button onClick={() => handleTranslateText(text, tkey)} className={`mt-1 flex items-center gap-1 text-xs ${btnCls}`}>
        <Icon name="translate" size={13} /> 显示翻译
      </button>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">口语陪练</h1>
        <p className="mt-1 text-sm text-slate-500">选场景 → 语音对话 → AI 角色扮演 → 反馈报告</p>
        {!support.recognition && (
          <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            {/* 目标用户：中国开发者，中文提示更友好 */}
            <Icon name="mic" size={16} /> 你的浏览器不支持语音识别，请使用 Chrome 或 Edge。
          </p>
        )}
        {!support.synthesis && (
          <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            {/* 目标用户：中国开发者，中文提示更友好 */}
            <Icon name="volume" size={16} /> 你的浏览器不支持语音合成，AI 回复将无法朗读。
          </p>
        )}
      </header>

      {!currentSession && (
        <div className="mb-6 flex gap-2">
          {([
            ['scenes', '场景列表'],
            ['history', `历史 (${sessions.length})`],
          ] as [Tab, string][]).map(([key, label]) => (
            <Button key={key} variant={tab === key ? 'primary' : 'secondary'} onClick={() => setTab(key)}>
              {label}
            </Button>
          ))}
        </div>
      )}

      {tab === 'scenes' && !currentSession && (
        <div className="grid gap-4 sm:grid-cols-2">
          {SCENES.map((scene) => {
            const meta = CATEGORY_META[scene.category]
            return (
              <button
                key={scene.id}
                onClick={() => handleSelectScene(scene)}
                disabled={!support.recognition}
                className="rounded-xl border border-slate-200 bg-white p-5 text-left transition-shadow hover:shadow-md disabled:opacity-50"
              >
                <div className="font-semibold">{scene.title}</div>
                <div className="mt-1 text-sm text-slate-500">{scene.description}</div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                  {meta && <Icon name={meta.icon} size={14} />}
                  {meta?.label}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {currentSession && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <div className="font-semibold">{currentSession.sceneTitle}</div>
              <div className="text-xs text-slate-400">{currentSession.turns.length} 轮对话</div>
            </div>
            <div className="flex gap-2">
              <Button variant="success" onClick={handleEndSession} disabled={aiThinking} icon={aiThinking ? 'spinner' : 'check'} iconSpin={aiThinking}>
                {aiThinking ? '生成反馈中...' : '结束并反馈'}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>取消</Button>
            </div>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4">
            {currentSession.turns.map((turn, i) => (
              <div key={i} className={`flex ${turn.who === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[80%] items-start gap-2 ${turn.who === 'user' ? 'flex-row-reverse' : ''}`}>
                  <Button
                    variant="icon"
                    iconOnly
                    size="sm"
                    icon="volume"
                    iconSpin={speakingTurnIndex === i}
                    onClick={() => handleSpeakTurn(turn, i)}
                    disabled={speakingTurnIndex === i}
                    title={turn.who === 'user' && turn.audioUrl ? '播放录音' : '朗读这句'}
                  />
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 text-sm ${
                        turn.who === 'user'
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {turn.text}
                    </div>
                    <TranslateBlock text={turn.text} tkey={`cur-${i}`} tone={turn.who === 'user' ? 'onBrand' : 'normal'} />
                  </div>
                </div>
              </div>
            ))}
            <div ref={conversationEndRef} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={async () => {
                if (listening) handleStopListening()
                else await handleUserSpeak()
              }}
              disabled={aiThinking || !support.recognition}
              className={`flex items-center justify-center rounded-full p-6 text-white transition-all disabled:opacity-50 ${
                listening ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'bg-brand-500 hover:bg-brand-600'
              }`}
            >
              <Icon name={listening ? 'stop' : aiThinking ? 'spinner' : 'mic'} size={32} spin={aiThinking} />
            </button>
            <p className="text-center text-xs text-slate-400">
              {listening && '正在录音...（点击停止）'}
              {aiThinking && 'AI 正在思考...'}
              {!listening && !aiThinking && !support.recognition && '浏览器不支持语音识别'}
              {!listening && !aiThinking && support.recognition && '点击麦克风开始说话'}
            </p>
          </div>
        </div>
      )}

      {tab === 'history' && !currentSession && (
        <div className="space-y-4">
          {sessions.length === 0 && <p className="text-slate-400">还没有对话历史。</p>}
          {sessions.map((s) => {
            const isExpanded = expandedSessions.has(s.id)
            return (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{s.sceneTitle}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {new Date(s.createdAt).toLocaleString('zh-CN')} · {s.turns.length} 轮
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={isExpanded ? 'chevronUp' : 'chevronDown'}
                      onClick={() => {
                        const next = new Set(expandedSessions)
                        if (isExpanded) next.delete(s.id)
                        else next.add(s.id)
                        setExpandedSessions(next)
                      }}
                    >
                      {isExpanded ? '收起对话' : '查看对话'}
                    </Button>
                    <Button variant="danger" iconOnly icon="trash" onClick={() => removeSession(s.id)} title="删除" />
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                    {s.turns.map((turn, i) => (
                      <div key={i} className="rounded bg-white p-2 text-sm">
                        <div className="mb-1 text-xs font-medium text-slate-400">{turn.who === 'user' ? '你' : 'AI'}</div>
                        <div className="text-slate-700">{turn.text}</div>
                        <TranslateBlock text={turn.text} tkey={`${s.id}-${i}`} />
                      </div>
                    ))}
                  </div>
                )}

                {s.feedback && (
                  <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3 text-sm">
                    <div>
                      <span className="font-medium">总评：</span>
                      <span className="text-slate-600">{s.feedback.summary}</span>
                      <TranslateBlock text={s.feedback.summary} tkey={`${s.id}-summary`} />
                    </div>
                    {s.feedback.suggestions.length > 0 && (
                      <div>
                        <span className="font-medium">建议：</span>
                        <ul className="ml-4 mt-1 list-disc text-slate-600">
                          {s.feedback.suggestions.map((sug, i) => (
                            <li key={i}>
                              <div>{sug}</div>
                              <TranslateBlock text={sug} tkey={`${s.id}-sug-${i}`} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {s.feedback.strengths.length > 0 && (
                      <div>
                        <span className="font-medium">优点：</span>
                        <ul className="ml-4 mt-1 list-disc text-slate-600">
                          {s.feedback.strengths.map((str, i) => (
                            <li key={i}>
                              <div>{str}</div>
                              <TranslateBlock text={str} tkey={`${s.id}-str-${i}`} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
