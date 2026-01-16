import { invoke } from '@tauri-apps/api/core'
import type { Prompt, PromptVariable, PromptHistory } from '../store/promptStore'

export interface CreatePromptInput {
  title: string
  content: string
  tags: string[]
  variables: PromptVariable[]
}

export interface UpdatePromptInput {
  id: string
  title?: string
  content?: string
  tags?: string[]
  variables?: PromptVariable[]
}

export const promptApi = {
  async createPrompt(input: CreatePromptInput): Promise<Prompt> {
    return await invoke('create_prompt', { input })
  },

  async getPrompt(id: string): Promise<Prompt | null> {
    return await invoke('get_prompt', { id })
  },

  async listPrompts(): Promise<Prompt[]> {
    return await invoke('list_prompts')
  },

  async updatePrompt(input: UpdatePromptInput): Promise<Prompt | null> {
    return await invoke('update_prompt', { input })
  },

  async deletePrompt(id: string): Promise<boolean> {
    return await invoke('delete_prompt', { id })
  },

  async searchPrompts(query: string): Promise<Prompt[]> {
    return await invoke('search_prompts', { query })
  },

  async getPromptHistory(id: string): Promise<PromptHistory[]> {
    return await invoke('get_prompt_history', { id })
  },

  async incrementUsage(id: string): Promise<void> {
    return await invoke('increment_usage', { id })
  }
}
