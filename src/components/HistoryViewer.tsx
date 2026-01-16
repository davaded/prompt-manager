import { useState, useEffect } from 'react'
import { promptApi } from '../api/prompt'
import { formatDateTime } from '../utils/dateFormat'
import type { PromptHistory } from '../store/promptStore'
import { motion, AnimatePresence } from 'framer-motion'
import { createDiffView } from '../utils/diffViewer'

interface HistoryViewerProps {
  promptId: string
  currentContent: string
  onClose: () => void
  onRestore?: (content: string) => void
}

export default function HistoryViewer({ promptId, currentContent, onClose, onRestore }: HistoryViewerProps) {
  const [history, setHistory] = useState<PromptHistory[]>([])
  const [selectedVersion, setSelectedVersion] = useState<PromptHistory | null>(null)
  const [compareMode, setCompareMode] = useState<'current' | 'previous'>('current')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [promptId])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      const data = await promptApi.getPromptHistory(promptId)
      setHistory(data)
      if (data.length > 0) {
        setSelectedVersion(data[0])
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = () => {
    if (selectedVersion && onRestore) {
      onRestore(selectedVersion.content)
      onClose()
    }
  }

  const getCompareContent = () => {
    if (!selectedVersion) return ''

    if (compareMode === 'current') {
      return currentContent
    } else {
      const index = history.findIndex((h) => h.version_id === selectedVersion.version_id)
      if (index < history.length - 1) {
        return history[index + 1].content
      }
      return ''
    }
  }

  const diffHtml = selectedVersion
    ? createDiffView(getCompareContent(), selectedVersion.content)
    : ''

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[90vw] h-[85vh] glass-card dark:glass-card-dark rounded-lg shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">版本历史</h2>
            <div className="flex items-center gap-3">
              {selectedVersion && onRestore && (
                <button
                  onClick={handleRestore}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  恢复此版本
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Timeline Sidebar */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {isLoading ? (
                <div className="text-center text-gray-400 py-8">加载中...</div>
              ) : history.length === 0 ? (
                <div className="text-center text-gray-400 py-8">暂无历史记录</div>
              ) : (
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <motion.button
                      key={item.version_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedVersion(item)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedVersion?.version_id === item.version_id
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-l-4 border-primary-500'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-800 dark:text-white">
                          {item.version_id}
                        </span>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                            最新
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(item.timestamp)}
                      </div>
                      {item.diff_summary && (
                        <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {item.diff_summary}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Diff Viewer */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedVersion ? (
                <>
                  {/* Comparison Mode Selector */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">对比：</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCompareMode('current')}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            compareMode === 'current'
                              ? 'bg-primary-500 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          与当前版本
                        </button>
                        <button
                          onClick={() => setCompareMode('previous')}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            compareMode === 'previous'
                              ? 'bg-primary-500 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          disabled={history.length <= 1}
                        >
                          与上一版本
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Diff Content */}
                  <div className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-800">
                    <div
                      className="diff-viewer font-mono text-sm"
                      dangerouslySetInnerHTML={{ __html: diffHtml }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  选择一个版本查看详情
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
