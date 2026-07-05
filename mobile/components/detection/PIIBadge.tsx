import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const PIIBadge = ({ type }: { type: string }) => (
  <View style={styles.badge}>
    <Text style={styles.text}>{type}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' }
});
