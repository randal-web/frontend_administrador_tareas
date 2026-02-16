'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProjectStore } from '@/stores/projectStore';
import { HiOutlinePlus, HiOutlineFolder, HiOutlineTrash, HiOutlinePencil, HiOutlineX } from 'react-icons/hi';

export default function ProjectsPage() {
  const { projects, isLoading, fetchProjects, createProject, updateProject, deleteProject } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color_hex: '#6366f1' });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject(formData);
    setFormData({ name: '', description: '', color_hex: '#6366f1' });
    setShowCreate(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateProject(editingId, formData);
      setEditingId(null);
      setFormData({ name: '', description: '', color_hex: '#6366f1' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto? Se desvinculará de las tareas asociadas.')) {
      await deleteProject(id);
    }
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({ name: project.name, description: project.description || '', color_hex: project.color_hex });
    setShowCreate(false);
  };

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6'];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); setFormData({ name: '', description: '', color_hex: '#6366f1' }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <HiOutlinePlus size={18} />
          Nuevo proyecto
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreate || editingId) && (
        <div className="p-4 rounded-xl border mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">{editingId ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
            <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="p-1 hover:bg-gray-100 rounded">
              <HiOutlineX size={16} />
            </button>
          </div>
          <form onSubmit={editingId ? handleUpdate : handleCreate} className="space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ borderColor: 'var(--border)' }}
              placeholder="Nombre del proyecto"
              required
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              style={{ borderColor: 'var(--border)' }}
              rows={2}
              placeholder="Descripción (opcional)"
            />
            <div>
              <label className="block text-xs font-medium mb-1.5">Color</label>
              <div className="flex gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color_hex: c }))}
                    className={`w-8 h-8 rounded-full ${formData.color_hex === c ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {editingId ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <HiOutlineFolder size={48} className="mx-auto mb-3" style={{ color: 'var(--muted)' }} />
          <p style={{ color: 'var(--muted)' }}>No tienes proyectos aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="rounded-xl border overflow-hidden hover:shadow-md transition-shadow"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="h-2" style={{ backgroundColor: project.color_hex }} />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <h3 className="font-semibold hover:underline">{project.name}</h3>
                  </Link>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(project)}
                      className="p-1.5 rounded hover:bg-gray-100"
                      style={{ color: 'var(--muted)' }}
                    >
                      <HiOutlinePencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-400"
                    >
                      <HiOutlineTrash size={14} />
                    </button>
                  </div>
                </div>
                {project.description && (
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--muted)' }}>
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--muted)' }}>
                  <span><strong>{project.total_tasks}</strong> tareas</span>
                  <span className="text-green-600"><strong>{project.done_tasks}</strong> hechas</span>
                  <span className="text-amber-600"><strong>{project.pending_tasks}</strong> pendientes</span>
                </div>
                {project.total_tasks > 0 && (
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--secondary)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(project.done_tasks / project.total_tasks) * 100}%`,
                        backgroundColor: 'var(--success)',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
