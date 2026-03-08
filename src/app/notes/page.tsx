'use client';

import { useEffect, useState, useMemo } from 'react';
import { useNoteStore } from '@/stores/noteStore';
import { useUIStore } from '@/stores/uiStore';
import { Note, NoteColor } from '@/types';
import {
  HiOutlineFilter,
  HiOutlinePlus,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineStar,
} from 'react-icons/hi';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { BsPinAngle, BsPinAngleFill } from 'react-icons/bs';
import RichTextEditor from '@/components/ui/RichTextEditor';

const colorConfig: Record<NoteColor, { bg: string; fold: string; border: string }> = {
  yellow: { bg: '#fefce8', fold: '#fde047', border: '#fef08a' },
  blue:   { bg: '#eff6ff', fold: '#93c5fd', border: '#bfdbfe' },
  green:  { bg: '#f0fdf4', fold: '#86efac', border: '#bbf7d0' },
  purple: { bg: '#f5f3ff', fold: '#c4b5fd', border: '#ddd6fe' },
  pink:   { bg: '#fdf2f8', fold: '#f9a8d4', border: '#fbcfe8' },
};

const fmtDate = (d: string) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

export default function NotesPage() {
  const { notes, isLoading, fetchNotes, createNote, updateNote, deleteNote, togglePin, toggleImportant } = useNoteStore();
  const { searchTerm } = useUIStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', color: 'yellow' as NoteColor });

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;
    const term = searchTerm.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(term) || 
      n.content?.toLowerCase().includes(term)
    );
  }, [notes, searchTerm]);

  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.is_pinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter(n => !n.is_pinned), [filteredNotes]);

  const openCreate = () => {
    setEditingNote(null);
    setForm({ title: '', content: '', color: 'yellow' });
    setModalOpen(true);
  };

  const openView = (note: Note) => {
    setViewNote(note);
  };

  const openEdit = (note: Note) => {
    setViewNote(null);
    setEditingNote(note);
    setForm({ title: note.title, content: note.content || '', color: note.color });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (editingNote) {
      await updateNote(editingNote.id, form);
    } else {
      await createNote(form);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteNote(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Notas</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {notes.length} nota{notes.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors hover:bg-gray-50" style={{ borderColor: 'var(--border)' }}>
            <HiOutlineFilter size={14} />
            Filtros
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--foreground)' }}
          >
            <HiOutlinePlus size={14} />
            Nueva Nota
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Cargando notas...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <HiOutlineDocumentText size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No hay notas todavía</p>
          <button onClick={openCreate} className="mt-3 text-sm font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            Crear una nota
          </button>
        </div>
      ) : (
        <>
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <BsPinAngleFill size={13} className="text-gray-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Fijadas</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {pinnedNotes.map(note => (
                  <NoteCard key={note.id} note={note} onClick={openView} onEdit={openEdit} onDelete={handleDelete} onTogglePin={togglePin} onToggleImportant={toggleImportant} />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes */}
          {otherNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <HiOutlineDocumentText size={14} className="text-gray-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Otras notas</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {otherNotes.map(note => (
                  <NoteCard key={note.id} note={note} onClick={openView} onEdit={openEdit} onDelete={handleDelete} onTogglePin={togglePin} onToggleImportant={toggleImportant} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* View Note Modal */}
      {viewNote && (() => {
        const cfg = colorConfig[viewNote.color] || colorConfig.yellow;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setViewNote(null)} />
            <div className="relative w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
              {/* Header */}
              <div className="flex items-center justify-between p-5 pb-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePin(viewNote.id).then(() => { const updated = notes.find(n => n.id === viewNote.id); if (updated) setViewNote({ ...viewNote, is_pinned: !viewNote.is_pinned }); })}
                    className="p-1 rounded-lg hover:bg-black/5 transition-colors text-gray-500"
                  >
                    {viewNote.is_pinned ? <BsPinAngleFill size={16} /> : <BsPinAngle size={16} />}
                  </button>
                  <button
                    onClick={() => toggleImportant(viewNote.id).then(() => { setViewNote({ ...viewNote, is_important: !viewNote.is_important }); })}
                    className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                    title={viewNote.is_important ? 'Quitar de importantes' : 'Marcar como importante'}
                  >
                    <HiOutlineStar size={16} className={viewNote.is_important ? 'text-amber-400 fill-amber-400' : 'text-gray-400'} style={viewNote.is_important ? { fill: '#fbbf24' } : {}} />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(viewNote)}
                    className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-gray-500"
                    title="Editar"
                  >
                    <HiOutlinePencil size={16} />
                  </button>
                  <button
                    onClick={() => { handleDelete(viewNote.id); setViewNote(null); }}
                    className="p-1.5 rounded-lg hover:bg-red-100 transition-colors text-gray-500 hover:text-red-500"
                    title="Eliminar"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                  <button onClick={() => setViewNote(null)} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-gray-500">
                    <HiOutlineX size={18} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-3">{viewNote.title}</h2>
                {viewNote.content ? (
                  <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5" dangerouslySetInnerHTML={{ __html: viewNote.content }} />
                ) : (
                  <p className="text-sm italic" style={{ color: 'var(--muted)' }}>Sin contenido</p>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 pb-4 flex items-center gap-1.5 text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-xs">{fmtDate(viewNote.updated_at || viewNote.updatedAt || viewNote.created_at || viewNote.createdAt || '')}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border shadow-2xl p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">{editingNote ? 'Editar nota' : 'Nueva nota'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <HiOutlineX size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-black/10"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}
                  placeholder="Título de la nota"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Contenido</label>
                <RichTextEditor
                  value={form.content}
                  onChange={content => setForm(prev => ({ ...prev, content }))}
                  placeholder="Escribe tu nota..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--muted)' }}>Color</label>
                <div className="flex gap-2">
                  {(Object.keys(colorConfig) as NoteColor[]).map(color => (
                    <button
                      key={color}
                      onClick={() => setForm(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === color ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-105'}`}
                      style={{ backgroundColor: colorConfig[color].bg, borderColor: colorConfig[color].fold }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50 transition-colors"
                style={{ borderColor: 'var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: 'var(--foreground)' }}
              >
                {editingNote ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="¿Eliminar esta nota?"
        message="Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

/* ---------- Note Card Component ---------- */

function NoteCard({
  note,
  onClick,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleImportant,
}: {
  note: Note;
  onClick: (n: Note) => void;
  onEdit: (n: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleImportant: (id: string) => void;
}) {
  const cfg = colorConfig[note.color] || colorConfig.yellow;

  return (
    <div
      className="relative rounded-xl overflow-hidden flex flex-col justify-between min-h-[180px] group cursor-pointer transition-shadow hover:shadow-md"
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
      onClick={() => onClick(note)}
    >
      {/* Content area */}
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {note.is_important && (
              <HiOutlineStar size={13} className="text-amber-400 flex-shrink-0" style={{ fill: '#fbbf24' }} />
            )}
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{note.title}</h3>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); onToggleImportant(note.id); }}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors text-gray-400 hover:text-amber-400"
              title={note.is_important ? 'Quitar de importantes' : 'Marcar como importante'}
            >
              <HiOutlineStar size={13} className={note.is_important ? 'text-amber-400' : 'opacity-0 group-hover:opacity-100 transition-opacity'} style={note.is_important ? { fill: '#fbbf24' } : {}} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onTogglePin(note.id); }}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors text-gray-400 hover:text-gray-600"
            >
              {note.is_pinned ? <BsPinAngleFill size={14} /> : <BsPinAngle size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
          </div>
        </div>
        {note.content && (
          <div className="text-xs text-gray-600 mt-1.5 line-clamp-3 leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" dangerouslySetInnerHTML={{ __html: note.content }} />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-gray-400">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-xs">{fmtDate(note.updated_at || note.updatedAt || note.created_at || note.createdAt || '')}</span>
        </div>

        {/* Action buttons (hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={e => { e.stopPropagation(); onEdit(note); }}
            className="p-1 rounded hover:bg-black/5 text-gray-500 transition-colors"
          >
            <HiOutlinePencil size={13} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(note.id); }}
            className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
          >
            <HiOutlineTrash size={13} />
          </button>
        </div>
      </div>

      {/* Decorative fold corner */}
      <div
        className="absolute bottom-0 right-0 w-0 h-0"
        style={{
          borderStyle: 'solid',
          borderWidth: '0 0 28px 28px',
          borderColor: `transparent transparent ${cfg.fold} transparent`,
        }}
      />
    </div>
  );
}
