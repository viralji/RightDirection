import Link from 'next/link';

const NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'My Profile', href: '/profile' },
  { label: 'Proposals', href: '/proposals' },
  { label: 'Applications', href: '/applications' },
  { label: 'Documents', href: '/documents' },
  { label: 'Messages', href: '/messages' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
        <div className="font-bold text-brand-700 text-lg">RightDirection</div>
        <div className="flex gap-4">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="text-sm text-gray-600 hover:text-brand-500">{n.label}</Link>
          ))}
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
