/**
 * [INPUT]: 无外部依赖（纯 SVG 路径数据）
 * [OUTPUT]: 导出 Icon 组件与 IconName 类型
 * [POS]: src/components 共享 UI；全站统一使用线性 SVG 图标，替代 emoji
 * [PROTOCOL]: 新增图标时往 PATHS 加一条，并在 IconName 中体现
 */

// 线性图标路径数据（24x24 viewBox，stroke 风格，参考 Lucide）
const PATHS: Record<string, React.ReactNode> = {
  // 导航
  home: <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />,
  cards: (
    <>
      <rect x="3" y="5" width="14" height="16" rx="2" />
      <path d="M7 5V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-1" />
    </>
  ),
  pencil: <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />,
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
    </>
  ),
  // 操作
  play: <path d="M6 4v16l13-8-13-8Z" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  volume: <path d="M11 5 6 9H2v6h4l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" />,
  translate: (
    <>
      <path d="M4 5h7M9 3v2c0 4-2.5 7-6 8" />
      <path d="M5 9c0 2.5 2.5 4.5 6 5.5M12 20l4-9 4 9M13.5 17h5" />
    </>
  ),
  trash: <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M20 6 9 17l-5-5" />,
  send: <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />,
  spinner: <path d="M12 3a9 9 0 1 0 9 9" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m6 15 6-6 6 6" />,
  book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13ZM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />,
  plug: <path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v6" />,
  // 类目
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  coffee: <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8ZM17 9h2a2 2 0 0 1 0 4h-2M6 2v2M10 2v2M14 2v2" />,
  code: <path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  party: <path d="M3 21 9 9l6 6-12 6ZM13 9a3 3 0 0 0 3-3M14 4h.01M19 7h.01M20 11a4 4 0 0 0-4-4" />,
}

export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName
  /** 像素尺寸，默认 18 */
  size?: number
  className?: string
  /** spinner 等需要旋转时传 true */
  spin?: boolean
}

export default function Icon({ name, size = 18, className = '', spin = false }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${spin ? 'animate-spin' : ''} ${className}`}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
