export const colors = {
  primary: '#059669', // Emerald 600
  primaryHover: '#047857', // Emerald 700
  primaryLight: '#D1FAE5', // Emerald 100
  primaryContainer: '#ECFDF5', // Emerald 50
  
  secondary: '#0F766E', // Teal 700
  secondaryLight: '#CCFBF1', // Teal 100

  accent: '#F59E0B', // Amber 500
  accentGold: '#D97706', // Amber 600
  accentLight: '#FEF3C7', // Amber 100

  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF', // Pure White
  surfaceVariant: '#F1F5F9', // Slate 100
  surfaceCard: '#FFFFFF',

  textPrimary: '#0F172A', // Slate 900
  textSecondary: '#64748B', // Slate 500
  textMuted: '#94A3B8', // Slate 400
  textOnPrimary: '#FFFFFF',

  success: '#10B981', // Emerald 500
  successBg: '#D1FAE5',
  warning: '#F59E0B', // Amber 500
  warningBg: '#FEF3C7',
  error: '#EF4444', // Red 500
  errorBg: '#FEE2E2',
  info: '#3B82F6', // Blue 500
  infoBg: '#DBEAFE',

  border: '#E2E8F0', // Slate 200
  borderFocus: '#059669',
  divider: '#F1F5F9',

  badgeActiveBg: '#ECFDF5',
  badgeActiveText: '#047857',
  badgeScheduledBg: '#EFF6FF',
  badgeScheduledText: '#1D4ED8',
  badgeFinishedBg: '#F1F5F9',
  badgeFinishedText: '#475569',
  badgeCancelledBg: '#FEF2F2',
  badgeCancelledText: '#DC2626',
} as const;

export type Colors = typeof colors;
