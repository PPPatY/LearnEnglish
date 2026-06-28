/**
 * [INPUT]: 依赖 react-router-dom (NavLink/Outlet)、./Icon
 * [OUTPUT]: 导出 Layout —— 侧边栏导航 + 内容区
 * [POS]: src/components 共享布局，包裹所有页面
 * [PROTOCOL]: 增减导航项时同步更新此处与 App 路由
 */
import { NavLink, Outlet } from 'react-router-dom'
import Icon, { type IconName } from './Icon'

const navItems: { to: string; label: string; icon: IconName; end: boolean }[] = [
  { to: '/', label: '首页', icon: 'home', end: true },
  { to: '/vocabulary', label: '词汇 SRS', icon: 'cards', end: false },
  { to: '/writing', label: '写作批改', icon: 'pencil', end: false },
  { to: '/speaking', label: '口语陪练', icon: 'mic', end: false },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-56 flex-col border-r border-slate-200 bg-white p-4">
        <div className="mb-6 px-2">
          <div className="text-lg font-bold">LearnEnglish</div>
          <div className="text-xs text-slate-400">工程师英语训练</div>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
