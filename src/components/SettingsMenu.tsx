import { useState } from 'react'
import { motion } from 'framer-motion'
import { importExportApi } from '../api/importExport'
import { promptApi } from '../api/prompt'
import { usePromptStore } from '../store/promptStore'
import { toast } from '../store/toastStore'
import ThemeSwitcher from './ThemeSwitcher'
import ShortcutSettings from './ShortcutSettings'

interface SettingsMenuProps {
  onClose: () => void
}

export default function SettingsMenu({ onClose }: SettingsMenuProps) {
  const { setPrompts } = usePromptStore()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleShortcutSave = (shortcut: string) => {
    // 保存快捷键设置到本地存储
    localStorage.setItem('globalShortcut', shortcut)
    toast.success(`快捷键已更新为 ${shortcut}，请重启应用生效`)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      await importExportApi.exportToFile()
      toast.success('数据导出成功')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('导出失败')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)
      const count = await importExportApi.importFromFile()

      if (count > 0) {
        // Reload prompts
        const prompts = await promptApi.listPrompts()
        setPrompts(prompts)
        toast.success(`成功导入 ${count} 条 Prompt`)
      }
    } catch (error) {
      console.error('Import failed:', error)
      toast.error('导入失败')
    } finally {
      setIsImporting(false)
    }
  }

  return (
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
        className="w-[500px] glass-card dark:glass-card-dark rounded-lg shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">设置</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Shortcut Settings */}
          <ShortcutSettings
            currentShortcut={localStorage.getItem('globalShortcut') || 'Ctrl+Shift+P'}
            onSave={handleShortcutSave}
          />

          {/* Data Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              数据管理
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-800 dark:text-white">导出数据</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">导出所有 Prompt 到 JSON 文件</div>
                  </div>
                </div>
                {isExporting && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                )}
              </button>

              <button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <div className="text-left">
                    <div className="font-medium text-gray-800 dark:text-white">导入数据</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">从 JSON 文件导入 Prompt</div>
                  </div>
                </div>
                {isImporting && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                )}
              </button>
            </div>
          </div>

          {/* About */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              关于
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>Prompt Manager v0.1.0</p>
              <p>基于 Tauri 2.0 构建</p>
              <p className="text-xs mt-2">快捷键: Ctrl+Shift+P 显示/隐藏窗口</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
