import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { useDocumentStore } from '../stores/documentStore';
import { Document, ProcessingStatus } from '../types/document';

export const useDocumentScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const { addDocument, updateDocument } = useDocumentStore();

  const pollScanStatus = useCallback((docId: string, jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/v1/scan/status/${jobId}`);
        const { status, progress, findings_count, risk_score, risk_level } = res.data;

        // Map JobStatus (queued, running, completed, failed) to ProcessingStatus
        let procStatus: ProcessingStatus = 'scanning';
        if (status === 'queued') procStatus = 'pending';
        else if (status === 'running') procStatus = 'scanning';
        else if (status === 'completed') procStatus = 'completed';
        else if (status === 'failed') procStatus = 'failed';

        // Map RiskLevel (none, low, medium, high, critical)
        let mappedRiskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (risk_level === 'medium') mappedRiskLevel = 'medium';
        else if (risk_level === 'high') mappedRiskLevel = 'high';
        else if (risk_level === 'critical') mappedRiskLevel = 'critical';

        updateDocument(docId, {
          status: procStatus,
          findingsCount: findings_count || 0,
          riskScore: risk_score || 0,
          riskLevel: mappedRiskLevel,
        });

        if (status === 'completed' || status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Polling error:', err);
        updateDocument(docId, { status: 'failed' });
        clearInterval(interval);
      }
    }, 2000);
  }, [updateDocument]);

  const uploadAndScan = useCallback(async (fileUri: string, type: 'pdf' | 'csv' | 'txt' | string, name: string) => {
    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name,
        type: type.includes('/') ? type : `application/${type}`,
      } as any);

      // Upload
      const uploadRes = await api.post('/api/v1/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const backendDoc = uploadRes.data;

      const doc: Document = {
        id: backendDoc.id,
        name: backendDoc.filename,
        type: backendDoc.content_type,
        size: backendDoc.file_size_bytes,
        uploadedAt: backendDoc.created_at,
        status: 'pending',
        riskScore: 0,
        riskLevel: 'low',
        findingsCount: 0,
        piiTypesFound: [],
      };
      addDocument(doc);

      // Trigger Scan
      updateDocument(doc.id, { status: 'scanning' });
      const scanRes = await api.post(`/api/v1/scan/${doc.id}`);
      
      const { job_id } = scanRes.data;

      // Start status polling
      pollScanStatus(doc.id, job_id);

    } catch (e) {
      console.error('Scan failed:', e);
    } finally {
      setIsScanning(false);
    }
  }, [addDocument, updateDocument, pollScanStatus]);

  return { uploadAndScan, isScanning };
};
