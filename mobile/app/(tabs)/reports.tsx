import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useDocumentStore } from '../../stores/documentStore';
import { DocumentCard } from '../../components/document/DocumentCard';
import { api } from '../../services/api';
import { Document } from '../../types/document';

export default function ReportsScreen() {
  const { documents, setDocuments, updateDocument } = useDocumentStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/documents/');
      const mappedDocs: Document[] = await Promise.all(
        res.data.map(async (d: any) => {
          let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
          let findingsCount = 0;
          let riskScore = 0;

          if (d.status === 'completed') {
            try {
              const riskRes = await api.get(`/api/v1/reports/${d.id}/risk`);
              riskLevel = riskRes.data.level === 'none' ? 'low' : riskRes.data.level;
              findingsCount = riskRes.data.total_findings;
              riskScore = riskRes.data.overall_score;
            } catch (e) {
              console.error(`Error fetching risk for ${d.id}:`, e);
            }
          }

          return {
            id: d.id,
            name: d.filename,
            type: d.content_type,
            size: d.file_size_bytes,
            uploadedAt: d.created_at,
            status: d.status,
            riskScore,
            riskLevel,
            findingsCount,
            piiTypesFound: [],
          };
        })
      );
      setDocuments(mappedDocs);
    } catch (e) {
      console.error('Failed to fetch documents:', e);
    }
  }, [setDocuments]);

  const loadInitial = async () => {
    setLoading(true);
    await fetchDocuments();
    setLoading(false);
  };

  useEffect(() => {
    loadInitial();
  }, [fetchDocuments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const handleDelete = async (doc: Document) => {
    try {
      // Optimitically update UI/remove from store
      setDocuments(documents.filter(d => d.id !== doc.id));
      await api.delete(`/api/v1/documents/${doc.id}`);
    } catch (e) {
      console.error('Failed to delete document:', e);
      // Re-fetch on error to sync state
      fetchDocuments();
    }
  };

  const handlePressCard = (doc: Document) => {
    console.log('Tapped document:', doc.name);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detection Reports</Text>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <DocumentCard
              document={item}
              index={index}
              onPress={handlePressCard}
              onDelete={handleDelete}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No reports generated yet.</Text>
              <Text style={styles.emptySubtext}>Scan a document on the Dashboard to see reports.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 60, 
    backgroundColor: colors.background 
  },
  title: { 
    fontSize: 32, 
    color: colors.textPrimary, 
    fontWeight: 'bold', 
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: { 
    color: colors.textSecondary, 
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  }
});
