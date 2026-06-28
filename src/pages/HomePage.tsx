/**
 * [INPUT]: 依赖 react-router (Link)、../lib/claude(chat)、各模块 store、../components/Icon、../components/Button
 * [OUTPUT]: 导出 HomePage —— Dashboard 今日概览 + AI 连通性自检 + 统计数据
 * [POS]: 应用首页，挂在 / 路由
 * [PROTOCOL]: 新增模块卡片时更新此处
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { chat } from '../lib/claude'
import { useVocabStore } from '../modules/vocabulary/store'
import { useWritingStore } from '../modules/writing/store'
import { useSpeakingStore } from '../modules/speaking/store'
import Icon, { type IconName } from '../components/Icon'
import Button from '../components/Button'

const MODULES: { to: string; icon: IconName; title: string; desc: string }[] = [
  { to: '/vocabulary', icon: 'cards', title: '词汇 SRS', desc: '间隔重复记技术词汇' },
  { to: '/writing', icon: 'pencil', title: '写作批改', desc: 'AI 批改 PR/邮件/issue' },
  { to: '/speaking', icon: 'mic', title: '口语陪练', desc: '语音对话 + 实时纠错' },
]

export default function HomePage() {
  const cards = useVocabStore((s) => s.cards)
  const dueCards = useVocabStore((s) => s.dueCards)
  const writingSessions = useWritingStore((s) => s.sessions)
  const speakingSessions = useSpeakingStore((s) => s.sessions)
  const [aiStatus, setAiStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle')
  const [aiMsg, setAiMsg] = useState('')

  async function testAI() {
    setAiStatus('testing')
    setAiMsg('')
    try {
      const reply = await chat([{ role: 'user', content: 'Reply with exactly: OK' }], { maxTokens: 16 })
      setAiStatus('ok')
      setAiMsg(reply.trim())
    } catch (err) {
      setAiStatus('fail')
      setAiMsg((err as Error).message)
    }
  }

  const stats: { to: string; icon: IconName; label: string; value: number; sub: React.ReactNode }[] = [
    { to: '/vocabulary', icon: 'cards', label: '词汇库', value: cards.length, sub: <>待复习 <span className="font-semibold text-brand-500">{dueCards().length}</span> 词</> },
    { to: '/writing', icon: 'pencil', label: '写作批改', value: writingSessions.length, sub: '次批改记录' },
    { to: '/speaking', icon: 'mic', label: '口语陪练', value: speakingSessions.length, sub: '次对话记录' },
  ]

  return (
    <div className="mx-auto max-w-3xl p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">工程师英语训练</h1>
        <p className="mt-2 text-slate-500">每天 90 分钟，系统提升口语 / 听力 / 技术表达 / 读写。</p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        {MODULES.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <Icon name={m.icon} size={22} />
            </div>
            <div className="mt-3 font-semibold">{m.title}</div>
            <div className="mt-1 text-sm text-slate-500">{m.desc}</div>
          </Link>
        ))}
      </section>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">统计数据</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <Link key={s.to} to={s.to} className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-2">
                <Icon name={s.icon} size={18} className="text-brand-500" />
                <span className="text-sm text-slate-500">{s.label}</span>
              </div>
              <div className="mt-2 text-2xl font-bold">{s.value}</div>
              <div className="mt-1 text-xs text-slate-400">{s.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">AI 连接自检</h2>
        <div className="flex items-start gap-3">
          <Button
            onClick={testAI}
            disabled={aiStatus === 'testing'}
            icon={aiStatus === 'testing' ? 'spinner' : 'send'}
            iconSpin={aiStatus === 'testing'}
            size="sm"
          >
            {aiStatus === 'testing' ? '测试中...' : '测试连接'}
          </Button>
          {aiStatus === 'ok' && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600">
              <Icon name="check" size={16} />
              连接正常：{aiMsg}
            </div>
          )}
          {aiStatus === 'fail' && (
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm text-red-500">
                <Icon name="x" size={16} />
                连接失败
              </div>
              <p className="mt-1 text-xs text-slate-500">{aiMsg}</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          检查 AI 是否能正常调用。如失败，请检查 .env.local 中的 API key 配置。
        </p>
      </section>
    </div>
  )
}
