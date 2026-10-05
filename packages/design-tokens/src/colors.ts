export const colors = {
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
