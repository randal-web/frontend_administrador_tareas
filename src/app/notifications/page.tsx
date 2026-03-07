'use client';

import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { AppNotification } from '@/types';
import {
  HiOutlineBell,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineClipboardList,
  HiOutlineCalendar,
} from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';

const typeConfig: Record<string, { icon: typeof HiOutlineSun; color: string; bg: string }> = {
  morning_tasks:     { icon: HiOutlineSun,            color: '#f59e0b', bg: '#fffbeb' },
  morning_reminders: { icon: HiOutlineClipboardList,  color: '#3b82f6', bg: '#eff6ff' },
  evening_pending:   { icon: HiOutlineMoon,           color: '#7c3aed', bg: '#f5f3ff' },
  task_due:          { icon: HiOutlineCalendar,        color: '#ef4444', bg: '#fef2f2' },
  reminder_due:      { icon: HiOutlineBell,            color: '#ea580c', bg: '#fff7ed' },
};

const fmtDate = (d: string) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const dateStr = date.toISOString().split('T')[0];
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const time = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  if (dateStr === today) return `Hoy, ${time}`;
  if (dateStr === yesterdayStr) return `Ayer, ${time}`;

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}, ${time}`;
};

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    generateNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  } = useNotificationStore();

  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    generateNotifications();
    fetchNotifications();
  }, [generateNotifications, fetchNotifications]);

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleConfirmClearAll = async () => {
    await deleteAll();
    setConfirmClearAll(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Notificaciones</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--border)' }}
            >
              <HiOutlineCheckCircle size={14} />
              Marcar todas leídas
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors hover:bg-red-50 hover:text-red-500 hover:border-red-200"
              style={{ borderColor: 'var(--border)' }}
            >
              <HiOutlineTrash size={14} />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg w-fit" style={{ backgroundColor: 'var(--border)' }}>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            filter === 'all' ? 'bg-white text-[var(--foreground)] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            filter === 'unread' ? 'bg-white text-[var(--foreground)] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sin leer{unreadCount > 0 && ` (${unreadCount})`}
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Cargando notificaciones...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <HiOutlineBell size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <NotificationCard
              key={n.id}
              notification={n}
              onRead={() => markAsRead(n.id)}
              onDelete={() => deleteNotification(n.id)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmClearAll}
        title="¿Eliminar todas las notificaciones?"
        message="Se borrarán todas las notificaciones. Esta acción no se puede deshacer."
        onConfirm={handleConfirmClearAll}
        onCancel={() => setConfirmClearAll(false)}
      />
    </div>
  );
}

/* ---------- Card ---------- */

function NotificationCard({
  notification,
  onRead,
  onDelete,
}: {
  notification: AppNotification;
  onRead: () => void;
  onDelete: () => void;
}) {
  const cfg = typeConfig[notification.type] || typeConfig.morning_tasks;
  const Icon = cfg.icon;

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        notification.is_read ? 'opacity-60' : ''
      }`}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: cfg.bg }}
        >
          <Icon size={18} style={{ color: cfg.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">{notification.title}</h3>
            {!notification.is_read && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs whitespace-pre-line mb-1.5" style={{ color: 'var(--muted)' }}>
            {notification.message}
          </p>
          <span className="text-[11px] text-gray-400">{fmtDate(notification.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!notification.is_read && (
            <button
              onClick={onRead}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-500 transition-colors"
              title="Marcar como leída"
            >
              <HiOutlineCheck size={14} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Eliminar"
          >
            <HiOutlineTrash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
