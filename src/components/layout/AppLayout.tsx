'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import Link from 'next/link';
import Sidebar from './Sidebar';
import SearchModal from './SearchModal';
import NotificationDropdown from './NotificationDropdown';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import { useTaskStore } from '@/stores/taskStore';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  HiOutlineMenu,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineUser,
  HiOutlineCog,
} from 'react-icons/hi';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth, user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setMobileSidebarOpen, setIsSearchOpen } = useUIStore();
  const { selectedTaskId, detailModalOpen, closeTaskDetail } = useTaskStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = publicPaths.some(p => pathname.startsWith(p)) || pathname === '/';

  useEffect(() => {
    if (!isPublicPage) {
      checkAuth();
    }
  }, [checkAuth, isPublicPage]);

  useEffect(() => {
    if (isAuthenticated && !isPublicPage) {
      fetchNotifications();
      // Polling for new notifications every 2 minutes
      const interval = setInterval(fetchNotifications, 120000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isPublicPage, fetchNotifications]);

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

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors md:hidden flex-shrink-0"
            >
              <HiOutlineMenu size={20} />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
              <span className="hidden xs:inline">Bienvenido </span>
              <span className="uppercase">{user?.full_name?.split(' ')[0] || 'Usuario'}</span>
            </h2>
          </div>

          {/* Right: search, user */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              title="Buscar (⌘K)"
            >
              <HiOutlineSearch size={18} />
            </button>

            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 relative"
                title="Notificaciones"
              >
                <HiOutlineBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <div ref={userMenuRef} className="relative flex items-center ml-1 sm:pl-2 sm:border-l" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-1.5 sm:px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                    {initials}
                  </div>
                )}
                <span className="text-xs sm:text-sm font-medium text-[var(--foreground)] hidden xxs:inline">
                  {user?.full_name?.split(' ')[0]?.toUpperCase()}
                </span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-11 w-60 rounded-xl border shadow-xl z-50 overflow-hidden"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      {user?.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.full_name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-[var(--foreground)]"
                    >
                      <HiOutlineUser size={15} className="text-gray-500" />
                      Mi perfil
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-[var(--foreground)]"
                    >
                      <HiOutlineCog size={15} className="text-gray-500" />
                      Configuración
                    </Link>
                  </div>

                  <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <HiOutlineLogout size={15} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
      <SearchModal />
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={detailModalOpen}
        onClose={closeTaskDetail}
      />
    </div>
  );
}