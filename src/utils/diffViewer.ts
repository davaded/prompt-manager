import DiffMatchPatch from 'diff-match-patch'

const dmp = new DiffMatchPatch()

/**
 * Create HTML diff view between two texts
 */
export function createDiffView(oldText: string, newText: string): string {
  const diffs = dmp.diff_main(oldText, newText)
  dmp.diff_cleanupSemantic(diffs)

  let html = '<div class="diff-content">'

  for (const [operation, text] of diffs) {
    const escapedText = escapeHtml(text)

    if (operation === 1) {
      // Insertion
      html += `<span class="diff-insert">${escapedText}</span>`
    } else if (operation === -1) {
      // Deletion
      html += `<span class="diff-delete">${escapedText}</span>`
    } else {
      // Equal
      html += `<span class="diff-equal">${escapedText}</span>`
    }
  }

  html += '</div>'
  return html
}

/**
 * Create side-by-side diff view
 */
export function createSideBySideDiff(oldText: string, newText: string): {
  left: string
  right: string
} {
  const diffs = dmp.diff_main(oldText, newText)
  dmp.diff_cleanupSemantic(diffs)

  let leftHtml = '<div class="diff-content">'
  let rightHtml = '<div class="diff-content">'

  for (const [operation, text] of diffs) {
    const escapedText = escapeHtml(text)

    if (operation === 1) {
      // Insertion - only in right
      rightHtml += `<span class="diff-insert">${escapedText}</span>`
    } else if (operation === -1) {
      // Deletion - only in left
      leftHtml += `<span class="diff-delete">${escapedText}</span>`
    } else {
      // Equal - in both
      leftHtml += `<span class="diff-equal">${escapedText}</span>`
      rightHtml += `<span class="diff-equal">${escapedText}</span>`
    }
  }

  leftHtml += '</div>'
  rightHtml += '</div>'

  return { left: leftHtml, right: rightHtml }
}

/**
 * Generate diff summary
 */
export function generateDiffSummary(oldText: string, newText: string): string {
  const diffs = dmp.diff_main(oldText, newText)
  dmp.diff_cleanupSemantic(diffs)

  let additions = 0
  let deletions = 0

  for (const [operation, text] of diffs) {
    if (operation === 1) {
      additions += text.length
    } else if (operation === -1) {
      deletions += text.length
    }
  }

  if (additions === 0 && deletions === 0) {
    return '无变化'
  }

  const parts = []
  if (additions > 0) {
    parts.push(`+${additions} 字符`)
  }
  if (deletions > 0) {
    parts.push(`-${deletions} 字符`)
  }

  return parts.join(', ')
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Calculate similarity percentage between two texts
 */
export function calculateSimilarity(oldText: string, newText: string): number {
  const diffs = dmp.diff_main(oldText, newText)
  const levenshtein = dmp.diff_levenshtein(diffs)
  const maxLength = Math.max(oldText.length, newText.length)

  if (maxLength === 0) return 100

  return Math.round(((maxLength - levenshtein) / maxLength) * 100)
}
