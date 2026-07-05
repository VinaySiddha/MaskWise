/**
 * Dark mode color palette for Sensitive Data Detection & Compliance Assistant
 * Glassmorphism-ready with transparency tokens
 */
export const colors = {
  // Primary brand
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryGlow: 'rgba(99, 102, 241, 0.3)',

  // Semantic
  critical: '#EF4444',
  criticalLight: '#FCA5A5',
  criticalDark: '#DC2626',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',
  success: '#10B981',
  successLight: '#6EE7B7',
  successDark: '#059669',
  info: '#3B82F6',
  infoLight: '#93C5FD',

  // Backgrounds
  background: '#000000',
  backgroundLight: '#050505',
  surface: '#111111',
  surfaceLight: '#1A1A1A',
  surfaceElevated: '#222222',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Borders
  border: '#222222',
  borderLight: '#333333',
  borderFocus: '#6366F1',

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.05)',
  glassMedium: 'rgba(255, 255, 255, 0.08)',
  glassHeavy: 'rgba(255, 255, 255, 0.12)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  glassBorderLight: 'rgba(255, 255, 255, 0.15)',

  // Gradients (defined as tuples for LinearGradient)
  gradientPrimary: ['#6366F1', '#8B5CF6'] as const,
  gradientDanger: ['#EF4444', '#F97316'] as const,
  gradientSuccess: ['#10B981', '#06B6D4'] as const,
  gradientSurface: ['rgba(17, 17, 17, 0.8)', 'rgba(0, 0, 0, 0.9)'] as const,
  gradientBackground: ['#000000', '#0a0a0a', '#000000'] as const,

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Shadows
  shadowColor: '#000000',
} as const;

export type ColorKey = keyof typeof colors;
