/**
 * Document-related types
 */
export type ProcessingStatus =
  | 'idle'
  | 'pending'
  | 'uploading'
  | 'extracting_text'
  | 'scanning'
  | 'detecting'
  | 'masking'
  | 'scoring'
  | 'completed'
  | 'failed';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: ProcessingStatus;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  findingsCount: number;
  piiTypesFound: string[];
  thumbnailUri?: string;
}

export interface UploadResponse {
  documentId: string;
  status: ProcessingStatus;
  message: string;
}

export interface ProcessingUpdate {
  documentId: string;
  status: ProcessingStatus;
  progress: number;
  message: string;
}

export const PROCESSING_STEPS: { status: ProcessingStatus; label: string; icon: string }[] = [
  { status: 'uploading', label: 'Uploading', icon: 'cloud-upload' },
  { status: 'scanning', label: 'Scanning', icon: 'document-text' },
  { status: 'detecting', label: 'Detecting PII', icon: 'search' },
  { status: 'masking', label: 'Masking', icon: 'shield-checkmark' },
  { status: 'scoring', label: 'Scoring Risk', icon: 'analytics' },
];
