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
  LEAD: 'bg-text-muted/20 text-text-muted',
  DOCS_COLLECTION: 'bg-status-info/20 text-status-info',
  UNDER_REVIEW: 'bg-status-warning/20 text-status-warning',
  SUBMITTED: 'bg-brand-500/20 text-brand-400',
  OFFER_RECEIVED: 'bg-status-success/20 text-status-success',
  VISA_PROCESSING: 'bg-status-info/20 text-status-info',
  FEES_PAID: 'bg-status-success/20 text-status-success',
  ENROLLED: 'bg-status-success/30 text-status-success font-semibold',
  REJECTED: 'bg-status-error/20 text-status-error',
  WITHDRAWN: 'bg-text-muted/20 text-text-muted',
};
