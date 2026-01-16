import { usePromptStore } from '../store/promptStore'
import { promptApi } from '../api/prompt'
import { toast } from '../store/toastStore'
import PromptCard from './PromptCard'
import NeonButton from './NeonButton'
import { motion } from 'framer-motion'

export default function PromptList() {
  const { filteredPrompts, currentPrompt, setCurrentPrompt, deletePrompt, addPrompt } = usePromptStore()
  const prompts = filteredPrompts()

  const handleSelect = (prompt: any) => {
    setCurrentPrompt(prompt)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()

    if (confirm('确定要删除这个 Prompt 吗？')) {
      try {
        await promptApi.deletePrompt(id)
        deletePrompt(id)
        toast.success('删除成功')
      } catch (error) {
        console.error('Failed to delete prompt:', error)
        toast.error('删除失败')
      }
    }
  }

  const handleNew = async () => {
    try {
      const newPrompt = await promptApi.createPrompt({
        title: '新建 Prompt',
        content: '',
        tags: [],
        variables: []
      })
      addPrompt(newPrompt)
      setCurrentPrompt(newPrompt)
      toast.success('创建成功')
    } catch (error) {
      console.error('Failed to create prompt:', error)
      toast.error('创建失败')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 列表区域 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
        {prompts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-xs font-mono text-gray-600 uppercase tracking-widest">
              [ NO_DATA ]
            </div>
            <div className="mt-2 text-[10px] text-gray-700">
              创建你的第一个 Prompt
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {prompts.map((prompt) => (
              <div key={prompt.id} className="relative group">
                <PromptCard
                  title={prompt.title}
                  tags={prompt.tags}
                  content={prompt.content}
                  active={currentPrompt?.id === prompt.id}
                  onClick={() => handleSelect(prompt)}
                />
                {/* 删除按钮 (hover时显示) */}
                <motion.button
                  onClick={(e) => handleDelete(e, prompt.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-red-900/20 hover:bg-red-900/40 border border-red-400/30 hover:border-red-400 z-20"
                >
                  <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </motion.button>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* 新建按钮固定在底部 */}
      <div className="p-3 border-t border-cyan-400/20 bg-gradient-to-t from-black/60 to-transparent">
        <NeonButton onClick={handleNew} className="w-full" variant="secondary">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>NEW_PROMPT</span>
        </NeonButton>
      </div>
    </div>
  )
}
