/**
 * GadgetBazar Design Token: Radii (Border Radius)
 * Plain TypeScript object usable by Tailwind CSS (web) and React Native (mobile).
 */
export const radii = {
  // Numerical values in pixels for React Native
  none: 0,
  sm: 4,
  base: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,

  // String values for Web / Tailwind
  web: {
    none: '0px',
    sm: '4px',
    base: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    '3xl': '32px',
    full: '9999px',
  },
} as const;

export type Radii = typeof radii;
