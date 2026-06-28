/**
 * [INPUT]: 依赖 ./store、./ReviewCard、./AddWordForm、./types、../speaking/speech(speak)、../../components/Button
 * [OUTPUT]: 导出 VocabularyPage —— 词汇模块主页面（复习 / 词表 / 添加）
 * [POS]: vocabulary 模块入口页，挂在 /vocabulary 路由
 * [PROTOCOL]: 增减子视图时更新本头注释
 */
import { useEffect, useState } from 'react'
import { useVocabStore } from './store'
import { speak } from '../speaking/speech'
import ReviewCard from './ReviewCard'
import AddWordForm from './AddWordForm'
import Button from '../../components/Button'

type Tab = 'review' | 'list' | 'add'

export default function VocabularyPage() {
  const seedIfEmpty = useVocabStore((s) => s.seedIfEmpty)
  const cards = useVocabStore((s) => s.cards)
  const dueCards = useVocabStore((s) => s.dueCards)
  const removeWord = useVocabStore((s) => s.removeWord)
  const [tab, setTab] = useState<Tab>('review')
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  useEffect(() => {
    seedIfEmpty()
  }, [seedIfEmpty])

  const due = dueCards()

  async function handleSpeak(word: string, cardId: string) {
    if (speakingId) return
    setSpeakingId(cardId)
    try {
      await speak(word)
    } catch (err) {
      console.error('发音失败:', err)
    } finally {
      setSpeakingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">词汇 SRS</h1>
        <p className="mt-1 text-sm text-slate-500">
          共 {cards.length} 词 · 待复习 <span className="font-semibold text-brand-500">{due.length}</span> 词
        </p>
      </header>

      <div className="mb-6 flex gap-2">
        {([
          ['review', `复习 (${due.length})`],
          ['list', `词表 (${cards.length})`],
          ['add', '添加'],
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

      {tab === 'review' && <ReviewCard />}
      {tab === 'add' && <AddWordForm onDone={() => setTab('list')} />}
      {tab === 'list' && (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {cards.length === 0 && <li className="p-4 text-slate-400">还没有词。</li>}
          {cards.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex-1">
                <div className="font-semibold">
                  {c.word}{' '}
                  {c.phonetic && <span className="text-xs font-normal text-slate-400">{c.phonetic}</span>}
                </div>
                <div className="text-sm text-slate-500">{c.meaning}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="icon"
                  iconOnly
                  icon="volume"
                  iconSpin={speakingId === c.id}
                  onClick={() => handleSpeak(c.word, c.id)}
                  disabled={speakingId === c.id}
                  title="朗读单词"
                />
                <Button
                  variant="danger"
                  iconOnly
                  icon="trash"
                  onClick={() => removeWord(c.id)}
                  title="删除"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
