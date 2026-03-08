'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Task } from '@/types';
import { getLocalDateString } from '@/lib/dateUtils';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlinePlus,
  HiOutlineFilter,
  HiOutlineCheck,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineCalendar,
  HiOutlineDotsHorizontal,
  HiOutlineDotsVertical,
  HiOutlineStar,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'react-icons/hi';

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

const fmtDate = (d: string) => d.split('-').reverse().join('/');

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  TODO: { label: 'Por hacer', color: '#106AFF', dot: '#106AFF' },
  IN_PROGRESS: { label: 'En curso', color: '#3b82f6', dot: '#3b82f6' },
  REVIEW: { label: 'Revisión', color: '#f59e0b', dot: '#f59e0b' },
  DONE: { label: 'Completadas', color: '#22c55e', dot: '#22c55e' },
};

export default function DashboardPage() {
  const { searchTerm } = useUIStore();
  const {
    tasks,
    upcomingTasks,
    currentDate,
    setCurrentDate,
    fetchTasksByDate,
    fetchUpcoming,
    fetchDaySummary,
    toggleStatus,
    deleteTask,
  } = useTaskStore();
  const { weeklyHabits, habits, fetchWeeklyHabits, fetchHabits, toggleLog } = useHabitStore();
  const { projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();

  const userInitials = useMemo(() => {
    if (!user?.full_name) return 'U';
    return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [user]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [collapsedStatuses, setCollapsedStatuses] = useState<Record<string, boolean>>({});
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterProject, setFilterProject] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeFilterCount = filterPriority.length + filterCategory.length + filterProject.length;

  const weekStartStr = useMemo(() => {
    const d = new Date(currentDate + 'T00:00:00');
    return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  }, [currentDate]);

  const toggleFilter = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setArr(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const clearFilters = () => {
    setFilterPriority([]);
    setFilterCategory([]);
    setFilterProject([]);
  };

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
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      await toggleStatus(taskId, newStatus);
    }
  };

  // Close menu / filter on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetchTasksByDate(currentDate);
    fetchUpcoming(currentDate);
    fetchDaySummary(currentDate);
    fetchWeeklyHabits(weekStartStr);
    fetchHabits();
    fetchProjects();
  }, [currentDate, weekStartStr, fetchTasksByDate, fetchUpcoming, fetchDaySummary, fetchWeeklyHabits, fetchHabits, fetchProjects]);

  const formattedDate = useMemo(() => {
    const d = new Date(currentDate + 'T00:00:00');
    return format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  }, [currentDate]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchTerm && !t.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterPriority.length > 0 && !filterPriority.includes(t.priority)) return false;
      if (filterCategory.length > 0 && !filterCategory.includes(t.category)) return false;
      if (filterProject.length > 0) {
        const pName = t.project?.name || 'Sin proyecto';
        if (!filterProject.includes(pName)) return false;
      }
      return true;
    });
  }, [tasks, filterPriority, filterCategory, filterProject, searchTerm]);

  // Group tasks: status → project
  const groupedByStatus = useMemo(() => {
    const groups: Record<string, Record<string, Task[]>> = {};
    const statusOrder = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

    statusOrder.forEach(status => {
      const statusTasks = filteredTasks.filter(t => t.status === status);
      if (statusTasks.length === 0) return;

      const byProject: Record<string, Task[]> = {};
      statusTasks.forEach(task => {
        const projectName = task.project?.name || 'Sin proyecto';
        if (!byProject[projectName]) byProject[projectName] = [];
        byProject[projectName].push(task);
      });
      groups[status] = byProject;
    });

    return groups;
  }, [filteredTasks]);

  const totalByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTasks.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return counts;
  }, [filteredTasks]);

  // Unique project names for filter
  const projectNames = useMemo(() => {
    const names = new Set<string>();
    tasks.forEach(t => names.add(t.project?.name || 'Sin proyecto'));
    return Array.from(names).sort();
  }, [tasks]);

  const toggleStatusCollapse = (status: string) => {
    setCollapsedStatuses(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const toggleProjectCollapse = (key: string) => {
    setCollapsedProjects(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getProjectColor = (projectName: string) => {
    const project = projects.find(p => p.name === projectName);
    return project?.color_hex || '#6b7280';
  };

  // Today's habits with streak info
  const todayStr = getLocalDateString();
  const todaysHabits = useMemo(() => {
    let base = weeklyHabits.map(h => {
      const todayDay = h.week?.find(d => d.date === todayStr);
      return { ...h, todayCompleted: todayDay?.is_completed || false, todayDate: todayStr };
    });
    if (searchTerm) {
      base = base.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return base;
  }, [weeklyHabits, todayStr, searchTerm]);

  // Tomorrow / upcoming tasks breakdown
  const currentDateObj = new Date(currentDate + 'T00:00:00');
  const tomorrowDate = format(addDays(currentDateObj, 1), 'yyyy-MM-dd');
  const isToday = currentDate === todayStr;

  // Filter upcoming: tasks visible on tomorrow (start_date <= tomorrow && (end_date >= tomorrow || no end_date))
  const tomorrowTasks = useMemo(() => {
    let filtered = upcomingTasks.filter(t => {
      const start = t.start_date || '';
      const end = t.end_date || start;
      return start <= tomorrowDate && end >= tomorrowDate;
    });
    if (searchTerm) {
      filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [upcomingTasks, tomorrowDate, searchTerm]);

  // Filter upcoming: tasks visible after tomorrow
  const futureTasks = useMemo(() => {
    let filtered = upcomingTasks.filter(t => {
      const start = t.start_date || '';
      const end = t.end_date || start;
      // Visible on at least one day after tomorrow
      return end > tomorrowDate || start > tomorrowDate;
    });
    if (searchTerm) {
      filtered = filtered.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [upcomingTasks, tomorrowDate, searchTerm]);

  const navigateDate = (offset: number) => {
    const newDate = offset === 0
      ? new Date()
      : addDays(currentDateObj, offset);
    setCurrentDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setConfirmDeleteId(taskId);
    setOpenMenuId(null);
  };

  const confirmDeleteTask = async () => {
    if (!confirmDeleteId) return;
    await deleteTask(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const handleEditTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailModalOpen(true);
    setOpenMenuId(null);
  };

  return (
    <div className="max-w-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--foreground)]">Tareas</h1>
        <p className="text-sm capitalize mt-0.5" style={{ color: 'var(--muted)' }}>{formattedDate}</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-[var(--foreground)]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <HiOutlineViewGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-[var(--foreground)]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <HiOutlineViewList size={16} />
              </button>
              <div className="flex items-center ml-1 rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                <button
                  onClick={() => navigateDate(-1)}
                  className="p-1.5 hover:bg-gray-100 transition-colors border-r"
                  style={{ borderColor: 'var(--border)' }}
                  title="Día anterior"
                >
                  <HiOutlineChevronLeft size={14} />
                </button>
                <button
                  onClick={() => navigateDate(0)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50 ${isToday ? '' : 'text-indigo-600'}`}
                >
                  <HiOutlineCalendar size={14} />
                  Hoy
                </button>
                <button
                  onClick={() => navigateDate(1)}
                  className="p-1.5 hover:bg-gray-100 transition-colors border-l"
                  style={{ borderColor: 'var(--border)' }}
                  title="Día siguiente"
                >
                  <HiOutlineChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setFilterOpen(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors hover:bg-gray-50 ${activeFilterCount > 0 ? 'border-blue-400 bg-blue-50 text-blue-600' : ''}`}
                  style={activeFilterCount === 0 ? { borderColor: 'var(--border)' } : {}}
                >
                  <HiOutlineFilter size={14} />
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="ml-1 text-[10px] font-bold bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border shadow-xl p-4 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">Filtros</h4>
                      {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="text-xs text-blue-500 hover:underline">Limpiar todo</button>
                      )}
                    </div>

                    {/* Priority */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Prioridad</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(priorityConfig).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => toggleFilter(filterPriority, setFilterPriority, key)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium ${
                              filterPriority.includes(key) ? 'text-white' : ''
                            }`}
                            style={{
                              backgroundColor: filterPriority.includes(key) ? cfg.color : cfg.bg,
                              color: filterPriority.includes(key) ? 'white' : cfg.color,
                              borderColor: filterPriority.includes(key) ? cfg.color : 'transparent',
                            }}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Categoría</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(categoryConfig).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => toggleFilter(filterCategory, setFilterCategory, key)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium`}
                            style={{
                              backgroundColor: filterCategory.includes(key) ? cfg.color : cfg.bg,
                              color: filterCategory.includes(key) ? 'white' : cfg.color,
                              borderColor: filterCategory.includes(key) ? cfg.color : 'transparent',
                            }}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Project */}
                    {projectNames.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Proyecto</p>
                        <div className="flex flex-wrap gap-1.5">
                          {projectNames.map(name => {
                            const isActive = filterProject.includes(name);
                            const color = getProjectColor(name);
                            return (
                              <button
                                key={name}
                                onClick={() => toggleFilter(filterProject, setFilterProject, name)}
                                className="text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium"
                                style={{
                                  backgroundColor: isActive ? color : color + '15',
                                  color: isActive ? 'white' : color,
                                  borderColor: isActive ? color : 'transparent',
                                }}
                              >
                                {name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--foreground)' }}
              >
                <HiOutlinePlus size={14} />
                Nueva Tarea
              </button>
            </div>
          </div>

          {/* Task Groups by Status → Project */}
          {Object.keys(groupedByStatus).length === 0 ? (
            <div className="text-center py-16 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No hay tareas para este día</p>
              <button onClick={() => setCreateModalOpen(true)} className="mt-3 text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                Crear una tarea
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {Object.entries(groupedByStatus).map(([status, projectGroups]) => {
                const cfg = statusConfig[status];
                const isCollapsed = collapsedStatuses[status];

                return (
                  <div key={status}>
                    {/* Status Header */}
                    <button
                      onClick={() => toggleStatusCollapse(status)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                      style={{ backgroundColor: cfg.color + '12', color: cfg.color, border: '1.5px solid ' + cfg.color + '40' }}
                    >
                      {isCollapsed ? <HiOutlineChevronRight size={14} /> : <HiOutlineChevronDown size={14} />}
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                      {cfg.label}
                      <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: cfg.color }}>
                        {totalByStatus[status] || 0}
                      </span>
                    </button>

                    {/* Project Groups */}
                    {!isCollapsed && (
                      <div className="mt-1 space-y-0.5">
                        {Object.entries(projectGroups).map(([projectName, projectTasks]) => {
                          const projectKey = `${status}-${projectName}`;
                          const isProjectCollapsed = collapsedProjects[projectKey];
                          const projectColor = getProjectColor(projectName);

                          return (
                            <div key={projectKey}>
                              {/* Project Row */}
                              <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50/50 transition-colors rounded-lg">
                                <button
                                  onClick={() => toggleProjectCollapse(projectKey)}
                                  className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
                                >
                                  {isProjectCollapsed ? <HiOutlineChevronRight size={12} className="text-gray-400" /> : <HiOutlineChevronDown size={12} className="text-gray-400" />}
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: projectColor }} />
                                  {projectName}
                                  <span className="text-xs text-gray-400 font-normal ml-1">{projectTasks.length}</span>
                                </button>
                                <button
                                  onClick={() => setCreateModalOpen(true)}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <HiOutlinePlus size={14} />
                                </button>
                              </div>

                              {/* Task Table */}
                              {!isProjectCollapsed && (
                                <div className="ml-4 mr-2 mb-2 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'white' }}>
                                  {/* Table Header */}
                                  <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-[11px] font-medium uppercase tracking-wider border-b"
                                    style={{ color: '#757575', borderColor: 'var(--border)' }}
                                  >
                                    <div className="col-span-4">Tarea</div>
                                    <div className="col-span-2">Descripción</div>
                                    <div className="col-span-2">Estimación</div>
                                    <div className="col-span-1">Tipo</div>
                                    <div className="col-span-1">Prioridad</div>
                                    <div className="col-span-1">Personas</div>
                                    <div className="col-span-1"></div>
                                  </div>

                                  {/* Task Rows */}
                                  {projectTasks.map(task => {
                                    const priority = priorityConfig[task.priority];
                                    const category = categoryConfig[task.category];
                                    const isDone = task.status === 'DONE';
                                    const estimationHours = task.end_date && task.start_date
                                      ? Math.max(1, Math.ceil((new Date(task.end_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24))) + 'h'
                                      : '—';

                                    return (
                                      <div
                                        key={task.id}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 items-center border-b last:border-0 hover:bg-gray-50/70 transition-colors cursor-pointer group"
                                        style={{ borderColor: 'var(--border)' }}
                                        onClick={() => handleTaskClick(task.id)}
                                      >
                                        {/* Task name + checkbox */}
                                        <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleStatus(task.id, isDone ? 'TODO' : 'DONE');
                                            }}
                                            className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isDone ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-indigo-400'
                                              }`}
                                          >
                                            {isDone && <HiOutlineCheck size={10} className="text-white" />}
                                          </button>
                                          <span className={`text-sm truncate ${isDone ? 'line-through text-gray-400' : 'text-[var(--foreground)]'}`}
                                            style={{ fontWeight: '600' }}>
                                            {task.title}
                                          </span>
                                        </div>

                                        {/* Description */}
                                        <div className="hidden md:block md:col-span-2">
                                          <span className="text-xs text-gray-400 truncate block">
                                            {task.description ? task.description.slice(0, 30) + (task.description.length > 30 ? '...' : '') : '—'}
                                          </span>
                                        </div>

                                        {/* Estimation */}
                                        <div className="hidden md:block md:col-span-2 text-xs text-gray-500">
                                          <span className="font-medium">{estimationHours}</span>
                                          {task.start_date && (
                                            <div className="text-[10px] text-gray-400">
                                              {fmtDate(task.start_date)}{task.end_date && ` → ${fmtDate(task.end_date)}`}
                                            </div>
                                          )}
                                        </div>

                                        {/* Type tag */}
                                        <div className="hidden md:block md:col-span-1">
                                          <span className="text-[12px] font-medium px-2 py-0.5 rounded-md"
                                            style={{ color: category.color, backgroundColor: category.bg }}
                                          >
                                            {category.label}
                                          </span>
                                        </div>

                                        {/* Priority tag */}
                                        <div className="hidden md:block md:col-span-1">
                                          <span className="text-[12px] font-medium px-2 py-0.5 rounded-md"
                                            style={{ color: priority.color, backgroundColor: priority.bg }}
                                          >
                                            {priority.label}
                                          </span>
                                        </div>

                                        {/* Person avatar */}
                                        <div className="hidden md:flex md:col-span-1 justify-center">
                                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-[9px] font-bold">
                                            {user?.avatar_url ? (
                                              <img
                                                src={user.avatar_url}
                                                alt={user.full_name}
                                                className="w-6 h-6 rounded-full object-cover"
                                              />
                                            ) : (
                                              userInitials
                                            )}
                                          </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="hidden md:flex md:col-span-1 justify-end relative">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === task.id ? null : task.id); }}
                                            className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors"
                                          >
                                            <HiOutlineDotsHorizontal size={14} />
                                          </button>
                                          {openMenuId === task.id && (
                                            <div ref={menuRef} className="absolute right-0 top-8 z-50 w-36 rounded-lg border shadow-lg py-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                                              <button onClick={(e) => { e.stopPropagation(); handleTaskClick(task.id); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
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

                                        {/* Mobile-only meta row */}
                                        <div className="md:hidden flex items-center gap-2 flex-wrap mt-1 pl-7">
                                          <span className="text-[12px] font-medium px-2 py-0.5 rounded-md"
                                            style={{ color: category.color, backgroundColor: category.bg }}
                                          >
                                            {category.label}
                                          </span>
                                          <span className="text-[12px] font-medium px-2 py-0.5 rounded-md"
                                            style={{ color: priority.color, backgroundColor: priority.bg }}
                                          >
                                            {priority.label}
                                          </span>
                                          {task.start_date && (
                                            <span className="text-[12px] text-gray-400">{fmtDate(task.start_date)}</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Board / Grid View — Kanban columns by status, rows by project */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
              {Object.entries(statusConfig).map(([status, cfg]) => {
                const projectGroups = groupedByStatus[status] || {};
                const count = totalByStatus[status] || 0;

                return (
                  <div
                    key={status}
                    className={`rounded-xl min-w-0 transition-all ${dragOverStatus === status ? 'ring-2 ring-blue-400 bg-blue-50/30' : ''}`}
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, status)}
                  >
                    {/* Status column header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-t-xl text-sm font-semibold"
                      style={{ color: cfg.color }}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
                      {cfg.label}
                      <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.color + '20' }}>
                        {count}
                      </span>
                    </div>

                    {/* Project groups inside column */}
                    <div className="p-2 space-y-3 max-h-[70vh] overflow-y-auto">
                      {Object.keys(projectGroups).length === 0 ? (
                        <p className="text-xs text-center py-4" style={{ color: 'var(--muted)' }}>Sin tareas</p>
                      ) : (
                        Object.entries(projectGroups).map(([projectKey, tasks]) => {
                          const projectId = projectKey === 'personal' ? 'personal' : tasks[0]?.project_id?.toString() || projectKey;
                          const collapseKey = `${status}::${projectId}`;
                          const isProjectCollapsed = collapsedProjects[collapseKey];
                          const projectColor = projectKey === 'personal' ? '#8b5cf6' : getProjectColor(tasks[0]?.project?.color_hex || '');
                          const projectName = projectKey === 'personal' ? 'Personal' : (tasks[0]?.project?.name || projectKey);

                          return (
                            <div key={projectKey} className="rounded-lg p-2" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                              {/* Project separator header */}
                              <div className="flex items-center justify-between mb-1.5">
                                <button
                                  onClick={() => toggleProjectCollapse(collapseKey)}
                                  className="flex items-center gap-1.5 text-xs font-medium min-w-0"
                                >
                                  {isProjectCollapsed ? <HiOutlineChevronRight size={10} /> : <HiOutlineChevronDown size={10} />}
                                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: projectColor }} />
                                  <span className="truncate">{projectName}</span>
                                  <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ color: 'var(--muted)', backgroundColor: 'var(--bg)' }}>
                                    {tasks.length}
                                  </span>
                                </button>
                                <button className="p-0.5 rounded hover:bg-white/10 transition-colors" style={{ color: 'var(--muted)' }}>
                                  <HiOutlinePlus size={12} />
                                </button>
                              </div>

                              {/* Task cards */}
                              {!isProjectCollapsed && (
                                <div className="space-y-2">
                                  {tasks.map((task: Task) => {
                                    const category = categoryConfig[task.category] || categoryConfig.PERSONAL;
                                    const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

                                    return (
                                      <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onClick={() => handleTaskClick(task.id)}
                                        className="rounded-lg border p-2.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all group"
                                        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                                      >
                                        {/* Title */}
                                        <div className="flex items-start justify-between gap-1.5 mb-1">
                                          <h4 className="text-sm font-semibold leading-tight line-clamp-2">{task.title}</h4>
                                          <div className="relative flex-shrink-0">
                                            <button
                                              className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
                                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === `k-${task.id}` ? null : `k-${task.id}`); }}
                                            >
                                              <HiOutlineDotsVertical size={12} />
                                            </button>
                                            {openMenuId === `k-${task.id}` && (
                                              <div ref={menuRef} className="absolute right-0 top-5 z-50 w-36 rounded-lg border shadow-lg py-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                                                <button onClick={(e) => { e.stopPropagation(); handleTaskClick(task.id); setOpenMenuId(null); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors">
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
                                          <p className="text-[11px] mb-2 line-clamp-2 font-light" style={{ color: 'var(--muted)' }}>
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
                                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: cfg.dot }}>
                                            {user?.avatar_url ? (
                                              <img
                                                src={user.avatar_url}
                                                alt={user.full_name}
                                                className="w-5 h-5 rounded-full object-cover"
                                              />
                                            ) : (
                                              userInitials
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
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
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[300px] xl:flex-shrink-0 space-y-4">
          {/* Habits Today */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-2">
                <HiOutlineStar size={14} className="text-amber-400" />
                <h3 className="text-sm font-semibold">Hábitos de hoy</h3>
              </div>
              <a href="/habits" className="text-xs text-black font-semibold hover:underline">Ver todos</a>
            </div>
            {todaysHabits.length === 0 ? (
              <p className="text-xs text-gray-400">No hay hábitos configurados</p>
            ) : (
              <div className="space-y-5">
                {todaysHabits.map(habit => (
                  <div key={habit.id} className={`flex items-center justify-between ${habit.todayCompleted ? 'bg-[#f2fff2]' : ''} p-1.5 rounded-lg`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => toggleLog(habit.id, habit.todayDate, weekStartStr)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${habit.todayCompleted
                          ? 'bg-black border-black'
                          : 'border-gray-300 hover:border-black'
                          }`}
                      >
                        {habit.todayCompleted && <HiOutlineCheck size={8} className="text-white" />}
                      </button>
                      <span className={`text-sm truncate ${habit.todayCompleted ? 'text-gray-400 line-through' : 'text-[var(--foreground)]'}`}>
                        {habit.name}
                      </span>
                    </div>
                    <span className="text-xs text-black font-bold border-1 border-solid px-2 rounded-2xl border-gray-300 flex-shrink-0 ml-2">
                      {habit.week?.filter(d => d.is_completed).length || 0} días
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Timeline */}
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineCalendar size={14} className="text-[var(--primary)]" />
              <h3 className="text-sm font-semibold">Histórico</h3>
            </div>

            {/* Current date tasks */}
            {tasks.filter(t => t.status !== 'DONE').length > 0 && (
              <div className="mb-4">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-black mb-2">
                  {isToday ? 'Hoy' : format(currentDateObj, "d 'de' MMM", { locale: es })}
                </p>
                <div className="space-y-2 pl-2">
                  {tasks.filter(t => t.status !== 'DONE').slice(0, 4).map(task => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 rounded-md p-1.5 -m-1.5 transition-colors"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: getProjectColor(task.project?.name || '') }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate text-[var(--foreground)] font-medium">{task.title}</p>
                        <p className="text-[10px] text-gray-400">{task.project?.name || task.category}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {task.end_date && task.start_date
                          ? Math.max(1, Math.ceil((new Date(task.end_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24))) + 'h'
                          : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next day */}
            {tomorrowTasks.length > 0 && (
              <div className="mb-4">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  {isToday ? 'Mañana' : format(addDays(currentDateObj, 1), "d 'de' MMM", { locale: es })}
                </p>
                <div className="space-y-2 pl-2">
                  {tomorrowTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 rounded-md p-1.5 -m-1.5 transition-colors"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: getProjectColor(task.project?.name || '') }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate text-[var(--foreground)] font-medium">{task.title}</p>
                        <p className="text-[10px] text-gray-400">{task.project?.name || task.category}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {task.end_date && task.start_date
                          ? Math.max(1, Math.ceil((new Date(task.end_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24))) + 'h'
                          : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {futureTasks.length > 0 && (
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Próximos días</p>
                <div className="space-y-2 pl-2">
                  {futureTasks.slice(0, 4).map(task => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 rounded-md p-1.5 -m-1.5 transition-colors"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: getProjectColor(task.project?.name || '') }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate text-[var(--foreground)] font-medium">{task.title}</p>
                        <p className="text-[10px] text-gray-400">{task.project?.name || task.category}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {task.end_date && task.start_date
                          ? Math.max(1, Math.ceil((new Date(task.end_date).getTime() - new Date(task.start_date).getTime()) / (1000 * 60 * 60 * 24))) + 'h'
                          : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tomorrowTasks.length === 0 && futureTasks.length === 0 && tasks.filter(t => t.status !== 'DONE').length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">Sin actividad reciente</p>
            )}
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
