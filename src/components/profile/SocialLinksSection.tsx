import React from 'react';
import { ExternalLink, Edit2, Share2 } from 'lucide-react';
import { SocialLinks } from '@/types';

/* ── Inline SVG icons for social platforms removed from lucide-react v1.7+ ── */
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

interface SocialLinksSectionProps {
  socialLinks?: SocialLinks;
  onEdit: () => void;
}

export const SocialLinksSection: React.FC<SocialLinksSectionProps> = ({
  socialLinks,
  onEdit
}) => {
  const links = [
    { id: 'linkedin', icon: LinkedinIcon, label: 'LinkedIn', value: socialLinks?.linkedin, color: 'hover:text-blue-600 hover:bg-blue-50' },
    { id: 'github', icon: GithubIcon, label: 'GitHub', value: socialLinks?.github, color: 'hover:text-gray-900 hover:bg-gray-50' },
    { id: 'portfolio', icon: Share2, label: 'Portfolio', value: socialLinks?.portfolio, color: 'hover:text-emerald-600 hover:bg-emerald-50' },
    { id: 'twitter', icon: TwitterIcon, label: 'Twitter', value: socialLinks?.twitter, color: 'hover:text-sky-500 hover:bg-sky-50' },
    { id: 'website', icon: ExternalLink, label: 'Website', value: socialLinks?.website, color: 'hover:text-indigo-600 hover:bg-indigo-50' },
  ].filter(link => link.value);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm transition-all hover:shadow-indigo-100/50">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Social & Links</h3>
        <button 
          onClick={onEdit}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-100"
        >
          <Edit2 size={16} />
          Edit Links
        </button>
      </div>

      {links.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.value}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-6 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl transition-all font-extrabold text-sm text-gray-700 ${link.color} hover:scale-[1.05] hover:shadow-lg`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-semibold mb-1">No links added yet.</p>
          <p className="text-xs text-gray-300">Connect your professional profiles for better visibility.</p>
        </div>
      )}
    </div>
  );
};
