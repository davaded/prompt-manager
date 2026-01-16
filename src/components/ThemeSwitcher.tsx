import { useThemeStore } from '../store/themeStore'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore()

  const themes = [
    { value: 'light' as const, label: '浅色', icon: '☀️' },
    { value: 'dark' as const, label: '深色', icon: '🌙' },
    { value: 'system' as const, label: '跟随系统', icon: '💻' }
  ]

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
        主题设置
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`p-3 rounded-lg border-2 transition-all ${
              theme === t.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-1">{t.icon}</div>
            <div className={`text-sm font-medium ${
              theme === t.value
                ? 'text-primary-700 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300'
            }`}>
              {t.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
