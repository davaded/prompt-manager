import { useState } from 'react'
import { usePromptStore } from '../store/promptStore'
import { motion } from 'framer-motion'

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = usePromptStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [isFocused, setIsFocused] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    setSearchQuery(value)
  }

  return (
    <div className="relative group">
      <input
        type="text"
        value={localQuery}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="SEARCH_PROMPTS..."
        className={`
          w-full px-4 py-2.5 pl-10 bg-black/40 border font-mono text-xs
          transition-all duration-300 tracking-wider
          ${isFocused
            ? 'border-cyan-400/60 bg-black/60 text-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.2)]'
            : 'border-cyan-400/20 text-gray-400 hover:border-cyan-400/40 hover:bg-black/50'
          }
          placeholder:text-gray-700 placeholder:uppercase placeholder:tracking-widest
          focus:outline-none
        `}
      />

      {/* 搜索图标 */}
      <motion.svg
        className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
          isFocused ? 'text-cyan-400' : 'text-gray-600'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        animate={isFocused ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </motion.svg>

      {/* 顶部光线 */}
      {isFocused && (
        <motion.div
          className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* 底部光线 */}
      {isFocused && (
        <motion.div
          className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* 角落装饰 */}
      {isFocused && (
        <>
          <motion.div
            className="absolute top-0 left-0 w-1.5 h-1.5 bg-cyan-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="absolute top-0 right-0 w-1.5 h-1.5 bg-cyan-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-cyan-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-cyan-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          />
        </>
      )}
    </div>
  )
}
