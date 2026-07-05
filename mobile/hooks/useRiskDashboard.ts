import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface RiskDashboardData {
  total_documents_scanned: number;
  total_findings: number;
  high_risk_documents: number;
  compliance_score: number;
  recent_activity: any[];
}

export const useRiskDashboard = () => {
  const [data, setData] = useState<RiskDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<RiskDashboardData>('/api/v1/reports/dashboard');
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading };
};
