'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineRefresh,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';

const navItems = [
  { href: '/dashboard', label: 'Panel Principal', icon: HiOutlineViewGrid },
  { href: '/projects', label: 'Proyectos', icon: HiOutlineFolder },
  { href: '/habits', label: 'Hábitos', icon: HiOutlineRefresh },
  { href: '/profile', label: 'Perfil', icon: HiOutlineUser },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleNavClick = () => {
    // Close mobile sidebar on navigation
    if (mobileSidebarOpen) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${sidebarOpen ? 'w-64' : 'md:w-20 w-64'}
        `}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-800">
          {sidebarOpen && (
            <h1 className="text-lg font-bold" style={{ color: 'var(--sidebar-text)' }}>
              TaskManager
            </h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-indigo-800 transition-colors hidden md:block"
            style={{ color: 'var(--sidebar-text)' }}
          >
            {sidebarOpen ? <HiOutlineChevronLeft size={20} /> : <HiOutlineChevronRight size={20} />}
          </button>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-indigo-800 transition-colors md:hidden"
            style={{ color: 'var(--sidebar-text)' }}
          >
            <HiOutlineChevronLeft size={20} />
          </button>
        </div>

        {/* User info */}
        {(sidebarOpen || mobileSidebarOpen) && user && (
          <div className="p-4 border-b border-indigo-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--sidebar-text)' }}>
                  {user.full_name}
                </p>
                <p className="text-xs truncate" style={{ color: '#a5b4fc' }}>
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-700 text-white'
                    : 'hover:bg-indigo-800'
                }`}
                style={{ color: isActive ? 'white' : 'var(--sidebar-text)' }}
                title={item.label}
              >
                <item.icon size={22} />
                {(sidebarOpen || mobileSidebarOpen) && <span className="text-sm font-medium md:hidden">{item.label}</span>}
                {sidebarOpen && <span className="text-sm font-medium hidden md:inline">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-indigo-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-red-600/20 transition-colors"
            style={{ color: '#fca5a5' }}
            title="Cerrar sesión"
          >
            <HiOutlineLogout size={22} />
            {(sidebarOpen || mobileSidebarOpen) && <span className="text-sm font-medium md:hidden">Cerrar sesión</span>}
            {sidebarOpen && <span className="text-sm font-medium hidden md:inline">Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
