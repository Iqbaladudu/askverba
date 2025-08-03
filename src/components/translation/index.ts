/**
 * Translation Components Index
 * Export all translation-related components
 *
 * Note: Some components use client-side libraries (framer-motion)
 * and should only be imported in client components
 */

// Client-side components (use framer-motion, should only be imported in client components)
export { TranslatorInput } from './translatorInput'
export { default as Translator } from './translator'
export { TranslationOutput } from './translationOutput'
export { GuestLimitationBanner } from './GuestLimitationBanner'

// Server-safe components
export { SimpleOutput } from './simpleOutput'
export { SingleTermOutput } from './singleTermOutput'
export { ParagraphOutput } from './paragraphOutput'
export { SimpleOutputWithVocabulary } from './SimpleOutputWithVocabulary'
export { OutputActions } from './outputActions'
