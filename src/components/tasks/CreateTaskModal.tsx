'use client';

import { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { HiOutlineX } from 'react-icons/hi';
import { Button } from '@/components/ui/Button';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export default function CreateTaskModal({ isOpen, onClose, defaultDate }: CreateTaskModalProps) {
  const { createTask, isMutating } = useTaskStore();
  const { projects } = useProjectStore();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: defaultDate || new Date().toISOString().split('T')[0],
    end_date: '',
    priority: 'MEDIUM' as TaskPriority,
    category: 'PERSONAL' as TaskCategory,
    project_id: '',
    subtasks: [] as { title: string }[],
  });
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, start_date: defaultDate || new Date().toISOString().split('T')[0] }));
      setError('');
    }
  }, [isOpen, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createTask({
        ...formData,
        project_id: formData.project_id || null,
        end_date: formData.end_date || null,
        category: formData.project_id ? 'PROJECT' : formData.category,
      });
      onClose();
      setFormData({
        title: '',
        description: '',
        start_date: defaultDate || new Date().toISOString().split('T')[0],
        end_date: '',
        priority: 'MEDIUM',
        category: 'PERSONAL',
        project_id: '',
        subtasks: [],
      });
    } catch {
      setError('Error al crear la tarea. Inténtalo de nuevo.');
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, { title: newSubtask.trim() }],
      }));
      setNewSubtask('');
    }
  };

  const removeSubtask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-lg rounded-xl shadow-xl border max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">Crear nueva tarea</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <HiOutlineX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la tarea *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ borderColor: 'var(--border)' }}
              placeholder="Ej: Revisar informe mensual"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              style={{ borderColor: 'var(--border)' }}
              rows={3}
              placeholder="Detalles de la tarea..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de inicio</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de fin</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: 'var(--border)' }}
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: 'var(--border)' }}
              >
                <option value="PERSONAL">Personal</option>
                <option value="WORK">Trabajo</option>
                <option value="PROJECT">Proyecto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">¿Pertenece a un proyecto?</label>
            <select
              value={formData.project_id}
              onChange={(e) => setFormData(prev => ({ ...prev, project_id: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ borderColor: 'var(--border)' }}
            >
              <option value="">Ninguno</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium mb-1">Subtareas</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: 'var(--border)' }}
                placeholder="Agregar subtarea..."
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-3 py-2 text-sm rounded-lg text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                +
              </button>
            </div>
            {formData.subtasks.map((st, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className="flex-1 text-sm">{st.title}</span>
                <button type="button" onClick={() => removeSubtask(i)} className="text-red-500 text-sm">
                  <HiOutlineX size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isMutating}
              fullWidth
            >
              Crear tarea
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
