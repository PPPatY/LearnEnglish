/**
 * [INPUT]: 依赖浏览器 fetch，调用本地 /api/chat 代理（见 server/aiProxy.ts）
 * [OUTPUT]: 导出 chat() 发送多轮消息；chatJSON() 期望返回结构化 JSON
 * [POS]: src/lib 下的 AI 封装；上层各模块（writing/speaking）经此与 Claude 交互
 * [PROTOCOL]: 修改请求/返回结构后更新本头注释
 */

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  system?: string
  model?: string
  maxTokens?: number
  temperature?: number
}

/** 发送多轮消息，返回 AI 的纯文本回复。 */
export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      system: opts.system,
      model: opts.model,
      max_tokens: opts.maxTokens,
      temperature: opts.temperature,
    }),
  })

  const data = (await res.json()) as { text?: string; error?: string }
  if (!res.ok || data.error) {
    throw new Error(data.error || `请求失败 (${res.status})`)
  }
  return data.text || ''
}

/**
 * 期望 AI 返回 JSON。会从回复中提取首个合法 JSON 块并解析。
 * 适合写作批改这类需要结构化结果的场景。
 */
export async function chatJSON<T>(messages: ChatMessage[], opts: ChatOptions = {}): Promise<T> {
  const text = await chat(messages, opts)

  // 策略 1: 尝试直接解析整个回复（AI 只返回 JSON）
  try {
    return JSON.parse(text.trim()) as T
  } catch {
    // 继续尝试其他策略
  }

  // 策略 2: 提取第一个 JSON 对象或数组
  // 找到第一个 { 或 [，然后匹配到对应的闭合符号
  const firstBrace = text.indexOf('{')
  const firstBracket = text.indexOf('[')

  let startIdx = -1
  let endChar = ''

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace
    endChar = '}'
  } else if (firstBracket !== -1) {
    startIdx = firstBracket
    endChar = ']'
  }

  if (startIdx === -1) {
    throw new Error('AI 未返回可解析的 JSON（找不到 { 或 [）')
  }

  // 从 startIdx 开始，找到匹配的闭合符号
  let depth = 0
  let endIdx = -1
  const startChar = text[startIdx]

  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === startChar) {
      depth++
    } else if (text[i] === endChar) {
      depth--
      if (depth === 0) {
        endIdx = i
        break
      }
    }
  }

  if (endIdx === -1) {
    throw new Error('AI 返回的 JSON 不完整（找不到匹配的闭合符号）')
  }

  const jsonStr = text.substring(startIdx, endIdx + 1)

  try {
    return JSON.parse(jsonStr) as T
  } catch (err) {
    throw new Error(`AI 返回的 JSON 格式错误: ${(err as Error).message}\n\n提取的内容: ${jsonStr.substring(0, 200)}...`)
  }
}

/**
 * 翻译英文为中文（用于口语练习显示翻译）
 */
export async function translate(englishText: string): Promise<string> {
  const res = await chat(
    [{ role: 'user', content: `Translate this English text to Chinese. Only output the Chinese translation, no explanation:\n\n${englishText}` }],
    { maxTokens: 512, temperature: 0.3 }
  )
  return res.trim()
}
