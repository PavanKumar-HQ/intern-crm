import Sidebar from '@/components/layout/Sidebar';
import TopBarTitle from '@/components/layout/TopBarTitle';
import NotificationCenter from '@/components/layout/NotificationCenter';
import GlobalSearchModal from '@/components/search/GlobalSearchModal';
import QuickCreateMenu from '@/components/layout/QuickCreateMenu';
import UserMenu from '@/components/layout/UserMenu';
import { RealtimeProvider } from '@/context/RealtimeContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brandex CRM',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RealtimeProvider>
      <div className="app-layout">
        <Sidebar />
        <div className="main-container flex-1 flex flex-col min-h-screen min-w-0">
          <header className="topbar sticky top-0 z-40 border-b border-[#E2DDD2] px-6 py-2.5 flex items-center justify-between">
            {/* Left: Contextual Page Title */}
            <div className="flex items-center gap-3">
              <TopBarTitle />
            </div>

            {/* Center: Quiet Global Search (⌘K) */}
            <div className="flex-1 max-w-md mx-6">
              <GlobalSearchModal />
            </div>

            {/* Right: Functional Action Group */}
            <div className="flex items-center gap-3">
              {/* Subtle Live Connection Indicator */}
              <div
                className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#065F46] font-semibold px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] select-none shadow-2xs"
                title="Real-time event stream connected"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Live</span>
              </div>

              {/* + Create Action Button */}
              <QuickCreateMenu />

              {/* Notification Center */}
              <NotificationCenter />

              {/* User Profile */}
              <UserMenu />
            </div>
          </header>

          <main className="page-body flex-1">
            {children}
          </main>
        </div>
      </div>
    </RealtimeProvider>
  );
}
