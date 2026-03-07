'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { HiOutlineMenu, HiOutlineSearch, HiOutlineBell, HiOutlineLogout } from 'react-icons/hi';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth, user, logout } = useAuthStore();
  const { sidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = publicPaths.some(p => pathname.startsWith(p)) || pathname === '/';

  useEffect(() => {
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

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar />

      <div
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          sidebarOpen ? 'md:ml-[220px]' : 'md:ml-[48px]'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 md:px-6 border-b"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Left: hamburger (mobile) + greeting */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              <HiOutlineMenu size={20} />
            </button>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Bienvenido <span className="uppercase">{user?.full_name?.split(' ')[0] || 'Usuario'}</span>
            </h2>
          </div>

          {/* Right: search, notifications, user */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
              <HiOutlineSearch size={18} />
            </button>
            <Link href="/notifications" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 relative">
              <HiOutlineBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500"
              title="Cerrar sesión"
            >
              <HiOutlineLogout size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-2 ml-1 pl-2 border-l" style={{ borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {user?.full_name?.split(' ')[0]?.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
