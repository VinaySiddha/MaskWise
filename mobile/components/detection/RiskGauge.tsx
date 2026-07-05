import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const RiskGauge = ({ score }: { score: number }) => (
  <View style={styles.container}>
    <Text style={styles.score}>{score}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  score: { color: colors.textPrimary, fontSize: 32, fontWeight: 'bold' }
});
