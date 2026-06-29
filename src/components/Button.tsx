/**
 * [INPUT]: 依赖 ./Icon（可选图标）
 * [OUTPUT]: 导出 Button 组件 —— 统一的按钮，含 variant/size 变体
 * [POS]: src/components 共享 UI；全站按钮统一使用，确保样式一致
 * [PROTOCOL]: 新增变体时更新 VARIANTS / SIZES 与本头注释
 */
import Icon, { type IconName } from './Icon'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'icon'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 disabled:hover:bg-brand-500',
  secondary: 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
  danger: 'text-slate-400 hover:bg-red-50 hover:text-red-500',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600',
  icon: 'bg-brand-100 text-brand-600 hover:bg-brand-200',
}

const SIZES: Record<Size, string> = {
  sm: 'gap-1 px-2 py-1 text-xs',
  md: 'gap-1.5 px-4 py-2 text-sm',
  lg: 'gap-2 px-6 py-2.5 text-base',
}

// 纯图标按钮的尺寸（正方形 padding）
const ICON_SIZES: Record<Size, string> = {
  sm: 'p-1',
  md: 'p-2',
  lg: 'p-3',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** 左侧图标 */
  icon?: IconName
  /** 是否只显示图标（无文字时用，按正方形 padding） */
  iconOnly?: boolean
  /** 图标是否旋转（loading 态） */
  iconSpin?: boolean
  /** 是否撑满父容器宽度 */
  fullWidth?: boolean
  active?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  iconSpin = false,
  fullWidth = false,
  active = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const sizeCls = iconOnly ? ICON_SIZES[size] : SIZES[size]
  const iconPx = size === 'sm' ? 14 : size === 'lg' ? 20 : 16

  return (
    <button
      {...rest}
      className={`inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        VARIANTS[variant]
      } ${sizeCls} ${fullWidth ? 'w-full' : ''} ${active ? 'ring-2 ring-brand-400' : ''} ${className}`}
    >
      {icon && <Icon name={icon} size={iconPx} spin={iconSpin} />}
      {children}
    </button>
  )
}
