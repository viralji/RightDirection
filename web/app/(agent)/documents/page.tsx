'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';

async function fetchDocuments(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/v1/documents?${qs}`, { credentials: 'include' });
  return (await res.json()).data;
}

async function getDownloadUrl(id: string) {
  const res = await fetch(`/api/v1/documents/${id}/download-url`, { credentials: 'include' });
  return (await res.json()).data;
}

const CATEGORY_LABELS: Record<string, string> = {
  PASSPORT: 'Passport',
  ACADEMIC_TRANSCRIPT: 'Academic Transcript',
  ENGLISH_TEST: 'English Test',
  BANK_STATEMENT: 'Bank Statement',
  OFFER_LETTER: 'Offer Letter',
  VISA: 'Visa',
  PHOTO: 'Photo',
  OTHER: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-status-warning/20 text-status-warning',
  VERIFIED: 'bg-status-success/20 text-status-success',
  REJECTED: 'bg-status-error/20 text-status-error',
  FLAGGED: 'bg-orange-500/20 text-orange-400',
};

const DOC_ICONS: Record<string, string> = {
  PASSPORT: '🛂',
  ACADEMIC_TRANSCRIPT: '📄',
  ENGLISH_TEST: '📝',
  BANK_STATEMENT: '🏦',
  OFFER_LETTER: '🏫',
  VISA: '✈️',
  PHOTO: '📷',
  OTHER: '📎',
};

export default function DocumentsPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [drawerDoc, setDrawerDoc] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', category, search],
    queryFn: () => fetchDocuments({
      ...(category ? { category } : {}),
      ...(search ? { search } : {}),
    }),
  });

  const docs = data?.items ?? data ?? [];

  const openDocument = async (doc: any) => {
    setDrawerDoc(doc);
    setPdfUrl(null);
    setPdfLoading(true);
    try {
      const urlData = await getDownloadUrl(doc.id);
      setPdfUrl(urlData.url);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Documents</h1>
        <p className="text-text-muted text-sm mt-1">All student documents across applications</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-500 w-64"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-brand-500"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Documents table */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="text-left px-4 py-3 text-text-muted font-medium">Document</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Student</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Category</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Version</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Uploaded</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">Loading...</td>
              </tr>
            )}
            {docs.map((doc: any) => (
              <tr key={doc.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{DOC_ICONS[doc.category] ?? '📎'}</span>
                    <span className="text-text-primary font-medium truncate max-w-40">
                      {doc.originalName ?? doc.filename ?? 'Document'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">{doc.student?.user?.name ?? '—'}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {CATEGORY_LABELS[doc.category] ?? doc.category}
                </td>
                <td className="px-4 py-3 text-text-muted">v{doc.version ?? 1}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', STATUS_COLORS[doc.status] || 'bg-surface-card2 text-text-muted')}>
                    {doc.status}
                  </span>
                  {doc.fraudScore != null && doc.fraudScore > 0.6 && (
                    <span className="ml-1 text-xs text-status-error">⚠️ {Math.round(doc.fraudScore * 100)}%</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDate(doc.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openDocument(doc)}
                    className="text-xs bg-brand-500/20 text-brand-400 px-2 py-1 rounded hover:bg-brand-500/30 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && docs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">No documents found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Document Drawer */}
      {drawerDoc && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60"
            onClick={() => { setDrawerDoc(null); setPdfUrl(null); }}
          />
          {/* Drawer */}
          <div className="w-full max-w-2xl bg-surface-card border-l border-surface-border flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-border">
              <div>
                <p className="text-text-primary font-semibold">
                  {DOC_ICONS[drawerDoc.category] ?? '📎'} {drawerDoc.originalName ?? 'Document'}
                </p>
                <p className="text-text-muted text-xs mt-0.5">
                  {CATEGORY_LABELS[drawerDoc.category]} · v{drawerDoc.version ?? 1} · {formatDate(drawerDoc.createdAt)}
                </p>
              </div>
              <button
                onClick={() => { setDrawerDoc(null); setPdfUrl(null); }}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            {/* Meta info */}
            <div className="p-4 border-b border-surface-border grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-text-muted">Student</p>
                <p className="text-text-primary font-medium">{drawerDoc.student?.user?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-text-muted">Status</p>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', STATUS_COLORS[drawerDoc.status] || '')}>
                  {drawerDoc.status}
                </span>
              </div>
              <div>
                <p className="text-text-muted">Fraud Score</p>
                <p className={cn('font-medium', (drawerDoc.fraudScore ?? 0) > 0.6 ? 'text-status-error' : 'text-status-success')}>
                  {drawerDoc.fraudScore != null ? `${Math.round(drawerDoc.fraudScore * 100)}%` : 'Not checked'}
                </p>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden p-4">
              {pdfLoading && (
                <div className="flex items-center justify-center h-full text-text-muted">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p>Loading document...</p>
                  </div>
                </div>
              )}
              {pdfUrl && !pdfLoading && (
                <div className="h-full flex flex-col gap-3">
                  <div className="flex gap-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-brand-500 text-white px-3 py-1.5 rounded-lg hover:bg-brand-600"
                    >
                      Open in New Tab
                    </a>
                    <a
                      href={pdfUrl}
                      download
                      className="text-xs bg-surface-card2 text-text-secondary border border-surface-border px-3 py-1.5 rounded-lg hover:text-text-primary"
                    >
                      Download
                    </a>
                  </div>
                  <iframe
                    src={pdfUrl}
                    className="flex-1 w-full rounded-lg border border-surface-border bg-white"
                    title="Document viewer"
                  />
                </div>
              )}
              {!pdfUrl && !pdfLoading && (
                <div className="flex items-center justify-center h-full text-text-muted">
                  Could not load document preview.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
