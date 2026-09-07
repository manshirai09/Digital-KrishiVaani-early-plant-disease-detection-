import React, { useState } from 'react';
import { Farm } from '../../types';
import { StorageService } from '../../services/storageService';
import {
  X,
  MapPin,
  Compass,
  CheckCircle2,
  Layers,
  Sprout,
  Save
} from 'lucide-react';

interface AddFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFarmAdded: (farm: Farm) => void;
}

export const AddFarmModal: React.FC<AddFarmModalProps> = ({
  isOpen,
  onClose,
  onFarmAdded
}) => {
  const [name, setName] = useState('');
  const [area, setArea] = useState('3.2');
  const [village, setVillage] = useState('Sanwer Kalan');
  const [block, setBlock] = useState('Sanwer');
  const [district, setDistrict] = useState('Indore');
  const [soilType, setSoilType] = useState('Medium Black Clayey Loam');
  const [coords, setCoords] = useState({ lat: 22.9734, lng: 75.8267 });
  const [locationPaging, setLocationPaging] = useState(false);

  if (!isOpen) return null;

  const handleUseCurrentLocation = () => {
    setLocationPaging(true);
    setTimeout(() => {
      setCoords({ lat: 22.9734 + (Math.random() * 0.02 - 0.01), lng: 75.8267 + (Math.random() * 0.02 - 0.01) });
      setLocationPaging(false);
    }, 600);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newFarm: Farm = {
      id: `farm-${Date.now()}`,
      name: name.trim(),
      farmerName: 'Ramesh Patidar',
      farmerPhone: '+91 98260 14820',
      village,
      block,
      district,
      totalAreaAcres: parseFloat(area) || 3.0,
      soilType,
      coordinates: coords,
      sensorNodeId: `ESP32-AGRI-${Math.floor(10 + Math.random() * 90)}`,
      overallRisk: 'low',
      overallRiskScore: 20,
      crops: [
        {
          id: `crop-${Date.now()}-1`,
          farmId: `farm-${Date.now()}`,
          cropName: 'Cotton',
          variety: 'BG-II Bt Hybrid',
          areaAcres: +(parseFloat(area) * 0.6).toFixed(1),
          sowingDate: '2026-06-20',
          stage: 'Flowering',
          riskLevel: 'low',
          riskScore: 22,
          lastScanDate: 'Today',
          activeDisease: 'None'
        }
      ]
    };

    StorageService.addFarm(newFarm);
    onFarmAdded(newFarm);
    onClose();
  };

  return (
    <div id="add-farm-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Add Agricultural Holding</h3>
              <p className="text-xs text-slate-500">Register new farm coordinates for GIS & IoT monitoring</p>
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
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Farm / Plot Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Patidar Krishi Farm - Plot C"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Area (Acres)
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Soil Type
              </label>
              <select
                value={soilType}
                onChange={e => setSoilType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none transition-all"
              >
                <option value="Medium Black Clayey Loam">Medium Black Clayey Loam</option>
                <option value="Deep Black Cotton Soil">Deep Black Cotton Soil</option>
                <option value="Red-Yellow Mixed Loam">Red-Yellow Mixed Loam</option>
                <option value="Alluvial Sandy Loam">Alluvial Sandy Loam</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Village</label>
              <input
                type="text"
                value={village}
                onChange={e => setVillage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Block</label>
              <input
                type="text"
                value={block}
                onChange={e => setBlock(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Interactive Location Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-emerald-700" />
                <span>Geospatial Coordinates</span>
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>{locationPaging ? 'Acquiring GPS...' : 'Use Current GPS Location'}</span>
              </button>
            </div>

            {/* Visual Mini Map Representation */}
            <div className="h-32 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center p-3 text-center">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
                  <MapPin className="w-4 h-4 fill-current" />
                </div>
                <p className="text-[11px] font-mono text-emerald-300 font-bold mt-1">
                  Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
                </p>
                <span className="text-[10px] text-slate-400">Sanwer Agro Polygon Zone</span>
              </div>
            </div>
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
              <span>Save Farm Holding</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
