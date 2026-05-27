/** Shared document category labels and status styling (student + agent portals). */

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: 'Academic',
  TEST_SCORES: 'Test scores',
  IDENTITY: 'Identity',
  FINANCIAL: 'Financial',
  APPLICATION: 'Application',
  VISA: 'Visa',
  KYC: 'KYC',
  OTHER: 'Other',
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  NOT_UPLOADED: 'Not uploaded',
  UPLOADED: 'Uploaded',
  UNDER_REVIEW: 'Under review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

export const DOCUMENT_STATUS_COLORS: Record<string, string> = {
  NOT_UPLOADED: 'bg-surface-card2 text-text-muted border border-surface-border',
  UPLOADED: 'bg-pastel-blue text-brand-700 border border-brand-200/80',
  UNDER_REVIEW: 'bg-pastel-sand text-amber-800 border border-amber-200/80',
  VERIFIED: 'bg-pastel-mint text-emerald-800 border border-emerald-200/80',
  REJECTED: 'bg-pastel-rose text-rose-800 border border-rose-200/80',
};

export const DOCUMENT_SLOT_ICONS: Record<string, string> = {
  IDENTITY: '🛂',
  ACADEMIC: '📄',
  TEST_SCORES: '📝',
  FINANCIAL: '🏦',
  APPLICATION: '📋',
  VISA: '✈️',
  OTHER: '📎',
};
