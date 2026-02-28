export const Colors = {
  primary: '#111111',
  background: '#F5F5F5',
  surface: 'rgba(255, 255, 255, 0.7)',
  surfaceStrong: 'rgba(255, 255, 255, 0.95)',
  border: 'rgba(0, 0, 0, 0.08)',
  text: {
    primary: '#0A0A0A',
    secondary: '#6B6B6B',
    tertiary: '#ABABAB',
    inverse: '#FFFFFF',
  },
  accent: {
    green: '#25671E',
    greenMuted: 'rgba(37, 103, 30, 0.1)',
    red: '#CC2B2B',
    redMuted: 'rgba(204, 43, 43, 0.1)',
    blue: '#1A56DB',
    blueMuted: 'rgba(26, 86, 219, 0.1)',
    orange: '#B45309',
    orangeMuted: 'rgba(180, 83, 9, 0.1)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.65)',
    border: 'rgba(255, 255, 255, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.06)',
  },
} as const;

export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
  title1:     { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.4 },
  title2:     { fontSize: 22, fontWeight: '600' as const, letterSpacing: -0.3 },
  title3:     { fontSize: 20, fontWeight: '600' as const, letterSpacing: -0.2 },
  headline:   { fontSize: 17, fontWeight: '600' as const, letterSpacing: -0.2 },
  body:       { fontSize: 17, fontWeight: '400' as const, letterSpacing: -0.2 },
  callout:    { fontSize: 16, fontWeight: '400' as const, letterSpacing: -0.2 },
  subhead:    { fontSize: 15, fontWeight: '400' as const, letterSpacing: -0.1 },
  footnote:   { fontSize: 13, fontWeight: '400' as const, letterSpacing: 0 },
  caption:    { fontSize: 12, fontWeight: '400' as const, letterSpacing: 0.1 },
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   22,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;