'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { students } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const COUNTRIES = ['UK', 'Canada', 'Australia', 'USA', 'Germany', 'Ireland', 'New Zealand', 'Dubai'];
const FIELDS = ['Engineering', 'Business', 'Computer Science', 'Health Sciences', 'Arts & Design', 'Law', 'Education', 'Finance'];

export default function NewStudentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    educationLevel: '', aggregatePct: '', stream: '',
    ieltsScore: '', pteScore: '',
    annualBudgetInr: '', preferredIntake: '',
    preferredCountries: [] as string[],
    preferredField: [] as string[],
    leadSource: 'WALK_IN',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: any) => students.create(data),
    onSuccess: (student) => router.push(`/students/${student.id}`),
    onError: (err: any) => setError(err.message),
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const toggle = (key: 'preferredCountries' | 'preferredField', val: string) =>
    setForm(p => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val],
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      aggregatePct: form.aggregatePct ? parseFloat(form.aggregatePct) : undefined,
      ieltsScore: form.ieltsScore ? parseFloat(form.ieltsScore) : undefined,
      pteScore: form.pteScore ? parseFloat(form.pteScore) : undefined,
      annualBudgetInr: form.annualBudgetInr ? parseInt(form.annualBudgetInr) : undefined,
    });
  };

  const inp = 'w-full px-3 py-2.5 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-brand-500';

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/students" className="text-text-muted hover:text-text-primary"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-text-primary">Add New Student</h1>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Personal Info */}
        <section className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-text-primary">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label><input value={form.name} onChange={f('name')} required className={inp} /></div>
            <div><label className="label">Phone *</label><input value={form.phone} onChange={f('phone')} required className={inp} placeholder="+91..." /></div>
            <div className="col-span-2"><label className="label">Email</label><input type="email" value={form.email} onChange={f('email')} className={inp} /></div>
          </div>
        </section>

        {/* Academic */}
        <section className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-text-primary">Academic Profile</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Education Level</label>
              <select value={form.educationLevel} onChange={f('educationLevel')} className={inp}>
                <option value="">Select...</option>
                <option>10th</option><option>12th</option>
                <option value="UNDERGRADUATE">Undergraduate</option>
                <option value="POSTGRADUATE">Postgraduate</option>
              </select>
            </div>
            <div><label className="label">Aggregate %</label><input type="number" value={form.aggregatePct} onChange={f('aggregatePct')} className={inp} placeholder="72" /></div>
            <div><label className="label">Stream</label><input value={form.stream} onChange={f('stream')} className={inp} placeholder="Commerce" /></div>
            <div><label className="label">IELTS Score</label><input type="number" step="0.5" value={form.ieltsScore} onChange={f('ieltsScore')} className={inp} placeholder="6.5" /></div>
            <div><label className="label">PTE Score</label><input type="number" value={form.pteScore} onChange={f('pteScore')} className={inp} placeholder="58" /></div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-text-primary">Preferences</h2>
          <div>
            <label className="label mb-2">Preferred Countries</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map(c => (
                <button key={c} type="button" onClick={() => toggle('preferredCountries', c)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.preferredCountries.includes(c) ? 'bg-brand-500 border-brand-500 text-white' : 'border-surface-border text-text-secondary hover:border-brand-500'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label mb-2">Preferred Fields</label>
            <div className="flex flex-wrap gap-2">
              {FIELDS.map(f => (
                <button key={f} type="button" onClick={() => toggle('preferredField', f)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${form.preferredField.includes(f) ? 'bg-brand-500 border-brand-500 text-white' : 'border-surface-border text-text-secondary hover:border-brand-500'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Annual Budget (₹)</label><input type="number" value={form.annualBudgetInr} onChange={f('annualBudgetInr')} className={inp} placeholder="2500000" /></div>
            <div><label className="label">Target Intake</label><input value={form.preferredIntake} onChange={f('preferredIntake')} className={inp} placeholder="September 2025" /></div>
          </div>
          <div>
            <label className="label">Lead Source</label>
            <select value={form.leadSource} onChange={f('leadSource')} className={inp}>
              <option value="WALK_IN">Walk-in</option>
              <option value="REFERRAL">Referral</option>
              <option value="SOCIAL">Social Media</option>
              <option value="WEBSITE">Website</option>
              <option value="MARKETPLACE">Marketplace</option>
            </select>
          </div>
        </section>

        {error && <p className="text-status-error text-sm">{error}</p>}

        <div className="flex gap-3">
          <Link href="/students" className="px-5 py-2.5 border border-surface-border text-text-secondary rounded-lg text-sm hover:bg-surface-card2">Cancel</Link>
          <button type="submit" disabled={mutation.isPending}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-60">
            {mutation.isPending ? 'Saving...' : 'Add Student'}
          </button>
        </div>
      </form>

      <style jsx>{`.label { display: block; font-size: 0.875rem; color: #c8d0e8; margin-bottom: 0.25rem; }`}</style>
    </div>
  );
}
