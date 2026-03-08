'use client';

import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useReminderStore } from '@/stores/reminderStore';
import { useNoteStore } from '@/stores/noteStore';
import { useAuthStore } from '@/stores/authStore';
import { getLocalDateString } from '@/lib/dateUtils';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import { useState } from 'react';
import {
  HiOutlineCheck,
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineChevronRight,
  HiOutlineUsers,
  HiOutlineLightningBolt,
  HiOutlineVideoCamera,
} from 'react-icons/hi';

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  HIGH: { label: 'Alta', color: '#dc2626', bg: '#fef2f2' },
  MEDIUM: { label: 'Media', color: '#d97706', bg: '#fffbeb' },
  LOW: { label: 'Baja', color: '#16a34a', bg: '#f0fdf4' },
};

const reminderPriorityColors: Record<string, { color: string; bg: string }> = {
  high: { color: '#dc2626', bg: '#fef2f2' },
  medium: { color: '#d97706', bg: '#fffbeb' },
  low: { color: '#16a34a', bg: '#f0fdf4' },
};

const noteColorMap: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: '#fefce8', border: '#fde047', text: '#854d0e' },
  blue: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
  green: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
  purple: { bg: '#faf5ff', border: '#c4b5fd', text: '#5b21b6' },
  pink: { bg: '#fdf2f8', border: '#f9a8d4', text: '#9d174d' },
};

export default function TodayPage() {
  const todayStr = getLocalDateString();

  const {
    tasks,
    daySummary,
    fetchTasksByDate,
    fetchDaySummary,
    toggleStatus,
  } = useTaskStore();
  const { weeklyHabits, fetchWeeklyHabits, toggleLog } = useHabitStore();
  const { reminders, fetchReminders, toggleComplete } = useReminderStore();
  const { notes, fetchNotes, toggleImportant } = useNoteStore();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { user } = useAuthStore();
  const userInitials = useMemo(() => {
    if (!user?.full_name) return '?';
    return user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }, [user]);

  useEffect(() => {
    fetchTasksByDate(todayStr);
    fetchDaySummary(todayStr);
    fetchWeeklyHabits();
    fetchReminders();
    fetchNotes();
  }, [todayStr, fetchTasksByDate, fetchDaySummary, fetchWeeklyHabits, fetchReminders, fetchNotes]);

  const formattedDate = useMemo(() => {
    const d = new Date(todayStr + 'T00:00:00');
    return format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  }, [todayStr]);

  // Today's pending tasks (not DONE)
  const pendingTasks = useMemo(() => tasks.filter(t => t.status !== 'DONE'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'DONE'), [tasks]);

  // Today's habits
  const todaysHabits = useMemo(() => {
    return weeklyHabits.map(h => {
      const todayDay = h.week?.find(d => d.date === todayStr);
      return { ...h, todayCompleted: todayDay?.is_completed || false };
    });
  }, [weeklyHabits, todayStr]);

  const habitsCompleted = todaysHabits.filter(h => h.todayCompleted).length;

  // Today's meetings (reminders with type 'meeting' due today)
  const todayMeetings = useMemo(() => {
    return reminders.filter(r => r.type === 'meeting' && r.due_date === todayStr && !r.is_completed);
  }, [reminders, todayStr]);

  // Today's reminders/pendientes (due today, excluding meetings)
  const todayReminders = useMemo(() => {
    return reminders.filter(r => r.due_date === todayStr && r.type !== 'meeting' && !r.is_completed);
  }, [reminders, todayStr]);

  // Important notes
  const importantNotes = useMemo(() => {
    return notes.filter(n => n.is_important);
  }, [notes]);

  // Summary stats
  const totalTasks = daySummary?.total || 0;
  const completedCount = daySummary?.completed || 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailModalOpen(true);
  };

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">Hoy</h1>
            <p className="text-sm capitalize mt-0.5" style={{ color: 'var(--muted)' }}>{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
            <span className="flex items-center gap-1.5">
              <HiOutlineLightningBolt size={14} className="text-amber-500" />
              {taskProgress}% completado
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border p-3.5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <HiOutlineClipboardList size={14} className="text-blue-500" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Tareas</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[var(--foreground)]">{pendingTasks.length}</span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>pendientes</span>
          </div>
          {totalTasks > 0 && (
            <div className="mt-2 w-full h-1.5 rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${taskProgress}%` }} />
            </div>
          )}
        </div>

        <div className="rounded-xl border p-3.5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <HiOutlineUsers size={14} className="text-purple-500" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Reuniones</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[var(--foreground)]">{todayMeetings.length}</span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>hoy</span>
          </div>
        </div>

        <div className="rounded-xl border p-3.5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
              <HiOutlineRefresh size={14} className="text-green-500" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Hábitos</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[var(--foreground)]">{habitsCompleted}</span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>de {todaysHabits.length}</span>
          </div>
          {todaysHabits.length > 0 && (
            <div className="mt-2 w-full h-1.5 rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${Math.round((habitsCompleted / todaysHabits.length) * 100)}%` }} />
            </div>
          )}
        </div>

        <div className="rounded-xl border p-3.5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <HiOutlineExclamationCircle size={14} className="text-amber-500" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Pendientes</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[var(--foreground)]">{todayReminders.length}</span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>para hoy</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN - Tasks (spans 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Today's Tasks */}
          <div className="rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-none" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <HiOutlineClipboardList size={16} className="text-blue-500" />
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Tareas de hoy</h2>
              </div>
              <Link href="/dashboard" className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                Ver todas
              </Link>
            </div>
            <div>
              {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>No hay tareas programadas para hoy</p>
                </div>
              ) : (
                <>
                  {pendingTasks.map(task => {
                    const priority = priorityConfig[task.priority];
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 hover:border-solid hover:border-2 hover:border-gray-200 rounded-lg transition-colors cursor-pointer mx-6 my-2"
                        onClick={() => handleTaskClick(task.id)}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStatus(task.id, 'DONE'); }}
                          className="w-4.5 h-4.5 rounded border-2 border-gray-300 hover:border-indigo-400 flex items-center justify-center flex-shrink-0 transition-colors"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">{task.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {task.project?.name && (
                              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                                {task.project.name}
                              </span>
                            )}
                            {task.end_date && (
                              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                                · {task.end_date.split('-').reverse().join('/')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md flex-shrink-0"
                          style={{ color: priority.color, backgroundColor: priority.bg }}>
                          {priority.label}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {user?.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-semibold text-gray-500">{userInitials}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {completedTasks.length > 0 && (
                    <div className="px-4 py-2.5 bg-gray-50/50">
                      <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--muted)' }}>
                        Completadas ({completedTasks.length})
                      </p>
                      {completedTasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 py-1.5 cursor-pointer"
                          onClick={() => handleTaskClick(task.id)}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleStatus(task.id, 'TODO'); }}
                            className="w-4 h-4 rounded border-2 bg-green-500 border-green-500 flex items-center justify-center flex-shrink-0"
                          >
                            <HiOutlineCheck size={10} className="text-white" />
                          </button>
                          <span className="text-sm text-gray-400 line-through truncate">{task.title}</span>
                        </div>
                      ))}
                      {completedTasks.length > 3 && (
                        <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
                          +{completedTasks.length - 3} más completadas
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Meetings */}
          <div className="rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <HiOutlineVideoCamera size={16} className="text-purple-500" />
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Reuniones de hoy</h2>
              </div>
              <Link href="/reminders" className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                Ver todas
              </Link>
            </div>
            <div>
              {todayMeetings.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>No hay reuniones programadas para hoy</p>
                </div>
              ) : (
                todayMeetings.map(meeting => (
                  <div key={meeting.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 hover:border-solid hover:border-2 hover:border-gray-200 rounded-lg transition-colors mx-6 my-2">
                    <button 
                      onClick={() => toggleComplete(meeting.id)}
                      className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 transition-colors hover:border-purple-400 flex items-center justify-center mr-1"
                    >
                      {meeting.is_completed && <HiOutlineCheck size={10} className="text-purple-500" />}
                    </button>
                    
                    {meeting.due_time ? (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white leading-none">{meeting.due_time.slice(0, 2)}</span>
                        <span className="text-[10px] font-medium text-white/80 leading-none mt-0.5">{meeting.due_time.slice(3, 5)}</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <HiOutlineVideoCamera size={18} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)] truncate">{meeting.title}</p>
                      {(meeting.description || meeting.project_name) && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
                          {meeting.description || meeting.project_name}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 flex-shrink-0">
                      Reunión
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today's Reminders */}
          <div className="rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <HiOutlineExclamationCircle size={16} className="text-amber-500" />
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Pendientes de hoy</h2>
              </div>
              <Link href="/reminders" className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                Ver todos
              </Link>
            </div>
            <div>
              {todayReminders.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>No hay pendientes para hoy</p>
                </div>
              ) : (
                todayReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 hover:border-solid hover:border-2 hover:border-gray-200 rounded-lg transition-colors mx-6 my-2">
                    <button 
                      onClick={() => toggleComplete(reminder.id)}
                      className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 transition-colors hover:border-amber-400 flex items-center justify-center"
                    >
                      {reminder.is_completed && <HiOutlineCheck size={10} className="text-green-500" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{reminder.title}</p>
                      {reminder.description && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{reminder.description}</p>
                      )}
                    </div>
                    {reminder.priority && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: reminderPriorityColors[reminder.priority]?.bg }}>
                        <HiOutlineExclamationCircle size={16}
                          style={{ color: reminderPriorityColors[reminder.priority]?.color }} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Habits */}
          <div className="rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <HiOutlineRefresh size={16} className="text-green-500" />
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Hábitos de hoy</h2>
              </div>
              <Link href="/habits" className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                Ver todos
              </Link>
            </div>
            <div className="p-3">
              {todaysHabits.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>No hay hábitos configurados</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {todaysHabits.map(habit => (
                      <div
                        key={habit.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${habit.todayCompleted ? 'bg-green-50 border-1 border-green-300 border-solid' : 'hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleLog(habit.id, todayStr)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${habit.todayCompleted
                              ? 'bg-green-500 border-green-500 '
                              : 'border-gray-300 hover:border-green-400'
                              }`}
                          >
                            {habit.todayCompleted && <HiOutlineCheck size={10} className="text-white" />}
                          </button>
                          <span className="text-sm text-[var(--foreground)]">
                            {habit.name}
                          </span>
                        </div>
                        <span className="text-xs font-medium flex items-center gap-1 flex-shrink-0 ml-2 text-orange-500">
                          🔥 {habit.week?.filter(d => d.is_completed).length || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm" style={{ color: 'var(--muted)' }}>Completados</span>
                      <span className="text-sm font-bold text-[var(--foreground)]">{habitsCompleted} de {todaysHabits.length}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${todaysHabits.length > 0 ? Math.round((habitsCompleted / todaysHabits.length) * 100) : 0}%` }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <div className="rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <HiOutlineStar size={16} className="text-amber-400" />
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Notas importantes</h2>
              </div>
              <Link href="/notes" className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                Ver todas
              </Link>
            </div>
            <div className="p-3">
              {importantNotes.length === 0 ? (
                <div className="py-4 text-center">
                  <HiOutlineStar size={24} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Sin notas importantes</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    Marca notas como importantes con la estrella ★
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {importantNotes.slice(0, 5).map(note => {
                    const colors = noteColorMap[note.color] || noteColorMap.yellow;
                    return (
                      <div
                        key={note.id}
                        className="rounded-xl p-3.5 relative"
                        style={{ backgroundColor: colors.bg, borderLeft: `3px solid ${colors.border}` }}
                      >
                        <button
                          onClick={() => toggleImportant(note.id)}
                          className="absolute top-3 right-3 p-0.5 rounded hover:bg-white/40 transition-colors"
                          title="Quitar de importantes"
                        >
                          <HiOutlineStar size={14} className="text-amber-400 fill-amber-400" />
                        </button>
                        <p className="text-sm font-semibold pr-6" style={{ color: colors.text }}>{note.title}</p>
                        {note.content && (
                          <div
                            className="text-xs mt-1.5 line-clamp-2 opacity-70"
                            style={{ color: colors.text }}
                            dangerouslySetInnerHTML={{ __html: note.content }}
                          />
                        )}
                        <div className="flex items-center gap-1 mt-2.5">
                          <HiOutlineClock size={11} style={{ color: colors.text, opacity: 0.5 }} />
                          <span className="text-[11px]" style={{ color: colors.text, opacity: 0.6 }}>
                            {(() => {
                              const dateStr = note.created_at || note.createdAt;
                              if (!dateStr) return '';
                              const d = new Date(dateStr);
                              return isNaN(d.getTime()) ? '' : format(d, 'dd/MM/yy');
                            })()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {importantNotes.length > 5 && (
                    <Link href="/notes" className="block text-center text-xs font-medium py-1.5 hover:underline" style={{ color: 'var(--primary)' }}>
                      +{importantNotes.length - 5} notas más
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Calendar Overview */}
          <div className="rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <HiOutlineCalendar size={16} className="text-indigo-500" />
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Resumen del día</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Tareas completadas</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">{completedCount}/{totalTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Hábitos completados</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">{habitsCompleted}/{todaysHabits.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Reuniones</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">{todayMeetings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Pendientes</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">{todayReminders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Notas importantes</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">{importantNotes.length}</span>
              </div>
              <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--foreground)]">Progreso total</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{taskProgress}%</span>
                </div>
                <div className="mt-2 w-full h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full transition-all" style={{ width: `${taskProgress}%`, backgroundColor: 'var(--primary)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedTaskId(null); }}
      />
    </div>
  );
}
