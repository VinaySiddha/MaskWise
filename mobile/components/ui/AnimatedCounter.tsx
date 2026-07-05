/**
 * AnimatedCounter — Smooth number counter that animates on value change
 */
import React, { useEffect } from 'react';
import { TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COUNTER_DURATION } from '../../theme/animations';
import { colors } from '../../theme';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedTextInput = Animated.createAnimatedComponent(
  require('react-native').TextInput
) as any;

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = COUNTER_DURATION,
  style,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, animatedValue]);

  const animatedProps = useAnimatedProps(() => {
    const displayValue = decimals > 0
      ? animatedValue.value.toFixed(decimals)
      : Math.round(animatedValue.value).toString();
    return {
      text: `${prefix}${displayValue}${suffix}`,
      defaultValue: `${prefix}${displayValue}${suffix}`,
    };
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      animatedProps={animatedProps as any}
      style={[
        {
          fontSize: 36,
          fontWeight: '700',
          color: colors.textPrimary,
          padding: 0,
        },
        style,
      ]}
    />
  );
};
