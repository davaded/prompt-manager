import type { PromptVariable } from '../store/promptStore'

interface VariableInputProps {
  variable: PromptVariable
  value: string
  onChange: (value: string) => void
}

export default function VariableInput({ variable, value, onChange }: VariableInputProps) {
  const { key, type, options } = variable

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  const renderInput = () => {
    if (type === 'select' && options) {
      return (
        <select
          value={value}
          onChange={handleChange}
          className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )
    }

    if (type === 'system_clipboard') {
      return (
        <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-sm">
          自动从剪贴板读取
        </div>
      )
    }

    if (type === 'system_date' || type === 'system_time') {
      return (
        <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-sm">
          系统自动填充
        </div>
      )
    }

    return (
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
        placeholder={`输入 ${key}...`}
      />
    )
  }

  return (
    <div className="flex items-center gap-3">
      <label className="w-24 text-sm text-gray-700 dark:text-gray-300 font-medium">
        {key}
      </label>
      {renderInput()}
    </div>
  )
}
