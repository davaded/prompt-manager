import { create } from 'zustand'

export interface PromptVariable {
  key: string
  type: 'text' | 'system_clipboard' | 'system_date' | 'system_time' | 'select'
  options?: string[]
  default?: string
}

export interface PromptMeta {
  created_at: number
  updated_at: number
  usage_count: number
}

export interface PromptHistory {
  version_id: string
  timestamp: number
  content: string
  diff_summary?: string
}

export interface Prompt {
  id: string
  title: string
  content: string
  tags: string[]
  variables: PromptVariable[]
  meta: PromptMeta
  history?: PromptHistory[]
}

interface PromptStore {
  prompts: Prompt[]
  currentPrompt: Prompt | null
  searchQuery: string
  selectedTags: string[]
  isLoading: boolean

  setPrompts: (prompts: Prompt[]) => void
  addPrompt: (prompt: Prompt) => void
  updatePrompt: (prompt: Prompt) => void
  deletePrompt: (id: string) => void
  setCurrentPrompt: (prompt: Prompt | null) => void
  setSearchQuery: (query: string) => void
  setSelectedTags: (tags: string[]) => void
  toggleTag: (tag: string) => void
  setLoading: (loading: boolean) => void

  // Computed
  filteredPrompts: () => Prompt[]
  allTags: () => string[]
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  currentPrompt: null,
  searchQuery: '',
  selectedTags: [],
  isLoading: false,

  setPrompts: (prompts) => set({ prompts }),

  addPrompt: (prompt) => set((state) => ({
    prompts: [prompt, ...state.prompts]
  })),

  updatePrompt: (prompt) => set((state) => ({
    prompts: state.prompts.map((p) => (p.id === prompt.id ? prompt : p)),
    currentPrompt: state.currentPrompt?.id === prompt.id ? prompt : state.currentPrompt
  })),

  deletePrompt: (id) => set((state) => ({
    prompts: state.prompts.filter((p) => p.id !== id),
    currentPrompt: state.currentPrompt?.id === id ? null : state.currentPrompt
  })),

  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedTags: (tags) => set({ selectedTags: tags }),

  toggleTag: (tag) => set((state) => ({
    selectedTags: state.selectedTags.includes(tag)
      ? state.selectedTags.filter((t) => t !== tag)
      : [...state.selectedTags, tag]
  })),

  setLoading: (loading) => set({ isLoading: loading }),

  filteredPrompts: () => {
    const { prompts, searchQuery, selectedTags } = get()

    return prompts.filter((prompt) => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = prompt.title.toLowerCase().includes(query)
        const matchesContent = prompt.content.toLowerCase().includes(query)
        const matchesTags = prompt.tags.some((tag) => tag.toLowerCase().includes(query))

        if (!matchesTitle && !matchesContent && !matchesTags) {
          return false
        }
      }

      // Filter by selected tags
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((tag) => prompt.tags.includes(tag))
        if (!hasAllTags) {
          return false
        }
      }

      return true
    })
  },

  allTags: () => {
    const { prompts } = get()
    const tagSet = new Set<string>()

    prompts.forEach((prompt) => {
      prompt.tags.forEach((tag) => tagSet.add(tag))
    })

    return Array.from(tagSet).sort()
  }
}))
