import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { ProjectEntry } from '@/types';
import { Plus, X } from 'lucide-react';
import clsx from 'clsx';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: ProjectEntry) => void;
  initialData?: ProjectEntry;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<ProjectEntry>({
    name: '',
    description: '',
    role: '',
    technologies: [],
    link: '',
    startDate: '',
    endDate: '',
  });

  const [techInput, setTechInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ 
        name: '', 
        description: '', 
        role: '', 
        technologies: [], 
        link: '', 
        startDate: '', 
        endDate: '' 
      });
    }
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.role.trim()) newErrors.role = 'Your role is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTech = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()]
      });
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit project" : "Add project"}
      subtitle="Showcase your best work and the technologies you used."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div>
          <Input
            label="Project name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. AI Portfolio Generator"
            error={errors.name}
            required
          />
        </div>

        <div>
          <Input
            label="Your role"
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="e.g. Lead Full-stack Developer"
            error={errors.role}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start date"
            name="startDate"
            type="month"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <Input
            label="End date"
            name="endDate"
            type="month"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={clsx(
              "w-full px-4 py-3 bg-white border rounded-2xl text-sm outline-none transition-all min-h-[120px] resize-none",
              errors.description ? "border-red-300 ring-4 ring-red-50" : "border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            )}
            placeholder="Describe the project, its goals, and your impact..."
          />
          {errors.description && <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.description}</p>}
        </div>

        <div>
          <Input
            label="Project Link (Optional)"
            name="link"
            value={formData.link || ''}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="e.g. https://github.com/myproject"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Technologies</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTech()}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-400"
              placeholder="e.g. React, Node.js"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.technologies.map((tech, i) => (
              <span 
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100/50"
              >
                {tech}
                <button type="button" onClick={() => removeTech(tech)}>
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

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
