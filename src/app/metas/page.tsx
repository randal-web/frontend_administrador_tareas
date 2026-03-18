'use client';

import { useEffect, useState, useMemo } from 'react';
import { useGoalStore } from '@/stores/goalStore';
import { useUIStore } from '@/stores/uiStore';
import { Goal } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineFlag, HiX, HiOutlineCalendar } from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';

export default function GoalsPage() {
  const { goals, fetchGoals, createGoal, updateGoal, deleteGoal, toggleGoal, isMutating } = useGoalStore();
  const { searchTerm } = useUIStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: '', description: '', target_date: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const filteredGoals = useMemo(() => {
    let base = goals;
    if (searchTerm) {
      base = base.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return base;
  }, [goals, searchTerm]);

  const openCreate = () => {
    setForm({ title: '', description: '', target_date: '' });
    setEditingGoal(null);
    setCreateOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setForm({
      title: goal.title,
      description: goal.description || '',
      target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
    });
    setEditingGoal(goal);
    setCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingGoal) {
      await updateGoal(editingGoal.id, form);
    } else {
      await createGoal(form);
    }
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteGoal(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Metas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Tus objetivos a corto y largo plazo</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95 text-white w-full sm:w-auto"
          style={{ backgroundColor: 'var(--foreground)' }}
        >
          <HiOutlinePlus size={18} />
          Nueva Meta
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 sm:py-24 rounded-3xl border-2 border-dashed bg-white/50" style={{ borderColor: 'var(--border)' }}>
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineFlag size={40} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Define tu próximo gran paso</h2>
          <p className="text-sm text-gray-500 mb-8 max-w-xs mx-auto">Los objetivos claros son el primer paso para convertir lo invisible en visible.</p>
          <Button onClick={openCreate} className="rounded-xl px-8">Empezar ahora</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredGoals.map(goal => (
            <div
              key={goal.id}
              className={`rounded-2xl border p-4 sm:p-5 group transition-all duration-200 ${goal.is_completed ? 'bg-gray-50/80 border-transparent opacity-75' : 'bg-white hover:border-blue-200 hover:shadow-xl shadow-sm'}`}
              style={!goal.is_completed ? { borderColor: 'var(--border)' } : {}}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleGoal(goal.id)}
                  className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${goal.is_completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 hover:border-blue-500 bg-white'}`}
                >
                  {goal.is_completed && <HiOutlineCheck size={14} strokeWidth={3} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base sm:text-lg font-bold truncate ${goal.is_completed ? 'text-gray-400 line-through decoration-2' : 'text-gray-900'}`}>
                    {goal.title}
                  </h3>
                  
                  {goal.description && (
                    <p className={`text-sm mt-1 line-clamp-2 ${goal.is_completed ? 'text-gray-300' : 'text-gray-500'}`}>
                      {goal.description}
                    </p>
                  )}
                  
                  {goal.target_date && !isNaN(new Date(goal.target_date).getTime()) && (
                    <div className="flex items-center gap-2 mt-3 inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider">
                      <HiOutlineCalendar size={14} />
                      {format(new Date(goal.target_date.includes('T') ? goal.target_date : goal.target_date + 'T12:00:00'), "d 'de' MMM, yyyy", { locale: es })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEdit(goal)} 
                    className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Editar"
                  >
                    <HiOutlinePencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(goal.id)} 
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setCreateOpen(false)}>
          <div className="rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingGoal ? 'Editar meta' : 'Nueva meta'}</h2>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <HiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <input
                  autoFocus
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="Ej. Aprender Next.js, Ahorrar para viaje..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm min-h-[80px]"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="Detalles sobre tu meta..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fecha objetivo</label>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={e => setForm(prev => ({ ...prev, target_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setCreateOpen(false)} variant="outline">
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isMutating}>
                  {editingGoal ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="¿Eliminar esta meta?"
        message="Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
