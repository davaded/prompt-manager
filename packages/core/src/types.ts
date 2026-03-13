export type PromptVariableType = 'text' | 'system_clipboard' | 'system_date' | 'system_time' | 'select'

export interface PromptVariable {
  key: string
  type: PromptVariableType
  options?: string[]
  default?: string
}

export interface PromptSpec {
  content: string
  variables: PromptVariable[]
}

export interface RenderContext {
  now?: Date
  clipboardText?: string
}

export interface VariableDefinition {
  key: string
  type: 'text' | 'select'
  options?: string[]
  default?: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}
