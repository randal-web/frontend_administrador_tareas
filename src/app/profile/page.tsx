'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { HiOutlineUser, HiOutlineMail, HiOutlinePencil, HiOutlineCheck, HiX } from 'react-icons/hi';

export default function ProfilePage() {
  const { user, updateProfile, isLoading: loading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', avatar_url: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name, avatar_url: user.avatar_url || '' });
    }
  }, [user]);

  const handleSave = async () => {
    await updateProfile(form);
    setEditing(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Perfil</h1>

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <HiOutlineCheck size={16} />
          Perfil actualizado correctamente.
        </div>
      )}

      <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              user.full_name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.full_name}</h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{user.email}</p>
            {user.provider !== 'local' && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 capitalize">
                {user.provider}
              </span>
            )}
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'var(--border)' }} />

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
              <span className="flex items-center gap-1"><HiOutlineUser size={12} /> Nombre completo</span>
            </label>
            {editing ? (
              <input
                value={form.full_name}
                onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)' }}
              />
            ) : (
              <p className="text-sm py-2">{user.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
              <span className="flex items-center gap-1"><HiOutlineMail size={12} /> Correo electrónico</span>
            </label>
            <p className="text-sm py-2">{user.email}</p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>URL del avatar</label>
            {editing ? (
              <input
                value={form.avatar_url}
                onChange={e => setForm(prev => ({ ...prev, avatar_url: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: 'var(--border)' }}
                placeholder="https://..."
              />
            ) : (
              <p className="text-sm py-2">{user.avatar_url || '—'}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Proveedor de autenticación</label>
            <p className="text-sm py-2 capitalize">{user.provider}</p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Miembro desde</label>
            <p className="text-sm py-2">{new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'var(--border)' }} />

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {editing ? (
            <>
              <button
                onClick={() => { setEditing(false); setForm({ full_name: user.full_name, avatar_url: user.avatar_url || '' }); }}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm border"
                style={{ borderColor: 'var(--border)' }}
              >
                <HiX size={14} /> Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <HiOutlineCheck size={14} /> Guardar
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white font-medium"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <HiOutlinePencil size={14} /> Editar perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
