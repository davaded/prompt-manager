import { motion } from 'framer-motion'

interface NeonButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
}

export default function NeonButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = ''
}: NeonButtonProps) {
  const variants = {
    primary: {
      bg: 'bg-cyan-900/20',
      border: 'border-cyan-400/50',
      text: 'text-cyan-300',
      glow: 'hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]',
      hoverBg: 'hover:bg-cyan-900/40',
      hoverBorder: 'hover:border-cyan-400'
    },
    secondary: {
      bg: 'bg-magenta-900/20',
      border: 'border-magenta-400/50',
      text: 'text-magenta-300',
      glow: 'hover:shadow-[0_0_20px_rgba(255,0,255,0.4)]',
      hoverBg: 'hover:bg-magenta-900/40',
      hoverBorder: 'hover:border-magenta-400'
    },
    danger: {
      bg: 'bg-red-900/20',
      border: 'border-red-400/50',
      text: 'text-red-300',
      glow: 'hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]',
      hoverBg: 'hover:bg-red-900/40',
      hoverBorder: 'hover:border-red-400'
    }
  }

  const style = variants[variant]

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        relative px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase
        border overflow-hidden transition-all duration-300
        ${style.bg} ${style.border} ${style.text}
        ${disabled
          ? 'opacity-40 cursor-not-allowed'
          : `${style.hoverBg} ${style.hoverBorder} ${style.glow} cursor-pointer`
        }
        ${className}
      `}
    >
      {/* 顶部光线 */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />

      {/* 底部光线 */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />

      {/* 扫描效果 */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-200%', '200%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
            repeatDelay: 1
          }}
        />
      )}

      {/* 角落装饰 */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-60" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-60" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-60" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-60" />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
