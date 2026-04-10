import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { SocialLinks } from '@/types';

interface SocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (links: SocialLinks) => void;
  initialData?: SocialLinks;
}

export const SocialLinksModal: React.FC<SocialLinksModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<SocialLinks>({
    linkedin: '',
    github: '',
    portfolio: '',
    twitter: '',
    website: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        linkedin: initialData.linkedin || '',
        github: initialData.github || '',
        portfolio: initialData.portfolio || '',
        twitter: initialData.twitter || '',
        website: initialData.website || '',
      });
    } else {
      setFormData({ linkedin: '', github: '', portfolio: '', twitter: '', website: '' });
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit social links"
      subtitle="Connect your professional online presence."
      maxWidth="md"
    >
      <div className="space-y-6">
        <Input
          label="LinkedIn Profile URL"
          name="linkedin"
          value={formData.linkedin || ''}
          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
          placeholder="https://linkedin.com/in/username"
        />

        <Input
          label="GitHub Profile URL"
          name="github"
          value={formData.github || ''}
          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
          placeholder="https://github.com/username"
        />

        <Input
          label="Portfolio URL"
          name="portfolio"
          value={formData.portfolio || ''}
          onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
          placeholder="https://myportfolio.com"
        />

        <Input
          label="Twitter / X Profile URL"
          name="twitter"
          value={formData.twitter || ''}
          onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
          placeholder="https://twitter.com/username"
        />

        <Input
          label="Personal Website"
          name="website"
          value={formData.website || ''}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://mywebsite.com"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};
