'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, X, CheckCircle2, Clock, AlertCircle, XCircle, FileText, TrendingUp, Users, DollarSign, RefreshCw } from 'lucide-react';

// ─── API ─────────────────────────────────────────────────────────────────────

const apiFetch = (path: string, opts?: RequestInit) =>
  fetch(`/api/v1${path}`, { credentials: 'include', ...opts }).then(r => r.json());

// ─── KYC Lifecycle ───────────────────────────────────────────────────────────

const KYC_STAGES = [
  { key: 'REGISTERED', label: 'Registered', icon: CheckCircle2, desc: 'Account created on platform' },
  { key: 'DOCS_PENDING', label: 'Docs Pending', icon: FileText, desc: 'KYC documents not yet submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review', icon: Clock, desc: 'Documents submitted, awaiting admin review' },
  { key: 'APPROVED', label: 'Approved', icon: CheckCircle2, desc: 'KYC verified, fully active' },
];

const KYC_COLORS: Record<string, string> = {
  PENDING: 'bg-surface-card2 text-text-muted',
  UNDER_REVIEW: 'bg-amber-500/20 text-amber-400',
  APPROVED: 'bg-status-success/20 text-status-success',
  REJECTED: 'bg-status-error/20 text-status-error',
  RE_UPLOAD_REQUIRED: 'bg-orange-500/20 text-orange-400',
};

function kycStageIndex(kycStatus: string, docsCount: number): number {
  if (kycStatus === 'APPROVED') return 3;
  if (kycStatus === 'UNDER_REVIEW') return 2;
  if (docsCount > 0 || kycStatus === 'REJECTED' || kycStatus === 'RE_UPLOAD_REQUIRED') return 1;
  return 0; // just registered
}

// ─── Rejection Modal ─────────────────────────────────────────────────────────

function RejectModal({ agent, onClose, onConfirm }: { agent: any; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Reject KYC — {agent.businessName}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-text-muted" /></button>
        </div>
        <p className="text-sm text-text-muted mb-3">Provide a reason so the agent knows what to fix:</p>
        <textarea
          className="w-full bg-surface-bg border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500 resize-none"
          rows={4}
          placeholder="e.g. PAN card image is blurry, GST certificate missing..."
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-surface-border rounded-lg text-text-secondary">Cancel</button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-sm bg-status-error hover:bg-red-600 text-white rounded-lg disabled:opacity-50"
          >
            Reject KYC
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Change Modal ────────────────────────────────────────────────────────

function PlanModal({ agent, onClose, onSave }: { agent: any; onClose: () => void; onSave: (plan: string) => void }) {
  const [plan, setPlan] = useState(agent.tenant?.subscriptionPlan ?? 'TRIAL');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary">Change Plan — {agent.businessName}</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-text-muted" /></button>
        </div>
        <select
          className="w-full bg-surface-bg border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary mb-4"
          value={plan}
          onChange={e => setPlan(e.target.value)}
        >
          {['TRIAL', 'STARTER', 'PRO', 'ENTERPRISE'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-surface-border rounded-lg text-text-secondary">Cancel</button>
          <button onClick={() => onSave(plan)} className="px-4 py-2 text-sm bg-brand-500 hover:bg-brand-600 text-white rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Agent Detail Row ─────────────────────────────────────────────────────────

function AgentRow({ a, onReject, onPlan, onApprove, onSuspend }: {
  a: any;
  onReject: (a: any) => void;
  onPlan: (a: any) => void;
  onApprove: (a: any) => void;
  onSuspend: (a: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: detail } = useQuery({
    queryKey: ['agent-detail', a.id],
    queryFn: () => apiFetch(`/admin/agents/${a.id}/detail`).then(r => r.data),
    enabled: expanded,
  });

  const docsCount = detail?.kycDocuments?.length ?? 0;
  const stageIdx = kycStageIndex(a.kycStatus, docsCount);
  const totalApps = detail ? Object.values(detail.appStats ?? {}).reduce((s: number, n: any) => s + n, 0) : 0;
  const enrolled = detail?.appStats?.ENROLLED ?? 0;

  return (
    <>
      <tr
        className="border-b border-surface-border/50 hover:bg-surface-card2/30 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <td className="px-3 py-2 w-8">
          {expanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
        </td>
        <td className="px-4 py-3">
          <p className="font-medium text-text-primary">{a.businessName}</p>
          <p className="text-text-muted text-xs">{a.tenant?.email}</p>
        </td>
        <td className="px-4 py-3 text-text-secondary text-sm">{a.tenant?.subdomain}</td>
        <td className="px-4 py-3 text-text-secondary text-sm">{a.city}{a.state ? `, ${a.state}` : ''}</td>
        <td className="px-4 py-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 font-medium capitalize">
            {a.tenant?.subscriptionPlan?.toLowerCase() ?? '—'}
          </span>
        </td>
        <td className="px-4 py-3 text-text-secondary text-sm">{a._count?.students ?? 0}</td>
        <td className="px-4 py-3">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', KYC_COLORS[a.kycStatus] ?? '')}>
            {a.kycStatus?.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="px-4 py-3 text-text-muted text-xs">{formatDate(a.createdAt)}</td>
        <td className="px-4 py-3">
          <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
            {a.kycStatus === 'UNDER_REVIEW' && (
              <>
                <button onClick={() => onApprove(a)}
                  className="text-xs bg-status-success/20 text-status-success px-2 py-0.5 rounded hover:bg-status-success/30">Approve</button>
                <button onClick={() => onReject(a)}
                  className="text-xs bg-status-error/20 text-status-error px-2 py-0.5 rounded hover:bg-status-error/30">Reject</button>
              </>
            )}
            {a.kycStatus === 'APPROVED' && a.tenant?.status !== 'SUSPENDED' && (
              <button onClick={() => onSuspend(a)}
                className="text-xs bg-surface-card2 text-text-muted px-2 py-0.5 rounded hover:bg-surface-card2/80">Suspend</button>
            )}
            <button onClick={() => onPlan(a)}
              className="text-xs border border-surface-border text-text-secondary px-2 py-0.5 rounded hover:bg-surface-card2">Plan</button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-pastel-blue/15">
          <td colSpan={9} className="px-4 py-3">
            <div className="space-y-5">

              {/* ── KYC Lifecycle Stepper ─────────────────────────── */}
              <div>
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">KYC Lifecycle</h4>
                <div className="flex items-start gap-0">
                  {KYC_STAGES.map((stage, idx) => {
                    const isPast = idx < stageIdx;
                    const isCurrent = idx === stageIdx;
                    const isRejected = a.kycStatus === 'REJECTED' && idx === 1;
                    return (
                      <div key={stage.key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0',
                            isPast ? 'bg-status-success border-status-success' :
                            isCurrent && isRejected ? 'bg-status-error border-status-error' :
                            isCurrent ? 'bg-brand-500 border-brand-500' :
                            'bg-surface-card2 border-surface-border'
                          )}>
                            {isPast ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                             isCurrent && isRejected ? <XCircle className="w-4 h-4 text-white" /> :
                             isCurrent ? <stage.icon className="w-4 h-4 text-white" /> :
                             <div className="w-2 h-2 rounded-full bg-surface-border" />}
                          </div>
                          <p className={cn('text-xs font-medium mt-1.5 text-center',
                            isPast ? 'text-status-success' :
                            isCurrent ? 'text-text-primary' : 'text-text-muted'
                          )}>{stage.label}</p>
                          <p className="text-xs text-text-muted text-center leading-tight mt-0.5 max-w-24">{stage.desc}</p>
                          {isCurrent && a.kycRejectedReason && (
                            <p className="text-xs text-status-error mt-1 text-center max-w-28 leading-tight">"{a.kycRejectedReason}"</p>
                          )}
                        </div>
                        {idx < KYC_STAGES.length - 1 && (
                          <div className={cn('h-0.5 flex-1 mx-1 -mt-8', isPast ? 'bg-status-success' : 'bg-surface-border')} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {a.kycSubmittedAt && (
                  <p className="text-xs text-text-muted mt-2">Submitted: {formatDate(a.kycSubmittedAt)}{a.kycReviewedAt ? ` · Reviewed: ${formatDate(a.kycReviewedAt)}` : ''}</p>
                )}
              </div>

              {/* ── Two-column detail layout ─────────────────────── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Business Info */}
                <div className="bg-surface-card border border-surface-border rounded-xl p-4 col-span-2">
                  <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-3">Business Info</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {[
                      ['Subdomain', a.tenant?.subdomain],
                      ['City', `${a.city}${a.state ? `, ${a.state}` : ''}${a.pincode ? ` - ${a.pincode}` : ''}`],
                      ['GST No', a.gstNumber ?? '—'],
                      ['PAN No', a.panNumber ?? '—'],
                      ['Reg. No', a.registrationNo ?? '—'],
                      ['Website', a.websiteUrl ?? '—'],
                      ['Years in Biz', a.yearsInBusiness != null ? `${a.yearsInBusiness} yrs` : '—'],
                      ['Team Size', a.teamSize != null ? `${a.teamSize} staff` : '—'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span className="text-text-muted">{k}: </span>
                        <span className="text-text-secondary font-medium">{v}</span>
                      </div>
                    ))}
                    {detail?.specializations?.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-text-muted">Specializations: </span>
                        <span className="text-text-secondary font-medium">{detail.specializations.join(', ')}</span>
                      </div>
                    )}
                    {detail?.languages?.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-text-muted">Languages: </span>
                        <span className="text-text-secondary font-medium">{detail.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="bg-surface-card border border-surface-border rounded-xl p-4 col-span-2">
                  <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-3">Performance</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Students', value: a._count?.students ?? 0, icon: Users, color: 'text-brand-400' },
                      { label: 'Enrolled', value: enrolled, icon: CheckCircle2, color: 'text-status-success' },
                      { label: 'Total Applications', value: totalApps, icon: FileText, color: 'text-status-info' },
                      { label: 'Total Earned', value: detail ? `₹${Number(detail.commissionStats?.totalNet ?? 0).toLocaleString()}` : '—', icon: DollarSign, color: 'text-status-success' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-surface-card2">
                          <s.icon className={cn('w-3.5 h-3.5', s.color)} />
                        </div>
                        <div>
                          <p className="text-text-muted text-xs">{s.label}</p>
                          <p className="font-semibold text-text-primary text-sm">{s.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {detail?.appStats && Object.keys(detail.appStats).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-surface-border">
                      <p className="text-xs text-text-muted mb-2">Application Breakdown</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(detail.appStats).map(([stage, count]: any) => (
                          <span key={stage} className="text-xs px-1.5 py-0.5 rounded bg-surface-card2 text-text-secondary">
                            {stage.replace(/_/g, ' ')}: <span className="font-medium">{count}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* ── KYC Documents ────────────────────────────────── */}
              {detail?.kycDocuments?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">KYC Documents Submitted</h4>
                  <div className="flex flex-wrap gap-2">
                    {detail.kycDocuments.map((doc: any) => (
                      <div key={doc.id} className="flex items-center gap-1.5 text-xs bg-surface-card border border-surface-border rounded-lg px-3 py-1.5">
                        <FileText className="w-3.5 h-3.5 text-brand-400" />
                        <span className="text-text-secondary">{doc.fileName}</span>
                        <span className={cn('px-1 rounded text-xs', doc.status === 'VERIFIED' ? 'text-status-success' : 'text-text-muted')}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Admin Notes ──────────────────────────────────── */}
              {a.kycNotes && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
                  <p className="text-xs font-medium text-amber-400 mb-1">Admin Notes</p>
                  <p className="text-xs text-text-secondary">{a.kycNotes}</p>
                </div>
              )}

            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAgentsPage() {
  const qc = useQueryClient();
  const [kycFilter, setKycFilter] = useState('');
  const [search, setSearch] = useState('');
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [planTarget, setPlanTarget] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-agents', kycFilter],
    queryFn: () => apiFetch(`/admin/agents${kycFilter ? `?kycStatus=${kycFilter}` : ''}`).then(r => r),
  });

  const agents = (data?.data ?? []) as any[];
  const filtered = agents.filter(a =>
    !search || a.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    a.tenant?.subdomain?.toLowerCase().includes(search.toLowerCase()) ||
    a.city?.toLowerCase().includes(search.toLowerCase())
  );

  const kycMutation = useMutation({
    mutationFn: ({ tenantId, status, reason }: { tenantId: string; status: string; reason?: string }) =>
      apiFetch(`/admin/agents/${tenantId}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-agents'] });
      qc.invalidateQueries({ queryKey: ['agent-detail'] });
    },
  });

  const planMutation = useMutation({
    mutationFn: ({ tenantId, plan }: { tenantId: string; plan: string }) =>
      apiFetch(`/admin/agents/${tenantId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-agents'] }),
  });

  const suspendMutation = useMutation({
    mutationFn: (tenantId: string) =>
      apiFetch(`/admin/agents/${tenantId}/suspend`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-agents'] }),
  });

  // Summary counts
  const counts = {
    total: agents.length,
    pending: agents.filter(a => a.kycStatus === 'PENDING').length,
    review: agents.filter(a => a.kycStatus === 'UNDER_REVIEW').length,
    approved: agents.filter(a => a.kycStatus === 'APPROVED').length,
    rejected: agents.filter(a => a.kycStatus === 'REJECTED').length,
  };

  return (
    <div className="space-y-4">
      {rejectTarget && (
        <RejectModal
          agent={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={reason => {
            kycMutation.mutate({ tenantId: rejectTarget.tenantId, status: 'REJECTED', reason });
            setRejectTarget(null);
          }}
        />
      )}
      {planTarget && (
        <PlanModal
          agent={planTarget}
          onClose={() => setPlanTarget(null)}
          onSave={plan => {
            planMutation.mutate({ tenantId: planTarget.tenantId, plan });
            setPlanTarget(null);
          }}
        />
      )}

      <h1 className="text-base font-semibold text-text-primary">Agent Management</h1>

      {/* Summary Strip */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total', value: counts.total, color: 'text-text-primary' },
          { label: 'Pending Docs', value: counts.pending, color: 'text-text-muted' },
          { label: 'Under Review', value: counts.review, color: 'text-amber-400' },
          { label: 'Approved', value: counts.approved, color: 'text-status-success' },
          { label: 'Rejected', value: counts.rejected, color: 'text-status-error' },
        ].map(s => (
          <div key={s.label} className="bg-surface-card border border-surface-border rounded-xl p-4 text-center">
            <p className={cn('text-base font-semibold', s.color)}>{s.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 w-64"
          placeholder="Search agency, subdomain, city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1.5">
          {['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RE_UPLOAD_REQUIRED'].map(s => (
            <button key={s} onClick={() => setKycFilter(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                kycFilter === s
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'border-surface-border text-text-secondary hover:bg-surface-card')}>
              {s ? s.replace(/_/g, ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="w-8 px-4 py-3" />
              <th className="text-left px-4 py-3 text-text-muted font-medium">Agency</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Subdomain</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Location</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Plan</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Students</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">KYC</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Joined</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={9} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-text-muted">No agents found</td></tr>
            )}
            {filtered.map(a => (
              <AgentRow
                key={a.id}
                a={a}
                onApprove={a => kycMutation.mutate({ tenantId: a.tenantId, status: 'APPROVED' })}
                onReject={a => setRejectTarget(a)}
                onPlan={a => setPlanTarget(a)}
                onSuspend={a => suspendMutation.mutate(a.tenantId)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
