import React, { useState } from 'react';
import { X, Database, Plus, CheckCircle2, Tag, MapPin, Calendar, Layers } from 'lucide-react';
import { Dataset } from '../../types';
import { StorageService } from '../../services/storageService';

interface CreateDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newDataset: Dataset) => void;
  onDatasetCreated?: (newDataset: Dataset) => void;
}

const DEFAULT_CROPS = [
  'Soybean',
  'Cotton',
  'Wheat',
  'Paddy / Rice',
  'Tomato',
  'Mustard',
  'Maize',
  'Chilli',
  'All Crops'
];

export const CreateDatasetModal: React.FC<CreateDatasetModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onDatasetCreated
}) => {
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('Soybean');
  const [description, setDescription] = useState('');
  const [targetDiseasesText, setTargetDiseasesText] = useState('');
  const [season, setSeason] = useState('Kharif 2026');
  const [region, setRegion] = useState('Malwa Plateau, Madhya Pradesh');
  const [author, setAuthor] = useState('Krishi AI Research Lab & ICAR');
  const [tagsText, setTagsText] = useState('Ground Truth, In-Situ, Field Labeled');
  const [coverImageUrl, setCoverImageUrl] = useState('/cotton_leaf_spot.svg');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const diseases = targetDiseasesText
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newDataset: Dataset = {
      id: `DS-${crop.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      description: description.trim() || `Field dataset for ${crop} disease diagnostics and AI vision retraining.`,
      crop,
      targetDiseases: diseases.length > 0 ? diseases : ['Foliar Spot', 'Healthy Foliage'],
      season,
      region,
      imageCount: 0,
      annotatedCount: 0,
      verifiedCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: 'active',
      author: author.trim() || 'Krishi AI Research Lab',
      tags: tags.length > 0 ? tags : ['Field Benchmark'],
      coverImage: coverImageUrl,
      modelAccuracyBaseline: 89.0,
      modelRetrainedAccuracy: 95.0
    };

    StorageService.addDataset(newDataset);
    if (onCreated) onCreated(newDataset);
    if (onDatasetCreated) onDatasetCreated(newDataset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="create-dataset-modal-container"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Create New Agricultural Dataset</h2>
              <p className="text-xs text-slate-400">Initialize a training corpus for crop vision models</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Dataset Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dataset Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Malwa Soybean Rust & Pustule Ground Truth 2026"
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Target Crop */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Crop *
              </label>
              <select
                value={crop}
                onChange={e => setCrop(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
              >
                {DEFAULT_CROPS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Agricultural Season
              </label>
              <input
                type="text"
                value={season}
                onChange={e => setSeason(e.target.value)}
                placeholder="e.g. Kharif 2026"
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900"
              />
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Agro-Ecological Region
            </label>
            <input
              type="text"
              value={region}
              onChange={e => setRegion(e.target.value)}
              placeholder="e.g. Malwa Plateau & Nimar Belt, MP"
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900"
            />
          </div>

          {/* Target Diseases */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Diseases / Classes (comma separated)
            </label>
            <input
              type="text"
              value={targetDiseasesText}
              onChange={e => setTargetDiseasesText(e.target.value)}
              placeholder="e.g. Asian Rust, Cercospora Spot, Healthy Foliage"
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Research Objective
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe purpose of dataset, image collection standards, and laboratory confirmation..."
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 resize-none"
            />
          </div>

          {/* Author / Organization */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Author / Contributing Organization
            </label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Dataset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
