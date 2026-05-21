import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountInr: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amountInr);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

export const JOURNEY_TYPE_COLORS: Record<string, string> = {
  lead: 'bg-pastel-blue text-brand-700 border-blue-100',
  call: 'bg-pastel-mint text-emerald-800 border-emerald-100',
  meeting: 'bg-pastel-lilac text-violet-800 border-violet-100',
  profile: 'bg-pastel-sand text-amber-800 border-amber-100',
  document: 'bg-amber-50 text-amber-900 border-amber-100',
  application: 'bg-brand-50 text-brand-700 border-brand-100',
  stage: 'bg-indigo-50 text-indigo-800 border-indigo-100',
  proposal: 'bg-purple-50 text-purple-800 border-purple-100',
  offer: 'bg-status-success-bg text-status-success border-green-100',
  visa: 'bg-sky-50 text-sky-800 border-sky-100',
  payment: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  enrolled: 'bg-status-success-bg text-status-success border-green-100',
  ai: 'bg-pastel-peach text-orange-800 border-orange-100',
  note: 'bg-surface-card2 text-text-muted border-surface-border',
};

export const APPLICATION_STAGE_LABELS: Record<string, string> = {
  LEAD: 'Lead',
  DOCS_COLLECTION: 'Docs Collection',
  UNDER_REVIEW: 'Under Review',
  SUBMITTED: 'Submitted',
  OFFER_RECEIVED: 'Offer Received',
  VISA_PROCESSING: 'Visa Processing',
  FEES_PAID: 'Fees Paid',
  ENROLLED: 'Enrolled',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const STAGE_COLORS: Record<string, string> = {
  LEAD: 'bg-pastel-sand text-amber-800 border border-amber-200/80',
  DOCS_COLLECTION: 'bg-pastel-blue text-brand-700 border border-brand-200/80',
  UNDER_REVIEW: 'bg-pastel-peach text-orange-800 border border-orange-200/80',
  SUBMITTED: 'bg-brand-100 text-brand-800 border border-brand-200/80',
  OFFER_RECEIVED: 'bg-pastel-mint text-emerald-800 border border-emerald-200/80',
  VISA_PROCESSING: 'bg-sky-100 text-sky-800 border border-sky-200/80',
  FEES_PAID: 'bg-pastel-lilac text-violet-800 border border-violet-200/80',
  ENROLLED: 'bg-status-success-bg text-emerald-800 border border-green-200 font-semibold',
  REJECTED: 'bg-pastel-rose text-rose-800 border border-rose-200/80',
  WITHDRAWN: 'bg-surface-card2 text-text-secondary border border-surface-border',
};

/** Pastel panel themes for student profile sections */
export const PROFILE_SECTION_THEMES: Record<string, { header: string; rowHover: string }> = {
  Academic: { header: 'bg-pastel-blue text-brand-700', rowHover: 'hover:bg-pastel-blue/50' },
  Goals: { header: 'bg-pastel-mint text-emerald-800', rowHover: 'hover:bg-pastel-mint/50' },
  Personal: { header: 'bg-pastel-lilac text-violet-800', rowHover: 'hover:bg-pastel-lilac/50' },
  'Family & other': { header: 'bg-pastel-peach text-orange-800', rowHover: 'hover:bg-pastel-peach/50' },
};

export const JOURNEY_EVENT_TYPE_TEXT: Record<string, string> = {
  lead: 'text-brand-700',
  call: 'text-emerald-700',
  meeting: 'text-violet-700',
  profile: 'text-text-secondary',
  document: 'text-amber-800',
  application: 'text-brand-700',
  stage: 'text-indigo-700',
  proposal: 'text-purple-700',
  offer: 'text-emerald-700',
  visa: 'text-sky-700',
  payment: 'text-teal-700',
  enrolled: 'text-emerald-800',
  ai: 'text-orange-700',
  note: 'text-text-muted',
};
