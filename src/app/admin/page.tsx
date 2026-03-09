'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import api from '@/lib/api';
import { User } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  HiOutlineUsers,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineSave,
} from 'react-icons/hi';

export default function AdminPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'notifications'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Notification form
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    type: 'info' as any,
    action_url: ''
  });
  const [sendingNotif, setSendingUsers] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleBetaTester = async (userId: string, currentVal: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/permissions`, { is_beta_tester: !currentVal });
      setUsers(users.map(u => u.id === userId ? { ...u, is_beta_tester: !currentVal } : u));
    } catch (error) {
      alert('Error al actualizar permisos');
    }
  };

  const sendGlobalNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) return;
    
    setSendingUsers(true);
    try {
      await api.post('/notifications/global', notifForm);
      alert('Notificación enviada a todos los usuarios correctamente.');
      setNotifForm({ title: '', message: '', type: 'info', action_url: '' });
    } catch (error) {
      alert('Error al enviar notificación');
    } finally {
      setSendingUsers(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <HiOutlineShieldCheck size={64} className="text-red-200 mb-4" />
        <h1 className="text-xl font-bold text-gray-800">Acceso Denegado</h1>
        <p className="text-gray-500 mt-2">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <HiOutlineShieldCheck className="text-indigo-600" />
          Panel de Administración
        </h1>
        <p className="text-gray-500 mt-1">Gestiona usuarios, permisos y comunicaciones del sistema.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <HiOutlineUsers size={18} />
          Usuarios
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'notifications' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <HiOutlineBell size={18} />
          Notificaciones Globales
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {activeTab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-bold uppercase tracking-widest border-b border-gray-50">
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4 text-center">Beta Tester</th>
                  <th className="px-6 py-4 text-right">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">Cargando usuarios...</td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {u.full_name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{u.full_name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleBetaTester(u.id, u.is_beta_tester)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors relative inline-block ${
                          u.is_beta_tester ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${u.is_beta_tester ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-gray-400">
                      {format(new Date(u.created_at), 'd MMM yyyy', { locale: es })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 max-w-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <HiOutlineSparkles className="text-amber-500" />
              Enviar Anuncio Global
            </h2>
            <form onSubmit={sendGlobalNotification} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Título</label>
                  <input
                    type="text"
                    required
                    value={notifForm.title}
                    onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                    placeholder="Ej: ¡Nuevos Reportes!"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tipo</label>
                  <select
                    value={notifForm.type}
                    onChange={e => setNotifForm({ ...notifForm, type: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="info">Informativa (Azul)</option>
                    <option value="beta_invite">Invitación Beta (Púrpura)</option>
                    <option value="success">Éxito (Verde)</option>
                    <option value="warning">Aviso (Naranja)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mensaje</label>
                <textarea
                  required
                  rows={4}
                  value={notifForm.message}
                  onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                  placeholder="Escribe el contenido del anuncio para todos los usuarios..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">URL de Acción (Opcional)</label>
                <input
                  type="text"
                  value={notifForm.action_url}
                  onChange={e => setNotifForm({ ...notifForm, action_url: e.target.value })}
                  placeholder="/reports"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={sendingNotif}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  <HiOutlineSave size={20} />
                  {sendingNotif ? 'Enviando...' : 'Enviar a todos los usuarios'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}