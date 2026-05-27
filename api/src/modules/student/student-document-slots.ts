import { DocumentCategory } from '@prisma/client';

export type StudentDocumentSlot = {
  category: DocumentCategory;
  label: string;
  description: string;
  required: boolean;
  accept: string;
};

/** Categories students may upload (excludes KYC — agent-only). */
export const STUDENT_UPLOAD_CATEGORIES: DocumentCategory[] = [
  DocumentCategory.IDENTITY,
  DocumentCategory.ACADEMIC,
  DocumentCategory.TEST_SCORES,
  DocumentCategory.FINANCIAL,
  DocumentCategory.APPLICATION,
  DocumentCategory.VISA,
  DocumentCategory.OTHER,
];

export const STUDENT_DOCUMENT_SLOTS: StudentDocumentSlot[] = [
  {
    category: DocumentCategory.IDENTITY,
    label: 'Identity',
    description: 'Passport, Aadhaar, or national ID',
    required: true,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    category: DocumentCategory.ACADEMIC,
    label: 'Academic',
    description: 'Mark sheets, transcripts, degree certificates',
    required: true,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    category: DocumentCategory.TEST_SCORES,
    label: 'Test scores',
    description: 'IELTS, PTE, TOEFL, GRE, GMAT score reports',
    required: true,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    category: DocumentCategory.FINANCIAL,
    label: 'Financial',
    description: 'Bank statements, sponsorship letters, loan sanction',
    required: true,
    accept: '.pdf',
  },
  {
    category: DocumentCategory.APPLICATION,
    label: 'Application',
    description: 'SOP drafts, LORs, CV/resume',
    required: false,
    accept: '.pdf,.doc,.docx',
  },
  {
    category: DocumentCategory.VISA,
    label: 'Visa',
    description: 'Visa forms, biometrics receipt, previous visas',
    required: false,
    accept: '.pdf,.jpg,.jpeg,.png',
  },
  {
    category: DocumentCategory.OTHER,
    label: 'Other',
    description: 'Any additional supporting documents',
    required: false,
    accept: '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  },
];

export const STUDENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  ACADEMIC: 'Academic',
  TEST_SCORES: 'Test scores',
  IDENTITY: 'Identity',
  FINANCIAL: 'Financial',
  APPLICATION: 'Application',
  VISA: 'Visa',
  KYC: 'KYC',
  OTHER: 'Other',
};
