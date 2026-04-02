'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  Undo,
  Redo
} from 'lucide-react';
import clsx from 'clsx';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  title
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    disabled={disabled}
    title={title}
    className={clsx(
      "p-2 rounded-lg transition-all border border-transparent",
      isActive 
        ? "bg-indigo-100 text-indigo-700 border-indigo-200" 
        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
      disabled && "opacity-30 cursor-not-allowed"
    )}
  >
    {children}
  </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  error,
  required 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[200px] p-4 text-gray-700',
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="space-y-1.5 flex flex-col group">
      {label && (
        <label className="text-sm font-bold text-gray-700 flex items-center gap-1 ml-1 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className={clsx(
        "rounded-2xl border transition-all overflow-hidden bg-white",
        error 
          ? "border-red-300 ring-4 ring-red-50" 
          : "border-gray-200 group-focus-within:border-indigo-400 group-focus-within:ring-4 group-focus-within:ring-indigo-50 shadow-sm"
      )}>
        {/* Toolbar */}
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-1 items-center">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </MenuButton>
          
          <div className="w-px h-6 bg-gray-200 mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </MenuButton>
          
          <div className="w-px h-6 bg-gray-200 mx-1" />
          
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bulleted List"
          >
            <List size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered size={18} />
          </MenuButton>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <MenuButton
            onClick={setLink}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon size={18} />
          </MenuButton>

          <div className="flex-1" />

          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={18} />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={18} />
          </MenuButton>
        </div>

        {/* Editor Area */}
        <div className="relative">
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs font-semibold text-red-500 animate-in slide-in-from-top-1 ml-1">
          {error}
        </p>
      )}

      {/* Tailwind Typography styles injected for the editor area */}
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          min-height: 200px;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }
      `}</style>
    </div>
  );
};
