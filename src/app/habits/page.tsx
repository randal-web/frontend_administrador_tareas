'use client';

import { useEffect, useState, useMemo } from 'react';
import { useHabitStore } from '@/stores/habitStore';
import { useUIStore } from '@/stores/uiStore';
import { Habit, WeekDay } from '@/types';
import { format, startOfWeek, addDays, addWeeks, isBefore, isAfter, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiCheck, HiX, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';

const dayLabelsShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const dayLabelsFull = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const dayIndices = [0, 1, 2, 3, 4, 5, 6];

const colors = [
  '#6366f1', '#3b82f6', '#06b6d4', '#22c55e', '#eab308',
  '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6',
];

export default function HabitsPage() {
  const { habits, weeklyHabits, fetchHabits, fetchWeeklyHabits, createHabit, updateHabit, deleteHabit, toggleLog, isLoading: loading } = useHabitStore();
  const { searchTerm } = useUIStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [form, setForm] = useState({ name: '', description: '', frequency: [...dayIndices] as number[], color: '#6366f1' });
  const [weekOffset, setWeekOffset] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const today = new Date();
  const currentWeekStart = startOfWeek(addWeeks(today, weekOffset), { weekStartsOn: 1 });
  const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd');
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const isCurrentWeek = weekOffset === 0;

  useEffect(() => {
    fetchHabits();
    fetchWeeklyHabits(weekStartStr);
  }, [fetchHabits, fetchWeeklyHabits, weekStartStr]);

  const filteredWeeklyHabits = useMemo(() => {
    if (!searchTerm) return weeklyHabits;
    return weeklyHabits.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [weeklyHabits, searchTerm]);

  const openCreate = () => {
    setForm({ name: '', description: '', frequency: [...dayIndices], color: '#6366f1' });
    setEditingHabit(null);
    setCreateOpen(true);
  };

  const openEdit = (habit: Habit) => {
    setForm({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency,
      color: (habit as unknown as Record<string, unknown>).color as string || '#6366f1',
    });
    setEditingHabit(habit);
    setCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.frequency.length === 0) return;
    if (editingHabit) {
      await updateHabit(editingHabit.id, { name: form.name, description: form.description, frequency: form.frequency });
    } else {
      await createHabit({ name: form.name, description: form.description, frequency: form.frequency });
    }
    setCreateOpen(false);
    fetchWeeklyHabits(weekStartStr);
  };

  const handleDelete = (habitId: string) => {
    setConfirmDeleteId(habitId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteHabit(confirmDeleteId);
    setConfirmDeleteId(null);
    fetchWeeklyHabits(weekStartStr);
  };

  const handleToggle = async (habitId: string, date: string) => {
    await toggleLog(habitId, date);
    fetchWeeklyHabits(weekStartStr);
  };

  const toggleDay = (dayIdx: number) => {
    setForm(prev => ({
      ...prev,
      frequency: prev.frequency.includes(dayIdx)
        ? prev.frequency.filter(d => d !== dayIdx)
        : [...prev.frequency, dayIdx],
    }));
  };

  // Compute streak for a habit (consecutive days completed backwards from today)
  const getStreak = (habit: { week?: WeekDay[] }) => {
    const completedCount = (habit.week || []).filter(d => d.is_completed).length;
    return completedCount;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hábitos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Gestiona tus hábitos diarios</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-white"
          style={{ backgroundColor: 'var(--foreground)' }}
        >
          <HiOutlinePlus size={16} />
          Nuevo Hábito
        </button>
      </div>

      {/* Week Navigation + Day Headers */}
      <div className="rounded-xl border p-3 sm:p-4 mb-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: 'var(--foreground)' }}
          >
            <HiOutlineChevronLeft size={14} />
            <span className="hidden sm:inline">Semana anterior</span>
            <span className="sm:hidden">Anterior</span>
          </button>
          <span className="text-sm font-semibold">
            {isCurrentWeek ? 'Esta semana' : `Semana del ${format(currentWeekStart, "d 'de' MMMM", { locale: es })}`}
          </span>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="flex items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: 'var(--foreground)' }}
          >
            <span className="hidden sm:inline">Semana siguiente</span>
            <span className="sm:hidden">Siguiente</span>
            <HiOutlineChevronRight size={14} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4">
          <div className="grid items-center min-w-[500px]" style={{ gridTemplateColumns: '120px repeat(7, 1fr)' }}>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Hábito</span>
            {weekDates.map((date, i) => {
              const isToday = isSameDay(date, today);
              return (
                <div key={i} className="text-center">
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{dayLabelsShort[i]}</div>
                  <div className="mt-0.5">
                    {isToday ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white bg-black">
                        {format(date, 'd')}
                      </span>
                    ) : (
                      <span className="text-sm">{format(date, 'd')}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Habit Rows */}
      {weeklyHabits.length === 0 && !loading && (
        <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
          <p className="text-sm">No tienes hábitos aún.</p>
          <p className="text-xs mt-1">Crea uno para empezar a hacer seguimiento.</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredWeeklyHabits.map(habit => {
          const streak = getStreak(habit);
          const scheduledThisWeek = (habit.week || []).filter(d => habit.frequency.includes(d.dayIndex)).length;
          const completedThisWeek = (habit.week || []).filter(d => habit.frequency.includes(d.dayIndex) && d.is_completed).length;

          return (
            <div
              key={habit.id}
              className="rounded-xl border p-4 group/card"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              {/* Main row: name + day indicators */}
              <div className="overflow-x-auto -mx-4 px-4">
                <div className="grid items-center min-w-[500px]" style={{ gridTemplateColumns: '120px repeat(7, 1fr)' }}>
                  {/* Habit info */}
                  <div className="pr-3">
                    <h3 className="text-sm font-bold leading-tight">{habit.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs">🔥</span>
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>{streak} días</span>
                    </div>
                  </div>

                {/* Day indicators */}
                {(habit.week || []).map((day) => {
                  const isScheduled = habit.frequency.includes(day.dayIndex);
                  const completed = day.is_completed;
                  const dayDate = new Date(day.date + 'T12:00:00');
                  const isToday = isSameDay(dayDate, today);
                  const isPast = isBefore(dayDate, today) && !isToday;
                  const isFuture = isAfter(dayDate, today);

                  if (!isScheduled) {
                    return (
                      <div key={day.date} className="flex justify-center">
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>-</span>
                      </div>
                    );
                  }

                  if (completed) {
                    // Green filled square with checkmark
                    return (
                      <div key={day.date} className="flex justify-center">
                        <button
                          onClick={() => handleToggle(habit.id, day.date)}
                          className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                        >
                          <HiCheck size={16} strokeWidth={2} />
                        </button>
                      </div>
                    );
                  }

                  if (isToday) {
                    // Blue outline circle — today not yet completed
                    return (
                      <div key={day.date} className="flex justify-center">
                        <button
                          onClick={() => handleToggle(habit.id, day.date)}
                          className="w-8 h-8 rounded-full border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 transition-colors"
                        />
                      </div>
                    );
                  }

                  if (isPast) {
                    // Pink/salmon circle — missed
                    return (
                      <div key={day.date} className="flex justify-center">
                        <button
                          onClick={() => handleToggle(habit.id, day.date)}
                          className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                        />
                      </div>
                    );
                  }

                  // Gray circle — future
                  return (
                    <div key={day.date} className="flex justify-center">
                      <button
                        onClick={() => handleToggle(habit.id, day.date)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      />
                    </div>
                  );
                })}
                </div>
              </div>

              {/* Bottom row: assigned days + actions + weekly progress */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px]" style={{ color: 'var(--muted)' }}>Días asignados:</span>
                  <div className="flex gap-1.5">
                    {dayLabelsShort.map((label, i) => (
                      habit.frequency.includes(i) ? (
                        <span key={i} className="text-[11px] font-semibold">{label}</span>
                      ) : null
                    ))}
                  </div>
                  {/* Edit/Delete on hover */}
                  <div className="flex gap-0.5 ml-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(habit)} className="p-1 rounded hover:bg-gray-100 transition-colors" style={{ color: 'var(--muted)' }}>
                      <HiOutlinePencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(habit.id)} className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors">
                      <HiOutlineTrash size={13} />
                    </button>
                  </div>
                </div>
                <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
                  {completedThisWeek}/{scheduledThisWeek} esta semana
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setCreateOpen(false)}>
          <div className="rounded-2xl shadow-xl w-full max-w-md mx-4 sm:mx-auto p-6" style={{ backgroundColor: 'var(--card)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingHabit ? 'Editar hábito' : 'Nuevo hábito'}</h2>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <HiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="Ej. Meditar, Leer, Ejercicio..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="Opcional..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Días de la semana *</label>
                <div className="flex flex-wrap gap-2">
                  {dayLabelsFull.map((label, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`w-10 h-10 rounded-lg text-xs font-medium border transition-colors ${
                        form.frequency.includes(i)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {form.frequency.length === 0 && <p className="text-xs text-red-500 mt-1">Selecciona al menos un día</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, color: c }))}
                      className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: form.color === c ? '#1e1b4b' : 'transparent',
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg text-sm border" style={{ borderColor: 'var(--border)' }}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {editingHabit ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="¿Eliminar este hábito?"
        message="Se perderá todo el historial. Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
