'use client';

import { useEffect, useState } from 'react';
import { useHabitStore } from '@/stores/habitStore';
import { Habit } from '@/types';
import { format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiCheck, HiX } from 'react-icons/hi';

const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
// dayIndex: 0=Mon, 1=Tue, ..., 6=Sun (matches backend)
const dayIndices = [0, 1, 2, 3, 4, 5, 6];

const colors = [
  '#6366f1', '#3b82f6', '#06b6d4', '#22c55e', '#eab308',
  '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6',
];

export default function HabitsPage() {
  const { habits, weeklyHabits, fetchHabits, fetchWeeklyHabits, createHabit, updateHabit, deleteHabit, toggleLog, isLoading: loading } = useHabitStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [form, setForm] = useState({ name: '', description: '', frequency: [...dayIndices] as number[], color: '#6366f1' });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchHabits();
    fetchWeeklyHabits();
  }, [fetchHabits, fetchWeeklyHabits]);

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
    fetchWeeklyHabits();
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm('¿Eliminar este hábito?')) return;
    await deleteHabit(habitId);
    fetchWeeklyHabits();
  };

  const handleToggle = async (habitId: string, date: string) => {
    await toggleLog(habitId, date);
    fetchWeeklyHabits();
  };

  const toggleDay = (dayIdx: number) => {
    setForm(prev => ({
      ...prev,
      frequency: prev.frequency.includes(dayIdx)
        ? prev.frequency.filter(d => d !== dayIdx)
        : [...prev.frequency, dayIdx],
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Hábitos</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Semana del {format(weekStart, "d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <HiOutlinePlus size={18} />
          Nuevo hábito
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Table Header */}
        <div className="grid items-center border-b px-4 py-3" style={{
          gridTemplateColumns: '1fr repeat(7, 48px) 64px',
          borderColor: 'var(--border)',
          backgroundColor: 'var(--secondary)',
        }}>
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--muted)' }}>Hábito</span>
          {weekDates.map((date, i) => {
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
            return (
              <div key={i} className={`text-center ${isToday ? 'font-bold' : ''}`}>
                <div className="text-[10px] uppercase" style={{ color: 'var(--muted)' }}>{dayLabels[i]}</div>
                <div className={`text-xs mt-0.5 ${isToday ? 'text-indigo-600 font-bold' : ''}`}>
                  {format(date, 'd')}
                </div>
              </div>
            );
          })}
          <span></span>
        </div>

        {/* Habit Rows */}
        {weeklyHabits.length === 0 && !loading && (
          <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
            <p className="text-sm">No tienes hábitos aún.</p>
            <p className="text-xs mt-1">Crea uno para empezar a hacer seguimiento.</p>
          </div>
        )}
        {weeklyHabits.map(habit => (
          <div key={habit.id} className="grid items-center border-b last:border-0 px-4 py-3 hover:bg-gray-50/50 transition-colors" style={{
            gridTemplateColumns: '1fr repeat(7, 48px) 64px',
            borderColor: 'var(--border)',
          }}>
            {/* Habit Name */}
            <div>
              <span className="text-sm font-medium">{habit.name}</span>
              {habit.description && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{habit.description}</p>
              )}
            </div>

            {/* Day Checkboxes */}
            {(habit.week || []).map((day) => {
              const isScheduled = habit.frequency.includes(day.dayIndex);
              const completed = day.is_completed;
              const dateStr = day.date;

              if (!isScheduled) {
                return <div key={dateStr} className="flex justify-center"><span className="text-gray-200">—</span></div>;
              }

              return (
                <div key={dateStr} className="flex justify-center">
                  <button
                    onClick={() => handleToggle(habit.id, dateStr)}
                    className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all ${
                      completed
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {completed && <HiCheck size={14} />}
                  </button>
                </div>
              );
            })}

            {/* Actions */}
            <div className="flex items-center justify-end gap-1">
              <button onClick={() => openEdit(habit)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" style={{ color: 'var(--muted)' }}>
                <HiOutlinePencil size={14} />
              </button>
              <button onClick={() => handleDelete(habit.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                <HiOutlineTrash size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Streaks summary */}
      {habits.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-bold">{habits.length}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Hábitos activos</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-bold text-green-600">
              {weeklyHabits.reduce((acc, h) => acc + (h.week || []).filter(d => d.is_completed).length, 0)}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Completados esta semana</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-bold text-amber-600">
              {weeklyHabits.reduce((acc, h) => acc + (h.week || []).filter(d => h.frequency.includes(d.dayIndex) && !d.is_completed).length, 0)}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Pendientes esta semana</p>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-bold text-indigo-600">
              {weeklyHabits.length > 0 ? Math.round(
                (weeklyHabits.reduce((acc, h) => acc + (h.week || []).filter(d => d.is_completed).length, 0) /
                  Math.max(1, weeklyHabits.reduce((acc, h) => acc + (h.week || []).filter(d => h.frequency.includes(d.dayIndex)).length, 0))) * 100
              ) : 0}%
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Cumplimiento</p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setCreateOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
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
                <div className="flex gap-2">
                  {dayLabels.map((label, i) => (
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
                <div className="flex gap-2">
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
    </div>
  );
}
