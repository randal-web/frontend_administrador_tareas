'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { HiOutlineLockClosed } from 'react-icons/hi';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const msg = await resetPassword(token, password);
      setMessage(msg);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      {error && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', color: 'var(--danger)' }}>
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#f0fdf4', color: 'var(--success)' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-3" style={{ color: 'var(--muted)' }} size={20} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirmar contraseña</label>
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-3" style={{ color: 'var(--muted)' }} size={20} />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>TaskManager</h1>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>Restablecer contraseña</p>
        </div>
        <Suspense fallback={<div>Cargando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
