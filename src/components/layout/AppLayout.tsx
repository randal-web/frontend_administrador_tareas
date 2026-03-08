'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Link from 'next/link';
import Sidebar from './Sidebar';
import {
  HiOutlineMenu,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineCog,
} from 'react-icons/hi';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth, user, logout } = useAuthStore();
  const { sidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { notifications, unreadCount, fetchNotifications, generateNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const [bellOpen, setBellOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
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
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && !isPublicPage) {
      generateNotifications();
      fetchNotifications();
    }
  }, [isAuthenticated, isPublicPage, generateNotifications, fetchNotifications]);

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
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 relative"
              >
                <HiOutlineBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                )}
              </button>

              {/* Dropdown */}
              {bellOpen && (
                <div
                  className="absolute right-0 top-11 w-[calc(100vw-2rem)] sm:w-96 max-h-[420px] rounded-xl border shadow-2xl flex flex-col overflow-hidden z-50"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-sm font-semibold text-[var(--foreground)]">
                      Notificaciones
                      {unreadCount > 0 && (
                        <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">{unreadCount}</span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-[11px] font-medium text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        Marcar todas leídas
                      </button>
                    )}
                  </div>

                  {/* Items */}
                  <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-10">
                        <HiOutlineBell size={28} className="mx-auto mb-2 text-gray-300" />
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>Sin notificaciones</p>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map(n => {
                        const iconMap: Record<string, typeof HiOutlineSun> = {
                          morning_tasks: HiOutlineSun,
                          morning_reminders: HiOutlineClipboardList,
                          evening_pending: HiOutlineMoon,
                          task_due: HiOutlineCalendar,
                          reminder_due: HiOutlineBell,
                        };
                        const colorMap: Record<string, string> = {
                          morning_tasks: '#f59e0b',
                          morning_reminders: '#3b82f6',
                          evening_pending: '#7c3aed',
                          task_due: '#ef4444',
                          reminder_due: '#ea580c',
                        };
                        const Icon = iconMap[n.type] || HiOutlineBell;
                        const color = colorMap[n.type] || '#6b7280';

                        return (
                          <div
                            key={n.id}
                            className={`flex items-start gap-3 px-4 py-3 border-b transition-colors hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50/40' : ''}`}
                            style={{ borderColor: 'var(--border)' }}
                          >
                            <Icon size={16} style={{ color }} className="mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs leading-snug ${!n.is_read ? 'font-semibold text-[var(--foreground)]' : 'text-gray-600'}`}>
                                {n.title}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 whitespace-pre-line">{n.message}</p>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {!n.is_read && (
                                <button onClick={() => markAsRead(n.id)} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-green-500 transition-colors" title="Marcar leída">
                                  <HiOutlineCheck size={12} />
                                </button>
                              )}
                              <button onClick={() => deleteNotification(n.id)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                                <HiOutlineTrash size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <Link
                      href="/notifications"
                      onClick={() => setBellOpen(false)}
                      className="block text-center text-xs font-medium py-2.5 border-t hover:bg-gray-50 transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--primary, #3b82f6)' }}
                    >
                      Ver todas las notificaciones
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div ref={userMenuRef} className="relative hidden sm:flex items-center ml-1 pl-2 border-l" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                )}
                <span className="text-sm font-medium text-[var(--foreground)]">
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
    </div>
  );
}
