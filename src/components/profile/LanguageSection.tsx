import React from 'react';
import { PlusCircle, Globe2, Trash2, Edit2 } from 'lucide-react';
import { LanguageEntry } from '@/types';

interface LanguageSectionProps {
  languages: LanguageEntry[];
  onAdd: () => void;
  onEdit: (idx: number) => void;
  onDelete: (idx: number) => void;
}

export const LanguageSection: React.FC<LanguageSectionProps> = ({
  languages,
  onAdd,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-indigo-100/50">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Languages</h3>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
        >
          <PlusCircle size={18} />
          Add Language
        </button>
      </div>

      {languages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang, idx) => (
            <div 
              key={idx}
              className="group relative bg-gray-50/50 border border-gray-100 p-6 rounded-2xl transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-100/50 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => onEdit(idx)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(idx)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h4 className="font-extrabold text-gray-900">{lang.name}</h4>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">
                {lang.proficiency}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-semibold mb-1">No languages added yet.</p>
          <p className="text-xs text-gray-300">Add the languages you speak to improve your matching.</p>
        </div>
      )}
    </div>
  );
};
