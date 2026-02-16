'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Save token and redirect to dashboard
      localStorage.setItem('token', token);
      checkAuth().then(() => {
        router.replace('/dashboard');
      });
    } else {
      // No token — redirect to login
      router.replace('/login?error=oauth_failed');
    }
  }, [searchParams, router, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }}
        />
        <p style={{ color: 'var(--muted)' }}>Iniciando sesión...</p>
      </div>
    </div>
  );
}
