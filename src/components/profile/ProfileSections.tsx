import React from 'react';
import { Edit3, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

interface BioCardProps {
  bio: string;
  onEdit: () => void;
}

export const BioCard: React.FC<BioCardProps> = ({ bio, onEdit }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Bio</h3>
        <button 
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-100 opacity-0 group-hover:opacity-100"
          title="Edit Bio"
        >
          <Edit3 size={16} />
        </button>
      </div>
      <p className="text-gray-600 leading-relaxed max-w-3xl">
        {bio || "Tell us about yourself and your professional journey..."}
      </p>
    </div>
  );
};

interface SkillsCardProps {
  skills: string[];
  onAdd: () => void;
  onRemove: (skill: string) => void;
}

export const SkillsCard: React.FC<SkillsCardProps> = ({ skills, onAdd, onRemove }) => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Technical Skills</h3>
        <button 
          onClick={onAdd}
          className="p-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm shadow-indigo-100 flex items-center justify-center"
          title="Add Technical Skills"
        >
          <PlusCircle size={18} />
        </button>
      </div>
      
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills
            .filter(s => s.toLowerCase() !== 'skills') // Remove redundant "Skills" tag
            .map((skill) => (
            <span 
              key={skill}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-gray-700 text-[11px] font-black rounded-full border-2 border-indigo-50 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-default shadow-sm shadow-indigo-100/20"
            >
              {skill}
              <button 
                onClick={() => onRemove(skill)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No skills added yet.</p>
      )}
    </div>
  );
};
