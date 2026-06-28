/**
 * [INPUT]: 依赖 react-router-dom 路由、components/Layout、各模块页面
 * [OUTPUT]: 导出 App —— 应用根组件，定义路由表
 * [POS]: 前端入口的顶层组件，挂载布局与三大模块
 * [PROTOCOL]: 新增模块路由时更新本文件与 src/CLAUDE.md
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import VocabularyPage from './modules/vocabulary/VocabularyPage'
import WritingPage from './modules/writing/WritingPage'
import SpeakingPage from './modules/speaking/SpeakingPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="vocabulary" element={<VocabularyPage />} />
        <Route path="writing" element={<WritingPage />} />
        <Route path="speaking" element={<SpeakingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
