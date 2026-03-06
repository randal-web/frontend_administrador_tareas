'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useProjectStore } from '@/stores/projectStore';
import { useHabitStore } from '@/stores/habitStore';
import {
  HiOutlineViewGrid,
  HiOutlineCalendar,
  HiOutlineFolder,
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlineCog,
  HiOutlineChevronLeft,
  HiOutlineChevronDown,
  HiOutlineSearch,
} from 'react-icons/hi';

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const { projects } = useProjectStore();
  const { habits } = useHabitStore();

  const handleNavClick = () => {
    if (mobileSidebarOpen) setMobileSidebarOpen(false);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navLinkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
      isActive(href)
        ? 'text-[var(--sidebar-active-text)]'
        : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]'
    }`;

  const navLinkStyle = (href: string) =>
    isActive(href) ? { backgroundColor: 'var(--sidebar-active)' } : {};

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 border-r
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${sidebarOpen ? 'w-[220px]' : 'md:w-[220px] w-[220px]'}
        `}
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
      >
        {/* Workspace Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.full_name?.charAt(0).toUpperCase() || 'T'}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                  {user?.full_name || 'TaskFlow'}
                </span>
                <HiOutlineChevronDown size={12} className="text-gray-400 flex-shrink-0" />
              </div>
              <p className="text-[11px] text-gray-400 truncate">Workspace</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] text-gray-400 cursor-pointer hover:bg-[var(--sidebar-hover)] transition-colors"
            style={{ border: '1px solid var(--sidebar-border)' }}
          >
            <HiOutlineSearch size={14} />
            <span className="flex-1">Buscar</span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-400 bg-gray-50">⌘K</kbd>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          {/* PRINCIPAL */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-section)] px-3 mb-1.5 mt-2">
              Principal
            </p>
            <Link href="/dashboard" onClick={handleNavClick} className={navLinkClass('/dashboard')} style={navLinkStyle('/dashboard')}>
              <HiOutlineViewGrid size={16} />
              Dashboard
            </Link>
            <Link href="/dashboard" onClick={handleNavClick} className={navLinkClass('/today')} style={navLinkStyle('/today')}>
              <HiOutlineCalendar size={16} />
              Hoy
            </Link>
          </div>

          {/* GESTIÓN */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-section)] px-3 mb-1.5">
              Gestión
            </p>
            <Link href="/projects" onClick={handleNavClick} className={navLinkClass('/projects')} style={navLinkStyle('/projects')}>
              <HiOutlineFolder size={16} />
              <span className="flex-1">Proyectos</span>
              {projects.length > 0 && (
                <span className="text-[11px] text-gray-400 font-normal">{projects.length}</span>
              )}
            </Link>
            <Link href="/habits" onClick={handleNavClick} className={navLinkClass('/habits')} style={navLinkStyle('/habits')}>
              <HiOutlineRefresh size={16} />
              <span className="flex-1">Hábitos</span>
              {habits.length > 0 && (
                <span className="text-[11px] text-gray-400 font-normal">{habits.length}</span>
              )}
            </Link>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-gray-300 cursor-default">
              <HiOutlineDocumentText size={16} />
              <span className="flex-1">Notas</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">Pronto</span>
            </div>
          </div>

          {/* CONFIGURACIÓN */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-section)] px-3 mb-1.5">
              Configuración
            </p>
            <Link href="/profile" onClick={handleNavClick} className={navLinkClass('/profile')} style={navLinkStyle('/profile')}>
              <HiOutlineCog size={16} />
              Ajustes
            </Link>
          </div>
        </nav>

        {/* Collapse button */}
        <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={() => {
              toggleSidebar();
              if (mobileSidebarOpen) setMobileSidebarOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors w-full"
          >
            <HiOutlineChevronLeft size={14} />
            <span className="hidden md:inline">Colapsar</span>
            <span className="md:hidden">Cerrar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
