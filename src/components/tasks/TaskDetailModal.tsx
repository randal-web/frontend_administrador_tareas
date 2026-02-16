'use client';

import { useEffect, useState } from 'react';
import { Task } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { HiOutlineX, HiOutlineCheck, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: 'TODO', label: 'Por hacer' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'REVIEW', label: 'Revisión' },
  { value: 'DONE', label: 'Hecha' },
];

export default function TaskDetailModal({ taskId, isOpen, onClose }: TaskDetailModalProps) {
  const { currentTask, fetchTask, toggleSubtask, addSubtask, deleteSubtask, addComment, deleteComment, toggleStatus, deleteTask } = useTaskStore();
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (taskId && isOpen) {
      fetchTask(taskId);
    }
  }, [taskId, isOpen, fetchTask]);

  if (!isOpen || !currentTask) return null;

  const handleAddSubtask = async () => {
    if (newSubtask.trim() && taskId) {
      await addSubtask(taskId, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() && taskId) {
      await addComment(taskId, newComment.trim());
      setNewComment('');
    }
  };

  const handleDelete = async () => {
    if (taskId && confirm('¿Estás seguro de eliminar esta tarea?')) {
      await deleteTask(taskId);
      onClose();
    }
  };

  const priorityColors: Record<string, string> = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-2xl rounded-xl shadow-xl border max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">{currentTask.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 text-red-500"
              title="Eliminar tarea"
            >
              <HiOutlineTrash size={18} />
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
              <HiOutlineX size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Description */}
          {currentTask.description && (
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Descripción</h3>
              <p className="text-sm">{currentTask.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--secondary)' }}>
              <span className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Prioridad</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColors[currentTask.priority] }} />
                {currentTask.priority === 'HIGH' ? 'Alta' : currentTask.priority === 'MEDIUM' ? 'Media' : 'Baja'}
              </span>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--secondary)' }}>
              <span className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Categoría</span>
              <span className="text-sm font-medium">
                {currentTask.category === 'PERSONAL' ? 'Personal' : currentTask.category === 'WORK' ? 'Trabajo' : 'Proyecto'}
              </span>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--secondary)' }}>
              <span className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Inicio</span>
              <span className="text-sm font-medium">{currentTask.start_date || '—'}</span>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--secondary)' }}>
              <span className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Fin</span>
              <span className="text-sm font-medium">{currentTask.end_date || '—'}</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Estado</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => taskId && toggleStatus(taskId, opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentTask.status === opt.value
                      ? 'text-white'
                      : 'border'
                  }`}
                  style={{
                    backgroundColor: currentTask.status === opt.value ? 'var(--primary)' : 'transparent',
                    borderColor: 'var(--border)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project */}
          {currentTask.project && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Proyecto:</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: currentTask.project.color_hex }}
              >
                {currentTask.project.name}
              </span>
            </div>
          )}

          {/* Subtasks */}
          <div>
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
              Subtareas ({currentTask.subtasks?.filter(s => s.is_completed).length || 0}/{currentTask.subtasks?.length || 0})
            </h3>
            <div className="space-y-1">
              {currentTask.subtasks?.map(st => (
                <div key={st.id} className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50">
                  <button
                    onClick={() => taskId && toggleSubtask(taskId, st.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      st.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}
                  >
                    {st.is_completed && <HiOutlineCheck size={10} className="text-white" />}
                  </button>
                  <span className={`text-sm flex-1 ${st.is_completed ? 'line-through opacity-50' : ''}`}>
                    {st.title}
                  </span>
                  <button
                    onClick={() => taskId && deleteSubtask(taskId, st.id)}
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                  >
                    <HiOutlineTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex-1 px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: 'var(--border)' }}
                placeholder="Nueva subtarea..."
              />
              <button
                onClick={handleAddSubtask}
                className="p-1.5 rounded-lg text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <HiOutlinePlus size={16} />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Comentarios</h3>
            <div className="space-y-2">
              {currentTask.comments?.map(c => (
                <div key={c.id} className="p-2 rounded-lg text-sm flex justify-between items-start" style={{ backgroundColor: 'var(--secondary)' }}>
                  <div>
                    <p>{c.content}</p>
                    <span className="text-xs mt-1 block" style={{ color: 'var(--muted)' }}>
                      {new Date(c.created_at).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <button
                    onClick={() => taskId && deleteComment(taskId, c.id)}
                    className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0"
                  >
                    <HiOutlineTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: 'var(--border)' }}
                placeholder="Agregar comentario..."
              />
              <button
                onClick={handleAddComment}
                className="px-3 py-1.5 rounded-lg text-white text-sm"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
