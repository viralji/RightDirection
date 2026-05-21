'use client';

import { useQuery } from '@tanstack/react-query';
import { students, applications, agent } from '@/lib/api';
import { Users, FileText, TrendingUp, CheckCircle2, Clock, AlertTriangle, XCircle, Upload, ArrowRight } from 'lucide-react';
import { APPLICATION_STAGE_LABELS, STAGE_COLORS, cn } from '@/lib/utils';
import Link from 'next/link';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-muted text-sm">{label}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        </div>
        <div className={cn('p-3 rounded-lg', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ─── KYC Status Banner ────────────────────────────────────────────────────────

const KYC_STEPS = [
  { key: 'PENDING', label: 'Register', icon: CheckCircle2 },
  { key: 'DOCS', label: 'Submit KYC Docs', icon: Upload },
  { key: 'UNDER_REVIEW', label: 'Under Review', icon: Clock },
  { key: 'APPROVED', label: 'Active & Verified', icon: CheckCircle2 },
];

function kycStep(kycStatus: string): number {
  if (kycStatus === 'APPROVED') return 3;
  if (kycStatus === 'UNDER_REVIEW') return 2;
  if (kycStatus === 'RE_UPLOAD_REQUIRED' || kycStatus === 'REJECTED') return 1;
  return 1; // PENDING = need to submit docs
}

function KycBanner({ profile }: { profile: any }) {
  const status: string = profile?.kycStatus ?? 'PENDING';

  if (status === 'APPROVED') return null; // no banner when approved

  const step = kycStep(status);
  const isRejected = status === 'REJECTED';
  const isReUpload = status === 'RE_UPLOAD_REQUIRED';

  const bannerBg = isRejected || isReUpload
    ? 'bg-status-error/10 border-status-error/30'
    : status === 'UNDER_REVIEW'
    ? 'bg-amber-500/10 border-amber-500/30'
    : 'bg-brand-500/10 border-brand-500/30';

  const messages: Record<string, { icon: any; title: string; subtitle: string; cta?: string; ctaHref?: string }> = {
    PENDING: {
      icon: Upload,
      title: 'Complete your KYC to start accepting students',
      subtitle: 'Submit your business documents (GST, PAN, registration) to get verified and unlock the full platform.',
      cta: 'Submit KYC Documents',
      ctaHref: '/agent/settings',
    },
    UNDER_REVIEW: {
      icon: Clock,
      title: 'Your KYC is under review',
      subtitle: 'Our team is reviewing your submitted documents. This usually takes 1–2 business days.',
    },
    RE_UPLOAD_REQUIRED: {
      icon: AlertTriangle,
      title: 'Action required — re-upload KYC documents',
      subtitle: profile?.kycRejectedReason ?? 'Please re-upload your documents with corrections.',
      cta: 'Re-upload Documents',
      ctaHref: '/agent/settings',
    },
    REJECTED: {
      icon: XCircle,
      title: 'KYC verification was rejected',
      subtitle: profile?.kycRejectedReason ?? 'Your KYC could not be verified. Please contact support.',
      cta: 'Contact Support',
      ctaHref: 'mailto:support@rightdirection.com',
    },
  };

  const msg = messages[status] ?? messages.PENDING;
  const MsgIcon = msg.icon;

  return (
    <div className={cn('border rounded-xl p-5', bannerBg)}>
      <div className="flex items-start gap-4">
        <div className={cn('p-2 rounded-lg flex-shrink-0',
          isRejected || isReUpload ? 'bg-status-error/20 text-status-error' :
          status === 'UNDER_REVIEW' ? 'bg-amber-500/20 text-amber-400' :
          'bg-brand-500/20 text-brand-400')}>
          <MsgIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary text-sm">{msg.title}</p>
          <p className="text-text-muted text-sm mt-0.5">{msg.subtitle}</p>

          {/* Stepper */}
          <div className="flex items-center gap-0 mt-4">
            {KYC_STEPS.map((s, idx) => {
              const isPast = idx < step;
              const isCurrent = idx === step;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold',
                      isPast ? 'bg-status-success border-status-success text-white' :
                      isCurrent && (isRejected || isReUpload) ? 'bg-status-error border-status-error text-white' :
                      isCurrent ? 'bg-brand-500 border-brand-500 text-white' :
                      'bg-surface-card2 border-surface-border text-text-muted'
                    )}>
                      {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <p className={cn('text-xs mt-1 whitespace-nowrap',
                      isPast ? 'text-status-success' :
                      isCurrent ? 'text-text-primary font-medium' : 'text-text-muted'
                    )}>{s.label}</p>
                  </div>
                  {idx < KYC_STEPS.length - 1 && (
                    <div className={cn('h-0.5 flex-1 mx-1 -mt-4', isPast ? 'bg-status-success' : 'bg-surface-border')} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {msg.cta && msg.ctaHref && (
          <Link
            href={msg.ctaHref}
            className={cn(
              'flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isRejected || isReUpload
                ? 'bg-status-error text-white hover:bg-red-600'
                : 'bg-brand-500 text-white hover:bg-brand-600'
            )}
          >
            {msg.cta} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: studentData } = useQuery({ queryKey: ['students'], queryFn: () => students.list() });
  const { data: kanbanData } = useQuery({ queryKey: ['applications-kanban'], queryFn: () => applications.kanban() });
  const { data: profile } = useQuery({ queryKey: ['agent-profile'], queryFn: () => agent.profile() });

  const totalStudents = studentData?.meta?.total ?? 0;
  const enrolled = kanbanData?.ENROLLED?.length ?? 0;
  const active = Object.entries(kanbanData ?? {})
    .filter(([stage]) => !['ENROLLED', 'REJECTED', 'WITHDRAWN'].includes(stage))
    .reduce((sum, [, apps]) => sum + (apps as any[]).length, 0);
  const totalApps = Object.values(kanbanData ?? {}).reduce((sum, apps) => sum + (apps as any[]).length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Overview of your agency</p>
      </div>

      {/* KYC Banner — only shown when not approved */}
      {profile && <KycBanner profile={profile} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={totalStudents} icon={Users} color="bg-brand-500/20 text-brand-400" />
        <StatCard label="Active Applications" value={active} icon={FileText} color="bg-status-info/20 text-status-info" />
        <StatCard label="Total Applications" value={totalApps} icon={TrendingUp} color="bg-amber-500/20 text-amber-400" />
        <StatCard label="Enrolled" value={enrolled} icon={CheckCircle2} color="bg-status-success/20 text-status-success" />
      </div>

      {/* Application Funnel */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5">
        <h2 className="text-text-primary font-semibold mb-4">Application Pipeline</h2>
        <div className="space-y-2">
          {kanbanData && Object.entries(kanbanData).map(([stage, apps]) => {
            const count = (apps as any[]).length;
            const pct = totalApps > 0 ? (count / totalApps) * 100 : 0;
            return (
              <div key={stage} className="flex items-center gap-3">
                <span className={cn('text-xs px-2 py-0.5 rounded-full w-36 text-center', STAGE_COLORS[stage])}>
                  {APPLICATION_STAGE_LABELS[stage]}
                </span>
                <div className="flex-1 bg-surface-card2 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-text-muted text-xs w-6 text-right">{count}</span>
              </div>
            );
          })}
          {(!kanbanData || Object.keys(kanbanData).length === 0) && (
            <p className="text-text-muted text-sm text-center py-4">No applications yet. Add your first student to begin.</p>
          )}
        </div>
      </div>
    </div>
  );
}
