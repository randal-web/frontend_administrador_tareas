'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import { HiOutlinePlus, HiOutlineFolder, HiOutlineTrash, HiOutlinePencil, HiOutlineX, HiOutlineCalendar, HiOutlineDotsHorizontal, HiOutlineEye, HiOutlineArchive, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function ProjectsPage() {
  const { projects, isLoading, fetchProjects, createProject, updateProject, deleteProject } = useProjectStore();
  const { user } = useAuthStore();
  const userInitials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color_hex: '#6366f1' });
  const [activeTab, setActiveTab] = useState<'folders' | 'stats'>('folders');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteProject(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const handleArchive = async (id: string) => {
    await updateProject(id, { status: 'archived' });
    setOpenMenuId(null);
  };

  const handleRestore = async (id: string) => {
    await updateProject(id, { status: 'active' });
    setOpenMenuId(null);
  };

  const startEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({ name: project.name, description: project.description || '', color_hex: project.color_hex });
    setShowCreate(false);
  };

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6'];

  const activeProjects = projects.filter(p => p.status === 'active');
  const archivedProjects = projects.filter(p => p.status === 'archived');
  const [showArchived, setShowArchived] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1">
        <div>
          <h1 className="text-2xl font-bold">Proyectos</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{activeProjects.length} proyectos activos</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); setFormData({ name: '', description: '', color_hex: '#6366f1' }); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-white"
          style={{ backgroundColor: 'var(--foreground)' }}
        >
          <HiOutlinePlus size={16} />
          Nuevo Proyecto
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setActiveTab('folders')}
          className={`flex items-center gap-2 pb-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'folders' ? 'border-current' : 'border-transparent'
          }`}
          style={{ color: activeTab === 'folders' ? 'var(--foreground)' : 'var(--muted)' }}
        >
          <HiOutlineFolder size={15} />
          Carpetas
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 pb-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'stats' ? 'border-current' : 'border-transparent'
          }`}
          style={{ color: activeTab === 'stats' ? 'var(--foreground)' : 'var(--muted)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18" /><rect x="10" y="8" width="4" height="13" /><rect x="2" y="13" width="4" height="8" /></svg>
          Estadísticas
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

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <HiOutlineFolder size={48} className="mx-auto mb-3" style={{ color: 'var(--muted)' }} />
          <p style={{ color: 'var(--muted)' }}>No tienes proyectos aún</p>
        </div>
      ) : activeTab === 'folders' ? (
        /* Project Cards Grid - Folder style */
        <>
        {activeProjects.length === 0 ? (
          <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <HiOutlineFolder size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No hay proyectos activos</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {activeProjects.map(project => {
            const progress = project.total_tasks > 0 ? Math.round((project.done_tasks / project.total_tasks) * 100) : 0;
            const initials = project.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
            const bgTint = project.color_hex + '08';

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group relative hover:shadow-lg transition-all"
              >
                {/* Folder tab */}
                <div className="flex items-end">
                  <div
                    className="h-3 w-16 rounded-t-lg"
                    style={{ backgroundColor: project.color_hex }}
                  />
                </div>

                {/* Card body */}
                <div
                  className="rounded-b-xl rounded-tr-xl border border-t-0 relative"
                  style={{ backgroundColor: bgTint, borderColor: 'var(--border)' }}
                >
                  {/* Top border line in project color */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] rounded-tr-xl" style={{ backgroundColor: project.color_hex }} />

                  {/* Actions menu */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <button
                      onClick={(e) => { e.preventDefault(); setOpenMenuId(openMenuId === project.id ? null : project.id); }}
                      className="p-1 rounded hover:bg-black/5 transition-colors"
                      style={{ color: 'var(--muted)' }}
                    >
                      <HiOutlineDotsHorizontal size={16} />
                    </button>
                    {openMenuId === project.id && (
                      <div ref={menuRef} className="absolute right-0 top-7 w-40 rounded-lg border shadow-lg py-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                        <button onClick={(e) => { e.preventDefault(); router.push(`/projects/${project.id}`); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
                          <HiOutlineEye size={13} /> Ver detalles
                        </button>
                        <button onClick={(e) => { e.preventDefault(); startEdit(project); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
                          <HiOutlinePencil size={13} /> Editar
                        </button>
                        <button onClick={(e) => { e.preventDefault(); handleArchive(project.id); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors" style={{ color: '#f59e0b' }}>
                          <HiOutlineArchive size={13} /> Archivar
                        </button>
                        <button onClick={(e) => { e.preventDefault(); handleDelete(project.id); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                          <HiOutlineTrash size={13} /> Eliminar
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 pt-3.5">
                    {/* Folder icon + Name */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <HiOutlineFolder size={18} style={{ color: project.color_hex }} />
                      <h3 className="font-semibold text-sm truncate pr-6">{project.name}</h3>
                    </div>

                    {/* Task count + Progress percentage */}
                    <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                      <span>{project.done_tasks}/{project.total_tasks} tareas</span>
                      <span className="font-semibold" style={{ color: progress >= 70 ? '#22c55e' : progress >= 40 ? '#f59e0b' : 'var(--muted)' }}>
                        {progress}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full overflow-hidden mb-3.5" style={{ backgroundColor: 'var(--secondary)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: project.color_hex }}
                      />
                    </div>

                    {/* Footer: avatar + date */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {user?.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-6 h-6 rounded-full border-2 object-cover"
                            style={{ borderColor: bgTint }}
                          />
                        ) : (
                          <div
                            className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ backgroundColor: '#1a1a1a', borderColor: bgTint }}
                          >
                            {userInitials}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--muted)' }}>
                        <HiOutlineCalendar size={11} />
                        {(() => {
                          const raw = project.created_at || (project as unknown as Record<string, unknown>).createdAt;
                          if (!raw) return 'Sin fecha';
                          const d = new Date(raw as string);
                          return isNaN(d.getTime()) ? 'Sin fecha' : d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        )}

        {/* Archived Projects Section */}
        {archivedProjects.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-sm font-medium mb-3 transition-colors hover:opacity-80"
              style={{ color: 'var(--muted)' }}
            >
              {showArchived ? <HiOutlineChevronDown size={14} /> : <HiOutlineChevronRight size={14} />}
              <HiOutlineArchive size={14} />
              Archivados ({archivedProjects.length})
            </button>
            {showArchived && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {archivedProjects.map(project => {
                  const progress = project.total_tasks > 0 ? Math.round((project.done_tasks / project.total_tasks) * 100) : 0;
                  const bgTint = project.color_hex + '08';
                  return (
                    <div key={project.id} className="relative opacity-60">
                      {/* Folder tab */}
                      <div className="flex items-end">
                        <div className="h-3 w-16 rounded-t-lg" style={{ backgroundColor: project.color_hex }} />
                      </div>
                      {/* Card body */}
                      <div className="rounded-b-xl rounded-tr-xl border border-t-0 relative" style={{ backgroundColor: bgTint, borderColor: 'var(--border)' }}>
                        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-tr-xl" style={{ backgroundColor: project.color_hex }} />
                        {/* Actions */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === `arch-${project.id}` ? null : `arch-${project.id}`)}
                            className="p-1 rounded hover:bg-black/5 transition-colors"
                            style={{ color: 'var(--muted)' }}
                          >
                            <HiOutlineDotsHorizontal size={16} />
                          </button>
                          {openMenuId === `arch-${project.id}` && (
                            <div ref={menuRef} className="absolute right-0 top-7 w-40 rounded-lg border shadow-lg py-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                              <button onClick={() => handleRestore(project.id)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors" style={{ color: '#22c55e' }}>
                                <HiOutlineArchive size={13} /> Restaurar
                              </button>
                              <button onClick={() => handleDelete(project.id)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                                <HiOutlineTrash size={13} /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="p-4 pt-3.5">
                          <div className="flex items-center gap-2 mb-2.5">
                            <HiOutlineFolder size={18} style={{ color: project.color_hex }} />
                            <h3 className="font-semibold text-sm truncate pr-6">{project.name}</h3>
                          </div>
                          <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: 'var(--muted)' }}>
                            <span>{project.done_tasks}/{project.total_tasks} tareas</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">Archivado</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden mb-3.5" style={{ backgroundColor: 'var(--secondary)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: project.color_hex }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </>
      ) : (
        /* Statistics Tab */
        <div className="space-y-6">
          {/* Summary cards */}
          {(() => {
            const totalProjects = projects.length;
            const totalTasks = projects.reduce((sum, p) => sum + p.total_tasks, 0);
            const totalDone = projects.reduce((sum, p) => sum + p.done_tasks, 0);
            const globalProgress = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

            return (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Proyectos</p>
                    <p className="text-3xl font-bold">{totalProjects}</p>
                  </div>
                  <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Tareas Totales</p>
                    <p className="text-3xl font-bold">{totalTasks}</p>
                  </div>
                  <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Completadas</p>
                    <p className="text-3xl font-bold text-green-600">{totalDone}</p>
                  </div>
                  <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <p className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Progreso Global</p>
                    <p className="text-3xl font-bold">{globalProgress}%</p>
                    <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ backgroundColor: 'var(--secondary)' }}>
                      <div className="h-full rounded-full bg-black transition-all" style={{ width: `${globalProgress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Progreso por proyecto */}
                <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold mb-5">Progreso por proyecto</h3>
                  <div className="space-y-5">
                    {projects.map(project => {
                      const progress = project.total_tasks > 0 ? Math.round((project.done_tasks / project.total_tasks) * 100) : 0;
                      return (
                        <div key={project.id}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <HiOutlineFolder size={15} style={{ color: project.color_hex }} />
                            <span className="text-sm font-medium">{project.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--secondary)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${progress}%`, backgroundColor: project.color_hex }}
                              />
                            </div>
                            <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>
                              {project.done_tasks}/{project.total_tasks} tareas
                            </span>
                            <span className="text-sm font-bold flex-shrink-0 w-10 text-right">{progress}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Equipo por proyecto */}
                <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <h3 className="text-sm font-bold mb-4">Equipo por proyecto</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.map(project => {
                      return (
                        <div
                          key={project.id}
                          className="flex items-center justify-between rounded-xl px-4 py-3.5"
                          style={{ backgroundColor: project.color_hex + '0a' }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <HiOutlineFolder size={16} style={{ color: project.color_hex }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{project.name}</p>
                              <p className="text-xs" style={{ color: 'var(--muted)' }}>1 miembro</p>
                            </div>
                          </div>
                          <div className="flex -space-x-1.5 flex-shrink-0">
                            <div
                              className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                              style={{ backgroundColor: '#1a1a1a', borderColor: project.color_hex + '0a' }}
                            >
                              {userInitials}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="¿Eliminar este proyecto?"
        message="Se desvinculará de las tareas asociadas. Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
