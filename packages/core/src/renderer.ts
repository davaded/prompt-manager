import type { PromptSpec, PromptVariable, RenderContext, VariableDefinition } from './types'

const VARIABLE_REGEX = /\{\{(\w+(?:\|[^}]+)?)\}\}/g

export function parseVariables(content: string): string[] {
  const matches = content.matchAll(VARIABLE_REGEX)
  const variables = new Set<string>()

  for (const match of matches) {
    const fullMatch = match[1]
    const varName = fullMatch.split('|')[0]
    variables.add(varName)
  }

  return Array.from(variables)
}

export function extractVariableDefinition(varPattern: string): VariableDefinition {
  const parts = varPattern.split('|')
  const key = parts[0]

  if (parts.length === 1) {
    return { key, type: 'text' }
  }

  const optionsStr = parts[1]
  const options = optionsStr.split(',').map((opt) => opt.trim())

  return {
    key,
    type: 'select',
    options,
    default: options[0]
  }
}

export function autoDetectVariables(content: string): PromptVariable[] {
  const variables: PromptVariable[] = []
  const matches = content.matchAll(VARIABLE_REGEX)
  const processed = new Set<string>()

  for (const match of matches) {
    const fullMatch = match[1]
    const varDef = extractVariableDefinition(fullMatch)

    if (processed.has(varDef.key)) continue
    processed.add(varDef.key)

    if (varDef.key === 'clipboard') {
      variables.push({ key: varDef.key, type: 'system_clipboard' })
    } else if (varDef.key === 'date') {
      variables.push({ key: varDef.key, type: 'system_date' })
    } else if (varDef.key === 'time') {
      variables.push({ key: varDef.key, type: 'system_time' })
    } else {
      variables.push({
        key: varDef.key,
        type: varDef.type,
        options: varDef.options,
        default: varDef.default
      })
    }
  }

  return variables
}

export function renderPrompt(
  spec: PromptSpec,
  variableValues: Record<string, string>,
  context: RenderContext = {}
): string {
  let result = spec.content
  const now = context.now ?? new Date()

  for (const variable of spec.variables) {
    const value = resolveVariableValue(variable, variableValues, now, context)
    const regex = new RegExp(`\\{\\{${variable.key}(?:\\|[^}]+)?\\}\\}`, 'g')
    result = result.replace(regex, value)
  }

  return result
}

function resolveVariableValue(
  variable: PromptVariable,
  variableValues: Record<string, string>,
  now: Date,
  context: RenderContext
): string {
  if (variable.type === 'system_clipboard') {
    return context.clipboardText ?? ''
  }

  if (variable.type === 'system_date') {
    return now.toLocaleDateString()
  }

  if (variable.type === 'system_time') {
    return now.toLocaleTimeString()
  }

  return variableValues[variable.key] || variable.default || ''
}
