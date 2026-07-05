/**
 * StatusIndicator — Compact status dot for connection / processing state
 */
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, spacing } from '../../theme';

type StatusType = 'online' | 'offline' | 'processing' | 'warning' | 'error';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: number;
}

const STATUS_COLORS: Record<StatusType, string> = {
  online: colors.success,
  offline: colors.textMuted,
  processing: colors.primary,
  warning: colors.warning,
  error: colors.critical,
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 8,
}) => {
  const color = STATUS_COLORS[status];

  return (
    <View style={styles.container}>
      <View style={[styles.dotWrapper, { width: size * 3, height: size * 3 }]}>
        {status === 'processing' && (
          <View
            style={[
              styles.pulse,
              {
                width: size * 1.8,
                height: size * 1.8,
                borderRadius: (size * 1.8) / 2,
                backgroundColor: color,
                opacity: 0.18,
              },
            ]}
          />
        )}
        <View
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {label && <Text style={[styles.label, { color }]}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  dot: {},
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
});
