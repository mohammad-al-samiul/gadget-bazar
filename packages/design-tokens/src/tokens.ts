import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';

export const tokens = {
  colors,
  typography,
  spacing,
  radii,
} as const;

export type DesignTokens = typeof tokens;
