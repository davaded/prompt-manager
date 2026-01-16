import { useState } from 'react'

interface ShortcutSettingsProps {
  currentShortcut?: string
  onSave: (shortcut: string) => void
}

export default function ShortcutSettings({ currentShortcut = 'Ctrl+Shift+P', onSave }: ShortcutSettingsProps) {
  const [recording, setRecording] = useState(false)
  const [keys, setKeys] = useState<string[]>([])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!recording) return

    e.preventDefault()
    e.stopPropagation()

    const pressedKeys: string[] = []

    if (e.ctrlKey || e.metaKey) pressedKeys.push(e.ctrlKey ? 'Ctrl' : 'Cmd')
    if (e.shiftKey) pressedKeys.push('Shift')
    if (e.altKey) pressedKeys.push('Alt')

    // 只处理字母和功能键
    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      pressedKeys.push(e.key.toUpperCase())
    } else if (['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'].includes(e.key)) {
      pressedKeys.push(e.key)
    }

    if (pressedKeys.length >= 2) {
      setKeys(pressedKeys)
    }
  }

  const handleStartRecording = () => {
    setRecording(true)
    setKeys([])
  }

  const handleSave = () => {
    if (keys.length >= 2) {
      const shortcut = keys.join('+')
      onSave(shortcut)
      setRecording(false)
    }
  }

  const handleCancel = () => {
    setRecording(false)
    setKeys([])
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
        全局快捷键
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 glass dark:glass-dark rounded-lg">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              显示/隐藏窗口
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              当前: <span className="font-mono font-semibold">{currentShortcut}</span>
            </div>
          </div>
          <button
            onClick={handleStartRecording}
            className="px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            修改
          </button>
        </div>

        {recording && (
          <div
            className="p-4 glass-card dark:glass-card-dark rounded-lg"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            autoFocus
          >
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                请按下新的快捷键组合
              </div>
              <div className="h-12 flex items-center justify-center">
                {keys.length > 0 ? (
                  <div className="text-lg font-mono font-semibold text-primary-600 dark:text-primary-400">
                    {keys.join(' + ')}
                  </div>
                ) : (
                  <div className="text-gray-400 dark:text-gray-500 animate-pulse">
                    等待按键...
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleSave}
                  disabled={keys.length < 2}
                  className="flex-1 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                提示: 必须包含修饰键 (Ctrl/Shift/Alt) + 字母或功能键
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
