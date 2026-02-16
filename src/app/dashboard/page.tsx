'use client';

import { useEffect, useState, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useProjectStore } from '@/stores/projectStore';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineCheck,
} from 'react-icons/hi';

const categoryLabels: Record<string, string> = {
  PERSONAL: 'Personal',
  WORK: 'Trabajo',
  PROJECT: 'Proyecto',
};

const filterOptions = [
  { value: '', label: 'Todas' },
  { value: 'PERSONAL', label: 'Personal' },
  { value: 'WORK', label: 'Trabajo' },
  { value: 'PROJECT', label: 'Proyecto' },
  { value: 'DONE', label: 'Completadas' },
  { value: 'PENDING', label: 'Sin completar' },
];

export default function DashboardPage() {
  const {
    tasks,
    upcomingTasks,
    daySummary,
    currentDate,
    setCurrentDate,
    fetchTasksByDate,
    fetchUpcoming,
    fetchDaySummary,
  } = useTaskStore();
  const { weeklyHabits, fetchWeeklyHabits, toggleLog } = useHabitStore();
  const { fetchProjects } = useProjectStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchTasksByDate(currentDate);
    fetchUpcoming(currentDate);
    fetchDaySummary(currentDate);
    fetchWeeklyHabits();
    fetchProjects();
  }, [currentDate, fetchTasksByDate, fetchUpcoming, fetchDaySummary, fetchWeeklyHabits, fetchProjects]);

  const goToDate = (days: number) => {
    const newDate = days > 0
      ? format(addDays(new Date(currentDate), days), 'yyyy-MM-dd')
      : format(subDays(new Date(currentDate), Math.abs(days)), 'yyyy-MM-dd');
    setCurrentDate(newDate);
  };

  const formattedDate = useMemo(() => {
    const d = new Date(currentDate + 'T00:00:00');
    return format(d, "EEEE, d 'de' MMMM yyyy", { locale: es });
  }, [currentDate]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!filter) return tasks;
    if (filter === 'DONE') return tasks.filter(t => t.status === 'DONE');
    if (filter === 'PENDING') return tasks.filter(t => t.status !== 'DONE');
    return tasks.filter(t => t.category === filter);
  }, [tasks, filter]);

  // Group tasks by category
  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof filteredTasks> = {};
    filteredTasks.forEach(task => {
      const cat = task.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(task);
    });
    return groups;
  }, [filteredTasks]);

  // Tomorrow's tasks
  const tomorrowDate = format(addDays(new Date(currentDate), 1), 'yyyy-MM-dd');
  const tomorrowTasks = upcomingTasks.filter(t => t.start_date === tomorrowDate);
  const nextTasks = upcomingTasks.filter(t => t.start_date !== tomorrowDate);

  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Panel Principal</h1>
          <p className="text-sm mt-1 capitalize" style={{ color: 'var(--muted)' }}>{formattedDate}</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <HiOutlinePlus size={18} />
          Nueva tarea
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Total del día</p>
          <p className="text-2xl font-bold mt-1">{daySummary?.total || 0}</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>Completadas</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--success)' }}>{daySummary?.completed || 0}</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--warning)' }}>Pendientes</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--warning)' }}>{daySummary?.pending || 0}</p>
        </div>
      </div>

      {/* Habits Section */}
      {weeklyHabits.length > 0 && (
        <div className="p-4 rounded-xl border mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3">Hábitos de la semana</h2>
          <div className="space-y-2">
            {weeklyHabits.map(habit => (
              <div key={habit.id} className="flex items-center gap-3">
                <span className="text-sm w-32 truncate">{habit.name}</span>
                <div className="flex gap-1">
                  {habit.week?.map((day, i) => (
                    <button
                      key={day.date}
                      onClick={() => toggleLog(habit.id, day.date)}
                      className={`w-9 h-9 rounded-lg text-xs font-medium flex flex-col items-center justify-center transition-colors ${
                        day.is_completed
                          ? 'bg-green-500 text-white'
                          : 'border hover:border-indigo-300'
                      }`}
                      style={!day.is_completed ? { borderColor: 'var(--border)' } : {}}
                      title={day.date}
                    >
                      <span className="text-[10px]">{dayNames[i]}</span>
                      {day.is_completed && <HiOutlineCheck size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Main Tasks Area */}
        <div className="flex-1">
          {/* Date Navigation & Filter */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToDate(-1)}
                className="p-2 rounded-lg border hover:bg-gray-50"
                style={{ borderColor: 'var(--border)' }}
              >
                <HiOutlineChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-1.5 rounded-lg border text-sm font-medium hover:bg-gray-50"
                style={{ borderColor: 'var(--border)' }}
              >
                Hoy
              </button>
              <button
                onClick={() => goToDate(1)}
                className="p-2 rounded-lg border hover:bg-gray-50"
                style={{ borderColor: 'var(--border)' }}
              >
                <HiOutlineChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <HiOutlineFilter size={16} style={{ color: 'var(--muted)' }} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ borderColor: 'var(--border)' }}
              >
                {filterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks grouped by category */}
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No hay tareas para este día</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="mt-3 text-sm font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Crear una tarea
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--muted)' }}>
                    {categoryLabels[category] || category} ({categoryTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {categoryTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => {
                          setSelectedTaskId(task.id);
                          setDetailModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Upcoming */}
        <div className="w-72 flex-shrink-0">
          <div className="sticky top-6 space-y-4">
            {/* Tomorrow */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold mb-3">Mañana</h3>
              {tomorrowTasks.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Sin tareas</p>
              ) : (
                <div className="space-y-2">
                  {tomorrowTasks.map(task => (
                    <div
                      key={task.id}
                      className="text-sm p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                      style={{ backgroundColor: 'var(--secondary)' }}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setDetailModalOpen(true);
                      }}
                    >
                      <p className="font-medium text-xs truncate">{task.title}</p>
                      <span
                        className="text-[10px] mt-0.5 inline-block px-1.5 py-0.5 rounded"
                        style={{ color: 'var(--muted)' }}
                      >
                        {task.category === 'PERSONAL' ? 'Personal' : task.category === 'WORK' ? 'Trabajo' : 'Proyecto'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold mb-3">Próximas</h3>
              {nextTasks.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Sin tareas próximas</p>
              ) : (
                <div className="space-y-2">
                  {nextTasks.slice(0, 8).map(task => (
                    <div
                      key={task.id}
                      className="text-sm p-2 rounded-lg cursor-pointer hover:bg-gray-50"
                      style={{ backgroundColor: 'var(--secondary)' }}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setDetailModalOpen(true);
                      }}
                    >
                      <p className="font-medium text-xs truncate">{task.title}</p>
                      <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        {task.start_date}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultDate={currentDate}
      />
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedTaskId(null);
        }}
      />
    </div>
  );
}
