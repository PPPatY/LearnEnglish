/**
 * [INPUT]: 依赖 ../../lib/claude(chat)、./types(Turn, FeedbackReport)
 * [OUTPUT]: 导出 sendMessage()、generateFeedback()
 * [POS]: speaking 模块的 AI 对话管理
 * [PROTOCOL]: 修改 prompt 策略时更新本文件
 */
import { chat, chatJSON } from '../../lib/claude'
import type { Turn, FeedbackReport } from './types'

/**
 * 发送一轮对话，返回 AI 回复。
 * @param systemPrompt 场景的 system prompt（定义 AI 角色）
 * @param turns 当前对话历史
 * @param userMessage 用户本轮说的话
 */
export async function sendMessage(
  systemPrompt: string,
  turns: Turn[],
  userMessage: string,
): Promise<string> {
  // 构造多轮上下文：跳过第一条 assistant 开场白（Claude API 要求 user 开头），然后添加本轮 user 消息
  // turns[0] 总是 assistant 的开场白，从 turns[1] 开始才是真正的对话
  const messages = turns
    .slice(1) // 跳过开场白
    .map((t) => ({ role: t.who, content: t.text }))
    .concat([{ role: 'user' as const, content: userMessage }])

  return chat(messages, { system: systemPrompt, maxTokens: 256, temperature: 0.8 })
}

/**
 * 对话结束后，生成反馈报告。
 * 分析用户在对话中的表现，给出总评、建议、优点。
 */
export async function generateFeedback(
  sceneTitle: string,
  turns: Turn[],
): Promise<FeedbackReport> {
  const transcript = turns.map((t) => `${t.who === 'user' ? 'User' : 'AI'}: ${t.text}`).join('\n')

  const prompt = `You are an English coach. Review this conversation transcript and provide feedback on the user's English.

Scene: ${sceneTitle}

Transcript:
${transcript}

IMPORTANT: Return ONLY a valid JSON object. Do not include any explanatory text before or after the JSON.

Return JSON:
{
  "summary": "1-2 sentence overall assessment",
  "suggestions": ["specific improvement tip 1", "tip 2", ...],
  "strengths": ["what they did well 1", "well 2", ...]
}

Focus on: grammar, fluency, clarity, word choice. Be constructive and specific.`

  return chatJSON<FeedbackReport>(
    [{ role: 'user', content: prompt }],
    { maxTokens: 512, temperature: 0.3 },
  )
}
