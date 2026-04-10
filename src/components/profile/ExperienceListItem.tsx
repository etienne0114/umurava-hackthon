import React, { useState } from 'react';
import { ExperienceEntry } from '@/types';
import { Edit2, Trash2, Building2 } from 'lucide-react';
interface ExperienceListItemProps {
  experience: ExperienceEntry;
  onEdit?: () => void;
  onDelete?: () => void;
  isLast?: boolean;
}

export const ExperienceListItem: React.FC<ExperienceListItemProps> = ({
  experience,
  onEdit,
  onDelete,
  isLast
}) => {
  const [logoError, setLogoError] = useState(false);
  
  // Attempt to fetch favicon based on company name
  // This is a naive implementation: it assumes [company].com
  const companyName = experience.company.trim().toLowerCase().replace(/\s+/g, '');
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${companyName}.com&sz=128`;

  const formatDescription = (desc: string = '') => {
    // Basic formatting for the experience list
    return desc.split('\n').map((line, i) => {
      // Handle Bullet points
      if (line.trim().startsWith('• ') || line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.trim().substring(2);
        return <li key={i} className="ml-4 mb-2 text-gray-700 font-medium leading-relaxed list-disc">{renderRichText(content)}</li>;
      }
      // Handle Numbered lists
      if (line.trim().match(/^\d+\./)) {
        const content = line.trim().substring(line.trim().indexOf('.') + 1);
        return <li key={i} className="ml-4 mb-2 text-gray-700 font-medium leading-relaxed list-decimal">{renderRichText(content)}</li>;
      }
      // Default paragraph
      return <p key={i} className="mb-2 text-gray-700 font-medium leading-relaxed">{renderRichText(line)}</p>;
    });
  };

  const renderRichText = (text: string) => {
    // Simple bold/underline parser
    let parts: (string | JSX.Element)[] = [text];
    
    // Bold **
    parts = parts.flatMap(p => {
      if (typeof p !== 'string') return p;
      const fragments = p.split(/(\*\*.*?\*\*)/g);
      return fragments.map(f => f.startsWith('**') && f.endsWith('**') ? <strong key={f} className="font-black text-gray-900">{f.slice(2, -2)}</strong> : f);
    });

    // Underline <u>
    parts = parts.flatMap(p => {
      if (typeof p !== 'string') return p;
      const fragments = p.split(/(<u>.*?<\/u>)/g);
      return fragments.map(f => f.startsWith('<u>') && f.endsWith('</u>') ? <u key={f} className="decoration-indigo-300 decoration-2">{f.slice(3, -4)}</u> : f);
    });

    return parts;
  };

  return (
    <div className="relative flex gap-6 group">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-px bg-gray-100" />
      )}

      {/* Logo container */}
      <div className="flex-shrink-0 relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
          {!logoError ? (
            <img 
              src={faviconUrl} 
              alt={experience.company} 
              className="w-8 h-8 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
              {experience.role}
            </h3>
            <p className="text-sm font-semibold text-gray-400 mt-2 flex items-center gap-2">
              <span className="text-gray-900">{experience.company}</span>
              <span className="text-gray-300">•</span>
              <span className="text-indigo-500 font-bold uppercase tracking-wider text-[10px] bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                {experience.duration}
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Edit Experience"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Experience"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-4 max-w-3xl space-y-1">
          {formatDescription(experience.description)}
        </div>
      </div>
    </div>
  );
};
