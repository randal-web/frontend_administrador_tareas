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
  HiOutlineChevronRight,
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
    `flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-0'} py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
      isActive(href)
        ? 'text-white'
        : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]'
    }`;

  const navLinkStyle = (href: string) =>
    isActive(href) ? { backgroundColor: '#000' } : {};

  const badgeClass = (href: string) =>
    `text-[11px] font-medium min-w-[20px] text-center px-1.5 py-0.5 rounded-full ${
      isActive(href)
        ? 'bg-white text-black'
        : 'bg-gray-200 text-gray-500'
    }`;

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 border-r overflow-hidden
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
          width: sidebarOpen ? 220 : 48,
          minWidth: sidebarOpen ? 220 : 48,
          maxWidth: sidebarOpen ? 220 : 48,
        }}
      >
        {/* Workspace Header */}
        <div className={`${sidebarOpen ? 'px-4' : 'px-1'} pt-4 pb-2`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-2.5' : 'justify-center'}`}>
            <div className={`${sidebarOpen ? 'w-8 h-8' : 'w-7 h-7'} rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {user?.full_name?.charAt(0).toUpperCase() || 'T'}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {user?.full_name || 'TaskFlow'}
                  </span>
                  <HiOutlineChevronDown size={12} className="text-gray-400 flex-shrink-0" />
                </div>
                <p className="text-[11px] text-gray-400 truncate">Workspace</p>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        {sidebarOpen && (
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
        )}
        {!sidebarOpen && (
          <div className="hidden md:flex justify-center py-1.5">
            <button className="p-1.5 rounded-lg text-gray-400 hover:bg-[var(--sidebar-hover)] transition-colors">
              <HiOutlineSearch size={15} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className={`flex-1 ${sidebarOpen ? 'px-3' : 'px-1'} overflow-y-auto`}>
          {/* PRINCIPAL */}
          <div className="mb-4">
            {sidebarOpen && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-section)] px-3 mb-1.5 mt-2">
              Principal
            </p>
            )}
            <Link href="/dashboard" onClick={handleNavClick} className={navLinkClass('/dashboard')} style={navLinkStyle('/dashboard')} title={!sidebarOpen ? 'Dashboard' : undefined}>
              <HiOutlineViewGrid size={16} />
              {sidebarOpen && 'Dashboard'}
            </Link>
            <Link href="/dashboard" onClick={handleNavClick} className={navLinkClass('/today')} style={navLinkStyle('/today')} title={!sidebarOpen ? 'Hoy' : undefined}>
              <HiOutlineCalendar size={16} />
              {sidebarOpen && 'Hoy'}
            </Link>
          </div>

          {/* GESTIÓN */}
          <div className="mb-4">
            {sidebarOpen && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-section)] px-3 mb-1.5">
                Gestión
              </p>
            )}
            <Link href="/projects" onClick={handleNavClick} className={navLinkClass('/projects')} style={navLinkStyle('/projects')} title={!sidebarOpen ? 'Proyectos' : undefined}>
              <HiOutlineFolder size={16} />
              {sidebarOpen && (
                <>
                  <span className="flex-1">Proyectos</span>
                  {projects.length > 0 && (
                    <span className={badgeClass('/projects')}>{projects.length}</span>
                  )}
                </>
              )}
            </Link>
            <Link href="/habits" onClick={handleNavClick} className={navLinkClass('/habits')} style={navLinkStyle('/habits')} title={!sidebarOpen ? 'Hábitos' : undefined}>
              <HiOutlineRefresh size={16} />
              {sidebarOpen && (
                <>
                  <span className="flex-1">Hábitos</span>
                  {habits.length > 0 && (
                    <span className={badgeClass('/habits')}>{habits.length}</span>
                  )}
                </>
              )}
            </Link>
            {sidebarOpen ? (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-gray-300 cursor-default">
                <HiOutlineDocumentText size={16} />
                <span className="flex-1">Notas</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">Pronto</span>
              </div>
            ) : (
              <div className="hidden md:flex justify-center py-1.5 text-gray-300" title="Notas (Pronto)">
                <HiOutlineDocumentText size={15} />
              </div>
            )}
          </div>

          {/* CONFIGURACIÓN */}
          <div className="mb-4">
            {sidebarOpen && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-section)] px-3 mb-1.5">
                Configuración
              </p>
            )}
            <Link href="/profile" onClick={handleNavClick} className={navLinkClass('/profile')} style={navLinkStyle('/profile')} title={!sidebarOpen ? 'Ajustes' : undefined}>
              <HiOutlineCog size={16} />
              {sidebarOpen && 'Ajustes'}
            </Link>
          </div>
        </nav>

        {/* Collapse button */}
        <div className={`${sidebarOpen ? 'px-3' : 'px-1'} py-3 border-t`} style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={() => {
              toggleSidebar();
              if (mobileSidebarOpen) setMobileSidebarOpen(false);
            }}
            className={`flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center'} py-1.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors w-full`}
          >
            {sidebarOpen ? <HiOutlineChevronLeft size={14} /> : <HiOutlineChevronRight size={14} />}
            {sidebarOpen && <span className="hidden md:inline">Colapsar</span>}
            {sidebarOpen && <span className="md:hidden">Cerrar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
