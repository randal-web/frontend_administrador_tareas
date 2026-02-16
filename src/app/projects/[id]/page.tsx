'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { Task } from '@/types';
import TaskCard from '@/components/tasks/TaskCard';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { HiOutlinePlus, HiOutlineViewGrid, HiOutlineViewList } from 'react-icons/hi';

const statusColumns = [
  { key: 'TODO', label: 'Por hacer', color: '#94a3b8' },
  { key: 'IN_PROGRESS', label: 'En curso', color: '#3b82f6' },
  { key: 'REVIEW', label: 'Revisión', color: '#f59e0b' },
  { key: 'DONE', label: 'Hecha', color: '#22c55e' },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { currentProject, projectBoard, projectGantt, fetchProject, fetchProjectBoard, fetchProjectGantt } = useProjectStore();
  const [tab, setTab] = useState<'board' | 'list'>('board');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: currentProject.color_hex }} />
            <h1 className="text-2xl font-bold">{currentProject.name}</h1>
          </div>
          {currentProject.description && (
            <p className="text-sm mt-1 ml-7" style={{ color: 'var(--muted)' }}>{currentProject.description}</p>
          )}
          <div className="flex gap-4 mt-2 ml-7 text-xs" style={{ color: 'var(--muted)' }}>
            <span><strong>{currentProject.total_tasks}</strong> tareas totales</span>
            <span className="text-green-600"><strong>{currentProject.done_tasks}</strong> completadas</span>
            <span className="text-amber-600"><strong>{currentProject.pending_tasks}</strong> pendientes</span>
          </div>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <HiOutlinePlus size={18} />
          Nueva tarea
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--secondary)' }}>
        <button
          onClick={() => setTab('board')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'board' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <HiOutlineViewGrid size={16} />
          Tablero
        </button>
        <button
          onClick={() => setTab('list')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'list' ? 'bg-white shadow-sm' : ''
          }`}
        >
          <HiOutlineViewList size={16} />
          Listado
        </button>
      </div>

      {/* Board View (Kanban) */}
      {tab === 'board' && projectBoard && (
        <div className="grid grid-cols-4 gap-4">
          {statusColumns.map(col => {
            const tasks = projectBoard[col.key as keyof typeof projectBoard] || [];
            return (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--muted)' }}>
                    {tasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.map((task: Task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setDetailOpen(true);
                      }}
                    />
                  ))}
                  {tasks.length === 0 && (
                    <div className="p-4 rounded-lg border-2 border-dashed text-center" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>Sin tareas</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {tab === 'list' && projectBoard && (
        <div className="space-y-6">
          {statusColumns.map(col => {
            const tasks = projectBoard[col.key as keyof typeof projectBoard] || [];
            if (tasks.length === 0) return null;
            return (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                  <h3 className="text-sm font-semibold">{col.label} ({tasks.length})</h3>
                </div>
                <div className="space-y-2">
                  {tasks.map((task: Task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setDetailOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gantt Chart (simplified) */}
      {tab === 'board' && projectGantt.length > 0 && (
        <div className="mt-8 p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-semibold mb-4">Diagrama de Gantt</h3>
          <div className="space-y-2 overflow-x-auto">
            {projectGantt.map(task => {
              const start = new Date(task.start_date);
              const end = new Date(task.end_date);
              const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
              const statusColor = task.status === 'DONE' ? '#22c55e' : task.status === 'IN_PROGRESS' ? '#3b82f6' : task.status === 'REVIEW' ? '#f59e0b' : '#94a3b8';

              return (
                <div key={task.id} className="flex items-center gap-3">
                  <span className="text-xs w-40 truncate" title={task.title}>{task.title}</span>
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
                        {task.start_date.slice(5)} → {task.end_date.slice(5)}
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
    </div>
  );
}
