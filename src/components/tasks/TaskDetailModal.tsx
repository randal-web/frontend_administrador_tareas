'use client';

import { useEffect, useState } from 'react';
import { Task, TaskPriority, TaskCategory } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { HiOutlineX, HiOutlineCheck, HiOutlineTrash, HiOutlinePlus, HiOutlinePencil } from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';

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

const priorityOptions = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
];

const categoryOptions = [
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'WORK', label: 'Trabajo' },
  { value: 'PROJECT', label: 'Proyecto' },
];

export default function TaskDetailModal({ taskId, isOpen, onClose }: TaskDetailModalProps) {
  const { currentTask, fetchTask, updateTask, toggleSubtask, addSubtask, deleteSubtask, addComment, deleteComment, toggleStatus, deleteTask } = useTaskStore();
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', priority: 'MEDIUM' as TaskPriority, category: 'PERSONAL' as TaskCategory, start_date: '', end_date: '' });

  useEffect(() => {
    if (taskId && isOpen) {
      fetchTask(taskId);
      setEditing(false);
    }
  }, [taskId, isOpen, fetchTask]);

  if (!isOpen || !currentTask) return null;

  const startEditing = () => {
    setEditData({
      title: currentTask.title,
      description: currentTask.description || '',
      priority: currentTask.priority,
      category: currentTask.category,
      start_date: currentTask.start_date || '',
      end_date: currentTask.end_date || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!taskId || !editData.title.trim()) return;
    await updateTask(taskId, {
      title: editData.title.trim(),
      description: editData.description.trim() || null,
      priority: editData.priority,
      category: editData.category,
      start_date: editData.start_date || null,
      end_date: editData.end_date || null,
    });
    await fetchTask(taskId);
    setEditing(false);
  };

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

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (taskId) {
      await deleteTask(taskId);
      setConfirmDeleteOpen(false);
      onClose();
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!taskId) return;
    await toggleStatus(taskId, status);
  };

  const priorityColors: Record<string, string> = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };
  const inputClass = 'w-full px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-2xl rounded-xl shadow-xl border max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          {editing ? (
            <input
              value={editData.title}
              onChange={e => setEditData(d => ({ ...d, title: e.target.value }))}
              className="text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none flex-1 mr-3"
              autoFocus
            />
          ) : (
            <h2 className="text-lg font-semibold flex-1">{currentTask.title}</h2>
          )}
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} className="px-3 py-1.5 rounded-lg text-white text-xs font-medium" style={{ backgroundColor: 'var(--primary)' }}>Guardar</button>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: 'var(--border)' }}>Cancelar</button>
              </>
            ) : (
              <button onClick={startEditing} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Editar tarea"><HiOutlinePencil size={18} /></button>
            )}
            <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Eliminar tarea"><HiOutlineTrash size={18} /></button>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><HiOutlineX size={20} /></button>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Description */}
          {editing ? (
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Descripción</h3>
              <textarea
                value={editData.description}
                onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                className={inputClass + ' resize-none'}
                style={{ borderColor: 'var(--border)' }}
                rows={3}
                placeholder="Descripción de la tarea..."
              />
            </div>
          ) : currentTask.description ? (
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>Descripción</h3>
              <p className="text-sm">{currentTask.description}</p>
            </div>
          ) : null}

          {/* Details */}
          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Prioridad</label>
                <select value={editData.priority} onChange={e => setEditData(d => ({ ...d, priority: e.target.value as TaskPriority }))} className={inputClass} style={{ borderColor: 'var(--border)' }}>
                  {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Categoría</label>
                <select value={editData.category} onChange={e => setEditData(d => ({ ...d, category: e.target.value as TaskCategory }))} className={inputClass} style={{ borderColor: 'var(--border)' }}>
                  {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Inicio</label>
                <input type="date" value={editData.start_date} onChange={e => setEditData(d => ({ ...d, start_date: e.target.value }))} className={inputClass} style={{ borderColor: 'var(--border)' }} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--muted)' }}>Fin</label>
                <input type="date" value={editData.end_date} onChange={e => setEditData(d => ({ ...d, end_date: e.target.value }))} className={inputClass} style={{ borderColor: 'var(--border)' }} />
              </div>
            </div>
          ) : (
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
          )}

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Estado</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
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
                  <div className="flex items-center gap-2 mb-1">
                    {c.commentUser?.avatar_url ? (
                      <img src={c.commentUser.avatar_url} alt={c.commentUser.full_name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                        {c.commentUser?.full_name ? c.commentUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </div>
                    )}
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {(() => {
                        const d = new Date(c.created_at);
                        if (isNaN(d.getTime())) return '—';
                        return d.toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                      })()}
                    </span>
                  </div>
                  <div>
                    <p>{c.content}</p>
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

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="¿Eliminar esta tarea?"
        message="Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
