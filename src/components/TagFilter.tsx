import { usePromptStore } from '../store/promptStore'
import { motion } from 'framer-motion'

export default function TagFilter() {
  const { allTags, selectedTags, toggleTag } = usePromptStore()
  const tags = allTags()

  if (tags.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => {
          const isActive = selectedTags.includes(tag)
          return (
            <motion.button
              key={tag}
              onClick={() => toggleTag(tag)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`
                relative px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest
                border transition-all duration-300 overflow-hidden
                ${isActive
                  ? 'bg-cyan-900/40 border-cyan-400/60 text-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.3)]'
                  : 'bg-black/30 border-cyan-400/20 text-gray-600 hover:border-cyan-400/40 hover:text-cyan-400/80 hover:bg-black/40'
                }
              `}
            >
              {/* 活动状态的扫描线 */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* 角落标记 */}
              {isActive && (
                <>
                  <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-400" />
                  <div className="absolute top-0 right-0 w-1 h-1 bg-cyan-400" />
                  <div className="absolute bottom-0 left-0 w-1 h-1 bg-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-1 h-1 bg-cyan-400" />
                </>
              )}

              <span className="relative z-10">#{tag}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
