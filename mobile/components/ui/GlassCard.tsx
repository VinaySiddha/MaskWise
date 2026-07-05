/**
 * GlassCard — Glassmorphism card with blur, border glow, and shadow
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  delay?: number;
  animated?: boolean;
  padding?: keyof typeof spacing;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  delay = 0,
  animated = true,
  padding = 'lg',
}) => {
  const cardPadding = spacing[padding];

  const gradientColors = variant === 'elevated'
    ? [colors.glassMedium, colors.glass] as const
    : variant === 'outlined'
    ? ['transparent', 'transparent'] as const
    : [colors.glass, 'rgba(255,255,255,0.02)'] as const;

  const content = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        variant === 'outlined' && styles.outlined,
        { padding: cardPadding },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );

  if (!animated) return <View>{content}</View>;

  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400).springify()}>
      {content}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.glass,
    ...shadows.md,
  },
  outlined: {
    borderColor: colors.glassBorderLight,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
});
