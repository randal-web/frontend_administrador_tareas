'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import Sidebar from './Sidebar';
import { HiOutlineMenu } from 'react-icons/hi';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { sidebarOpen, setMobileSidebarOpen } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = publicPaths.some(p => pathname.startsWith(p)) || pathname === '/';

  useEffect(() => {
    // Don't check auth on public pages — avoids race condition with OAuth callback
    if (!isPublicPage) {
      checkAuth();
    }
  }, [checkAuth, isPublicPage]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicPage) {
        router.push('/login');
      }
      if (isAuthenticated && isPublicPage && pathname !== '/auth/callback') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, isPublicPage, router, pathname]);

  // Public pages render immediately — no need to wait for auth check
  if (isPublicPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar />

      {/* Mobile top bar with hamburger */}
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center h-14 px-4 md:hidden border-b"
        style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
      >
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <HiOutlineMenu size={22} />
        </button>
        <span className="ml-3 font-semibold text-sm">TaskManager</span>
      </div>

      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <div className="p-4 pt-18 md:p-6 md:pt-6">{children}</div>
      </main>
    </div>
  );
}
