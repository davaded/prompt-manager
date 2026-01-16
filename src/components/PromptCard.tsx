import { motion } from 'framer-motion'

interface PromptCardProps {
  title: string
  tags: string[]
  content?: string
  active?: boolean
  onClick?: () => void
}

export default function PromptCard({ title, tags, content, active, onClick }: PromptCardProps) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: active ? 1 : 1.02, x: active ? 0 : 4 }}
      className={`
        relative group cursor-pointer mb-3 overflow-hidden
        transition-all duration-300
        ${active ? 'z-10' : 'z-0'}
      `}
    >
      {/* 背景层 */}
      <div className={`
        relative p-4 border-l-2 transition-all duration-300
        ${active
          ? 'bg-gradient-to-r from-cyan-950/40 to-transparent border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]'
          : 'bg-black/20 border-transparent hover:border-cyan-400/40 hover:bg-black/30'
        }
      `}>

        {/* 活动状态的扫描线效果 */}
        {active && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* 左侧光条 */}
        {active && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-400"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute top-0 left-0 w-full h-8 bg-cyan-400 blur-sm"
              animate={{ y: ['0%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        )}

        {/* 标题 */}
        <div className="relative z-10 mb-2">
          <h3 className={`
            text-sm font-bold tracking-wider transition-colors font-['Orbitron']
            ${active ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-200'}
          `}>
            <span className="text-cyan-400/60 mr-2">&gt;</span>
            {title}
          </h3>
        </div>

        {/* 内容预览 */}
        {content && (
          <p className={`
            relative z-10 text-xs font-mono truncate mb-2 transition-colors
            ${active ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-500'}
          `}>
            {content}
          </p>
        )}

        {/* 标签 */}
        {tags.length > 0 && (
          <div className="relative z-10 flex gap-2 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`
                  text-[10px] px-2 py-0.5 font-mono border transition-all duration-300
                  ${active
                    ? 'bg-cyan-900/30 text-cyan-300 border-cyan-400/40'
                    : 'bg-black/30 text-gray-600 border-gray-700 group-hover:border-cyan-400/30 group-hover:text-cyan-400/60'
                  }
                `}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 右上角装饰 */}
        {active && (
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyan-400/30">
            <motion.div
              className="absolute -top-px -right-px w-2 h-2 bg-cyan-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        )}

        {/* 右下角装饰 */}
        {active && (
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-cyan-400/20" />
        )}
      </div>

      {/* 悬停时的光晕效果 */}
      {!active && (
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.05), transparent)'
          }}
        />
      )}
    </motion.div>
  )
}
