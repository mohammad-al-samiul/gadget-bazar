/**
 * GadgetBazar Design Token: Colors
 * Plain TypeScript object usable by Tailwind CSS (web) and React Native (mobile).
 */
export const colors = {
  // Brand Primary & Accents
  blue: '#1652F0',
  blueHover: '#1242C4',
  blueLight: '#E8EFFF',
  blueDark: '#0D36A8',

  ink: '#111318',
  inkLight: '#1C1F26',
  inkSurface: '#242731',

  orange: '#FF7A29',
  orangeHover: '#E5681E',
  orangeLight: '#FFF2EB',
  orangeDark: '#C75713',

  // Neutrals Palette
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Status & Feedback
  success: '#0F9D58',
  successLight: '#E6F4EA',
  warning: '#F4B400',
  warningLight: '#FEF7E0',
  error: '#DB4437',
  errorLight: '#FCE8E6',
  info: '#4285F4',
  infoLight: '#E8F0FE',

  // Semantic mappings
  primary: {
    blue: '#1652F0',
    blueHover: '#1242C4',
    blueLight: '#E8EFFF',
  },
  neutral: {
    nearBlack: '#111318',
    darkGray: '#242731',
    midGray: '#5F6368',
    lightGray: '#F1F3F4',
    white: '#FFFFFF',
  },
  accent: {
    orange: '#FF7A29',
    orangeHover: '#E5681E',
    orangeLight: '#FFF2EB',
  },
  status: {
    success: '#0F9D58',
    warning: '#F4B400',
    error: '#DB4437',
    info: '#4285F4',
  },
} as const;

export type Colors = typeof colors;
