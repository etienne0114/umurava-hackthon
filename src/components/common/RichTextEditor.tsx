import React, { useRef, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Type
} from 'lucide-react';
import clsx from 'clsx';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  rows = 8,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newValue = 
      value.substring(0, start) + 
      before + (selectedText || '') + after + 
      value.substring(end);

    onChange(newValue);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText.length || 0)
      );
    }, 0);
  }, [value, onChange]);

  const handleBulletList = useCallback(() => {
    insertText('\n• ', '');
  }, [insertText]);

  const handleNumberedList = useCallback(() => {
    insertText('\n1. ', '');
  }, [insertText]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className={clsx(
        "rounded-2xl border transition-all overflow-hidden bg-white",
        error ? "border-red-300 ring-4 ring-red-50" : "border-gray-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50"
      )}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100">
          <button
            type="button"
            onClick={() => insertText('**', '**')}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('_', '_')}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText('<u>', '</u>')}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <button
            type="button"
            onClick={handleBulletList}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNumberedList}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-4 text-sm text-gray-800 placeholder:text-gray-400 border-none outline-none focus:ring-0 resize-none leading-relaxed"
        />
      </div>

      {error && <p className="text-xs font-medium text-red-500 mt-1">{error}</p>}
    </div>
  );
};
