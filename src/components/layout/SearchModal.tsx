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
  
  const { tasks, openTaskDetail } = useTaskStore();
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
    
    if (result.type === 'task') {
      openTaskDetail(result.id);
    } else {
      router.push(result.url);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center sm:pt-[10vh] px-0 sm:px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />

      {/* Modal content */}
      <div 
        className="relative w-full max-w-2xl h-full sm:h-auto bg-white sm:rounded-2xl shadow-2xl border-x sm:border border-gray-100 overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Input area */}
        <div className="flex items-center gap-3 px-4 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
          <HiOutlineSearch size={22} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="¿Qué estás buscando?"
            className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg placeholder-gray-400 text-gray-800"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-gray-200 text-[10px] text-gray-400 bg-white whitespace-nowrap">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </kbd>
            <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
              <HiOutlineX size={20} />
            </button>
          </div>
        </div>

        {/* Results area */}
        <div className="flex-1 sm:max-h-[60vh] overflow-y-auto p-2 sm:p-3 bg-white" ref={scrollRef}>
          {!searchTerm || searchTerm.length < 2 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <HiOutlineSearch size={32} />
              </div>
              <p className="text-sm font-medium text-gray-400">Escribe para buscar tareas, notas...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-gray-400 font-medium">No hay resultados para "{searchTerm}"</p>
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
                    className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-xl text-left transition-all ${
                      isSelected ? 'bg-indigo-50/80 shadow-sm ring-1 ring-indigo-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: `${result.color}15`, color: result.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                        {result.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                          {result.type === 'task' ? 'Tarea' : result.type === 'note' ? 'Nota' : result.type === 'habit' ? 'Hábito' : result.type === 'reminder' ? 'Pendiente' : 'Proyecto'}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="hidden sm:inline-block text-[10px] font-black text-indigo-400">ENTER</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="hidden sm:flex px-5 py-3 bg-gray-50 border-t border-gray-100 items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border bg-white shadow-sm">↑↓</kbd> Navegar</span>
            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded border bg-white shadow-sm">↵</kbd> Abrir</span>
            <span className="flex items-center gap-1.5 ml-4">
              <kbd className="px-1.5 py-0.5 rounded border bg-white shadow-sm">{isMac ? '⌘K' : 'Ctrl+K'}</kbd> para buscar
            </span>
          </div>
          <span className="text-indigo-500">Búsqueda Global</span>
        </div>
      </div>
    </div>
  );
}