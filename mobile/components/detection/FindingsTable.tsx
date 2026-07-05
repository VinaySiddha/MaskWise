import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const FindingsTable = ({ findings }: { findings: any }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Findings</Text>
    {/* Implement table here */}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.surface, borderRadius: 12 },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: 'bold' }
});
