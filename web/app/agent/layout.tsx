import { Sidebar } from '@/components/layout/sidebar';
import { ImpersonationBanner } from '@/components/layout/impersonation-banner';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface">
      <ImpersonationBanner />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
