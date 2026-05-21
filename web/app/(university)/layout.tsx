import Link from 'next/link';

const NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Applications', href: '/applications' },
  { label: 'Agents', href: '/agents' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Offers', href: '/offers' },
];

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-brand-700 text-white px-6 py-3 flex items-center gap-8">
        <div className="font-bold text-white text-lg">RightDirection · University Portal</div>
        <div className="flex gap-5">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="text-sm text-blue-100 hover:text-white">{n.label}</Link>
          ))}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
