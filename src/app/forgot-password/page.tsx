'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { HiOutlineMail } from 'react-icons/hi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const msg = await forgotPassword(email);
      setMessage(msg);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>TaskManager</h1>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>Recuperar contraseña</p>
        </div>

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
              <label className="block text-sm font-medium mb-1">Correo electrónico</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-3" style={{ color: 'var(--muted)' }} size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
                  placeholder="tu@email.com"
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
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--muted)' }}>
          <Link href="/login" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
