'use client';

import { Task } from '@/types';
import { useTaskStore } from '@/stores/taskStore';
import { HiOutlineCheck, HiOutlineClock, HiOutlineFlag } from 'react-icons/hi';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
};

const priorityLabels: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

const statusLabels: Record<string, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  DONE: 'Hecha',
};

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const { toggleStatus } = useTaskStore();
  const isDone = task.status === 'DONE';
  const completedSubtasks = task.subtasks?.filter(s => s.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = isDone ? 'TODO' : 'DONE';
    await toggleStatus(task.id, newStatus);
  };

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
        isDone ? 'opacity-60' : ''
      }`}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
            isDone ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-indigo-500'
          }`}
        >
          {isDone && <HiOutlineCheck size={12} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${isDone ? 'line-through' : ''}`}>
            {task.title}
          </h4>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Priority */}
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${priorityColors[task.priority]}20`, color: priorityColors[task.priority] }}
            >
              <HiOutlineFlag size={10} />
              {priorityLabels[task.priority]}
            </span>

            {/* Status */}
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--secondary)', color: 'var(--muted)' }}>
              {statusLabels[task.status]}
            </span>

            {/* Project tag */}
            {task.project && (
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: task.project.color_hex }}
              >
                {task.project.name}
              </span>
            )}

            {/* Subtask progress */}
            {totalSubtasks > 0 && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                <HiOutlineCheck size={12} />
                {completedSubtasks}/{totalSubtasks}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
