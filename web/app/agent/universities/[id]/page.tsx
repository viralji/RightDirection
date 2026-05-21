'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { universities } from '@/lib/api';
import { ArrowLeft, Globe, TrendingUp, DollarSign, Users, Calendar, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';

function Badge({ label, color = 'default' }: { label: string; color?: 'success' | 'brand' | 'default' }) {
  const cls = {
    success: 'bg-status-success/20 text-status-success',
    brand: 'bg-brand-500/20 text-brand-400',
    default: 'bg-surface-card2 text-text-muted',
  }[color];
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>;
}

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: uni, isLoading } = useQuery({
    queryKey: ['university', id],
    queryFn: () => universities.findOne(id),
  });

  if (isLoading) return <div className="text-text-muted p-6">Loading...</div>;
  if (!uni) return <div className="text-status-error p-6">University not found</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/agent/universities" className="text-text-muted hover:text-text-primary mt-1"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary">{uni.name}</h1>
            {uni.isPartner && <Badge label="Partner" color="success" />}
            {uni.type && <Badge label={uni.type.replace('_', ' ')} />}
            {uni.campusType && <Badge label={uni.campusType} />}
          </div>
          <p className="text-text-muted text-sm mt-0.5">
            {uni.city}{uni.stateProvince ? `, ${uni.stateProvince}` : ''}, {uni.country}
            {uni.foundedYear && <span className="ml-2 text-text-muted">· Est. {uni.foundedYear}</span>}
          </p>
          {uni.overview && <p className="text-text-secondary text-sm mt-2 max-w-2xl">{uni.overview}</p>}
        </div>
        {uni.website && (
          <a href={uni.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-surface-border rounded-lg text-text-secondary hover:text-text-primary transition-colors">
            <Globe className="w-3.5 h-3.5" /> Website
          </a>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Commission', value: `${uni.defaultCommissionPct}%`, icon: DollarSign, color: 'text-status-success' },
          { label: 'Visa Success', value: uni.visaSuccessRate ? `${(uni.visaSuccessRate * 100).toFixed(0)}%` : 'N/A', icon: TrendingUp, color: 'text-brand-400' },
          { label: 'QS World Rank', value: uni.qsWorldRank ? `#${uni.qsWorldRank}` : 'N/A', icon: Award, color: 'text-text-secondary' },
          { label: 'Active Courses', value: uni.courses?.length ?? 0, icon: BookOpen, color: 'text-text-secondary' },
        ].map(s => (
          <div key={s.label} className="bg-surface-card border border-surface-border rounded-xl p-4">
            <p className="text-text-muted text-xs">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Profile & Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Rankings */}
        {(uni.qsWorldRank || uni.timesHigherRank || uni.shanghaiRank || uni.nirf) && (
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-3">Rankings</h3>
            <div className="space-y-2 text-sm">
              {uni.qsWorldRank && <div className="flex justify-between"><span className="text-text-muted">QS World</span><span className="text-text-primary font-medium">#{uni.qsWorldRank}</span></div>}
              {uni.timesHigherRank && <div className="flex justify-between"><span className="text-text-muted">Times Higher</span><span className="text-text-primary font-medium">#{uni.timesHigherRank}</span></div>}
              {uni.shanghaiRank && <div className="flex justify-between"><span className="text-text-muted">Shanghai</span><span className="text-text-primary font-medium">#{uni.shanghaiRank}</span></div>}
              {uni.nirf && <div className="flex justify-between"><span className="text-text-muted">NIRF</span><span className="text-text-primary font-medium">#{uni.nirf}</span></div>}
            </div>
          </div>
        )}

        {/* Student Profile */}
        {(uni.totalStudents || uni.internationalStudentPct != null) && (
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Student Profile</h3>
            <div className="space-y-2 text-sm">
              {uni.totalStudents && <div className="flex justify-between"><span className="text-text-muted">Total Students</span><span className="text-text-primary font-medium">{uni.totalStudents.toLocaleString()}</span></div>}
              {uni.internationalStudentPct != null && <div className="flex justify-between"><span className="text-text-muted">International</span><span className="text-text-primary font-medium">{(uni.internationalStudentPct * 100).toFixed(0)}%</span></div>}
              {uni.avgPostStudySalaryUsd && <div className="flex justify-between"><span className="text-text-muted">Avg Post-Study Salary</span><span className="text-text-primary font-medium">${uni.avgPostStudySalaryUsd.toLocaleString()}/yr</span></div>}
            </div>
          </div>
        )}

        {/* Financials & Living */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="font-semibold text-text-primary text-sm mb-3">Costs & Living</h3>
          <div className="space-y-2 text-sm">
            {uni.applicationFeeUsd != null && <div className="flex justify-between"><span className="text-text-muted">Application Fee</span><span className="text-text-primary font-medium">${Number(uni.applicationFeeUsd).toLocaleString()}</span></div>}
            {uni.livingCostAnnualUsd && <div className="flex justify-between"><span className="text-text-muted">Annual Living Cost</span><span className="text-text-primary font-medium">${uni.livingCostAnnualUsd.toLocaleString()}</span></div>}
            {uni.dormAvailable && <div className="flex justify-between"><span className="text-text-muted">On-Campus Dorm</span><span className="text-status-success font-medium">{uni.dormCostAnnualUsd ? `$${uni.dormCostAnnualUsd.toLocaleString()}/yr` : 'Available'}</span></div>}
            {!uni.dormAvailable && <div className="flex justify-between"><span className="text-text-muted">On-Campus Dorm</span><span className="text-text-muted">Not available</span></div>}
          </div>
        </div>

        {/* Post-Study Work & Visa */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <h3 className="font-semibold text-text-primary text-sm mb-3">Post-Study & Visa</h3>
          <div className="space-y-2 text-sm">
            {uni.postStudyWorkYears != null
              ? <div className="flex justify-between"><span className="text-text-muted">Post-Study Work</span><span className="text-status-success font-medium">{uni.postStudyWorkYears} years</span></div>
              : <div className="flex justify-between"><span className="text-text-muted">Post-Study Work</span><span className="text-text-muted">—</span></div>}
            {uni.visaSuccessRate != null && <div className="flex justify-between"><span className="text-text-muted">Visa Success Rate</span><span className="text-text-primary font-medium">{(uni.visaSuccessRate * 100).toFixed(0)}%</span></div>}
            {uni.scholarshipAvailable && (
              <div>
                <div className="flex justify-between"><span className="text-text-muted">Scholarships</span><span className="text-status-success font-medium">Available</span></div>
                {uni.scholarshipInfo && <p className="text-text-muted text-xs mt-1">{uni.scholarshipInfo}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Accreditations */}
        {uni.accreditations?.length > 0 && (
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-3">Accreditations</h3>
            <div className="flex flex-wrap gap-2">
              {uni.accreditations.map((a: string) => <Badge key={a} label={a} color="brand" />)}
            </div>
          </div>
        )}

        {/* Contact */}
        {(uni.contactName || uni.contactEmail) && (
          <div className="bg-surface-card border border-surface-border rounded-xl p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-3">University Contact</h3>
            <div className="space-y-1.5 text-sm">
              {uni.contactName && <div><span className="text-text-muted">Name: </span><span className="text-text-primary">{uni.contactName}</span></div>}
              {uni.contactEmail && <div><span className="text-text-muted">Email: </span><a href={`mailto:${uni.contactEmail}`} className="text-brand-400 hover:underline">{uni.contactEmail}</a></div>}
              {uni.contactPhone && <div><span className="text-text-muted">Phone: </span><span className="text-text-primary">{uni.contactPhone}</span></div>}
            </div>
          </div>
        )}
      </div>

      {/* Courses Table */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-semibold text-text-primary">Available Courses ({uni.courses?.length ?? 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-4 py-3 text-text-muted font-medium">Course</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Level</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Duration</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Intakes</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Tuition/yr</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Min IELTS</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Duolingo</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Scholarship</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Co-op</th>
                <th className="text-left px-4 py-3 text-text-muted font-medium">Commission</th>
              </tr>
            </thead>
            <tbody>
              {uni.courses?.map((course: any) => (
                <tr key={course.id} className="border-b border-surface-border/50 hover:bg-surface-card2/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{course.name}</p>
                    {course.field && <p className="text-text-muted text-xs">{course.field}</p>}
                    {course.specializations?.length > 0 && (
                      <p className="text-brand-400 text-xs">{course.specializations.join(' · ')}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary capitalize">{course.level.toLowerCase()}</td>
                  <td className="px-4 py-3 text-text-secondary">{course.durationMonths}mo</td>
                  <td className="px-4 py-3 text-text-secondary">{course.intakes?.join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-text-primary font-medium">${Number(course.tuitionFeeUsd).toLocaleString()}</td>
                  <td className="px-4 py-3 text-text-secondary">{course.minIelts ?? '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{course.minDuolingo ?? '—'}</td>
                  <td className="px-4 py-3">
                    {course.scholarshipAvailable
                      ? <span className="text-status-success text-xs">
                          Yes{course.scholarshipAmountUsd ? ` ($${Number(course.scholarshipAmountUsd).toLocaleString()})` : ''}
                        </span>
                      : <span className="text-text-muted text-xs">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    {course.coopAvailable ? <span className="text-brand-400 text-xs">Yes</span> : <span className="text-text-muted text-xs">No</span>}
                  </td>
                  <td className="px-4 py-3 text-status-success">{course.commissionPct != null ? `${course.commissionPct}%` : `${uni.defaultCommissionPct}%`}</td>
                </tr>
              ))}
              {!uni.courses?.length && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-text-muted">No courses listed for this university yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
