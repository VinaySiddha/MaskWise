/**
 * DocumentCard — Card showing document name, status, and risk summary
 */
import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';
import type { Document } from '../../types/document';

interface DocumentCardProps {
  document: Document;
  onPress: (doc: Document) => void;
  onDelete?: (doc: Document) => void;
  index?: number;
}

const FILE_TYPE_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  'application/pdf': { icon: 'document-text', color: '#EF4444' },
  'text/plain': { icon: 'document', color: '#3B82F6' },
  'text/csv': { icon: 'grid', color: '#10B981' },
  'application/json': { icon: 'code-slash', color: '#F59E0B' },
  default: { icon: 'document-attach', color: '#8B5CF6' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPress,
  onDelete,
  index = 0,
}) => {
  const fileConfig = FILE_TYPE_ICONS[document.type] ?? FILE_TYPE_ICONS.default;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(document);
  }, [document, onPress]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete?.(document);
  }, [document, onDelete]);

  const isProcessing = ['pending', 'uploading', 'extracting_text', 'scanning', 'detecting', 'masking', 'scoring'].includes(document.status);
  const statusType = isProcessing ? 'processing' : document.status === 'completed' ? 'online' : document.status === 'failed' ? 'error' : 'offline';

  return (
    <View>
      <Pressable onPress={handlePress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        {/* File icon */}
        <View style={[styles.iconContainer, { backgroundColor: fileConfig.color + '20' }]}>
          <Ionicons name={fileConfig.icon} size={24} color={fileConfig.color} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.name} numberOfLines={1}>{document.name}</Text>
            {onDelete && (
              <Pressable onPress={handleDelete} hitSlop={12}>
                <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{formatFileSize(document.size)}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.meta}>{formatDate(document.uploadedAt)}</Text>
            <View style={styles.metaDot} />
            <StatusIndicator status={statusType} size={6} />
            <Text style={[styles.meta, { marginLeft: 4 }]}>
              {isProcessing ? document.status : document.status === 'completed' ? 'Done' : document.status}
            </Text>
          </View>
          {document.status === 'completed' && (
            <View style={styles.bottomRow}>
              <Badge level={document.riskLevel} size="sm" />
              <Text style={styles.findings}>
                {document.findingsCount} finding{document.findingsCount !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  pressed: {
    opacity: 0.96,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    ...typography.h5,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  findings: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
