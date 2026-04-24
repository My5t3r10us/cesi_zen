export const Colors = {
  primary: '#8A9A5B',
  primaryForeground: '#FFFFFF',
  background: '#FAFAF5',
  foreground: '#2D3B2D',
  card: '#FFFFFF',
  cardForeground: '#2D3B2D',
  secondary: '#F5F5DC',
  secondaryForeground: '#2D3B2D',
  muted: '#E8EBE0',
  mutedForeground: '#5A6B5A',
  accent: '#E8EBE0',
  border: '#D4DBC8',
  input: '#E8EBE0',
  destructive: '#E57373',
  chart: ['#8A9A5B', '#87CEEB', '#F0E68C', '#DDA0DD', '#98D8C8'],
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
} as const;

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;
