/**
 * Button — Gradient button with press feedback
 */
import React, { useCallback } from 'react';
import { StyleSheet, Text, Pressable, View, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const GRADIENT_MAP: Record<string, readonly [string, string]> = {
  primary: colors.gradientPrimary,
  danger: colors.gradientDanger,
  secondary: [colors.surfaceLight, colors.surface] as const,
};

const SIZE_MAP: Record<ButtonSize, { height: number; px: number; fontSize: number }> = {
  sm: { height: 36, px: spacing.lg, fontSize: 13 },
  md: { height: 48, px: spacing['2xl'], fontSize: 15 },
  lg: { height: 56, px: spacing['3xl'], fontSize: 17 },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const sizeConfig = SIZE_MAP[size];

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  const isGradient = variant === 'primary' || variant === 'danger' || variant === 'secondary';
  const textColor =
    variant === 'ghost' || variant === 'outline'
      ? colors.primary
      : colors.textPrimary;

  const iconColor =
    variant === 'ghost' || variant === 'outline'
      ? colors.primary
      : colors.textPrimary;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeConfig.fontSize + 2}
              color={iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              { fontSize: sizeConfig.fontSize, color: textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeConfig.fontSize + 2}
              color={iconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [fullWidth && styles.fullWidth, pressed && !disabled && !loading && styles.pressed]}
    >
      {isGradient ? (
        <LinearGradient
          colors={GRADIENT_MAP[variant] ?? colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.container,
            {
              height: sizeConfig.height,
              paddingHorizontal: sizeConfig.px,
            },
            disabled && styles.disabled,
            style,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.container,
            {
              height: sizeConfig.height,
              paddingHorizontal: sizeConfig.px,
            },
            variant === 'outline' && styles.outline,
            variant === 'ghost' && styles.ghost,
            disabled && styles.disabled,
            style,
          ]}
        >
          {renderContent()}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  text: {
    fontWeight: typography.h5.fontWeight,
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.92,
  },
  fullWidth: {
    width: '100%',
  },
});
