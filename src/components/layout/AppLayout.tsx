'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import Sidebar from './Sidebar';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isPublicPage = publicPaths.some(p => pathname.startsWith(p)) || pathname === '/';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicPage) {
        router.push('/login');
      }
      if (isAuthenticated && isPublicPage) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, isPublicPage, router]);

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

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar />
      <main
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
