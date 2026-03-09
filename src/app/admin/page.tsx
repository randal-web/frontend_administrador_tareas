'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { User } from '@/types';
import { format, formatDistanceToNow, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  HiOutlineUsers,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineSave,
  HiOutlineSearch,
  HiOutlineChartBar,
  HiOutlineStar,
  HiOutlineBan,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineStatusOnline,
  HiOutlineDatabase,
  HiOutlineDesktopComputer,
  HiOutlineDeviceMobile,
  HiOutlineChip,
  HiOutlineArrowRight,
  HiOutlineRefresh,
} from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  module: string;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: User;
}

export default function AdminPage() {
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'notifications' | 'audit'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detail selection
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Modals and Feedback
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'beta' | 'role' | 'status', value: any } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Notification form
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'beta_invite' | 'success' | 'warning',
    action_url: ''
  });
  const [sendingNotif, setSendingNotif] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      showToast('Error al obtener usuarios', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await api.get('/admin/audit');
      setAuditLogs(res.data);
    } catch (error) {
      showToast('Error al obtener auditoría', 'error');
    } finally {
      setLoadingAudit(false);
    }
  };

  const executePermissionChange = async () => {
    if (!confirmAction) return;
    
    const { id, type, value } = confirmAction;
    const targetUser = users.find(u => u.id === id);
    if (!targetUser) return;

    try {
      const payload = {
        is_beta_tester: type === 'beta' ? value : targetUser.is_beta_tester,
        role: type === 'role' ? value : targetUser.role,
        is_active: type === 'status' ? value : targetUser.is_active
      };

      await api.patch(`/admin/users/${id}/permissions`, payload);
      setUsers(users.map(u => u.id === id ? { ...u, ...payload } : u));
      showToast('Usuario actualizado correctamente');
    } catch (error) {
      showToast('Error al actualizar usuario', 'error');
    } finally {
      setConfirmAction(null);
    }
  };

  const sendGlobalNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) return;
    
    setSendingNotif(true);
    try {
      await api.post('/notifications/global', notifForm);
      showToast('Notificación enviada a todos los usuarios');
      setNotifForm({ title: '', message: '', type: 'info', action_url: '' });
    } catch (error) {
      showToast('Error al enviar notificación', 'error');
    } finally {
      setSendingNotif(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(u => 
      u.full_name.toLowerCase().includes(lowerQuery) || 
      u.email.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  const stats = useMemo(() => {
    const now = new Date();
    const onlineThreshold = 5 * 60 * 1000;

    return {
      total: users.length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      testers: users.filter(u => u.is_beta_tester).length,
      inactive: users.filter(u => !u.is_active).length,
      online: users.filter(u => {
        if (!u.last_active_at) return false;
        const d = new Date(u.last_active_at);
        return isValid(d) && (now.getTime() - d.getTime() < onlineThreshold);
      }).length
    };
  }, [users]);

  const safeFormatDistance = (dateStr: string | null | Date, suffix = false) => {
    if (!dateStr) return 'Nunca';
    const d = new Date(dateStr);
    if (!isValid(d)) return 'Fecha inválida';
    return formatDistanceToNow(d, { addSuffix: suffix, locale: es });
  };

  const isOnline = (lastActive: Date | string | null) => {
    if (!lastActive) return false;
    const now = new Date();
    const activeDate = new Date(lastActive);
    if (!isValid(activeDate)) return false;
    return now.getTime() - activeDate.getTime() < 5 * 60 * 1000;
  };

  const getDeviceIcon = (ua: string) => {
    if (!ua) return <HiOutlineDesktopComputer />;
    const lowerUA = ua.toLowerCase();
    if (lowerUA.includes('android') || lowerUA.includes('iphone')) return <HiOutlineDeviceMobile />;
    return <HiOutlineDesktopComputer />;
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <HiOutlineShieldCheck size={64} className="text-red-200 mb-4" />
        <h1 className="text-xl font-bold text-gray-800">Acceso Denegado</h1>
        <p className="text-gray-500 mt-2">No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm text-white flex items-center gap-3 animate-slide-in-right ${
          toastMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toastMessage.type === 'success' ? <HiOutlineCheckCircle size={20}/> : <HiOutlineXCircle size={20}/>}
          {toastMessage.text}
        </div>
      )}

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <HiOutlineShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Panel de Administración
          </h1>
        </div>
        <p className="text-gray-500 font-medium">Gestiona los nodos de la red y audita el historial del sistema.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-gray-100/80 p-1.5 rounded-2xl w-fit mb-10 border border-gray-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
          }`}
        >
          <HiOutlineChartBar size={20} />
          Métricas
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'users' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
          }`}
        >
          <HiOutlineUsers size={20} />
          Usuarios
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'audit' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
          }`}
        >
          <HiOutlineDatabase size={20} />
          Auditoría
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'notifications' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
          }`}
        >
          <HiOutlineBell size={20} />
          Comunicación
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-xl shadow-gray-100 overflow-hidden min-h-[600px] flex">
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="p-10 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-gray-900">Visión Panorámica</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold ring-1 ring-green-100">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {stats.online} Usuarios en línea ahora
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-50 to-indigo-100/30 border border-indigo-100 group hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                    <HiOutlineUsers size={24} />
                  </div>
                  <p className="text-xs font-black text-indigo-900/40 uppercase tracking-[0.2em]">Población Total</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-4xl font-black text-indigo-950">{stats.total}</p>
                    <span className="text-xs font-bold text-indigo-600">cuentas</span>
                  </div>
                </div>
                
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-100 group hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
                    <HiOutlineStar size={24} />
                  </div>
                  <p className="text-xs font-black text-purple-900/40 uppercase tracking-[0.2em]">Cuerpo de Testers</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-4xl font-black text-purple-950">{stats.testers}</p>
                    <span className="text-xs font-bold text-purple-600">activos</span>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-red-50 to-red-100/30 border border-red-100 group hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-red-200">
                    <HiOutlineBan size={24} />
                  </div>
                  <p className="text-xs font-black text-red-900/40 uppercase tracking-[0.2em]">Cuentas Suspendidas</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-4xl font-black text-red-950">{stats.inactive}</p>
                    <span className="text-xs font-bold text-red-600">bloqueadas</span>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-amber-50 to-amber-100/30 border border-amber-100 group hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-lg shadow-amber-200">
                    <HiOutlineShieldCheck size={24} />
                  </div>
                  <p className="text-xs font-black text-amber-900/40 uppercase tracking-[0.2em]">Administración</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-4xl font-black text-amber-950">{stats.admins}</p>
                    <span className="text-xs font-bold text-amber-600">staff</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gray-50/20">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Directorio de Usuarios</h2>
                  <p className="text-sm text-gray-500 mt-1">Control de acceso, roles y estados de cuenta.</p>
                </div>
                <div className="relative group">
                  <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="text"
                    placeholder="Buscar por nombre, email o ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-6 py-3.5 text-sm border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none w-full lg:w-[400px] transition-all bg-white font-medium"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-[0.15em] border-b border-gray-100 sticky top-0 bg-white z-10">
                      <th className="px-10 py-5">Identidad</th>
                      <th className="px-6 py-5 text-center">Último Acceso</th>
                      <th className="px-6 py-5 text-center">Estado de Cuenta</th>
                      <th className="px-6 py-5 text-center">Privilegios</th>
                      <th className="px-6 py-5 text-center">Beta</th>
                      <th className="px-10 py-5 text-right">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={6} className="px-10 py-32 text-center">
                          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-xl shadow-indigo-100" />
                          <p className="text-gray-500 font-black text-lg">Sincronizando Base de Datos...</p>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-10 py-32 text-center">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiOutlineSearch size={40} className="text-gray-300" />
                          </div>
                          <p className="text-gray-400 font-bold text-lg">No se encontraron resultados para "{searchQuery}"</p>
                        </td>
                      </tr>
                    ) : filteredUsers.map(u => {
                      const online = isOnline(u.last_active_at);
                      const isSelf = u.id === currentUser?.id;
                      
                      return (
                        <tr key={u.id} className={`hover:bg-indigo-50/30 transition-colors group ${!u.is_active ? 'bg-red-50/20' : ''} ${selectedUserId === u.id ? 'bg-indigo-50' : ''}`}>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt={u.full_name} className="w-11 h-11 rounded-2xl object-cover shadow-md ring-2 ring-white" />
                                ) : (
                                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-lg">
                                    {u.full_name[0].toUpperCase()}
                                  </div>
                                )}
                                {online && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-black text-gray-900">{u.full_name}</p>
                                  {isSelf && <span className="px-2 py-0.5 bg-indigo-600 text-[9px] font-black text-white rounded-full uppercase tracking-widest">Tú</span>}
                                </div>
                                <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-6 text-center">
                            {online ? (
                              <span className="text-[10px] font-black text-green-600 bg-green-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">En línea</span>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">
                                  {u.last_active_at ? safeFormatDistance(u.last_active_at, true) : 'Nunca'}
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-6 text-center">
                            <button
                              onClick={() => setConfirmAction({ id: u.id, type: 'status', value: !u.is_active })}
                              disabled={isSelf}
                              className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                u.is_active 
                                  ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                              } ${isSelf ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                            >
                              {u.is_active ? (
                                <><HiOutlineCheckCircle size={14}/> Activo</>
                              ) : (
                                <><HiOutlineBan size={14}/> Suspendido</>
                              )}
                            </button>
                          </td>

                          <td className="px-6 py-6 text-center">
                            <select 
                              value={u.role}
                              onChange={(e) => setConfirmAction({ id: u.id, type: 'role', value: e.target.value })}
                              disabled={isSelf}
                              className={`text-[10px] font-black px-4 py-2 rounded-xl border-2 outline-none cursor-pointer appearance-none text-center transition-all ${
                                u.role === 'ADMIN' 
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                                  : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-200'
                              } ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN STAFF</option>
                            </select>
                          </td>

                          <td className="px-6 py-6 text-center">
                            <button
                              onClick={() => setConfirmAction({ id: u.id, type: 'beta', value: !u.is_beta_tester })}
                              className={`w-12 h-6 rounded-full p-1 transition-all relative inline-block ${
                                u.is_beta_tester ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-gray-200 shadow-inner'
                              }`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${u.is_beta_tester ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                          </td>

                          <td className="px-10 py-6 text-right">
                            <button 
                              onClick={() => setSelectedUserId(selectedUserId === u.id ? null : u.id)}
                              className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                            >
                              <HiOutlineArrowRight size={20} className={`transition-transform ${selectedUserId === u.id ? 'rotate-180' : ''}`} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AUDIT TAB */}
          {activeTab === 'audit' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/20">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Historial de Auditoría</h2>
                  <p className="text-sm text-gray-500 mt-1">Registro cronológico de acciones en el sistema.</p>
                </div>
                <button onClick={fetchAuditLogs} className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors" title="Actualizar historial">
                  <HiOutlineRefresh size={20} className={loadingAudit ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-10 py-8">
                {loadingAudit ? (
                  <div className="flex flex-col items-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Descifrando logs...</p>
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-20 text-gray-400 italic">No hay registros de auditoría aún.</div>
                ) : (
                  <div className="space-y-4">
                    {auditLogs.map(log => (
                      <div key={log.id} className="flex gap-4 p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 group hover:border-indigo-200 transition-colors">
                        <div className="flex-shrink-0">
                          {log.user?.avatar_url ? (
                            <img src={log.user.avatar_url} className="w-10 h-10 rounded-xl object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                              {log.user?.full_name[0] || '?'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-900 truncate">
                                {log.user?.full_name || 'Sistema'}
                                <span className="mx-2 text-gray-300 font-normal">|</span>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{log.action}</span>
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-4">
                              {safeFormatDistance(log.created_at, true)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><HiOutlineChip size={14}/> {log.module}</span>
                            <span className="flex items-center gap-1">
                              {getDeviceIcon(log.user_agent)}
                              {log.user_agent ? (log.user_agent.includes('Chrome') ? 'Chrome' : log.user_agent.includes('Firefox') ? 'Firefox' : 'Browser') : 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="p-16 max-w-4xl mx-auto overflow-y-auto">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100/50">
                  <HiOutlineBell size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Mensajería de Sistema</h2>
                <p className="text-gray-500 mt-2 font-medium">Difunde anuncios críticos a toda la red.</p>
              </div>

              <form onSubmit={sendGlobalNotification} className="space-y-8 bg-gray-50/40 p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Cabecera</label>
                    <input
                      type="text"
                      required
                      value={notifForm.title}
                      onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Tipo</label>
                    <select
                      value={notifForm.type}
                      onChange={e => setNotifForm({ ...notifForm, type: e.target.value as any })}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm font-bold transition-all bg-white cursor-pointer appearance-none"
                    >
                      <option value="info">🔵 Informativo</option>
                      <option value="beta_invite">🟣 Invitación Beta</option>
                      <option value="success">🟢 Actualización Exitosa</option>
                      <option value="warning">🟠 Alerta de Sistema</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Cuerpo del Mensaje</label>
                  <textarea
                    required
                    rows={4}
                    value={notifForm.message}
                    onChange={e => setNotifForm({ ...notifForm, message: e.target.value })}
                    className="w-full px-6 py-5 rounded-[2rem] border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-sm leading-relaxed transition-all bg-white font-medium"
                  />
                </div>

                <div className="pt-8 flex justify-center">
                  <button
                    type="submit"
                    disabled={sendingNotif}
                    className="group relative flex items-center justify-center gap-3 px-12 py-5 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <HiOutlineSave size={20} className="relative z-10" />
                    <span className="relative z-10">{sendingNotif ? 'Enviando...' : 'Difundir Notificación'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* SIDEBAR DETAIL (ACTIONS LIST ONLY) */}
        {selectedUserId && (
          <div className="w-[400px] border-l border-gray-100 bg-gray-50/30 overflow-y-auto animate-slide-in-right">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-gray-900">Histórico Personal</h3>
                <button onClick={() => setSelectedUserId(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                  <HiOutlineXCircle size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Eventos Recientes</p>
                {auditLogs.filter(l => l.user_id === selectedUserId).length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No hay acciones registradas para este usuario.</p>
                ) : (
                  auditLogs.filter(l => l.user_id === selectedUserId).slice(0, 20).map(log => (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 text-xs shadow-sm group hover:border-indigo-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black text-gray-900 uppercase tracking-tighter">{log.action}</span>
                        <span className="text-[10px] text-gray-400">{safeFormatDistance(log.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{log.module}</span>
                        <span className="text-[9px] text-gray-400">
                          {isValid(new Date(log.created_at)) ? format(new Date(log.created_at), 'd MMM', { locale: es }) : ''}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        title={
          confirmAction?.type === 'role' ? 'Reasignar Rango' : 
          confirmAction?.type === 'status' ? 'Estado de Cuenta' :
          'Accesos Beta'
        }
        message={
          confirmAction?.type === 'role'
            ? `¿Confirmas elevar/degradar el rango a ${confirmAction.value}?`
            : confirmAction?.type === 'status'
            ? `¿Estás seguro de que quieres ${confirmAction.value ? 'reactivar' : 'suspender'} esta cuenta?`
            : `¿Conceder acceso al canal Beta?`
        }
        onConfirm={executePermissionChange}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
