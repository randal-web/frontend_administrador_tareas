'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { useNoteStore } from '@/stores/noteStore';
import { useHabitStore } from '@/stores/habitStore';
import { useReminderStore } from '@/stores/reminderStore';
import { useProjectStore } from '@/stores/projectStore';
import {
  HiOutlineSearch,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineStar,
  HiOutlineCalendar,
  HiOutlineFolder,
  HiOutlineX,
} from 'react-icons/hi';

export default function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen, searchTerm, setSearchTerm } = useUIStore();
  
  const { tasks } = useTaskStore();
  const { notes } = useNoteStore();
  const { habits } = useHabitStore();
  const { reminders } = useReminderStore();
  const { projects } = useProjectStore();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMac = typeof window !== 'undefined' && (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.toUpperCase().indexOf('MAC') >= 0);

  useEffect(() => {
    if (isSearchOpen) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const results = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();

    const filtered = [
      ...tasks.filter(t => t.title.toLowerCase().includes(term)).map(t => ({ id: t.id, title: t.title, type: 'task', icon: HiOutlineCheckCircle, url: '/dashboard', color: '#106AFF' })),
      ...notes.filter(n => n.title.toLowerCase().includes(term) || n.content?.toLowerCase().includes(term)).map(n => ({ id: n.id, title: n.title, type: 'note', icon: HiOutlineDocumentText, url: '/notes', color: '#7c3aed' })),
      ...habits.filter(h => h.name.toLowerCase().includes(term)).map(h => ({ id: h.id, title: h.name, type: 'habit', icon: HiOutlineStar, url: '/habits', color: '#eab308' })),
      ...reminders.filter(r => r.title.toLowerCase().includes(term)).map(r => ({ id: r.id, title: r.title, type: 'reminder', icon: HiOutlineCalendar, url: '/reminders', color: '#ea580c' })),
      ...projects.filter(p => p.name.toLowerCase().includes(term)).map(p => ({ id: p.id, title: p.name, type: 'project', icon: HiOutlineFolder, url: `/projects`, color: p.color_hex || '#6366f1' })),
    ];

    return filtered.slice(0, 10);
  }, [searchTerm, tasks, notes, habits, reminders, projects]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  const handleSelect = (result: any) => {
    setIsSearchOpen(false);
    setSearchTerm('');
    router.push(result.url);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsSearchOpen(false)} />

      {/* Modal content */}
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-50 bg-gray-50/30">
          <HiOutlineSearch size={20} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en todo el sistema..."
            className="flex-1 bg-transparent border-none outline-none text-base placeholder-gray-400 text-gray-800"
          />
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 text-[10px] text-gray-400 bg-white whitespace-nowrap">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </kbd>
            <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
              <HiOutlineX size={18} />
            </button>
          </div>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto p-2" ref={scrollRef}>
          {!searchTerm || searchTerm.length < 2 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">Escribe al menos 2 caracteres para buscar...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No se encontraron resultados para "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((result, index) => {
                const Icon = result.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                      isSelected ? 'bg-indigo-50 shadow-sm' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${result.color}15`, color: result.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {result.title}
                      </p>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                        {result.type === 'task' ? 'Tarea' : result.type === 'note' ? 'Nota' : result.type === 'habit' ? 'Hábito' : result.type === 'reminder' ? 'Pendiente' : 'Proyecto'}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-indigo-400 animate-pulse">ENTER</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1 rounded border bg-white">↑↓</kbd> Navegar</span>
            <span className="flex items-center gap-1"><kbd className="px-1 rounded border bg-white">↵</kbd> Abrir</span>
            <span className="hidden sm:flex items-center gap-1 ml-2">
              <kbd className="px-1 rounded border bg-white">{isMac ? '⌘K' : 'Ctrl+K'}</kbd> para buscar
            </span>
          </div>
          <span>Búsqueda Global</span>
        </div>
      </div>
    </div>
  );
}