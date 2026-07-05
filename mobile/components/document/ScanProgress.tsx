import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const ScanProgress = ({ status }: { status: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Status: {status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  text: {
    color: colors.textPrimary,
  }
});
