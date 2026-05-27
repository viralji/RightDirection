'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { uploadStudentDocument } from '@/lib/upload-document';
import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_SLOT_ICONS,
  DOCUMENT_STATUS_COLORS,
  DOCUMENT_STATUS_LABELS,
} from '@/lib/document-meta';
import { formatDate, cn } from '@/lib/utils';
import { DetailSection, StatBox, pt } from '@/components/ui/portal-ui';
import { CheckCircle2, Clock, Eye, Loader2, Upload, XCircle } from 'lucide-react';

export function StudentDocumentsPanel() {
  const qc = useQueryClient();
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; fileName: string } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['student-documents'],
    queryFn: () => students.meDocuments(),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({
      category,
      file,
      parentDocId,
    }: {
      category: string;
      file: File;
      parentDocId?: string;
    }) => {
      setUploadingCategory(category);
      setError(null);
      return uploadStudentDocument(category, file, parentDocId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['student-documents'] });
      qc.invalidateQueries({ queryKey: ['student-journey-me'] });
      qc.invalidateQueries({ queryKey: ['student-dashboard'] });
    },
    onError: (e: Error) => setError(e.message),
    onSettled: () => setUploadingCategory(null),
  });

  const handleFile = (category: string, file: File | undefined, parentDocId?: string) => {
    if (!file) return;
    uploadMutation.mutate({ category, file, parentDocId });
  };

  const openPreview = async (docId: string, fileName: string) => {
    try {
      const { url } = await students.meDocumentDownload(docId);
      setPreview({ url, fileName });
    } catch (e: any) {
      setError(e.message || 'Could not open document');
    }
  };

  if (isLoading) {
    return <p className={cn(pt.meta, 'py-4 text-center')}>Loading documents…</p>;
  }

  const summary = data?.summary;

  return (
    <div className="space-y-3">
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatBox
            label="Required done"
            value={`${summary.requiredUploaded}/${summary.requiredTotal}`}
            tone="mint"
          />
          <StatBox label="Verified" value={summary.verified} tone="blue" />
          <StatBox label="Under review" value={summary.underReview} tone="sand" />
          <StatBox label="Rejected" value={summary.rejected} tone="rose" />
        </div>
      )}

      {error && (
        <div className="bg-pastel-rose border border-rose-200 rounded-lg px-3 py-2 text-xs text-rose-900">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {data?.slots.map((slot) => {
          const busy = uploadingCategory === slot.category;
          const doc = slot.document;
          const statusIcon =
            slot.status === 'VERIFIED' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : slot.status === 'REJECTED' ? (
              <XCircle className="w-4 h-4 text-rose-600" />
            ) : slot.status === 'UNDER_REVIEW' ? (
              <Clock className="w-4 h-4 text-amber-600" />
            ) : null;

          return (
            <DetailSection
              key={slot.category}
              title={`${DOCUMENT_SLOT_ICONS[slot.category] ?? '📎'} ${slot.label}${slot.required ? ' *' : ''}`}
              theme={
                slot.status === 'VERIFIED'
                  ? 'mint'
                  : slot.status === 'REJECTED'
                    ? 'rose'
                    : slot.status === 'UPLOADED' || slot.status === 'UNDER_REVIEW'
                      ? 'sand'
                      : 'blue'
              }
            >
              <p className={cn(pt.meta, 'mb-2')}>{slot.description}</p>

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md',
                    DOCUMENT_STATUS_COLORS[slot.status] ?? DOCUMENT_STATUS_COLORS.NOT_UPLOADED,
                  )}
                >
                  {statusIcon}
                  {DOCUMENT_STATUS_LABELS[slot.status] ?? slot.status}
                </span>
                {doc && (
                  <span className="text-xs text-text-muted">
                    v{doc.version} · {formatDate(doc.updatedAt)}
                  </span>
                )}
                {slot.historyCount > 1 && (
                  <span className={cn(pt.chip, 'bg-pastel-lilac text-violet-800')}>
                    {slot.historyCount} versions
                  </span>
                )}
              </div>

              {doc?.rejectedReason && (
                <p className="text-xs text-rose-800 bg-pastel-rose/80 border border-rose-200 rounded-md px-2 py-1.5 mb-2">
                  <span className="font-semibold">Rejection reason: </span>
                  {doc.rejectedReason}
                </p>
              )}

              {doc && (
                <div className="flex items-center justify-between gap-2 mb-2 text-xs bg-pastel-blue/40 rounded-md px-2 py-1.5">
                  <span className="font-medium text-text-primary truncate">{doc.fileName}</span>
                  <button
                    type="button"
                    onClick={() => openPreview(doc.id, doc.fileName)}
                    className="inline-flex items-center gap-1 text-brand-700 font-semibold shrink-0 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              )}

              <input
                ref={(el) => {
                  fileRefs.current[slot.category] = el;
                }}
                type="file"
                accept={slot.accept}
                className="hidden"
                onChange={(e) => {
                  handleFile(slot.category, e.target.files?.[0], doc?.id);
                  e.target.value = '';
                }}
              />

              <button
                type="button"
                disabled={busy}
                onClick={() => fileRefs.current[slot.category]?.click()}
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                  busy
                    ? 'bg-surface-card2 text-text-muted cursor-wait'
                    : 'bg-brand-500 text-white hover:bg-brand-600',
                )}
              >
                {busy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {doc ? 'Upload new version' : 'Upload document'}
              </button>
            </DetailSection>
          );
        })}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border">
              <span className="text-sm font-medium text-text-primary truncate">{preview.fileName}</span>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                Close
              </button>
            </div>
            <iframe title={preview.fileName} src={preview.url} className="flex-1 min-h-[60vh] w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
