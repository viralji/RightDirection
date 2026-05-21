import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b">
        <div className="font-bold text-xl text-brand-700">RightDirection</div>
        <div className="flex gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-brand-500">Sign In</Link>
          <Link href="/register" className="text-sm px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">Get Started</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-20 text-center">
        <div className="inline-block px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-sm font-medium mb-6">
          AI-Powered Global Admissions Exchange
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          The Smart Way to Study<br />Abroad — Verified & AI-Native
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Connecting India's study abroad consultants with top universities through automation, verification, and intelligence.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors">
            Start Free Trial
          </Link>
          <Link href="/universities" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Explore Universities
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-20">
          {[
            { label: 'Verified Applications', value: '50,000+', desc: 'fraud-checked and trusted' },
            { label: 'Partner Universities', value: '500+', desc: 'across UK, Canada, Australia' },
            { label: 'Agent Partners', value: '1,200+', desc: 'across India Tier-2/3 cities' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-brand-500">{s.value}</div>
              <div className="text-gray-800 font-medium mt-1">{s.label}</div>
              <div className="text-gray-400 text-sm">{s.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
