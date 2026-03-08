'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { Task } from '@/types';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import {
  HiOutlinePlus,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineCheck,
  HiOutlineDotsVertical,
  HiOutlineFolder,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';

const fmtDate = (d: string) => d.split('-').reverse().join('/');

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  TODO: { label: 'Por hacer', color: '#6366f1', dot: '#6366f1' },
  IN_PROGRESS: { label: 'En curso', color: '#3b82f6', dot: '#3b82f6' },
  REVIEW: { label: 'Revisión', color: '#f59e0b', dot: '#f59e0b' },
  DONE: { label: 'Completadas', color: '#22c55e', dot: '#22c55e' },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  HIGH: { label: 'Alta', color: '#dc2626', bg: '#fef2f2' },
  MEDIUM: { label: 'Media', color: '#d97706', bg: '#fffbeb' },
  LOW: { label: 'Baja', color: '#16a34a', bg: '#f0fdf4' },
};

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  PERSONAL: { label: 'Personal', color: '#7c3aed', bg: '#f5f3ff' },
  WORK: { label: 'Trabajo', color: '#2563eb', bg: '#eff6ff' },
  PROJECT: { label: 'Proyecto', color: '#0891b2', bg: '#ecfeff' },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { currentProject, projectBoard, projectGantt, fetchProject, fetchProjectBoard, fetchProjectGantt } = useProjectStore();
  const { deleteTask, toggleStatus } = useTaskStore();
  const { user } = useAuthStore();

  const userInitials = user?.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [collapsedStatuses, setCollapsedStatuses] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;
    await toggleStatus(taskId, newStatus);
    fetchProjectBoard(projectId);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteTask = (id: string) => {
    setConfirmDeleteId(id);
    setOpenMenuId(null);
  };

  const confirmDeleteTask = async () => {
    if (!confirmDeleteId) return;
    await deleteTask(confirmDeleteId);
    setConfirmDeleteId(null);
    fetchProjectBoard(projectId);
    fetchProject(projectId);
  };

  const handleEditTask = (id: string) => {
    setSelectedTaskId(id);
    setDetailOpen(true);
    setOpenMenuId(null);
  };

  const toggleStatusCollapse = (status: string) => {
    setCollapsedStatuses(prev => ({ ...prev, [status]: !prev[status] }));
  };

  useEffect(() => {
    fetchProject(projectId);
    fetchProjectBoard(projectId);
    fetchProjectGantt(projectId);
  }, [projectId, fetchProject, fetchProjectBoard, fetchProjectGantt]);

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const progress = currentProject.total_tasks > 0 ? Math.round((currentProject.done_tasks / currentProject.total_tasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <HiOutlineFolder size={20} style={{ color: currentProject.color_hex }} />
            <h1 className="text-2xl font-bold truncate">{currentProject.name}</h1>
          </div>
          {currentProject.description && (
            <p className="text-sm ml-8" style={{ color: 'var(--muted)' }}>{currentProject.description}</p>
          )}
          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-2 ml-8">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {currentProject.done_tasks}/{currentProject.total_tasks} tareas
            </span>
            <div className="flex items-center gap-2 flex-1 max-w-[200px]">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--secondary)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: currentProject.color_hex }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: currentProject.color_hex }}>{progress}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View mode toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setViewMode('board')}
              className="p-2 transition-colors"
              style={{
                backgroundColor: viewMode === 'board' ? 'var(--primary)' : 'var(--card)',
                color: viewMode === 'board' ? 'white' : 'var(--muted)',
              }}
            >
              <HiOutlineViewGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 transition-colors"
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--primary)' : 'var(--card)',
                color: viewMode === 'list' ? 'white' : 'var(--muted)',
              }}
            >
              <HiOutlineViewList size={16} />
            </button>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white"
            style={{ backgroundColor: 'var(--foreground)' }}
          >
            <HiOutlinePlus size={16} />
            Nueva tarea
          </button>
        </div>
      </div>

      {/* Board View (Kanban) */}
      {viewMode === 'board' && projectBoard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
          {Object.entries(statusConfig).map(([status, cfg]) => {
            const tasks = projectBoard[status as keyof typeof projectBoard] || [];

            return (
              <div
                key={status}
                className={`rounded-xl min-w-0 transition-all ${dragOverStatus === status ? 'ring-2 ring-blue-400 bg-blue-50/30' : ''}`}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column header */}
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl text-sm font-semibold"
                  style={{ color: cfg.color }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  {cfg.label}
                  <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.color + '20' }}>
                    {tasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 max-h-[70vh] overflow-y-auto">
                  {tasks.length === 0 ? (
                    <div className="p-4 rounded-lg border-2 border-dashed text-center" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>Sin tareas</p>
                    </div>
                  ) : (
                    tasks.map((task: Task) => {
                      const category = categoryConfig[task.category] || categoryConfig.PERSONAL;
                      const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => { setSelectedTaskId(task.id); setDetailOpen(true); }}
                          className="rounded-lg border p-2.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all group"
                          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                        >
                          {/* Title */}
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <h4 className="text-xs font-medium leading-tight line-clamp-2">{task.title}</h4>
                            <div className="relative flex-shrink-0">
                              <button
                                className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === `k-${task.id}` ? null : `k-${task.id}`); }}
                              >
                                <HiOutlineDotsVertical size={12} />
                              </button>
                              {openMenuId === `k-${task.id}` && (
                                <div ref={menuRef} className="absolute right-0 top-5 z-50 w-36 rounded-lg border shadow-lg py-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); setDetailOpen(true); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
                                    <HiOutlineEye size={13} /> Ver
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleEditTask(task.id); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
                                    <HiOutlinePencil size={13} /> Editar
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors">
                                    <HiOutlineTrash size={13} /> Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className="text-[10px] mb-2 line-clamp-2" style={{ color: 'var(--muted)' }}>
                              {task.description}
                            </p>
                          )}

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                              style={{ color: category.color, backgroundColor: category.bg }}
                            >
                              {category.label}
                            </span>
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                              style={{ color: priority.color, backgroundColor: priority.bg }}
                            >
                              {priority.label}
                            </span>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {task.start_date && task.end_date && (
                                <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
                                  {fmtDate(task.start_date)} → {fmtDate(task.end_date)}
                                </span>
                              )}
                              {task.start_date && !task.end_date && (
                                <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
                                  {fmtDate(task.start_date)}
                                </span>
                              )}
                            </div>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white overflow-hidden" style={{ backgroundColor: cfg.dot }}>
                              {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                              ) : (
                                userInitials
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && projectBoard && (
        <div className="space-y-2">
          {Object.entries(statusConfig).map(([status, cfg]) => {
            const tasks = projectBoard[status as keyof typeof projectBoard] || [];
            if (tasks.length === 0) return null;
            const isCollapsed = collapsedStatuses[status];

            return (
              <div key={status}>
                {/* Status Header */}
                <button
                  onClick={() => toggleStatusCollapse(status)}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                  style={{ backgroundColor: cfg.color + '12', color: cfg.color }}
                >
                  {isCollapsed ? <HiOutlineChevronRight size={14} /> : <HiOutlineChevronDown size={14} />}
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                  {cfg.label}
                  <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.color + '20' }}>
                    {tasks.length}
                  </span>
                </button>

                {/* Task rows */}
                {!isCollapsed && (
                  <div className="mt-1 ml-2 mr-1 mb-2 rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  <div className="overflow-x-auto">
                    {/* Table header */}
                    <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] font-medium border-b min-w-[500px]"
                      style={{ color: 'var(--muted)', borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
                    >
                      <div className="col-span-1"></div>
                      <div className="col-span-3">Tarea</div>
                      <div className="col-span-3">Descripción</div>
                      <div className="col-span-2">Tipo</div>
                      <div className="col-span-1">Prioridad</div>
                      <div className="col-span-1 hidden md:block">Fecha</div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Task rows */}
                    {tasks.map((task: Task) => {
                      const category = categoryConfig[task.category] || categoryConfig.PERSONAL;
                      const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

                      return (
                        <div
                          key={task.id}
                          onClick={() => { setSelectedTaskId(task.id); setDetailOpen(true); }}
                          className="flex flex-col sm:grid sm:grid-cols-12 gap-1 sm:gap-2 px-3 py-2 items-start sm:items-center text-xs border-b last:border-b-0 hover:bg-gray-50/50 cursor-pointer transition-colors min-w-0"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <div className="hidden sm:flex col-span-1 justify-center">
                            <div
                              className="w-4 h-4 rounded border-2 flex items-center justify-center"
                              style={{
                                borderColor: task.status === 'DONE' ? cfg.color : 'var(--border)',
                                backgroundColor: task.status === 'DONE' ? cfg.color : 'transparent',
                              }}
                            >
                              {task.status === 'DONE' && <HiOutlineCheck size={10} className="text-white" />}
                            </div>
                          </div>
                          <div className="sm:col-span-3 font-medium truncate flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 sm:hidden"
                              style={{
                                borderColor: task.status === 'DONE' ? cfg.color : 'var(--border)',
                                backgroundColor: task.status === 'DONE' ? cfg.color : 'transparent',
                              }}
                            >
                              {task.status === 'DONE' && <HiOutlineCheck size={10} className="text-white" />}
                            </div>
                            {task.title}
                          </div>
                          <div className="sm:col-span-3 hidden sm:block truncate" style={{ color: 'var(--muted)' }}>
                            {task.description || '—'}
                          </div>
                          <div className="sm:col-span-2 flex gap-1 sm:block">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                              style={{ color: category.color, backgroundColor: category.bg }}
                            >
                              {category.label}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md sm:hidden"
                              style={{ color: priority.color, backgroundColor: priority.bg }}
                            >
                              {priority.label}
                            </span>
                          </div>
                          <div className="col-span-1 hidden sm:block">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                              style={{ color: priority.color, backgroundColor: priority.bg }}
                            >
                              {priority.label}
                            </span>
                          </div>
                          <div className="col-span-1 hidden md:block">
                            {task.start_date && (
                              <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{fmtDate(task.start_date)}</span>
                            )}
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white overflow-hidden" style={{ backgroundColor: cfg.dot }}>
                              {user?.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                              ) : (
                                userInitials
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Gantt Chart */}
      {projectGantt.length > 0 && (
        <div className="mt-8 p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-4">Diagrama de Gantt</h3>
          <div className="space-y-2 overflow-x-auto">
            {projectGantt.map(task => {
              const start = new Date(task.start_date);
              const end = new Date(task.end_date);
              const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
              const statusColor = statusConfig[task.status]?.dot || '#94a3b8';

              return (
                <div key={task.id} className="flex items-center gap-3">
                  <span className="text-xs w-24 sm:w-40 truncate flex-shrink-0" title={task.title}>{task.title}</span>
                  <div className="flex-1 relative h-6">
                    <div
                      className="absolute h-full rounded-md flex items-center px-2"
                      style={{
                        backgroundColor: statusColor + '30',
                        borderLeft: `3px solid ${statusColor}`,
                        width: `${Math.min(duration * 40, 100)}%`,
                        minWidth: '60px',
                      }}
                    >
                      <span className="text-[10px] whitespace-nowrap" style={{ color: statusColor }}>
                        {fmtDate(task.start_date)} → {fmtDate(task.end_date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTaskId(null);
          fetchProjectBoard(projectId);
        }}
      />
      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          fetchProjectBoard(projectId);
          fetchProject(projectId);
        }}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="¿Eliminar esta tarea?"
        message="Esta acción no se puede deshacer."
        onConfirm={confirmDeleteTask}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
