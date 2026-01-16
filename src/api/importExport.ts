import { invoke } from '@tauri-apps/api/core'
import { save, open } from '@tauri-apps/plugin-dialog'

export const importExportApi = {
  async exportToFile(): Promise<void> {
    const filePath = await save({
      filters: [{
        name: 'JSON',
        extensions: ['json']
      }],
      defaultPath: `prompt-manager-export-${Date.now()}.json`
    })

    if (filePath) {
      await invoke('export_data', { filePath })
    }
  },

  async importFromFile(): Promise<number> {
    const filePath = await open({
      filters: [{
        name: 'JSON',
        extensions: ['json']
      }],
      multiple: false
    })

    if (filePath) {
      const count = await invoke<number>('import_data', { filePath })
      return count
    }

    return 0
  }
}
