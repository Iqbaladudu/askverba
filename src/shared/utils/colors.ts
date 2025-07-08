// Modern Color Palette for AskVerba
// Replaces gradient usage with cohesive solid colors

export const colors = {
  // Primary Brand Colors
  brand: {
    primary: '#FF5B9E',
    secondary: '#E54A8C',
    light: '#FF8BB8',
    dark: '#D63E7A',
  },

  // Accent Colors
  accent: {
    orange: '#FF8A3C',
    blue: '#3B82F6',
    purple: '#8B5CF6',
    green: '#10B981',
    yellow: '#F59E0B',
    teal: '#06B6D4',
    rose: '#F43F5E',
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Neutral Colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // Background variants
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    dark: {
      primary: '#0F172A',
      secondary: '#1E293B',
      tertiary: '#334155',
    },
  },

  // Interactive states
  interactive: {
    hover: 'rgba(255, 91, 158, 0.1)',
    active: 'rgba(255, 91, 158, 0.2)',
    disabled: 'rgba(156, 163, 175, 0.5)',
    focus: 'rgba(255, 91, 158, 0.3)',
  },
} as const

// Color utilities
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Theme-aware color selection
export const getThemeColor = (lightColor: string, darkColor: string, isDark: boolean): string => {
  return isDark ? darkColor : lightColor
}

// Color combinations for UI elements
export const colorCombinations = {
  // Button variants
  buttons: {
    primary: {
      background: colors.brand.primary,
      text: '#FFFFFF',
      hover: colors.brand.secondary,
    },
    secondary: {
      background: colors.accent.blue,
      text: '#FFFFFF',
      hover: '#2563EB',
    },
    success: {
      background: colors.semantic.success,
      text: '#FFFFFF',
      hover: '#059669',
    },
    warning: {
      background: colors.semantic.warning,
      text: '#FFFFFF',
      hover: '#D97706',
    },
    danger: {
      background: colors.semantic.error,
      text: '#FFFFFF',
      hover: '#DC2626',
    },
  },

  // Status indicators
  status: {
    online: colors.semantic.success,
    offline: colors.neutral[400],
    busy: colors.semantic.warning,
    away: colors.accent.orange,
  },

  // Translation modes
  translationModes: {
    simple: {
      primary: colors.accent.green,
      background: getColorWithOpacity(colors.accent.green, 0.1),
      border: getColorWithOpacity(colors.accent.green, 0.2),
    },
    detailed: {
      primary: colors.accent.purple,
      background: getColorWithOpacity(colors.accent.purple, 0.1),
      border: getColorWithOpacity(colors.accent.purple, 0.2),
    },
  },

  // Feature categories
  features: {
    conversation: {
      primary: colors.accent.blue,
      background: getColorWithOpacity(colors.accent.blue, 0.1),
    },
    learning: {
      primary: colors.accent.purple,
      background: getColorWithOpacity(colors.accent.purple, 0.1),
    },
    ai: {
      primary: colors.accent.orange,
      background: getColorWithOpacity(colors.accent.orange, 0.1),
    },
  },
} as const

// Tailwind CSS class generators
export const getTailwindColor = (colorPath: string): string => {
  // Helper to convert color object paths to Tailwind classes
  // Example: 'brand.primary' -> 'text-[#FF5B9E]'
  const color = colorPath.split('.').reduce((obj, key) => obj[key], colors as any)
  return `[${color}]`
}

// Export individual color tokens for direct usage
export const brandColors = colors.brand
export const accentColors = colors.accent
export const semanticColors = colors.semantic
export const neutralColors = colors.neutral

// Dark mode color mappings
export const darkModeColors = {
  background: colors.background.dark.primary,
  surface: colors.background.dark.secondary,
  border: colors.neutral[700],
  text: {
    primary: colors.neutral[50],
    secondary: colors.neutral[300],
    tertiary: colors.neutral[400],
  },
}

// Light mode color mappings
export const lightModeColors = {
  background: colors.background.primary,
  surface: colors.background.secondary,
  border: colors.neutral[200],
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
  },
}
