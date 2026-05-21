import Link from 'next/link';
import { LayoutDashboard, Users, Building2, Wallet, Shield, Settings } from 'lucide-react';

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Agents', href: '/agents', icon: Users },
  { label: 'Universities', href: '/universities', icon: Building2 },
  { label: 'Commissions', href: '/commissions', icon: Wallet },
  { label: 'Fraud', href: '/fraud', icon: Shield },
  { label: 'Config', href: '/config', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside className="w-56 flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col">
        <div className="px-4 py-4 border-b border-surface-border">
          <div className="text-sm font-bold text-status-error">SUPER ADMIN</div>
          <div className="text-xs text-text-muted mt-0.5">RightDirection Platform</div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-card2 hover:text-text-primary transition-colors">
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
