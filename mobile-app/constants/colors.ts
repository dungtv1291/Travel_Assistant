// Design tokens — color palette  (TravelIn / Travenor inspired)

const base = {
  // Brand — teal primary (same in both themes)
  primary: '#1BBCD4',
  primaryDark: '#148FA0',
  accent: '#FF6B35',
  // Semantic (same in both themes)
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  // Category colors (same in both themes)
  beach: '#1BBCD4',
  mountain: '#52B788',
  city: '#6C63FF',
  culture: '#E07A5F',
  food: '#F4A261',
  family: '#FF85A1',
  // Ratings
  star: '#FBBF24',
  // Card gradient overlay
  cardGradientStart: 'rgba(0,0,0,0)',
  cardGradientEnd: 'rgba(0,0,0,0.65)',
  tabActive: '#1BBCD4',
  textInverse: '#FFFFFF',
};

export const LightColors = {
  ...base,
  primaryLight: '#E4F9FC',
  accentLight: '#FFF0EB',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  successLight: '#DCFCE7',
  warningLight: '#FEF3C7',
  errorLight: '#FEE2E2',
  infoLight: '#EFF6FF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  tabInactive: '#9CA3AF',
  tabBackground: '#FFFFFF',
};

export const DarkColors = {
  ...base,
  primaryLight: '#0D3A40',
  accentLight: '#3D2010',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceSecondary: '#252538',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  successLight: '#052E16',
  warningLight: '#2D1D00',
  errorLight: '#2D0A0A',
  infoLight: '#0B1A3D',
  border: '#2D2D44',
  divider: '#1F1F30',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  tabInactive: '#4B5563',
  tabBackground: '#1A1A2E',
};

// Default export kept for backward compat — resolved at runtime via useThemeColors()
export const Colors = LightColors;

export type ColorPalette = typeof LightColors;

export const GradientColors = {
  hero: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)'],
  card: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)'],
  primary: ['#2BCFE1', '#1BBCD4'],
  accent: ['#FF8C42', '#FF6B35'],
  splash: ['#1BBCD4', '#0D8FA0'],
};
