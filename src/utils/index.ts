import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatContent = (content: string): string => {
  // 1. normalize literal "\n" sequences
  const normalized = content.replace(/\\n/g, '\n')
  // 2. Replace bold markers
  const withBold = normalized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // 3. Handle list items (lines starting with "- ")
  const withLists = withBold.replace(/^- (.*)$/gm, '<li class="ml-5 pl-1 py-1">$1</li>')
  // 4. Replace newlines with <br/>
  const withBreaks = withLists.replace(/\n/g, '<br/>')
  // 5. Wrap standalone <li> items in <ul>
  const html = withBreaks.includes('<li') ? `<ul>${withBreaks}</ul>` : withBreaks

  return html
}

// Re-export all utilities from subdirectories
export * from './api'
export * from './auth'
export * from './hooks'
export * from './schema'
export * from './ai'

// Get clean title without markdown formatting
export const getCleanTitle = (title: string) => {
  return title.replace(/✨\s*\*\*\[?(.*?)\]?\*\*\s*✨/, '$1').trim()
}

// Function to speak text
export const handleSpeak = (text: string, lang: string = 'id-ID') => {
  if ('speechSynthesis' in window) {
    // Clean the text of markdown and emoji symbols if needed
    let cleanText = text
    if (text.includes('**') || text.includes('📝')) {
      // Remove specific emojis and markdown bold/brackets
      cleanText = text
        .replace(/[📝📚🔍✏️🔄⚖️💡🌐✍️⚙️🎯✨]/g, '') // Remove emojis
        .replace(/\*\*/g, '') // Remove bold markers
        .replace(/\[(.*?)\]/g, '$1') // Remove brackets but keep content
        .replace(/^- /gm, '') // Remove list markers
        .replace(/\\n/g, ' ') // Replace escaped newlines with space
        .replace(/\n/g, ' ') // Replace actual newlines with space
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim()
    }
    // Further cleaning for titles/headings if necessary
    cleanText = cleanText
      .replace(/Terjemahan Utama:/i, '')
      .replace(/Terjemahan Utuh \(Alami & Akurat\):/i, '')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = lang
    window.speechSynthesis.speak(utterance)
  }
}

// Function to copy text
export const handleCopy = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}
