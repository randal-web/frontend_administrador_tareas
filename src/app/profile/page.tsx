'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { HiOutlineUser, HiOutlineMail, HiOutlinePencil, HiOutlineCheck, HiX, HiOutlineCamera } from 'react-icons/hi';

export default function ProfilePage() {
  const { user, updateProfile, isLoading: loading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', avatar_url: '' });
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name, avatar_url: user.avatar_url || '' });
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !cloudName || !uploadPreset) return;

      // Redimensionar y convertir a base64
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (ev) => {
        img.src = ev.target?.result as string;
        img.onload = async () => {
          const MAX = 256;
          const scale = Math.min(MAX / img.width, MAX / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          setPreview(base64);
          setEditing(true);

          // Subir a Cloudinary
          const formData = new FormData();
          formData.append('file', base64);
          formData.append('upload_preset', uploadPreset);
          try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
              setPreview(data.secure_url);
              setForm(prev => ({ ...prev, avatar_url: data.secure_url }));
            }
          } catch (err) {
            // Error de subida
          }
        };
      };
      reader.readAsDataURL(file);
      e.target.value = '';
  };

  const handleSave = async () => {
    await updateProfile(form);
    setEditing(false);
    setPreview(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCancel = () => {
    setEditing(false);
    setPreview(null);
    setForm({ full_name: user!.full_name, avatar_url: user!.avatar_url || '' });
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
          <div className="relative w-20 h-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden" style={{ backgroundColor: 'var(--primary)' }}>
              {(preview || form.avatar_url) ? (
                <img src={preview || form.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                user.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}
              title="Cambiar foto"
            >
              <HiOutlineCamera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
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
                onClick={handleCancel}
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
