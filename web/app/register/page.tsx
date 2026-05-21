'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const post = (path: string, body: unknown) =>
  fetch(`/api/v1${path}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'otp' | 'details'>('otp');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '', city: '', subdomain: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch('/api/v1/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }), headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
      setStep('details');
    } catch { setError('Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await fetch('/api/v1/auth/register/agent', {
        method: 'POST',
        body: JSON.stringify({ ...form, phone, otp }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      router.push('/login?registered=1');
    } catch (err: any) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputClass =
    'w-full px-3 py-2.5 bg-white border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-surface-border rounded-2xl shadow-soft p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">RD</div>
          <h1 className="text-2xl font-bold text-text-primary">Start Your Free Trial</h1>
          <p className="text-text-muted text-sm mt-1">Set up your agency portal in 2 minutes</p>
        </div>

        {step === 'otp' ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Mobile Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 98765 43210"
                className={inputClass} />
            </div>
            {error && <p className="text-status-error text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <p className="text-center text-text-muted text-sm">
              Already have an account? <Link href="/login" className="text-brand-600 hover:underline font-medium">Sign in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={register} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Your Name</label>
                <input value={form.name} onChange={f('name')} required placeholder="Rahul Sharma"
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">OTP</label>
                <input value={otp} onChange={e => setOtp(e.target.value)} required placeholder="123456" maxLength={6}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Work Email</label>
              <input type="email" value={form.email} onChange={f('email')} required placeholder="you@agency.com"
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Password</label>
              <input type="password" value={form.password} onChange={f('password')} required placeholder="Min 8 characters"
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Agency / Business Name</label>
              <input value={form.businessName} onChange={f('businessName')} required placeholder="StudyVision Consultancy"
                className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">City</label>
                <input value={form.city} onChange={f('city')} required placeholder="Surat"
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Portal Subdomain</label>
                <div className="flex">
                  <input value={form.subdomain} onChange={f('subdomain')} required placeholder="studyvision"
                    className={`flex-1 rounded-l-lg ${inputClass}`} />
                  <span className="px-2 py-2.5 bg-surface-card2 border border-l-0 border-surface-border rounded-r-lg text-text-muted text-xs">.rightdirection.com</span>
                </div>
              </div>
            </div>
            {error && <p className="text-status-error text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
