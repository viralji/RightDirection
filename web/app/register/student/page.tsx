'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { dashboardPath } from '@/lib/portal';

export default function StudentRegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState<'phone' | 'details'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    agentSubdomain: 'demo',
    countries: 'UK, Canada',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputClass =
    'w-full px-3 py-2.5 bg-white border border-surface-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-200';

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.sendOtp(phone);
      setStep('details');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const preferredCountries = form.countries
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      const { user } = await auth.registerStudent({
        phone,
        otp,
        name: form.name,
        email: form.email,
        password: form.password,
        agentSubdomain: form.agentSubdomain,
        preferredCountries,
      });
      setUser(user);
      router.push(dashboardPath(user.role));
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-surface-border rounded-2xl shadow-soft p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pastel-mint to-brand-500 flex items-center justify-center text-white font-bold mx-auto mb-3">
            RD
          </div>
          <h1 className="text-xl font-bold text-text-primary">Student sign up</h1>
          <p className="text-text-muted text-sm mt-1">
            Link to your counselor agency using their portal code
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Mobile number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={inputClass}
                placeholder="+91 9876543210"
              />
            </div>
            {error && <p className="text-xs text-status-error">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
            <p className="text-xs text-text-muted text-center">
              Demo agency code: <strong>demo</strong> (StudyVision)
            </p>
          </form>
        ) : (
          <form onSubmit={register} className="space-y-3">
            <Field label="OTP" value={otp} onChange={setOtp} required />
            <Field label="Full name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
            <Field label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} type="email" required />
            <Field label="Password" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} type="password" required />
            <div>
              <label className="block text-sm text-text-secondary mb-1">Agency code (subdomain)</label>
              <input
                value={form.agentSubdomain}
                onChange={(e) => setForm((p) => ({ ...p, agentSubdomain: e.target.value }))}
                required
                className={inputClass}
                placeholder="demo"
              />
              <p className="text-xs text-text-muted mt-0.5">Ask your counselor for this code</p>
            </div>
            <Field
              label="Preferred countries"
              value={form.countries}
              onChange={(v) => setForm((p) => ({ ...p, countries: v }))}
              placeholder="UK, Canada"
            />
            {error && <p className="text-xs text-status-error">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create student account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-text-muted mt-6">
          Already registered? <Link href="/login" className="text-brand-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-text-secondary mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-white border border-surface-border rounded-lg text-sm"
      />
    </div>
  );
}
