'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documents as documentsApi } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: 'Academic',
  TEST_SCORES: 'Test Scores',
  IDENTITY: 'Identity',
  FINANCIAL: 'Financial',
  APPLICATION: 'Application',
  VISA: 'Visa',
  KYC: 'KYC',
  OTHER: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  NOT_UPLOADED: 'bg-surface-card2 text-text-muted border border-surface-border',
  UPLOADED: 'bg-status-info-bg text-status-info border border-blue-100',
  UNDER_REVIEW: 'bg-status-warning-bg text-status-warning border border-amber-100',
  VERIFIED: 'bg-status-success-bg text-status-success border border-green-100',
  REJECTED: 'bg-status-error-bg text-status-error border border-red-100',
};

const DOC_ICONS: Record<string, string> = {
  ACADEMIC: '📄',
  TEST_SCORES: '📝',
  IDENTITY: '🛂',
  FINANCIAL: '🏦',
  APPLICATION: '📋',
  VISA: '✈️',
  KYC: '📁',
  OTHER: '📎',
};

export default function DocumentsPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [drawerDoc, setDrawerDoc] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documents', category, search],
    queryFn: () =>
      documentsApi.list({
        ...(category ? { category } : {}),
        ...(search ? { search } : {}),
      }),
  });

  const openDocument = async (doc: any) => {
    setDrawerDoc(doc);
    setPdfUrl(null);
    setPdfError(null);
    setPdfLoading(true);
    try {
      const urlData = await documentsApi.download(doc.id);
      if (!urlData?.url) {
        setPdfError('Download URL not available');
        return;
      }
      setPdfUrl(urlData.url);
    } catch (e: any) {
      setPdfError(e.message || 'Failed to load document');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Documents</h1>
        <p className="text-text-muted text-sm mt-1">
          {docs.length} student document{docs.length === 1 ? '' : 's'} in your agency
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by student name or file..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-200 w-64"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-white border border-surface-border rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-surface-border rounded-xl overflow-hidden shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-card2/50">
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
              <tr key={doc.id} className="border-b border-surface-border/50 hover:bg-pastel-blue/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{DOC_ICONS[doc.category] ?? '📎'}</span>
                    <span className="text-text-primary font-medium truncate max-w-40">
                      {doc.fileName ?? 'Document'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {doc.user?.name ?? doc.student?.user?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-text-secondary">
                  {CATEGORY_LABELS[doc.category] ?? doc.category}
                </td>
                <td className="px-4 py-3 text-text-muted">v{doc.version ?? 1}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', STATUS_COLORS[doc.status] || 'bg-surface-card2 text-text-muted')}>
                    {doc.status}
                  </span>
                  {doc.fraudScore != null && doc.fraudScore > 0.6 && (
                    <span className="ml-1 text-xs text-status-error">⚠ {Math.round(doc.fraudScore * 100)}%</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-muted">{formatDate(doc.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openDocument(doc)}
                    className="text-xs bg-brand-50 text-brand-700 border border-brand-100 px-2 py-1 rounded hover:bg-brand-100 transition-colors"
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

      {drawerDoc && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => { setDrawerDoc(null); setPdfUrl(null); setPdfError(null); }}
          />
          <div className="w-full max-w-2xl bg-white border-l border-surface-border flex flex-col shadow-soft">
            <div className="flex items-center justify-between p-4 border-b border-surface-border">
              <div>
                <p className="text-text-primary font-semibold">
                  {DOC_ICONS[drawerDoc.category] ?? '📎'} {drawerDoc.fileName ?? 'Document'}
                </p>
                <p className="text-text-muted text-xs mt-0.5">
                  {CATEGORY_LABELS[drawerDoc.category]} · v{drawerDoc.version ?? 1} · {formatDate(drawerDoc.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setDrawerDoc(null); setPdfUrl(null); setPdfError(null); }}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-surface-border grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-text-muted">Student</p>
                <p className="text-text-primary font-medium">
                  {drawerDoc.user?.name ?? drawerDoc.student?.user?.name ?? '—'}
                </p>
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

            <div className="flex-1 overflow-hidden p-4 min-h-[320px]">
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
                      download={drawerDoc.fileName}
                      className="text-xs bg-white text-text-secondary border border-surface-border px-3 py-1.5 rounded-lg hover:text-text-primary"
                    >
                      Download
                    </a>
                  </div>
                  <iframe
                    src={pdfUrl}
                    className="flex-1 w-full rounded-lg border border-surface-border bg-white min-h-[400px]"
                    title="Document viewer"
                  />
                </div>
              )}
              {!pdfUrl && !pdfLoading && (
                <div className="flex items-center justify-center h-full text-text-muted text-sm text-center px-4">
                  {pdfError ?? 'Could not load document preview.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
