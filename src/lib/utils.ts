import { type ClassValue, clsx } from 'clsx'
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

// Get clean title without markdown formatting
export const getCleanTitle = (title: string) => {
  return title.replace(/✨\s*\*\*\[?(.*?)\]?\*\*\s*✨/, '$1').trim()
}

// Handle copy functionality
export const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy text:', error)
    return false
  }
}

// Handle speak functionality
export const handleSpeak = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.pitch = 1
    speechSynthesis.speak(utterance)
  }
}
