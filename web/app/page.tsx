import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="flex items-center justify-between px-6 sm:px-8 py-4 border-b border-surface-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 text-white font-bold text-xs flex items-center justify-center">RD</div>
          <span className="font-bold text-lg text-text-primary">RightDirection</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-text-secondary hover:text-brand-600 font-medium">
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium shadow-soft"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 sm:px-8 py-16 sm:py-24 text-center">
        <div className="inline-block px-4 py-1.5 bg-pastel-blue text-brand-700 rounded-full text-sm font-medium mb-6 border border-brand-100">
          AI-Powered Global Admissions Exchange
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary leading-tight mb-6">
          The Smart Way to Study
          <br />
          Abroad — Verified & AI-Native
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
          Connecting India&apos;s study abroad consultants with top universities through automation, verification, and intelligence.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors shadow-soft"
          >
            Start Free Trial
          </Link>
          <Link
            href="/agent/universities"
            className="px-6 py-3 bg-white border border-surface-border text-text-primary rounded-xl font-medium hover:bg-pastel-blue transition-colors"
          >
            Explore Universities
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 sm:mt-20">
          {[
            { label: 'Verified Applications', value: '50,000+', desc: 'fraud-checked and trusted', bg: 'bg-pastel-mint' },
            { label: 'Partner Universities', value: '500+', desc: 'across UK, Canada, Australia', bg: 'bg-pastel-blue' },
            { label: 'Agent Partners', value: '1,200+', desc: 'across India Tier-2/3 cities', bg: 'bg-pastel-peach' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-6 border border-surface-border shadow-card`}>
              <div className="text-3xl font-bold text-brand-600">{s.value}</div>
              <div className="text-text-primary font-medium mt-2">{s.label}</div>
              <div className="text-text-muted text-sm mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
