/**
 * [INPUT]: 依赖 ./store 的 addWord 动作、../../components/Button
 * [OUTPUT]: 导出 AddWordForm —— 手动添加生词的表单
 * [POS]: vocabulary 模块的录入组件
 * [PROTOCOL]: 字段变更时同步 store.addWord 与 types
 */
import { useState } from 'react'
import { useVocabStore } from './store'
import Button from '../../components/Button'

export default function AddWordForm({ onDone }: { onDone: () => void }) {
  const addWord = useVocabStore((s) => s.addWord)
  const [word, setWord] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [phonetic, setPhonetic] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!word.trim() || !meaning.trim()) return
    addWord(word.trim(), meaning.trim(), example.trim() || undefined, phonetic.trim() || undefined)
    onDone()
  }

  const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm'

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium">单词 *</label>
        <input className={field} value={word} onChange={(e) => setWord(e.target.value)} placeholder="e.g. idempotent" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">释义 *</label>
        <input className={field} value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="幂等的" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">音标</label>
        <input className={field} value={phonetic} onChange={(e) => setPhonetic(e.target.value)} placeholder="/aɪˈdempətənt/" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">例句</label>
        <textarea className={field} rows={2} value={example} onChange={(e) => setExample(e.target.value)} placeholder="Make the handler idempotent." />
      </div>
      <Button type="submit" icon="plus">
        添加
      </Button>
    </form>
  )
}
