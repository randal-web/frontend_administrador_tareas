// User
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  provider: string;
  created_at: string;
}

// Auth
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Task
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskCategory = 'PERSONAL' | 'WORK' | 'PROJECT';

export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  start_date: string | null;
  end_date: string | null;
  category: TaskCategory;
  subtasks?: Subtask[];
  comments?: TaskComment[];
  project?: { id: string; name: string; color_hex: string } | null;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

// Project
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color_hex: string;
  status: 'active' | 'archived';
  total_tasks: number;
  done_tasks: number;
  pending_tasks: number;
  created_at: string;
}

export interface ProjectBoard {
  TODO: Task[];
  IN_PROGRESS: Task[];
  REVIEW: Task[];
  DONE: Task[];
}

export interface GanttTask {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: TaskStatus;
  priority: TaskPriority;
}

// Habit
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: number[];
  logs?: HabitLog[];
  week?: WeekDay[];
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  is_completed: boolean;
}

export interface WeekDay {
  date: string;
  dayIndex: number;
  is_completed: boolean;
  log_id: string | null;
}

// Note
export type NoteColor = 'yellow' | 'blue' | 'green' | 'purple' | 'pink';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  color: NoteColor;
  is_pinned: boolean;
  is_important: boolean;
  created_at: string;
  updated_at: string;
  createdAt?: string;
  updatedAt?: string;
}

// Reminder
export type ReminderType = 'reminder' | 'meeting' | 'event' | 'review';
export type ReminderPriority = 'high' | 'medium' | 'low';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: ReminderType;
  priority: ReminderPriority;
  due_date: string;
  due_time: string | null;
  project_name: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Dashboard Summary
export interface DaySummary {
  total: number;
  completed: number;
  pending: number;
  date: string;
}

// Notification
export type NotificationType = 'morning_tasks' | 'morning_reminders' | 'evening_pending' | 'task_due' | 'reminder_due';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
  updated_at: string;
}
