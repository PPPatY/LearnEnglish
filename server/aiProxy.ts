/**
 * [INPUT]: 依赖 process.env (ANTHROPIC_API_KEY / ANTHROPIC_BASE_URL / ANTHROPIC_MODEL)
 * [OUTPUT]: 导出 aiProxy() —— 一个 Vite Plugin，在 dev server 注入 /api/chat 端点
 * [POS]: server 模块唯一文件；前端经此代理调用 Claude，API key 只存在服务端
 * [PROTOCOL]: 修改端点/转发逻辑后更新本头注释与 server/CLAUDE.md
 */
import type { Plugin, Connect } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

const DEFAULT_BASE_URL = 'https://api.anthropic.com'
const DEFAULT_MODEL = 'claude-opus-4-8'

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  system?: string
  model?: string
  max_tokens?: number
  temperature?: number
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

/**
 * Vite 插件：在开发服务器上挂载 POST /api/chat。
 * 前端发送 { messages, system, ... }，此处注入 key 后转发到 Claude Messages API，
 * 返回精简后的 { text } 或 { error }。
 */
export function aiProxy(): Plugin {
  return {
    name: 'learn-english-ai-proxy',
    configureServer(server) {
      const handler: Connect.NextHandleFunction = async (req, res, next) => {
        if (req.url !== '/api/chat' || req.method !== 'POST') return next()

        const apiKey = process.env.ANTHROPIC_API_KEY
        const baseUrl = (process.env.ANTHROPIC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')
        const defaultModel = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL

        if (!apiKey) {
          return sendJson(res, 500, {
            error: 'ANTHROPIC_API_KEY 未配置。请在 .env.local 中设置后重启 dev server。',
          })
        }

        // 验证 API key 格式（常见格式：sk-ant-xxx, mg-xxx 等）
        if (apiKey.length < 10 || !/^[a-zA-Z0-9-_]+$/.test(apiKey)) {
          return sendJson(res, 500, {
            error: `ANTHROPIC_API_KEY 格式不正确。当前值: ${apiKey.substring(0, 8)}... （请检查是否复制完整）`,
          })
        }

        try {
          const raw = await readBody(req)
          const body = JSON.parse(raw) as ChatRequestBody

          const upstream = await fetch(`${baseUrl}/v1/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: body.model || defaultModel,
              max_tokens: body.max_tokens ?? 1024,
              temperature: body.temperature ?? 0.7,
              system: body.system,
              messages: body.messages,
            }),
          })

          if (!upstream.ok) {
            const errText = await upstream.text()
            return sendJson(res, upstream.status, {
              error: `上游 API 错误 (${upstream.status}): ${errText}`,
            })
          }

          const data = (await upstream.json()) as {
            content?: Array<{ type: string; text?: string }>
          }
          const text = (data.content || [])
            .filter((b) => b.type === 'text')
            .map((b) => b.text || '')
            .join('')

          return sendJson(res, 200, { text })
        } catch (err) {
          return sendJson(res, 500, {
            error: `代理处理失败: ${(err as Error).message}`,
          })
        }
      }

      server.middlewares.use(handler)
    },
  }
}
