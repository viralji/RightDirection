'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Plus, X, Pencil } from 'lucide-react';

// ─── API helpers ─────────────────────────────────────────────────────────────

async function fetchAdminUniversities() {
  const res = await fetch('/api/v1/admin/universities', { credentials: 'include' });
  return res.json();
}

async function fetchCourses(universityId: string) {
  const res = await fetch(`/api/v1/universities/${universityId}/courses`, { credentials: 'include' });
  return res.json();
}

async function createUniversity(dto: any) {
  const res = await fetch('/api/v1/universities', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function createCourse(universityId: string, dto: any) {
  const res = await fetch(`/api/v1/universities/${universityId}/courses`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ─── Types ───────────────────────────────────────────────────────────────────

const COURSE_LEVELS = ['UNDERGRADUATE', 'POSTGRADUATE', 'DIPLOMA', 'PHD', 'CERTIFICATE'];
const CAMPUS_TYPES = ['URBAN', 'SUBURBAN', 'RURAL', 'ONLINE'];
const UNI_TYPES = ['PUBLIC', 'PRIVATE', 'PUBLIC_RESEARCH', 'PRIVATE_RESEARCH'];
const INTAKE_OPTIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label className="text-xs font-medium text-text-muted">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'bg-surface-bg border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 w-full';
const selectCls = 'bg-surface-bg border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-500 w-full';
const textareaCls = 'bg-surface-bg border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 w-full resize-none';

// ─── Intake multi-select ──────────────────────────────────────────────────────

function IntakeSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (m: string) =>
    onChange(value.includes(m) ? value.filter(x => x !== m) : [...value, m]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {INTAKE_OPTIONS.map(m => (
        <button
          key={m}
          type="button"
          onClick={() => toggle(m)}
          className={cn(
            'text-xs px-2.5 py-1 rounded-full border transition-colors',
            value.includes(m)
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-surface-border text-text-muted hover:border-brand-400'
          )}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

// ─── Add University Modal ─────────────────────────────────────────────────────

const defaultUni = {
  name: '', country: '', city: '', stateProvince: '', website: '', overview: '',
  type: '', foundedYear: '', totalStudents: '', internationalStudentPct: '', campusType: '',
  accreditations: '',
  qsWorldRank: '', timesHigherRank: '', shanghaiRank: '', nirf: '',
  applicationFeeUsd: '', livingCostAnnualUsd: '', dormAvailable: false, dormCostAnnualUsd: '',
  scholarshipAvailable: false, scholarshipInfo: '',
  postStudyWorkYears: '', visaSuccessRate: '', avgPostStudySalaryUsd: '',
  isPartner: false, defaultCommissionPct: '15',
  contactName: '', contactEmail: '', contactPhone: '',
  instagramUrl: '', linkedinUrl: '', youtubeUrl: '',
};

function AddUniversityModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ ...defaultUni });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country || !form.city) {
      setError('Name, country, and city are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const dto: any = {
        name: form.name,
        country: form.country,
        city: form.city,
        stateProvince: form.stateProvince || undefined,
        website: form.website || undefined,
        overview: form.overview || undefined,
        type: form.type || undefined,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        totalStudents: form.totalStudents ? Number(form.totalStudents) : undefined,
        internationalStudentPct: form.internationalStudentPct ? Number(form.internationalStudentPct) / 100 : undefined,
        campusType: form.campusType || undefined,
        accreditations: form.accreditations ? form.accreditations.split(',').map(s => s.trim()).filter(Boolean) : [],
        qsWorldRank: form.qsWorldRank ? Number(form.qsWorldRank) : undefined,
        timesHigherRank: form.timesHigherRank ? Number(form.timesHigherRank) : undefined,
        shanghaiRank: form.shanghaiRank ? Number(form.shanghaiRank) : undefined,
        nirf: form.nirf ? Number(form.nirf) : undefined,
        applicationFeeUsd: form.applicationFeeUsd ? Number(form.applicationFeeUsd) : undefined,
        livingCostAnnualUsd: form.livingCostAnnualUsd ? Number(form.livingCostAnnualUsd) : undefined,
        dormAvailable: form.dormAvailable,
        dormCostAnnualUsd: form.dormCostAnnualUsd ? Number(form.dormCostAnnualUsd) : undefined,
        scholarshipAvailable: form.scholarshipAvailable,
        scholarshipInfo: form.scholarshipInfo || undefined,
        postStudyWorkYears: form.postStudyWorkYears ? Number(form.postStudyWorkYears) : undefined,
        visaSuccessRate: form.visaSuccessRate ? Number(form.visaSuccessRate) / 100 : undefined,
        avgPostStudySalaryUsd: form.avgPostStudySalaryUsd ? Number(form.avgPostStudySalaryUsd) : undefined,
        isPartner: form.isPartner,
        defaultCommissionPct: form.defaultCommissionPct ? Number(form.defaultCommissionPct) : 15,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        instagramUrl: form.instagramUrl || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        youtubeUrl: form.youtubeUrl || undefined,
      };
      await createUniversity(dto);
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to create university');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-3xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <h2 className="text-lg font-semibold text-text-primary">Add University</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">

          {/* ── Basic Info ─────────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="University Name *" className="col-span-2">
                <input className={inputCls} placeholder="e.g. University of Toronto" value={form.name} onChange={e => set('name', e.target.value)} />
              </Field>
              <Field label="Country *">
                <input className={inputCls} placeholder="e.g. Canada" value={form.country} onChange={e => set('country', e.target.value)} />
              </Field>
              <Field label="City *">
                <input className={inputCls} placeholder="e.g. Toronto" value={form.city} onChange={e => set('city', e.target.value)} />
              </Field>
              <Field label="State / Province">
                <input className={inputCls} placeholder="e.g. Ontario" value={form.stateProvince} onChange={e => set('stateProvince', e.target.value)} />
              </Field>
              <Field label="Website">
                <input className={inputCls} placeholder="https://university.edu" value={form.website} onChange={e => set('website', e.target.value)} />
              </Field>
              <Field label="Overview / Description" className="col-span-2">
                <textarea className={textareaCls} rows={3} placeholder="Brief description of the university..." value={form.overview} onChange={e => set('overview', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* ── Profile ───────────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">University Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <select className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="">Select type</option>
                  {UNI_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </Field>
              <Field label="Campus Type">
                <select className={selectCls} value={form.campusType} onChange={e => set('campusType', e.target.value)}>
                  <option value="">Select campus type</option>
                  {CAMPUS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Founded Year">
                <input className={inputCls} type="number" placeholder="e.g. 1827" value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)} />
              </Field>
              <Field label="Total Students">
                <input className={inputCls} type="number" placeholder="e.g. 45000" value={form.totalStudents} onChange={e => set('totalStudents', e.target.value)} />
              </Field>
              <Field label="International Students %">
                <input className={inputCls} type="number" placeholder="e.g. 25 (for 25%)" min="0" max="100" value={form.internationalStudentPct} onChange={e => set('internationalStudentPct', e.target.value)} />
              </Field>
              <Field label="Accreditations (comma-separated)">
                <input className={inputCls} placeholder="e.g. AACSB, EQUIS, AMBA" value={form.accreditations} onChange={e => set('accreditations', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* ── Rankings ──────────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Rankings</h3>
            <div className="grid grid-cols-4 gap-4">
              <Field label="QS World Rank">
                <input className={inputCls} type="number" placeholder="e.g. 34" value={form.qsWorldRank} onChange={e => set('qsWorldRank', e.target.value)} />
              </Field>
              <Field label="Times Higher Rank">
                <input className={inputCls} type="number" placeholder="e.g. 28" value={form.timesHigherRank} onChange={e => set('timesHigherRank', e.target.value)} />
              </Field>
              <Field label="Shanghai Rank">
                <input className={inputCls} type="number" placeholder="e.g. 50" value={form.shanghaiRank} onChange={e => set('shanghaiRank', e.target.value)} />
              </Field>
              <Field label="NIRF Rank">
                <input className={inputCls} type="number" placeholder="e.g. 5" value={form.nirf} onChange={e => set('nirf', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* ── Financials & Accommodation ────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Financials & Living</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Application Fee (USD)">
                <input className={inputCls} type="number" placeholder="e.g. 100" value={form.applicationFeeUsd} onChange={e => set('applicationFeeUsd', e.target.value)} />
              </Field>
              <Field label="Annual Living Cost (USD)">
                <input className={inputCls} type="number" placeholder="e.g. 15000" value={form.livingCostAnnualUsd} onChange={e => set('livingCostAnnualUsd', e.target.value)} />
              </Field>
              <Field label="On-Campus Accommodation">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.dormAvailable} onChange={e => set('dormAvailable', e.target.checked)} className="rounded" />
                  <span className="text-sm text-text-secondary">Available</span>
                </label>
              </Field>
              {form.dormAvailable && (
                <Field label="Dorm Cost Annual (USD)">
                  <input className={inputCls} type="number" placeholder="e.g. 8000" value={form.dormCostAnnualUsd} onChange={e => set('dormCostAnnualUsd', e.target.value)} />
                </Field>
              )}
            </div>
          </section>

          {/* ── Scholarships ──────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Scholarships</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Scholarships Available">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.scholarshipAvailable} onChange={e => set('scholarshipAvailable', e.target.checked)} className="rounded" />
                  <span className="text-sm text-text-secondary">Yes</span>
                </label>
              </Field>
              {form.scholarshipAvailable && (
                <Field label="Scholarship Details" className="col-span-2">
                  <textarea className={textareaCls} rows={2} placeholder="Describe available scholarships, amounts, eligibility..." value={form.scholarshipInfo} onChange={e => set('scholarshipInfo', e.target.value)} />
                </Field>
              )}
            </div>
          </section>

          {/* ── Post-Study & Visa ─────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Post-Study Work & Visa</h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Post-Study Work Permit (years)">
                <input className={inputCls} type="number" step="0.5" placeholder="e.g. 3" value={form.postStudyWorkYears} onChange={e => set('postStudyWorkYears', e.target.value)} />
              </Field>
              <Field label="Visa Success Rate %">
                <input className={inputCls} type="number" placeholder="e.g. 85 (for 85%)" min="0" max="100" value={form.visaSuccessRate} onChange={e => set('visaSuccessRate', e.target.value)} />
              </Field>
              <Field label="Avg Post-Study Salary (USD/yr)">
                <input className={inputCls} type="number" placeholder="e.g. 55000" value={form.avgPostStudySalaryUsd} onChange={e => set('avgPostStudySalaryUsd', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* ── Partnership & Commission ──────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Partnership & Commission</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Partner University">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPartner} onChange={e => set('isPartner', e.target.checked)} className="rounded" />
                  <span className="text-sm text-text-secondary">Verified Partner</span>
                </label>
              </Field>
              <Field label="Default Commission %">
                <input className={inputCls} type="number" step="0.5" placeholder="e.g. 15" value={form.defaultCommissionPct} onChange={e => set('defaultCommissionPct', e.target.value)} />
              </Field>
              <Field label="Contact Name">
                <input className={inputCls} placeholder="University liaison name" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
              </Field>
              <Field label="Contact Email">
                <input className={inputCls} type="email" placeholder="liaison@university.edu" value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
              </Field>
              <Field label="Contact Phone">
                <input className={inputCls} placeholder="+1 416 555 0100" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* ── Social Media ──────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Social Media</h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Instagram URL">
                <input className={inputCls} placeholder="https://instagram.com/..." value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} />
              </Field>
              <Field label="LinkedIn URL">
                <input className={inputCls} placeholder="https://linkedin.com/school/..." value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} />
              </Field>
              <Field label="YouTube URL">
                <input className={inputCls} placeholder="https://youtube.com/..." value={form.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)} />
              </Field>
            </div>
          </section>

          {error && <p className="text-status-error text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-surface-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-surface-border rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg disabled:opacity-60">
              {saving ? 'Saving...' : 'Add University'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Add Course Modal ─────────────────────────────────────────────────────────

const defaultCourse = {
  name: '', overview: '', level: 'POSTGRADUATE', field: '', specializations: '',
  durationMonths: '24', languageOfInstruction: 'English',
  intakes: [] as string[],
  tuitionFeeUsd: '', currency: 'USD', localFee: '', applicationFeeUsd: '',
  minGradePercent: '', minIelts: '', minPte: '', minToefl: '', minDuolingo: '',
  minGre: '', minGmat: '', workExperienceYears: '',
  scholarshipAvailable: false, scholarshipAmountUsd: '', scholarshipInfo: '',
  coopAvailable: false, onlineAvailable: false,
  applicationDeadline: '', commissionPct: '', notes: '',
};

function AddCourseModal({ universityId, universityName, onClose, onSaved }: {
  universityId: string; universityName: string; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...defaultCourse });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.field || !form.tuitionFeeUsd) {
      setError('Name, field, and tuition fee are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const dto: any = {
        name: form.name,
        overview: form.overview || undefined,
        level: form.level,
        field: form.field,
        specializations: form.specializations ? form.specializations.split(',').map(s => s.trim()).filter(Boolean) : [],
        durationMonths: Number(form.durationMonths),
        languageOfInstruction: form.languageOfInstruction || 'English',
        intakes: form.intakes,
        tuitionFeeUsd: Number(form.tuitionFeeUsd),
        currency: form.currency || 'USD',
        localFee: form.localFee ? Number(form.localFee) : undefined,
        applicationFeeUsd: form.applicationFeeUsd ? Number(form.applicationFeeUsd) : undefined,
        minGradePercent: form.minGradePercent ? Number(form.minGradePercent) : undefined,
        minIelts: form.minIelts ? Number(form.minIelts) : undefined,
        minPte: form.minPte ? Number(form.minPte) : undefined,
        minToefl: form.minToefl ? Number(form.minToefl) : undefined,
        minDuolingo: form.minDuolingo ? Number(form.minDuolingo) : undefined,
        minGre: form.minGre ? Number(form.minGre) : undefined,
        minGmat: form.minGmat ? Number(form.minGmat) : undefined,
        workExperienceYears: form.workExperienceYears ? Number(form.workExperienceYears) : undefined,
        scholarshipAvailable: form.scholarshipAvailable,
        scholarshipAmountUsd: form.scholarshipAmountUsd ? Number(form.scholarshipAmountUsd) : undefined,
        scholarshipInfo: form.scholarshipInfo || undefined,
        coopAvailable: form.coopAvailable,
        onlineAvailable: form.onlineAvailable,
        applicationDeadline: form.applicationDeadline || undefined,
        commissionPct: form.commissionPct ? Number(form.commissionPct) : undefined,
        notes: form.notes || undefined,
      };
      await createCourse(universityId, dto);
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Add Course</h2>
            <p className="text-xs text-text-muted">{universityName}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">

          {/* ── Basic ─────────────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Course Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Course Name *" className="col-span-2">
                <input className={inputCls} placeholder="e.g. MSc Computer Science with AI" value={form.name} onChange={e => set('name', e.target.value)} />
              </Field>
              <Field label="Level *">
                <select className={selectCls} value={form.level} onChange={e => set('level', e.target.value)}>
                  {COURSE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Field / Department *">
                <input className={inputCls} placeholder="e.g. Computer Science" value={form.field} onChange={e => set('field', e.target.value)} />
              </Field>
              <Field label="Specializations (comma-separated)" className="col-span-2">
                <input className={inputCls} placeholder="e.g. AI/ML, Data Science, Cybersecurity" value={form.specializations} onChange={e => set('specializations', e.target.value)} />
              </Field>
              <Field label="Duration (months)">
                <input className={inputCls} type="number" placeholder="e.g. 24" value={form.durationMonths} onChange={e => set('durationMonths', e.target.value)} />
              </Field>
              <Field label="Language of Instruction">
                <input className={inputCls} placeholder="English" value={form.languageOfInstruction} onChange={e => set('languageOfInstruction', e.target.value)} />
              </Field>
              <Field label="Overview / Description" className="col-span-2">
                <textarea className={textareaCls} rows={2} placeholder="Brief description of the course..." value={form.overview} onChange={e => set('overview', e.target.value)} />
              </Field>
              <Field label="Available Intakes" className="col-span-2">
                <IntakeSelect value={form.intakes} onChange={v => set('intakes', v)} />
              </Field>
              <Field label="Application Deadline">
                <input className={inputCls} placeholder="e.g. 15 Jan 2026" value={form.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* ── Fees ──────────────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Fees</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tuition Fee per year (USD) *">
                <input className={inputCls} type="number" placeholder="e.g. 25000" value={form.tuitionFeeUsd} onChange={e => set('tuitionFeeUsd', e.target.value)} />
              </Field>
              <Field label="Application Fee (USD)">
                <input className={inputCls} type="number" placeholder="e.g. 75" value={form.applicationFeeUsd} onChange={e => set('applicationFeeUsd', e.target.value)} />
              </Field>
              <Field label="Local Fee (in local currency)">
                <input className={inputCls} type="number" placeholder="e.g. 33000" value={form.localFee} onChange={e => set('localFee', e.target.value)} />
              </Field>
              <Field label="Currency">
                <input className={inputCls} placeholder="USD" value={form.currency} onChange={e => set('currency', e.target.value)} />
              </Field>
              <Field label="Commission % (override)">
                <input className={inputCls} type="number" step="0.5" placeholder="Leave blank to use university default" value={form.commissionPct} onChange={e => set('commissionPct', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* ── Eligibility ───────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Eligibility Requirements</h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Min Grade %">
                <input className={inputCls} type="number" placeholder="e.g. 65" value={form.minGradePercent} onChange={e => set('minGradePercent', e.target.value)} />
              </Field>
              <Field label="Min IELTS">
                <input className={inputCls} type="number" step="0.5" placeholder="e.g. 6.5" value={form.minIelts} onChange={e => set('minIelts', e.target.value)} />
              </Field>
              <Field label="Min PTE">
                <input className={inputCls} type="number" placeholder="e.g. 58" value={form.minPte} onChange={e => set('minPte', e.target.value)} />
              </Field>
              <Field label="Min TOEFL">
                <input className={inputCls} type="number" placeholder="e.g. 90" value={form.minToefl} onChange={e => set('minToefl', e.target.value)} />
              </Field>
              <Field label="Min Duolingo">
                <input className={inputCls} type="number" placeholder="e.g. 105" value={form.minDuolingo} onChange={e => set('minDuolingo', e.target.value)} />
              </Field>
              <Field label="Min GRE">
                <input className={inputCls} type="number" placeholder="e.g. 310" value={form.minGre} onChange={e => set('minGre', e.target.value)} />
              </Field>
              <Field label="Min GMAT">
                <input className={inputCls} type="number" placeholder="e.g. 600" value={form.minGmat} onChange={e => set('minGmat', e.target.value)} />
              </Field>
              <Field label="Work Experience (years)">
                <input className={inputCls} type="number" step="0.5" placeholder="e.g. 2" value={form.workExperienceYears} onChange={e => set('workExperienceYears', e.target.value)} />
              </Field>
            </div>
          </section>

          {/* ── Scholarship ───────────────────────────────────────────── */}
          <section>
            <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-4">Scholarship & Extras</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Scholarship Available">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.scholarshipAvailable} onChange={e => set('scholarshipAvailable', e.target.checked)} className="rounded" />
                  <span className="text-sm text-text-secondary">Yes</span>
                </label>
              </Field>
              {form.scholarshipAvailable && (
                <>
                  <Field label="Scholarship Amount (USD/yr)">
                    <input className={inputCls} type="number" placeholder="e.g. 5000" value={form.scholarshipAmountUsd} onChange={e => set('scholarshipAmountUsd', e.target.value)} />
                  </Field>
                  <Field label="Scholarship Details" className="col-span-2">
                    <textarea className={textareaCls} rows={2} placeholder="Merit-based / need-based details..." value={form.scholarshipInfo} onChange={e => set('scholarshipInfo', e.target.value)} />
                  </Field>
                </>
              )}
              <Field label="Co-op / Internship Integrated">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.coopAvailable} onChange={e => set('coopAvailable', e.target.checked)} className="rounded" />
                  <span className="text-sm text-text-secondary">Available</span>
                </label>
              </Field>
              <Field label="Online Option">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.onlineAvailable} onChange={e => set('onlineAvailable', e.target.checked)} className="rounded" />
                  <span className="text-sm text-text-secondary">Available</span>
                </label>
              </Field>
              <Field label="Notes" className="col-span-2">
                <textarea className={textareaCls} rows={2} placeholder="Any additional notes for agents..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </Field>
            </div>
          </section>

          {error && <p className="text-status-error text-sm">{error}</p>}

          <div className="flex justify-end gap-3 pt-2 border-t border-surface-border">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-surface-border rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg disabled:opacity-60">
              {saving ? 'Saving...' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Courses Row Expansion ────────────────────────────────────────────────────

function UniversityRow({ u, onAddCourse }: { u: any; onAddCourse: (u: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', u.id],
    queryFn: () => fetchCourses(u.id),
    enabled: expanded,
  });
  const courses = coursesData?.data ?? [];

  return (
    <>
      <tr className="border-b border-surface-border/50 hover:bg-surface-card2/30 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <td className="px-4 py-3 w-8">
          {expanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div>
              <p className="font-medium text-text-primary">{u.name}</p>
              <p className="text-text-muted text-xs">{u.city}{u.stateProvince ? `, ${u.stateProvince}` : ''}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-text-secondary">{u.country}</td>
        <td className="px-4 py-3 text-text-secondary">{u.type ? u.type.replace('_', ' ') : '—'}</td>
        <td className="px-4 py-3 text-text-secondary">{u.qsWorldRank ? `#${u.qsWorldRank}` : '—'}</td>
        <td className="px-4 py-3 text-text-secondary">{u._count?.courses ?? 0}</td>
        <td className="px-4 py-3 text-text-secondary">{u._count?.applications ?? 0}</td>
        <td className="px-4 py-3 text-status-success">{u.defaultCommissionPct}%</td>
        <td className="px-4 py-3">
          <span className={cn('text-xs px-2 py-0.5 rounded-full',
            u.isPartner ? 'bg-status-success/20 text-status-success' : 'bg-surface-card2 text-text-muted')}>
            {u.isPartner ? 'Partner' : 'Listed'}
          </span>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-surface-bg/40">
          <td colSpan={9} className="px-6 py-4">
            <div className="space-y-3">
              {/* University extra fields */}
              <div className="grid grid-cols-4 gap-3 text-xs text-text-muted mb-3">
                {u.overview && <div className="col-span-4 text-text-secondary">{u.overview}</div>}
                {u.postStudyWorkYears != null && <div><span className="text-text-muted">Post-study work: </span><span className="text-text-secondary font-medium">{u.postStudyWorkYears}yr</span></div>}
                {u.visaSuccessRate != null && <div><span className="text-text-muted">Visa success: </span><span className="text-text-secondary font-medium">{(u.visaSuccessRate * 100).toFixed(0)}%</span></div>}
                {u.scholarshipAvailable && <div><span className="text-status-success font-medium">Scholarships available</span></div>}
                {u.dormAvailable && <div><span className="text-text-muted">Dorm: </span><span className="text-text-secondary font-medium">{u.dormCostAnnualUsd ? `$${u.dormCostAnnualUsd.toLocaleString()}/yr` : 'Available'}</span></div>}
              </div>

              {/* Courses table */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-text-primary">Courses ({courses.length})</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onAddCourse(u); }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Course
                </button>
              </div>

              {coursesLoading && <p className="text-xs text-text-muted">Loading courses...</p>}

              {!coursesLoading && courses.length === 0 && (
                <p className="text-xs text-text-muted italic">No courses added yet. Click "Add Course" to start.</p>
              )}

              {courses.length > 0 && (
                <table className="w-full text-xs border border-surface-border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-surface-card2/50 border-b border-surface-border">
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Course</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Level</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Field</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Duration</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Intakes</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Tuition/yr</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">IELTS</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Duolingo</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Scholarship</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Co-op</th>
                      <th className="text-left px-3 py-2 text-text-muted font-medium">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c: any) => (
                      <tr key={c.id} className="border-b border-surface-border/50 hover:bg-surface-card2/30">
                        <td className="px-3 py-2 font-medium text-text-primary">
                          {c.name}
                          {c.specializations?.length > 0 && (
                            <div className="text-text-muted font-normal">{c.specializations.join(', ')}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-text-secondary capitalize">{c.level.toLowerCase()}</td>
                        <td className="px-3 py-2 text-text-secondary">{c.field}</td>
                        <td className="px-3 py-2 text-text-secondary">{c.durationMonths}mo</td>
                        <td className="px-3 py-2 text-text-secondary">{c.intakes?.join(', ') || '—'}</td>
                        <td className="px-3 py-2 text-text-primary">${Number(c.tuitionFeeUsd).toLocaleString()}</td>
                        <td className="px-3 py-2 text-text-secondary">{c.minIelts ?? '—'}</td>
                        <td className="px-3 py-2 text-text-secondary">{c.minDuolingo ?? '—'}</td>
                        <td className="px-3 py-2">
                          {c.scholarshipAvailable
                            ? <span className="text-status-success">Yes{c.scholarshipAmountUsd ? ` ($${Number(c.scholarshipAmountUsd).toLocaleString()})` : ''}</span>
                            : <span className="text-text-muted">No</span>}
                        </td>
                        <td className="px-3 py-2">{c.coopAvailable ? <span className="text-brand-400">Yes</span> : <span className="text-text-muted">No</span>}</td>
                        <td className="px-3 py-2 text-status-success">{c.commissionPct != null ? `${c.commissionPct}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUniversitiesPage() {
  const qc = useQueryClient();
  const [showAddUni, setShowAddUni] = useState(false);
  const [addCourseFor, setAddCourseFor] = useState<any>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['admin-universities'], queryFn: fetchAdminUniversities });
  const universities = (data?.data ?? []) as any[];

  const filtered = universities.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.country.toLowerCase().includes(search.toLowerCase())
  );

  const onUniSaved = () => {
    setShowAddUni(false);
    qc.invalidateQueries({ queryKey: ['admin-universities'] });
  };

  const onCourseSaved = () => {
    if (addCourseFor) qc.invalidateQueries({ queryKey: ['courses', addCourseFor.id] });
    qc.invalidateQueries({ queryKey: ['admin-universities'] });
    setAddCourseFor(null);
  };

  return (
    <div className="space-y-6">
      {showAddUni && <AddUniversityModal onClose={() => setShowAddUni(false)} onSaved={onUniSaved} />}
      {addCourseFor && (
        <AddCourseModal
          universityId={addCourseFor.id}
          universityName={addCourseFor.name}
          onClose={() => setAddCourseFor(null)}
          onSaved={onCourseSaved}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Universities</h1>
        <button
          onClick={() => setShowAddUni(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add University
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 w-72"
          placeholder="Search by name or country..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span className="text-sm text-text-muted">{filtered.length} universities</span>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border">
              <th className="w-8 px-4 py-3" />
              <th className="text-left px-4 py-3 text-text-muted font-medium">University</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Country</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Type</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">QS Rank</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Courses</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Applications</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Commission</th>
              <th className="text-left px-4 py-3 text-text-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-text-muted">Loading...</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-text-muted">No universities found. Add one to get started.</td></tr>
            )}
            {filtered.map(u => (
              <UniversityRow key={u.id} u={u} onAddCourse={setAddCourseFor} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
