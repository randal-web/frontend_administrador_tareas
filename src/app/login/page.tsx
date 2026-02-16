'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>TaskManager</h1>
          <p className="mt-2" style={{ color: 'var(--muted)' }}>Inicia sesión en tu cuenta</p>
        </div>

        <div className="rounded-xl p-6 shadow-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Correo electrónico
              </label>
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

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Contraseña
              </label>
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

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm hover:underline" style={{ color: 'var(--primary)' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
            <span className="px-4 text-sm" style={{ color: 'var(--muted)' }}>o continúa con</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          </div>

          <div>
            <a
              href={`${API_URL}/auth/google`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors w-full"
              style={{ borderColor: 'var(--border)' }}
            >
              <FcGoogle size={20} />
              Continuar con Google
            </a>
          </div>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--muted)' }}>
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
