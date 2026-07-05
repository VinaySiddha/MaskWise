/**
 * Badge — Color-coded risk level badges
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { RiskLevel, RISK_LEVEL_CONFIG } from '../../types/risk';

interface BadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const SIZE_MAP = {
  sm: { px: spacing.sm, py: 2, fontSize: 10, iconSize: 10 },
  md: { px: spacing.md, py: spacing.xs, fontSize: 12, iconSize: 13 },
  lg: { px: spacing.lg, py: spacing.sm, fontSize: 14, iconSize: 16 },
};

export const Badge: React.FC<BadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
}) => {
  const config = RISK_LEVEL_CONFIG[level];
  const sizeConfig = SIZE_MAP[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: sizeConfig.px,
          paddingVertical: sizeConfig.py,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon as keyof typeof Ionicons.glyphMap}
          size={sizeConfig.iconSize}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          { fontSize: sizeConfig.fontSize, color: config.color },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
