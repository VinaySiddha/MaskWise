/**
 * DocumentUploader — File picker + camera scan
 */
import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';
import { Button } from '../ui/Button';

interface DocumentUploaderProps {
  onFileSelected: (file: { uri: string; name: string; type: string; size: number }) => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onFileSelected,
  isUploading = false,
  uploadProgress = 0,
}) => {
  const handlePickDocument = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'text/csv', 'application/json',
               'application/msword',
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        onFileSelected({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType ?? 'application/octet-stream',
          size: asset.size ?? 0,
        });
      }
    } catch (err) {
      console.warn('Document pick error:', err);
    }
  }, [onFileSelected]);

  const handleCameraScan = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        onFileSelected({
          uri: asset.uri,
          name: `scan_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: asset.fileSize ?? 0,
        });
      }
    } catch (err) {
      console.warn('Camera scan error:', err);
    }
  }, [onFileSelected]);

  if (isUploading) {
    return (
      <View style={styles.uploadingContainer}>
        <LinearGradient
          colors={[colors.glass, colors.glassMedium]}
          style={styles.uploadingGradient}
        >
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={colors.gradientPrimary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${uploadProgress}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            Uploading... {Math.round(uploadProgress)}%
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePickDocument}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={styles.container}>
        <View style={styles.dashedBorder}>
          <LinearGradient
            colors={colors.gradientPrimary as any}
            style={styles.iconCircle}
          >
            <Ionicons name="cloud-upload" size={32} color={colors.textPrimary} />
          </LinearGradient>

          <Text style={styles.title}>Upload Document</Text>
          <Text style={styles.subtitle}>
            PDF, DOC, TXT, CSV, JSON — up to 10MB
          </Text>

          <View style={styles.actions}>
            <Button
              title="Browse Files"
              onPress={handlePickDocument}
              variant="primary"
              size="md"
              icon="document-text"
            />
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <Button
              title="Scan Document"
              onPress={handleCameraScan}
              variant="outline"
              size="md"
              icon="camera"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.md,
  },
  dashedBorder: {
    borderWidth: 2,
    borderColor: colors.glassBorderLight,
    borderStyle: 'dashed',
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.glass,
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  uploadingContainer: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.96,
  },
  uploadingGradient: {
    padding: spacing['2xl'],
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    gap: spacing.md,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
