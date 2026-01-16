import { useEffect, useState } from 'react'
import { usePromptStore } from './store/promptStore'
import { promptApi } from './api/prompt'
import PromptList from './components/PromptList'
import PromptEditor from './components/PromptEditor'
import SearchBar from './components/SearchBar'
import TagFilter from './components/TagFilter'
import ToastContainer from './components/ToastContainer'
import SettingsMenu from './components/SettingsMenu'
import HoloWindow from './components/HoloWindow'
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut'
import { motion } from 'framer-motion'

function App() {
  const { setPrompts, setLoading, currentPrompt } = usePromptStore()
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      setLoading(true)
      const prompts = await promptApi.listPrompts()
      setPrompts(prompts)
    } catch (error) {
      console.error('Failed to load prompts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Keyboard shortcuts
  useKeyboardShortcut([
    {
      key: ',',
      ctrl: true,
      handler: () => setShowSettings(true)
    }
  ])

  return (
    <>
      <ToastContainer />
      <HoloWindow>
        {/* Sidebar */}
        <div className="w-80 flex flex-col border-r border-cyan-400/20 bg-black/30 backdrop-blur-sm relative">
          {/* 侧边栏顶部光线 */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-cyan-400/40 via-transparent to-transparent" />

          <div className="p-4 border-b border-cyan-400/20">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-bold text-cyan-400 tracking-widest font-['Orbitron'] flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                PROMPT_MGR
              </h1>
              <motion.button
                onClick={() => setShowSettings(true)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-black/40 hover:bg-cyan-900/30 border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300"
                title="设置"
              >
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.button>
            </div>

            {/* 标签 */}
            <div className="text-[10px] font-mono font-bold text-cyan-400/60 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="text-cyan-400">&gt;</span>
              LIBRARY
            </div>

            <SearchBar />
            <TagFilter />
          </div>

          <div className="flex-1 overflow-y-auto mask-image-b">
            <PromptList />
          </div>

          {/* 侧边栏底部装饰 */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-black/10 relative">
          {/* 主内容区顶部光线 */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

          {currentPrompt ? (
            <PromptEditor />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {/* 空状态图标 */}
                <motion.div
                  className="mx-auto mb-6 relative"
                  animate={{
                    rotateY: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  <svg
                    className="w-20 h-20 text-cyan-400/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>

                  {/* 外圈光环 */}
                  <motion.div
                    className="absolute inset-0 border border-cyan-400/20 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                  />
                </motion.div>

                <p className="text-base font-mono text-cyan-400/60 uppercase tracking-widest mb-2">
                  [ NO_PROMPT_SELECTED ]
                </p>
                <p className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                  &gt; Select or create a prompt
                </p>
                <p className="text-[10px] font-mono text-gray-700 mt-3 uppercase tracking-wider">
                  Ctrl+Shift+P : Toggle Window
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </HoloWindow>

      {/* Settings Menu */}
      {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
    </>
  )
}

export default App
