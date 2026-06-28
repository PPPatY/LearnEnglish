import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { aiProxy } from './server/aiProxy'

// 加载 .env.local 等文件中【无前缀】的变量到 process.env，
// 供服务端中间件（aiProxy）读取。注意：这些变量不会进入前端 bundle。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
  process.env.ANTHROPIC_BASE_URL = env.ANTHROPIC_BASE_URL
  process.env.ANTHROPIC_MODEL = env.ANTHROPIC_MODEL

  return {
    plugins: [react(), tailwindcss(), aiProxy()],
    server: { port: 5173 },
  }
})
