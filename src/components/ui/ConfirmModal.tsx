'use client';

import { useEffect, useRef } from 'react';
import { HiOutlineExclamation, HiOutlineX } from 'react-icons/hi';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) cancelRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-xl border shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <HiOutlineX size={16} />
        </button>

        {/* Icon */}
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100' : 'bg-amber-100'}`}>
          <HiOutlineExclamation size={24} className={isDanger ? 'text-red-500' : 'text-amber-500'} />
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-center text-[var(--foreground)] mb-1">{title}</h3>

        {/* Message */}
        <p className="text-sm text-center mb-6" style={{ color: 'var(--muted)' }}>{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-colors"
            style={{ borderColor: 'var(--border)' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 ${isDanger ? 'bg-red-500' : 'bg-amber-500'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
