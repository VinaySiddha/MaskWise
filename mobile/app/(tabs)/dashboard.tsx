import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { useRiskDashboard } from '../../hooks/useRiskDashboard';
import { useDocumentScan } from '../../hooks/useDocumentScan';
import { DocumentUploader } from '../../components/document/DocumentUploader';

export default function DashboardScreen() {
  const { data, loading } = useRiskDashboard();
  const { uploadAndScan, isScanning } = useDocumentScan();

  const handleFileSelected = (file: { uri: string; name: string; type: string; size: number }) => {
    let type: 'pdf' | 'csv' | 'txt' = 'pdf';
    if (file.name.endsWith('.csv')) type = 'csv';
    if (file.name.endsWith('.txt')) type = 'txt';
    uploadAndScan(file.uri, type, file.name);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Risk Dashboard</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 20 }} />
      ) : data ? (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.total_documents_scanned}</Text>
            <Text style={styles.statLabel}>Documents</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.total_findings}</Text>
            <Text style={styles.statLabel}>Findings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: data.high_risk_documents > 0 ? colors.critical : colors.success }]}>
              {data.high_risk_documents}
            </Text>
            <Text style={styles.statLabel}>High Risk</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>Dashboard data will appear here once you scan a document.</Text>
      )}

      <Text style={styles.subtitle}>Scan New Document</Text>
      <View style={styles.uploaderWrapper}>
        <DocumentUploader 
          onFileSelected={handleFileSelected} 
          isUploading={isScanning} 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  title: { fontSize: 32, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 24, color: 'white', fontWeight: '600', marginTop: 30, marginBottom: 15 },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 28, color: colors.primary, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 14, color: colors.textSecondary },
  emptyText: { color: colors.textSecondary, fontSize: 16, marginTop: 10 },
  uploaderWrapper: { marginTop: 10 }
});
