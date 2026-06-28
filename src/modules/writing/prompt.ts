/**
 * [INPUT]: 依赖 ../lib/claude(chatJSON)、./types(Feedback)
 * [OUTPUT]: 导出 correctWriting() —— 调用 AI 批改英文写作
 * [POS]: writing 模块的 AI 调用封装
 * [PROTOCOL]: 修改 prompt 策略或返回结构时更新本文件与 types.ts
 */
import { chatJSON } from '../../lib/claude'
import type { Feedback } from './types'

const SYSTEM_PROMPT = `You are an English writing coach for software engineers. Your task is to review and correct their technical writing (emails, PR descriptions, documentation, etc.).

IMPORTANT: Return ONLY a valid JSON object. Do not include any explanatory text before or after the JSON.

Return a JSON object with this structure:
{
  "items": [
    {
      "type": "grammar" | "style" | "word-choice",
      "original": "the exact phrase from the user's text",
      "issue": "what's wrong",
      "suggestion": "how to fix it"
    }
  ],
  "rewrite": "a complete rewritten version that is natural and professional",
  "summary": "optional overall feedback (1-2 sentences)"
}

Focus on:
- Grammar errors (tense, subject-verb agreement, articles)
- Style improvements (clarity, conciseness, tone)
- Word choice (replacing Chinglish with idiomatic English)

Be constructive and specific. If the text is already good, say so in the summary and provide minimal items.`

/**
 * 调用 AI 批改英文写作。
 * @param userText 用户写的英文
 * @param taskContext 任务上下文（可选，帮助 AI 理解场景）
 */
export async function correctWriting(
  userText: string,
  taskContext?: string,
): Promise<Feedback> {
  const userPrompt = taskContext
    ? `Context: ${taskContext}\n\nUser's text:\n${userText}`
    : `User's text:\n${userText}`

  return chatJSON<Feedback>(
    [{ role: 'user', content: userPrompt }],
    { system: SYSTEM_PROMPT, maxTokens: 2048, temperature: 0.3 },
  )
}
