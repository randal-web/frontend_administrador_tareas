'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useReminderStore } from '@/stores/reminderStore';
import { Reminder, ReminderType, ReminderPriority } from '@/types';
import {
  HiOutlineFilter,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlineDotsHorizontal,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineFolder,
  HiOutlineArchive,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  BsExclamationCircle,
  BsCameraVideo,
  BsCalendarEvent,
  BsClipboardCheck,
} from 'react-icons/bs';

const typeConfig: Record<ReminderType, { label: string; color: string; bg: string; icon: typeof BsExclamationCircle }> = {
  reminder: { label: 'Recordatorio', color: '#ea580c', bg: '#fff7ed', icon: BsExclamationCircle },
  meeting:  { label: 'Reunión',      color: '#2563eb', bg: '#eff6ff', icon: BsCameraVideo },
  event:    { label: 'Evento',       color: '#16a34a', bg: '#f0fdf4', icon: BsCalendarEvent },
  review:   { label: 'Revisión',     color: '#7c3aed', bg: '#f5f3ff', icon: BsClipboardCheck },
};

const priorityConfig: Record<ReminderPriority, { label: string; color: string; bg: string }> = {
  high:   { label: 'Alta',  color: '#dc2626', bg: '#fef2f2' },
  medium: { label: 'Media', color: '#d97706', bg: '#fffbeb' },
  low:    { label: 'Baja',  color: '#16a34a', bg: '#f0fdf4' },
};

export default function RemindersPage() {
  const { reminders, archivedReminders, isLoading, fetchReminders, fetchArchivedReminders, createReminder, updateReminder, deleteReminder, toggleComplete } = useReminderStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'reminder' as ReminderType,
    priority: 'medium' as ReminderPriority,
    due_date: new Date().toISOString().split('T')[0],
    due_time: '',
    project_name: '',
  });

  useEffect(() => {
    fetchReminders();
    fetchArchivedReminders();
  }, [fetchReminders, fetchArchivedReminders]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  const todayReminders = useMemo(() => reminders.filter(r => r.due_date === today), [reminders, today]);
  const tomorrowReminders = useMemo(() => reminders.filter(r => r.due_date === tomorrow), [reminders, tomorrow]);
  const futureReminders = useMemo(() => reminders.filter(r => r.due_date > tomorrow), [reminders, tomorrow]);

  const openCreate = () => {
    setEditingReminder(null);
    setForm({ title: '', description: '', type: 'reminder', priority: 'medium', due_date: today, due_time: '', project_name: '' });
    setModalOpen(true);
  };

  const openEdit = (r: Reminder) => {
    setEditingReminder(r);
    setForm({
      title: r.title,
      description: r.description || '',
      type: r.type,
      priority: r.priority,
      due_date: r.due_date,
      due_time: r.due_time || '',
      project_name: r.project_name || '',
    });
    setModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.due_date) return;
    const payload = {
      ...form,
      due_time: form.due_time || null,
      project_name: form.project_name || null,
    };
    if (editingReminder) {
      await updateReminder(editingReminder.id, payload);
    } else {
      await createReminder(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
    setOpenMenuId(null);
  };

  const confirmDeleteReminder = async () => {
    if (!confirmDeleteId) return;
    await deleteReminder(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Pendientes</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {reminders.length} pendiente{reminders.length !== 1 ? 's' : ''} activo{reminders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors hover:bg-gray-50" style={{ borderColor: 'var(--border)' }}>
            <HiOutlineFilter size={14} />
            Filtros
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--foreground)' }}
          >
            <HiOutlinePlus size={14} />
            Nuevo Pendiente
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Cargando pendientes...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <HiOutlineCalendar size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No hay pendientes activos</p>
          <button onClick={openCreate} className="mt-3 text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            Crear un pendiente
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* HOY */}
          {todayReminders.length > 0 && (
            <ReminderSection
              title="Hoy"
              count={todayReminders.length}
              countHighlight
              reminders={todayReminders}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              menuRef={menuRef}
              onToggle={toggleComplete}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}

          {/* MAÑANA */}
          {tomorrowReminders.length > 0 && (
            <ReminderSection
              title="Mañana"
              count={tomorrowReminders.length}
              reminders={tomorrowReminders}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              menuRef={menuRef}
              onToggle={toggleComplete}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}

          {/* PRÓXIMOS DÍAS */}
          {futureReminders.length > 0 && (
            <ReminderSection
              title="Próximos días"
              count={futureReminders.length}
              reminders={futureReminders}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              menuRef={menuRef}
              onToggle={toggleComplete}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      {/* Archived Section */}
      {archivedReminders.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 mb-3 group"
          >
            {showArchived ? <HiOutlineChevronDown size={14} className="text-gray-400" /> : <HiOutlineChevronRight size={14} className="text-gray-400" />}
            <HiOutlineArchive size={15} className="text-gray-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Archivados</h2>
            <span className="text-xs font-bold min-w-[22px] text-center px-1.5 py-0.5 rounded-md" style={{ color: 'var(--muted)', backgroundColor: 'var(--border)' }}>
              {archivedReminders.length}
            </span>
          </button>
          {showArchived && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {archivedReminders.map(r => {
                const typeCfg = typeConfig[r.type] || typeConfig.reminder;
                const TypeIcon = typeCfg.icon;
                return (
                  <div key={r.id} className="rounded-xl border p-4 opacity-60" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleComplete(r.id)}
                        className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors border-green-400 bg-green-50"
                        title="Restaurar"
                      >
                        <HiOutlineCheck size={12} className="text-green-500" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ color: typeCfg.color, backgroundColor: typeCfg.bg }}>
                            <TypeIcon size={11} />
                            {typeCfg.label}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[var(--foreground)] mb-0.5 line-through">{r.title}</h3>
                        {r.description && <p className="text-xs text-gray-500 mb-2 line-clamp-1">{r.description}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          {r.due_time && (
                            <div className="flex items-center gap-1 text-gray-400">
                              <HiOutlineClock size={12} />
                              <span className="text-xs">{r.due_time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteReminder(r.id)}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Eliminar permanentemente"
                      >
                        <HiOutlineTrash size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border shadow-2xl p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">{editingReminder ? 'Editar pendiente' : 'Nuevo pendiente'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <HiOutlineX size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-black/10"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  placeholder="Título del pendiente"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-black/10 resize-none"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  placeholder="Descripción..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Tipo</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(prev => ({ ...prev, type: e.target.value as ReminderType }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  >
                    {Object.entries(typeConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Prioridad</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as ReminderPriority }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  >
                    {Object.entries(priorityConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Fecha</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Hora (opcional)</label>
                  <input
                    type="time"
                    value={form.due_time}
                    onChange={e => setForm(prev => ({ ...prev, due_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Proyecto (opcional)</label>
                <input
                  type="text"
                  value={form.project_name}
                  onChange={e => setForm(prev => ({ ...prev, project_name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-black/10"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  placeholder="Nombre del proyecto"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || !form.due_date}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: 'var(--foreground)' }}
              >
                {editingReminder ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="¿Eliminar este pendiente?"
        message="Esta acción no se puede deshacer."
        onConfirm={confirmDeleteReminder}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

/* ---------- Section Component ---------- */

function ReminderSection({
  title,
  count,
  countHighlight,
  reminders,
  openMenuId,
  setOpenMenuId,
  menuRef,
  onToggle,
  onEdit,
  onDelete,
}: {
  title: string;
  count: number;
  countHighlight?: boolean;
  reminders: Reminder[];
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggle: (id: string) => void;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <HiOutlineCalendar size={15} className="text-gray-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{title}</h2>
        <span
          className={`text-xs font-bold min-w-[22px] text-center px-1.5 py-0.5 rounded-md ${
            countHighlight ? 'bg-black text-white' : ''
          }`}
          style={!countHighlight ? { color: 'var(--muted)', backgroundColor: 'var(--border)' } : {}}
        >
          {count}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reminders.map(r => (
          <ReminderCard
            key={r.id}
            reminder={r}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            menuRef={menuRef}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Card Component ---------- */

function ReminderCard({
  reminder,
  openMenuId,
  setOpenMenuId,
  menuRef,
  onToggle,
  onEdit,
  onDelete,
}: {
  reminder: Reminder;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onToggle: (id: string) => void;
  onEdit: (r: Reminder) => void;
  onDelete: (id: string) => void;
}) {
  const typeCfg = typeConfig[reminder.type] || typeConfig.reminder;
  const prioCfg = priorityConfig[reminder.priority] || priorityConfig.medium;
  const TypeIcon = typeCfg.icon;

  return (
    <div className="rounded-xl border p-4 transition-shadow hover:shadow-md" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      {/* Top row: checkbox + tags + menu */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(reminder.id)}
          className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors border-gray-300 hover:border-gray-500"
        >
          {reminder.is_completed && <HiOutlineCheck size={12} className="text-green-500" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Tags */}
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{ color: typeCfg.color, backgroundColor: typeCfg.bg }}
            >
              <TypeIcon size={11} />
              {typeCfg.label}
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{ color: prioCfg.color, backgroundColor: prioCfg.bg }}
            >
              {prioCfg.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-[var(--foreground)] mb-0.5">{reminder.title}</h3>

          {/* Description */}
          {reminder.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{reminder.description}</p>
          )}

          {/* Footer: time + project */}
          <div className="flex items-center gap-3 mt-2">
            {reminder.due_time && (
              <div className="flex items-center gap-1 text-gray-400">
                <HiOutlineClock size={12} />
                <span className="text-xs">{reminder.due_time}</span>
              </div>
            )}
            {reminder.project_name && (
              <div className="flex items-center gap-1 text-gray-400">
                <HiOutlineFolder size={12} />
                <span className="text-xs">{reminder.project_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3-dot menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setOpenMenuId(openMenuId === reminder.id ? null : reminder.id)}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <HiOutlineDotsHorizontal size={16} />
          </button>
          {openMenuId === reminder.id && (
            <div ref={menuRef} className="absolute right-0 top-8 z-50 w-36 rounded-lg border shadow-lg py-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <button onClick={() => onEdit(reminder)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
                <HiOutlinePencil size={13} /> Editar
              </button>
              <button onClick={() => onDelete(reminder.id)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                <HiOutlineTrash size={13} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
