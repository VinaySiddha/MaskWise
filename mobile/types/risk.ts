/**
 * Risk-related types
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskScore {
  overall: number;
  level: RiskLevel;
  breakdown: RiskBreakdown;
}

export interface RiskBreakdown {
  identityRisk: number;
  financialRisk: number;
  contactRisk: number;
  healthRisk: number;
  volumeRisk: number;
}

export interface ComplianceStatus {
  gdpr: ComplianceCheck;
  hipaa: ComplianceCheck;
  pci: ComplianceCheck;
  ccpa: ComplianceCheck;
}

export interface ComplianceCheck {
  name: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  score: number;
  issues: string[];
}

export const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bgColor: string; icon: string }> = {
  low: { label: 'Low', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.15)', icon: 'shield-checkmark' },
  medium: { label: 'Medium', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.15)', icon: 'warning' },
  high: { label: 'High', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)', icon: 'alert-circle' },
  critical: { label: 'Critical', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)', icon: 'flame' },
};
