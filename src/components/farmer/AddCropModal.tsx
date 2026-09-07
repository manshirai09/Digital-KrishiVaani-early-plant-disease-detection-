import React, { useState } from 'react';
import { Crop, CropStage } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  X,
  Sprout,
  Calendar,
  Save,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: string;
  onCropAdded: (crop: Crop) => void;
}

export const AddCropModal: React.FC<AddCropModalProps> = ({
  isOpen,
  onClose,
  farmId,
  onCropAdded
}) => {
  const [selectedCrop, setSelectedCrop] = useState('Cotton');
  const [variety, setVariety] = useState('BG-II Bt Hybrid');
  const [area, setArea] = useState('1.5');
  const [sowingDate, setSowingDate] = useState('2026-06-25');

  if (!isOpen) return null;

  const cropOptions = [
    { name: 'Cotton', icon: '🌱', defaultVariety: 'BG-II Bt Hybrid', duration: 160 },
    { name: 'Soybean', icon: '🌿', defaultVariety: 'JS 20-34', duration: 95 },
    { name: 'Wheat', icon: '🌾', defaultVariety: 'HI 8759 (Pusa Tejas)', duration: 120 },
    { name: 'Rice', icon: '🌾', defaultVariety: 'Pusa Basmati 1509', duration: 115 },
    { name: 'Tomato', icon: '🍅', defaultVariety: 'Abhinav Hybrid', duration: 110 },
    { name: 'Chilli', icon: '🌶️', defaultVariety: 'Pusa Jwala', duration: 140 },
  ];

  const handleSelectCrop = (name: string, defaultVar: string) => {
    setSelectedCrop(name);
    setVariety(defaultVar);
  };

  // Automatically calculate phenological stage based on sowing date
  const calculateStage = (dateStr: string, cropName: string): CropStage => {
    const sowing = new Date(dateStr);
    const now = new Date('2026-08-29');
    const diffDays = Math.max(1, Math.round((now.getTime() - sowing.getTime()) / (1000 * 60 * 60 * 24)));

    if (diffDays <= 20) return 'Seedling';
    if (diffDays <= 45) return 'Vegetative';
    if (diffDays <= 75) return 'Flowering';
    if (diffDays <= 115) return 'Boll Formation / Pod Filling';
    return 'Maturity / Harvesting';
  };

  const calculatedStage = calculateStage(sowingDate, selectedCrop);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const newCrop: Crop = {
      id: `crop-${Date.now()}`,
      farmId: farmId || 'farm-01',
      cropName: selectedCrop,
      variety,
      areaAcres: parseFloat(area) || 1.0,
      sowingDate,
      stage: calculatedStage,
      riskLevel: 'low',
      riskScore: 22,
      lastScanDate: 'Today (Registered)',
      activeDisease: 'None (Healthy)'
    };

    StorageService.addCropToFarm(newCrop.farmId, newCrop);
    onCropAdded(newCrop);
    onClose();
  };

  return (
    <div id="add-crop-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Add Crop to Holding</h3>
              <p className="text-xs text-slate-500">Visual crop selection with automatic stage calculation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          
          {/* Visual Crop Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Crop Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {cropOptions.map(crop => {
                const isSelected = selectedCrop === crop.name;
                return (
                  <button
                    key={crop.name}
                    type="button"
                    onClick={() => handleSelectCrop(crop.name, crop.defaultVariety)}
                    className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{crop.icon}</span>
                    <span className="text-xs font-bold">{crop.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Crop Variety / Hybrid *
              </label>
              <input
                type="text"
                required
                value={variety}
                onChange={e => setVariety(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Plot Area (Acres) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sowing / Plantation Date *
            </label>
            <input
              type="date"
              required
              value={sowingDate}
              onChange={e => setSowingDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          {/* Automatic Stage Calculation Result Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Calculated Phenological Stage
                </span>
                <span className="font-bold text-sm text-emerald-950">
                  {calculatedStage}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-200/70 text-emerald-900 text-[11px] font-mono font-bold rounded-lg">
              Auto-Computed
            </span>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Crop Plot</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
