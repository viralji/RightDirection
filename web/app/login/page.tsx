'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { dashboardPath } from '@/lib/portal';

type Tab = 'email' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [tab, setTab] = useState<Tab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devHint, setDevHint] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const afterAuth = (user: { role: string }) => {
    setUser(user as any);
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    router.push(redirect && redirect.startsWith('/') ? redirect : dashboardPath(user.role));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await auth.login(email, password);
      afterAuth(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await auth.sendOtp(phone);
      setOtpSent(true);
      setDevHint(res.devHint ?? '');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await auth.loginOtp(phone, otp);
      afterAuth(user);
    } catch (err: any) {
      setError(err.message || 'OTP login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-white border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-surface-border rounded-2xl shadow-soft p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-soft">
              RD
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
            <p className="text-text-muted text-sm mt-1">Sign in to RightDirection</p>
          </div>

          <div className="flex gap-1 bg-surface-card2 rounded-lg p-1 mb-5">
            <button
              type="button"
              onClick={() => setTab('email')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'email' ? 'bg-white text-brand-700 shadow-sm' : 'text-text-muted'}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setTab('otp')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md ${tab === 'otp' ? 'bg-white text-brand-700 shadow-sm' : 'text-text-muted'}`}
            >
              Phone OTP
            </button>
          </div>

          {tab === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              {error && <ErrorBox message={error} />}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Mobile</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="+91 9876543210"
                />
              </div>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading || !phone}
                  className="w-full py-2.5 border border-brand-500 text-brand-700 rounded-lg text-sm font-medium"
                >
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">OTP</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="6-digit code"
                    />
                  </div>
                  {devHint && (
                    <p className="text-xs text-amber-800 bg-pastel-peach px-2 py-1 rounded">
                      Dev: OTP is printed in the API server console.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                  >
                    {loading ? 'Verifying…' : 'Sign in with OTP'}
                  </button>
                </>
              )}
              {error && <ErrorBox message={error} />}
            </form>
          )}

          <p className="text-center text-text-muted text-sm mt-6">
            New student?{' '}
            <Link href="/register/student" className="text-brand-600 font-medium hover:underline">
              Create account
            </Link>
            {' · '}
            <Link href="/register" className="text-brand-600 hover:underline">
              Agency signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="text-sm text-status-error bg-status-error-bg px-3 py-2 rounded-lg border border-red-100">
      {message}
    </p>
  );
}
