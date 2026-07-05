/**
 * Detection / findings types
 */
export type PIIType =
  | 'SSN'
  | 'EMAIL'
  | 'PHONE'
  | 'ADDRESS'
  | 'CREDIT_CARD'
  | 'DOB'
  | 'NAME'
  | 'PASSPORT'
  | 'DRIVER_LICENSE'
  | 'BANK_ACCOUNT'
  | 'IP_ADDRESS'
  | 'MEDICAL_RECORD'
  | 'TAX_ID';

export type FindingCategory = 'identity' | 'financial' | 'contact' | 'health' | 'location' | 'other';

export interface Finding {
  id: string;
  documentId: string;
  type: PIIType;
  category: FindingCategory;
  value: string;
  maskedValue: string;
  confidence: number;
  lineNumber: number;
  context: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FindingsGroup {
  category: FindingCategory;
  findings: Finding[];
  count: number;
}

export const PII_TYPE_CONFIG: Record<PIIType, { label: string; color: string; category: FindingCategory }> = {
  SSN: { label: 'Social Security', color: '#EF4444', category: 'identity' },
  EMAIL: { label: 'Email Address', color: '#3B82F6', category: 'contact' },
  PHONE: { label: 'Phone Number', color: '#8B5CF6', category: 'contact' },
  ADDRESS: { label: 'Physical Address', color: '#F59E0B', category: 'location' },
  CREDIT_CARD: { label: 'Credit Card', color: '#EF4444', category: 'financial' },
  DOB: { label: 'Date of Birth', color: '#F97316', category: 'identity' },
  NAME: { label: 'Person Name', color: '#10B981', category: 'identity' },
  PASSPORT: { label: 'Passport Number', color: '#EF4444', category: 'identity' },
  DRIVER_LICENSE: { label: 'Driver License', color: '#EC4899', category: 'identity' },
  BANK_ACCOUNT: { label: 'Bank Account', color: '#EF4444', category: 'financial' },
  IP_ADDRESS: { label: 'IP Address', color: '#06B6D4', category: 'other' },
  MEDICAL_RECORD: { label: 'Medical Record', color: '#EF4444', category: 'health' },
  TAX_ID: { label: 'Tax ID', color: '#F59E0B', category: 'financial' },
};

export const CATEGORY_CONFIG: Record<FindingCategory, { label: string; icon: string; color: string }> = {
  identity: { label: 'Identity', icon: 'person', color: '#8B5CF6' },
  financial: { label: 'Financial', icon: 'card', color: '#EF4444' },
  contact: { label: 'Contact', icon: 'call', color: '#3B82F6' },
  health: { label: 'Health', icon: 'medkit', color: '#10B981' },
  location: { label: 'Location', icon: 'location', color: '#F59E0B' },
  other: { label: 'Other', icon: 'ellipsis-horizontal', color: '#64748B' },
};
