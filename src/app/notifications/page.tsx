'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineCheck,
} from 'react-icons/hi';
import Link from 'next/link';

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAsRead, deleteNotification, isLoading } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'beta_invite': return <HiOutlineSparkles className="text-purple-500" size={24} />;
      case 'success': return <HiOutlineCheckCircle className="text-green-500" size={24} />;
      case 'warning': return <HiOutlineInformationCircle className="text-amber-500" size={24} />;
      default: return <HiOutlineInformationCircle className="text-blue-500" size={24} />;
    }
  };

  const safeFormatDate = (notif: any) => {
    const dateStr = notif.created_at || notif.createdAt;
    if (!dateStr) return 'Fecha no disponible';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Fecha no disponible';
      return format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es });
    } catch {
      return 'Fecha no disponible';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <HiOutlineBell className="text-indigo-600" />
            Centro de Notificaciones
          </h1>
          <p className="text-gray-500 mt-1">Historial completo de avisos y actualizaciones.</p>
        </div>
        <button 
          onClick={() => notifications.forEach(n => !n.is_read && markAsRead(n.id))}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1.5"
        >
          <HiOutlineCheck size={16} />
          Marcar todas como leídas
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading && notifications.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando tu historial...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center">
            <HiOutlineBell size={64} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-500 font-medium text-lg">No hay notificaciones</p>
            <p className="text-gray-400 text-sm mt-1">Te avisaremos cuando haya novedades importantes.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-6 flex gap-6 transition-all hover:bg-gray-50/50 relative ${notif.is_read ? 'bg-white' : 'bg-indigo-50/20'}`}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${notif.is_read ? 'bg-gray-50' : 'bg-white shadow-sm'}`}>
                    {getIcon(notif.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`text-base font-bold ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notif.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {safeFormatDate(notif)}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <span className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                  
                  <div className="mt-4 flex items-center gap-3">
                    {notif.type === 'beta_invite' && (
                      <Link 
                        href="/reports" 
                        className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        Probar funcionalidad
                      </Link>
                    )}
                    {!notif.is_read && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        Marcar como leída
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notif.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors ml-auto"
                      title="Eliminar notificación"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}