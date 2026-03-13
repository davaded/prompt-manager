import type { PromptSpec, ValidationResult } from './types'

export function validatePromptSpec(spec: PromptSpec): ValidationResult {
  const errors: string[] = []

  if (!spec.content || typeof spec.content !== 'string') {
    errors.push('content must be a non-empty string')
  }

  if (!Array.isArray(spec.variables)) {
    errors.push('variables must be an array')
    return { valid: false, errors }
  }

  const seen = new Set<string>()
  for (const variable of spec.variables) {
    if (!variable.key) {
      errors.push('variable key is required')
      continue
    }

    if (seen.has(variable.key)) {
      errors.push(`duplicate variable key: ${variable.key}`)
    }
    seen.add(variable.key)

    if (variable.type === 'select' && (!variable.options || variable.options.length === 0)) {
      errors.push(`select variable ${variable.key} must provide options`)
    }
  }

  return { valid: errors.length === 0, errors }
}
