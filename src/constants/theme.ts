export const Colors = {
  primary: '#0A84FF',
  background: '#F2F2F7',
  surface: 'rgba(255, 255, 255, 0.6)',
  surfaceStrong: 'rgba(255, 255, 255, 0.85)',
  border: 'rgba(255, 255, 255, 0.4)',
  text: {
    primary: '#1C1C1E',
    secondary: '#6C6C70',
    tertiary: '#AEAEB2',
    inverse: '#FFFFFF',
  },
  accent: {
    blue: '#0A84FF',
    green: '#30D158',
    orange: '#FF9F0A',
    red: '#FF453A',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.55)',
    border: 'rgba(255, 255, 255, 0.45)',
    shadow: 'rgba(0, 0, 0, 0.08)',
  },
} as const;

export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, letterSpacing: 0.37 },
  title1:     { fontSize: 28, fontWeight: '700' as const, letterSpacing: 0.36 },
  title2:     { fontSize: 22, fontWeight: '600' as const, letterSpacing: 0.35 },
  title3:     { fontSize: 20, fontWeight: '600' as const, letterSpacing: 0.38 },
  headline:   { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.41 },
  body:       { fontSize: 17, fontWeight: '400' as const, letterSpacing: -0.41 },
  callout:    { fontSize: 16, fontWeight: '400' as const, letterSpacing: -0.32 },
  subhead:    { fontSize: 15, fontWeight: '400' as const, letterSpacing: -0.24 },
  footnote:   { fontSize: 13, fontWeight: '400' as const, letterSpacing: -0.08 },
  caption:    { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0 },
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;