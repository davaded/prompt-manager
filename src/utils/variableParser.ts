import { readText } from '@tauri-apps/plugin-clipboard-manager'
import type { PromptVariable } from '../store/promptStore'

export interface ParsedVariable {
  key: string
  value: string
  type: string
}

/**
 * Parse variables from prompt content
 * Extracts {{variable}} patterns
 */
export function parseVariables(content: string): string[] {
  const regex = /\{\{(\w+(?:\|[^}]+)?)\}\}/g
  const matches = content.matchAll(regex)
  const variables = new Set<string>()

  for (const match of matches) {
    const fullMatch = match[1]
    // Handle {{variable|options}} format
    const varName = fullMatch.split('|')[0]
    variables.add(varName)
  }

  return Array.from(variables)
}

/**
 * Replace variables in content with actual values
 */
export async function replaceVariables(
  content: string,
  variableValues: Record<string, string>,
  variables: PromptVariable[]
): Promise<string> {
  let result = content

  // Process each variable
  for (const variable of variables) {
    const { key, type } = variable
    let value = variableValues[key] || ''

    // Handle system variables
    if (type === 'system_clipboard') {
      try {
        value = await readText() || ''
      } catch (error) {
        console.error('Failed to read clipboard:', error)
        value = ''
      }
    } else if (type === 'system_date') {
      value = new Date().toLocaleDateString()
    } else if (type === 'system_time') {
      value = new Date().toLocaleTimeString()
    }

    // Replace all occurrences
    const regex = new RegExp(`\\{\\{${key}(?:\\|[^}]+)?\\}\\}`, 'g')
    result = result.replace(regex, value)
  }

  return result
}

/**
 * Extract variable definition from content
 * E.g., {{tone|formal,casual,friendly}} -> { key: 'tone', options: ['formal', 'casual', 'friendly'] }
 */
export function extractVariableDefinition(varPattern: string): {
  key: string
  type: string
  options?: string[]
  default?: string
} {
  const parts = varPattern.split('|')
  const key = parts[0]

  if (parts.length === 1) {
    return { key, type: 'text' }
  }

  // Handle {{variable|option1,option2,option3}}
  const optionsStr = parts[1]
  const options = optionsStr.split(',').map((opt) => opt.trim())

  return {
    key,
    type: 'select',
    options,
    default: options[0]
  }
}

/**
 * Auto-detect variables from content and create variable definitions
 */
export function autoDetectVariables(content: string): PromptVariable[] {
  const variables: PromptVariable[] = []

  const regex = /\{\{(\w+(?:\|[^}]+)?)\}\}/g
  const matches = content.matchAll(regex)

  const processed = new Set<string>()

  for (const match of matches) {
    const fullMatch = match[1]
    const varDef = extractVariableDefinition(fullMatch)

    if (processed.has(varDef.key)) {
      continue
    }

    processed.add(varDef.key)

    // Detect system variables by name
    if (varDef.key === 'clipboard') {
      variables.push({ key: varDef.key, type: 'system_clipboard' })
    } else if (varDef.key === 'date') {
      variables.push({ key: varDef.key, type: 'system_date' })
    } else if (varDef.key === 'time') {
      variables.push({ key: varDef.key, type: 'system_time' })
    } else {
      variables.push({
        key: varDef.key,
        type: varDef.type as 'text' | 'select',
        options: varDef.options,
        default: varDef.default
      })
    }
  }

  return variables
}
