'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineX,
} from 'react-icons/hi';
import Link from 'next/link';

export default function NotificationDropdown({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { notifications, unreadCount, fetchNotifications, markAsRead, deleteNotification, isLoading } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'beta_invite': return <HiOutlineSparkles className="text-purple-500" size={20} />;
      case 'success': return <HiOutlineCheckCircle className="text-green-500" size={20} />;
      case 'warning': return <HiOutlineInformationCircle className="text-amber-500" size={20} />;
      default: return <HiOutlineInformationCircle className="text-blue-500" size={20} />;
    }
  };

  const safeFormatDate = (notif: any) => {
    const dateStr = notif.created_at || notif.createdAt;
    if (!dateStr) return 'Fecha no disponible';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      return format(date, "d 'de' MMMM, HH:mm", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] flex flex-col max-h-[500px]"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800">Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} nuevas
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <HiOutlineX size={18} />
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {isLoading && notifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <HiOutlineBell size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 flex gap-4 transition-colors group relative ${notif.is_read ? 'bg-white' : 'bg-indigo-50/30'}`}
                onMouseEnter={() => !notif.is_read && markAsRead(notif.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {safeFormatDate(notif)}
                  </p>
                  
                  {notif.type === 'beta_invite' && !notif.is_read && (
                    <Link 
                      href="/reports" 
                      onClick={onClose}
                      className="inline-block mt-3 px-4 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      Ir a Reportes
                    </Link>
                  )}
                </div>
                <button 
                  onClick={() => deleteNotification(notif.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all"
                >
                  <HiOutlineTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 text-center">
        <Link 
          href="/notifications" 
          onClick={onClose}
          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider block"
        >
          Ver todas las notificaciones
        </Link>
      </div>
    </div>
  );
}