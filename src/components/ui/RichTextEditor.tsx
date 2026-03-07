'use client';

import { useRef, useEffect, useCallback } from 'react';
import {
  BsTypeBold,
  BsTypeItalic,
  BsTypeUnderline,
  BsTypeStrikethrough,
  BsListUl,
  BsListOl,
} from 'react-icons/bs';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Escribe aquí...', minHeight = 120 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const exec = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`;

  const isActive = (command: string) => {
    try { return document.queryCommandState(command); } catch { return false; }
  };

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-gray-50/50" style={{ borderColor: 'var(--border)' }}>
        <button type="button" onClick={() => exec('bold')} className={btnClass(isActive('bold'))} title="Negrita">
          <BsTypeBold size={14} />
        </button>
        <button type="button" onClick={() => exec('italic')} className={btnClass(isActive('italic'))} title="Cursiva">
          <BsTypeItalic size={14} />
        </button>
        <button type="button" onClick={() => exec('underline')} className={btnClass(isActive('underline'))} title="Subrayado">
          <BsTypeUnderline size={14} />
        </button>
        <button type="button" onClick={() => exec('strikeThrough')} className={btnClass(isActive('strikeThrough'))} title="Tachado">
          <BsTypeStrikethrough size={14} />
        </button>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button type="button" onClick={() => exec('insertUnorderedList')} className={btnClass(isActive('insertUnorderedList'))} title="Lista">
          <BsListUl size={14} />
        </button>
        <button type="button" onClick={() => exec('insertOrderedList')} className={btnClass(isActive('insertOrderedList'))} title="Lista numerada">
          <BsListOl size={14} />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="px-3 py-2 text-sm outline-none overflow-y-auto prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5"
        style={{
          minHeight,
          maxHeight: 300,
          backgroundColor: 'var(--bg, #fff)',
          color: 'var(--foreground)',
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
}
