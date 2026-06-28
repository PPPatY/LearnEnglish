/**
 * [INPUT]: 依赖 ./store 的复习数据与 grade 动作、../speaking/speech(speak)、../../components
 * [OUTPUT]: 导出 ReviewCard —— 翻面式复习卡，评分驱动 SRS，带发音按钮
 * [POS]: vocabulary 模块的核心交互组件
 * [PROTOCOL]: 修改评分档位时同步 lib/srs 的 Grade
 */
import { useState } from 'react'
import { useVocabStore } from './store'
import { speak } from '../speaking/speech'
import Icon from '../../components/Icon'
import Button from '../../components/Button'
import type { Grade } from '../../lib/srs'

const GRADES: { grade: Grade; label: string; cls: string }[] = [
  { grade: 'forgot', label: '忘了', cls: 'bg-red-500 hover:bg-red-600' },
  { grade: 'hard', label: '模糊', cls: 'bg-amber-500 hover:bg-amber-600' },
  { grade: 'good', label: '认识', cls: 'bg-emerald-500 hover:bg-emerald-600' },
]

export default function ReviewCard() {
  const dueCards = useVocabStore((s) => s.dueCards)
  const grade = useVocabStore((s) => s.grade)
  const [flipped, setFlipped] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const due = dueCards()
  const card = due[0]

  if (!card) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
        <Icon name="check" size={40} className="mx-auto text-emerald-500" />
        <p className="mt-3 font-medium">今天的复习都完成了！</p>
        <p className="mt-1 text-sm text-slate-400">到期的词会自动出现在这里。</p>
      </div>
    )
  }

  function onGrade(g: Grade) {
    grade(card.id, g)
    setFlipped(false)
  }

  async function handleSpeak(e: React.MouseEvent, text: string) {
    e.stopPropagation()
    if (speaking) return
    setSpeaking(true)
    try {
      await speak(text)
    } catch (err) {
      console.error('发音失败:', err)
    } finally {
      setSpeaking(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8">
      <div className="min-h-[180px] select-none">
        <div className="flex items-start justify-center gap-3">
          <div className="flex-1 cursor-pointer text-center" onClick={() => setFlipped((f) => !f)}>
            <div className="text-3xl font-bold">{card.word}</div>
            {card.phonetic && <div className="mt-1 text-sm text-slate-400">{card.phonetic}</div>}
          </div>
          <Button
            variant="icon"
            iconOnly
            icon="volume"
            iconSpin={speaking}
            onClick={(e) => handleSpeak(e, card.word)}
            disabled={speaking}
            title="朗读单词"
          />
        </div>

        {flipped ? (
          <div className="mt-6 space-y-3">
            <div className="cursor-pointer text-center text-lg text-brand-500" onClick={() => setFlipped((f) => !f)}>
              {card.meaning}
            </div>
            {card.example && (
              <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
                <p className="flex-1 cursor-pointer text-sm italic text-slate-600" onClick={() => setFlipped((f) => !f)}>
                  "{card.example}"
                </p>
                <Button
                  variant="icon"
                  iconOnly
                  size="sm"
                  icon="volume"
                  iconSpin={speaking}
                  onClick={(e) => handleSpeak(e, card.example!)}
                  disabled={speaking}
                  title="朗读例句"
                />
              </div>
            )}
          </div>
        ) : (
          <p className="mt-10 cursor-pointer text-center text-sm text-slate-400" onClick={() => setFlipped((f) => !f)}>
            点击卡片查看释义
          </p>
        )}
      </div>

      {flipped && (
        <div className="mt-6 flex justify-center gap-3">
          {GRADES.map((g) => (
            <button
              key={g.grade}
              onClick={() => onGrade(g.grade)}
              className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors ${g.cls}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
