export const colors = {
  // Primary palette
  navy: '#09142A',
  navyLight: '#122040',
  navyGlass: 'rgba(9, 20, 42, 0.85)',
  orange: '#FF5722',
  orangeLight: '#FF7043',
  orangeGlow: 'rgba(255, 87, 34, 0.3)',
  teal: '#22D3EE',
  tealGlow: 'rgba(34, 211, 238, 0.25)',
  gold: '#C9A227',
  goldLight: '#D4AF37',
  goldGlow: 'rgba(201, 162, 39, 0.3)',

  // Neutral
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  gray100: '#F1F3F5',
  gray200: '#E9ECEF',
  gray300: '#CED4DA',
  gray500: '#868E96',
  gray700: '#495057',
  gray900: '#212529',

  // Semantic
  danger: '#FF4444',
  dangerPulse: '#FF1744',
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Background
  background: '#0A1528',
  surface: '#122040',
  surfaceElevated: '#1A2A4A',
  surfaceDark: '#0D1B35',

  // Glassmorphism
  glass: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.15)',
  glassStrong: 'rgba(255,255,255,0.12)',
} as const;

export type ColorKey = keyof typeof colors;
