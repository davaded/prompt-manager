import { useState, useEffect } from 'react'
import { usePromptStore } from '../store/promptStore'
import { promptApi } from '../api/prompt'
import { autoDetectVariables, replaceVariables } from '../utils/variableParser'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import VariableInput from './VariableInput'
import HistoryViewer from './HistoryViewer'
import { toast } from '../store/toastStore'
import { motion } from 'framer-motion'
import NeonButton from './NeonButton'

export default function PromptEditor() {
  const { currentPrompt, updatePrompt: updateStorePrompt } = usePromptStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [processedContent, setProcessedContent] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (currentPrompt) {
      setTitle(currentPrompt.title)
      setContent(currentPrompt.content)
      setTags(currentPrompt.tags)

      // Initialize variable values with defaults
      const initialValues: Record<string, string> = {}
      currentPrompt.variables.forEach((v) => {
        if (v.default) {
          initialValues[v.key] = v.default
        }
      })
      setVariableValues(initialValues)
    }
  }, [currentPrompt?.id])

  useEffect(() => {
    if (currentPrompt) {
      processContent()
    }
  }, [content, variableValues])

  const processContent = async () => {
    if (!currentPrompt) return

    try {
      const result = await replaceVariables(content, variableValues, currentPrompt.variables)
      setProcessedContent(result)
    } catch (error) {
      console.error('Failed to process content:', error)
      setProcessedContent(content)
    }
  }

  const handleSave = async () => {
    if (!currentPrompt) return

    try {
      // Auto-detect variables from content
      const variables = autoDetectVariables(content)

      const updated = await promptApi.updatePrompt({
        id: currentPrompt.id,
        title,
        content,
        tags,
        variables
      })

      if (updated) {
        updateStorePrompt(updated)
        toast.success('保存成功')
      }
    } catch (error) {
      console.error('Failed to save prompt:', error)
      toast.error('保存失败')
    }
  }

  const handleCopy = async () => {
    try {
      await writeText(processedContent)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('复制失败')
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleRestoreVersion = async (restoredContent: string) => {
    setContent(restoredContent)
    await handleSave()
    toast.success('版本已恢复')
  }

  if (!currentPrompt) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-cyan-400/20 bg-black/20 backdrop-blur-sm relative">
        {/* 顶部光线 */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="text-xl font-bold flex-1 bg-transparent border-b-2 border-transparent hover:border-cyan-400/30 focus:border-cyan-400/60 outline-none text-cyan-300 placeholder:text-gray-700 transition-all duration-300 font-['Orbitron'] tracking-wider pb-2"
            placeholder="PROMPT_TITLE"
          />
          <motion.button
            onClick={() => setShowHistory(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-4 px-4 py-2 text-xs font-mono font-bold uppercase bg-black/40 hover:bg-cyan-900/30 border border-cyan-400/30 hover:border-cyan-400/60 text-cyan-400 transition-all duration-300 flex items-center gap-2 tracking-wider"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            HISTORY
          </motion.button>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {tags.map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-3 py-1.5 bg-cyan-900/30 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 relative overflow-hidden group"
            >
              {/* 扫描线 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
              <span className="relative z-10">#{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="relative z-10 hover:text-red-400 transition-colors"
              >
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            onBlur={handleAddTag}
            placeholder="ADD_TAG..."
            className="px-3 py-1.5 text-xs font-mono bg-black/40 border border-cyan-400/20 outline-none focus:border-cyan-400/60 text-cyan-400 placeholder:text-gray-700 placeholder:uppercase transition-all duration-300 tracking-wider"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
        {/* Editor */}
        <div className="flex flex-col">
          <label className="text-[10px] font-mono font-bold text-cyan-400/60 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="text-cyan-400">&gt;</span>
            PROMPT_CONTENT
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            className="flex-1 p-4 bg-black/40 border border-cyan-400/20 focus:border-cyan-400/60 resize-none outline-none text-gray-300 font-mono text-sm placeholder:text-gray-700 transition-all duration-300 no-scrollbar relative"
            placeholder="// Enter your prompt here...&#10;// Use {{variable}} syntax for variables"
            style={{
              backgroundImage: 'linear-gradient(transparent 0%, rgba(0,255,255,0.02) 50%, transparent 100%)'
            }}
          />

          {/* Variables */}
          {currentPrompt.variables.length > 0 && (
            <div className="mt-4">
              <label className="text-[10px] font-mono font-bold text-cyan-400/60 uppercase tracking-widest mb-3 block flex items-center gap-2">
                <span className="text-cyan-400">&gt;</span>
                VARIABLES
              </label>
              <div className="space-y-3">
                {currentPrompt.variables.map((variable) => (
                  <VariableInput
                    key={variable.key}
                    variable={variable}
                    value={variableValues[variable.key] || ''}
                    onChange={(value) => setVariableValues({ ...variableValues, [variable.key]: value })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-mono font-bold text-cyan-400/60 uppercase tracking-widest flex items-center gap-2">
              <span className="text-cyan-400">&gt;</span>
              OUTPUT_PREVIEW
            </label>
            <NeonButton onClick={handleCopy} variant="primary">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              COPY
            </NeonButton>
          </div>
          <div className="flex-1 p-4 bg-black/40 border border-cyan-400/20 overflow-y-auto no-scrollbar relative">
            {/* 代码矩阵背景效果 */}
            <div className="absolute inset-0 opacity-5 pointer-events-none font-mono text-[8px] text-cyan-400 overflow-hidden leading-tight">
              {Array.from({ length: 50 }).map((_, i) => (
                <div key={i}>
                  {Array.from({ length: 100 }).map(() =>
                    Math.random() > 0.5 ? '1' : '0'
                  ).join('')}
                </div>
              ))}
            </div>
            <pre className="relative whitespace-pre-wrap text-sm text-cyan-300/90 font-mono leading-relaxed">
              {processedContent || '// Waiting for input...'}
            </pre>
          </div>
        </div>
      </div>

      {/* History Viewer Modal */}
      {showHistory && (
        <HistoryViewer
          promptId={currentPrompt.id}
          currentContent={content}
          onClose={() => setShowHistory(false)}
          onRestore={handleRestoreVersion}
        />
      )}
    </div>
  )
}
