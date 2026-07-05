/**
 * Typography scale for the app
 * System fonts with consistent sizing and weights
 */
import { TextStyle } from 'react-native';

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

export const fontWeights = {
  light: '300' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
};

export const lineHeights = {
  tight: 1.15,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

export const typography = {
  h1: {
    fontSize: fontSizes['4xl'],
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
  } as TextStyle,
  h2: {
    fontSize: fontSizes['3xl'],
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  } as TextStyle,
  h3: {
    fontSize: fontSizes['2xl'],
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
  } as TextStyle,
  h4: {
    fontSize: fontSizes.xl,
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.normal,
  } as TextStyle,
  h5: {
    fontSize: fontSizes.lg,
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.lg * lineHeights.normal,
  } as TextStyle,
  body: {
    fontSize: fontSizes.base,
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.relaxed,
  } as TextStyle,
  bodySmall: {
    fontSize: fontSizes.md,
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.md * lineHeights.relaxed,
  } as TextStyle,
  caption: {
    fontSize: fontSizes.sm,
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
  } as TextStyle,
  label: {
    fontSize: fontSizes.sm,
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  } as TextStyle,
  overline: {
    fontSize: fontSizes.xs,
    fontFamily: 'GoogleSans',
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  } as TextStyle,
};

export type TypographyVariant = keyof typeof typography;
