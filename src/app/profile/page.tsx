'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { HiOutlineUser, HiOutlineMail, HiOutlinePencil, HiOutlineCheck, HiX, HiOutlineCamera, HiOutlineScissors } from 'react-icons/hi';
import ImageCropper from '@/components/ui/ImageCropper';

export default function ProfilePage() {
  const { user, updateProfile, isLoading: loading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', avatar_url: '' });
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageToCrop(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleEditCurrentPhoto = () => {
    if (form.avatar_url) {
      setImageToCrop(form.avatar_url);
    }
  };

  const handleCropComplete = async (croppedImage: string) => {
    setImageToCrop(null);
    setPreview(croppedImage);
    setEditing(true);

    if (!cloudName || !uploadPreset) return;

    // Subir a Cloudinary
    const formData = new FormData();
    formData.append('file', croppedImage);
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
      console.error('Error uploading image:', err);
    }
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
        {/* Avatar and Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
            <div className="w-full h-full rounded-full flex items-center justify-center text-4xl font-bold text-white overflow-hidden shadow-md" style={{ backgroundColor: 'var(--primary)' }}>
              {(preview || form.avatar_url) ? (
                <img src={preview || form.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                user.full_name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="text-2xl font-bold mb-1">{user.full_name}</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{user.email}</p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                style={{ borderColor: 'var(--border)' }}
              >
                <HiOutlineCamera size={16} /> Subir nueva foto
              </button>
              
              {form.avatar_url && (
                <button
                  type="button"
                  onClick={handleEditCurrentPhoto}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <HiOutlineScissors size={16} /> Ajustar encuadre
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
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
              <p className="text-sm py-2">
                {(() => {
                  const u = user as any;
                  const dateStr = u.created_at || u.createdAt || u.createdAtLocal;
                  if (!dateStr) return '—';
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return '—';
                  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
                })()}
              </p>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'var(--border)' }} />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm border transition-colors hover:bg-gray-50"
                style={{ borderColor: 'var(--border)' }}
              >
                <HiX size={14} /> Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-50 shadow-sm"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <HiOutlineCheck size={14} /> Guardar cambios
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm text-white font-medium shadow-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <HiOutlinePencil size={14} /> Editar perfil
            </button>
          )}
        </div>
      </div>

      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}
    </div>
  );
}
