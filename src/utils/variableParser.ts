import { readText } from '@tauri-apps/plugin-clipboard-manager'
import {
  autoDetectVariables as autoDetectCoreVariables,
  extractVariableDefinition as extractCoreVariableDefinition,
  parseVariables as parseCoreVariables,
  renderPrompt,
  type PromptSpec
} from '../../packages/core/src'
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
  return parseCoreVariables(content)
}

/**
 * Replace variables in content with actual values
 */
export async function replaceVariables(
  content: string,
  variableValues: Record<string, string>,
  variables: PromptVariable[]
): Promise<string> {
  let clipboardText = ''

  if (variables.some((variable) => variable.type === 'system_clipboard')) {
    try {
      clipboardText = (await readText()) || ''
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  const spec: PromptSpec = { content, variables }
  return renderPrompt(spec, variableValues, { clipboardText })
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
  return extractCoreVariableDefinition(varPattern)
}

/**
 * Auto-detect variables from content and create variable definitions
 */
export function autoDetectVariables(content: string): PromptVariable[] {
  return autoDetectCoreVariables(content)
}
