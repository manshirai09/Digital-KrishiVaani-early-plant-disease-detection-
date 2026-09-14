import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Camera,
  Layers,
  MapPin,
  Tag,
  ShieldCheck,
  FileCheck2,
  Crop as CropIcon,
  ChevronRight
} from 'lucide-react';
import { Dataset, DatasetImage, CaseRecord, UserRole } from '../../types';
import { StorageService } from '../../services/storageService';
import { AuthService } from '../../services/authService';

interface AddImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasets: Dataset[];
  selectedDatasetId?: string;
  onImagesAdded?: (addedImages: DatasetImage[]) => void;
  onSuccess?: (addedImages: DatasetImage[], targetDatasetId: string) => void;
  cases?: CaseRecord[];
  availableCases?: CaseRecord[];
}

// Pre-defined field sample presets for immediate testing
const SAMPLE_FIELD_PRESETS = [
  {
    id: 'preset-1',
    title: 'Cotton Foliar Cercospora Lesion',
    crop: 'Cotton',
    disease: 'Cercospora Leaf Spot',
    severity: 45,
    growthStage: 'Flowering',
    foliarSide: 'Adaxial (Top Surface)',
    imageUrl: '/cotton_leaf_spot.svg',
    notes: 'Classic target-board concentric necrotic lesions with reddish-purple margin.',
    box: { id: 'b1', x: 28, y: 32, width: 44, height: 40, label: 'Cercospora Lesion Cluster', confidence: 0.96 }
  },
  {
    id: 'preset-2',
    title: 'Soybean Rust Micro-Pustules',
    crop: 'Soybean',
    disease: 'Asian Soybean Rust',
    severity: 58,
    growthStage: 'Pod / Boll Formation',
    foliarSide: 'Abaxial (Underside)',
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80',
    notes: 'Tan to dark reddish-brown erupting uredinia on abaxial leaf surface.',
    box: { id: 'b2', x: 22, y: 25, width: 55, height: 50, label: 'Rust Pustules', confidence: 0.94 }
  },
  {
    id: 'preset-3',
    title: 'Cotton Leaf Curl Virus Distortion',
    crop: 'Cotton',
    disease: 'Cotton Leaf Curl Virus (CLCuV)',
    severity: 65,
    growthStage: 'Vegetative',
    foliarSide: 'Full Canopy',
    imageUrl: '/cotton_leaf.jpg',
    notes: 'Upward cupping of leaves with enation and vein thickening.',
    box: { id: 'b3', x: 20, y: 18, width: 60, height: 62, label: 'Leaf Curling & Enation', confidence: 0.98 }
  },
  {
    id: 'preset-4',
    title: 'Healthy Cotton Canopy Baseline',
    crop: 'Cotton',
    disease: 'Healthy Foliage',
    severity: 0,
    growthStage: 'Vegetative',
    foliarSide: 'Full Canopy',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    notes: 'Vigorous vegetative growth free from chlorosis or foliar blemishes.',
    box: { id: 'b4', x: 15, y: 15, width: 70, height: 70, label: 'Healthy Vigorous Leaf', confidence: 0.99 }
  },
  {
    id: 'preset-5',
    title: 'Wheat Yellow Stripe Rust',
    crop: 'Wheat',
    disease: 'Yellow Stripe Rust',
    severity: 52,
    growthStage: 'Flowering',
    foliarSide: 'Adaxial (Top Surface)',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    notes: 'Linear stripes of bright yellow uredinial pustules parallel to leaf veins.',
    box: { id: 'b5', x: 30, y: 20, width: 40, height: 60, label: 'Stripe Rust Column', confidence: 0.95 }
  }
];

export const AddImagesModal: React.FC<AddImagesModalProps> = ({
  isOpen,
  onClose,
  datasets,
  selectedDatasetId,
  onImagesAdded,
  onSuccess,
  cases = [],
  availableCases = []
}) => {
  const session = AuthService.getAuthSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const effectiveCases = cases.length > 0 ? cases : availableCases;

  // Target Dataset state
  const [targetDatasetId, setTargetDatasetId] = useState<string>(
    selectedDatasetId || (datasets[0]?.id ?? '')
  );

  // Source tab: 'upload' | 'cases' | 'presets'
  const [sourceTab, setSourceTab] = useState<'upload' | 'cases' | 'presets'>('upload');

  // Multi-image upload queue
  interface StagedImage {
    tempId: string;
    imageUrl: string;
    fileName: string;
    title: string;
    crop: string;
    diseaseLabel: string;
    split: 'train' | 'val' | 'test';
    severityPercent: number;
    growthStage: string;
    foliarSide: string;
    village: string;
    district: string;
    state: string;
    notes: string;
    verified: boolean;
    boundingBoxLabel?: string;
  }

  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDiseaseInput, setCustomDiseaseInput] = useState('');
  const [isAddingCustomDisease, setIsAddingCustomDisease] = useState(false);

  const activeDataset = datasets.find(d => d.id === targetDatasetId) || datasets[0];

  // Helper: Create default staged image item
  const createStagedImage = (
    url: string,
    name: string,
    presetCrop?: string,
    presetDisease?: string,
    presetSeverity?: number,
    presetNotes?: string
  ): StagedImage => {
    const crop = presetCrop || activeDataset?.crop || 'Cotton';
    const disease = presetDisease || activeDataset?.targetDiseases[0] || 'Cercospora Leaf Spot';
    return {
      tempId: `stg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      imageUrl: url,
      fileName: name,
      title: name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
      crop,
      diseaseLabel: disease,
      split: 'train',
      severityPercent: typeof presetSeverity === 'number' ? presetSeverity : 35,
      growthStage: 'Flowering',
      foliarSide: 'Adaxial (Top Surface)',
      village: session?.user?.village || 'Sanwer Kalan',
      district: session?.user?.district || 'Indore',
      state: session?.user?.state || 'Madhya Pradesh',
      notes: presetNotes || 'Field ground-truth sample collected for model training.',
      verified: true,
      boundingBoxLabel: disease
    };
  };

  // Handle local file selection / drag-drop
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) {
          const staged = createStagedImage(result, file.name);
          setStagedImages(prev => [...prev, staged]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle selecting from existing app cases
  const handleSelectCase = (c: CaseRecord) => {
    const imgUrl = c.imageUrl || c.diagnosis?.sampleImageUrl || '/cotton_leaf_spot.svg';
    const staged = createStagedImage(
      imgUrl,
      `${c.id}-${c.cropName}-${c.diseaseName || 'DiagnosticScan'}.jpg`,
      c.cropName,
      c.diseaseName || 'Unspecified Spot',
      c.diagnosis?.severityPercent || 40,
      c.expertNotes || c.diagnosis?.symptomPattern || 'Imported from field diagnostic scan record.'
    );
    staged.village = c.village || 'Sanwer';
    staged.district = c.district || 'Indore';
    setStagedImages(prev => [...prev, staged]);
  };

  // Handle selecting preset
  const handleSelectPreset = (p: typeof SAMPLE_FIELD_PRESETS[0]) => {
    const staged = createStagedImage(
      p.imageUrl,
      `${p.crop}_${p.disease.replace(/\s+/g, '_')}_Preset.jpg`,
      p.crop,
      p.disease,
      p.severity,
      p.notes
    );
    staged.growthStage = p.growthStage;
    staged.foliarSide = p.foliarSide;
    setStagedImages(prev => [...prev, staged]);
  };

  // Remove staged image
  const handleRemoveStaged = (index: number) => {
    setStagedImages(prev => prev.filter((_, i) => i !== index));
    if (activeStageIndex >= stagedImages.length - 1) {
      setActiveStageIndex(Math.max(0, stagedImages.length - 2));
    }
  };

  // Update field of current active staged image
  const updateActiveStaged = (field: keyof StagedImage, value: any) => {
    setStagedImages(prev => {
      const copy = [...prev];
      if (copy[activeStageIndex]) {
        copy[activeStageIndex] = { ...copy[activeStageIndex], [field]: value };
      }
      return copy;
    });
  };

  // Submit all staged images into the selected dataset
  const handleSubmit = () => {
    if (stagedImages.length === 0 || !targetDatasetId) return;
    setIsSubmitting(true);

    try {
      const datasetImages: DatasetImage[] = stagedImages.map((stg, i) => {
        const isHealthy = stg.diseaseLabel.toLowerCase().includes('healthy');
        const isPest = stg.diseaseLabel.toLowerCase().includes('worm') || 
                       stg.diseaseLabel.toLowerCase().includes('fly') || 
                       stg.diseaseLabel.toLowerCase().includes('aphid') || 
                       stg.diseaseLabel.toLowerCase().includes('pest');

        return {
          id: `IMG-DS-${Date.now().toString().slice(-4)}${i + 1}`,
          datasetId: targetDatasetId,
          imageUrl: stg.imageUrl,
          fileName: stg.fileName,
          title: stg.title || stg.fileName,
          cropName: stg.crop,
          diseaseLabel: stg.diseaseLabel,
          split: stg.split,
          pathogenType: isHealthy ? 'healthy' : isPest ? 'pest' : 'fungal',
          healthStatus: isHealthy ? 'healthy' : isPest ? 'pest_damaged' : 'diseased',
          severityPercent: isHealthy ? 0 : stg.severityPercent,
          growthStage: stg.growthStage,
          foliarSide: stg.foliarSide,
          location: {
            state: stg.state,
            district: stg.district,
            village: stg.village
          },
          capturedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          contributedBy: {
            name: session?.user?.name || 'Field Researcher',
            role: session?.user?.role || 'expert',
            id: session?.user?.id || 'usr-curator'
          },
          verificationStatus: stg.verified ? 'verified_by_scientist' : 'pending_review',
          verifiedBy: stg.verified ? (session?.user?.name || 'ICAR Verified Agronomist') : undefined,
          notes: stg.notes,
          boundingBoxes: !isHealthy ? [
            {
              id: `box-${Date.now()}-${i}`,
              x: 25,
              y: 25,
              width: 50,
              height: 50,
              label: stg.diseaseLabel,
              confidence: 0.95
            }
          ] : [],
          tags: [stg.crop, stg.diseaseLabel, stg.split.toUpperCase()]
        };
      });

      // Save to StorageService
      StorageService.addBatchImagesToDataset(datasetImages);

      // Trigger callbacks
      if (onImagesAdded) onImagesAdded(datasetImages);
      if (onSuccess) onSuccess(datasetImages, targetDatasetId);

      // Clean up & close
      setStagedImages([]);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Failed to add images to dataset:', err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentStaged = stagedImages[activeStageIndex];
  const targetDiseasesList = activeDataset?.targetDiseases || [
    'Cercospora Leaf Spot',
    'Bacterial Blight',
    'Asian Soybean Rust',
    'Cotton Leaf Curl Virus (CLCuV)',
    'Healthy Foliage'
  ];

  return (
    <div
      id="add-images-dataset-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Add Images to Dataset</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Retraining Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload photos, import verified diagnostic scans, or load botanical field samples
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Dataset Selection Bar */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300">Target Dataset:</span>
            <select
              value={targetDatasetId}
              onChange={e => setTargetDatasetId(e.target.value)}
              className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {datasets.map(ds => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.crop}) • {ds.imageCount || 0} images
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Primary Crop:</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded-md font-semibold text-emerald-300">
              {activeDataset?.crop || 'All'}
            </span>
            <span className="text-slate-600">•</span>
            <span>Season:</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded-md font-semibold text-slate-300">
              {activeDataset?.season || 'Kharif 2026'}
            </span>
          </div>
        </div>

        {/* Source Switcher Tabs */}
        <div className="px-6 pt-3 pb-0 border-b border-slate-800 flex items-center gap-2 bg-slate-900/50 shrink-0">
          <button
            onClick={() => setSourceTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
              sourceTab === 'upload'
                ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files ({stagedImages.length})</span>
          </button>

          <button
            onClick={() => setSourceTab('cases')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
              sourceTab === 'cases'
                ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Import from Farm Scans ({effectiveCases.length})</span>
          </button>

          <button
            onClick={() => setSourceTab('presets')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer ${
              sourceTab === 'presets'
                ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>High-Res Botanical Presets ({SAMPLE_FIELD_PRESETS.length})</span>
          </button>
        </div>

        {/* Modal Main Body (Scrollable Split View) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[380px]">
          
          {/* Left Column: Image Selection & Queue (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* SOURCE TAB: FILE UPLOAD */}
            {sourceTab === 'upload' && (
              <div className="space-y-3">
                {/* Drag and drop box */}
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950/70 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={e => handleFileUpload(e.target.files)}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white mb-1">
                    Click to select images or drag & drop here
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports JPG, PNG, WebP • Multi-selection allowed
                  </p>
                </div>
              </div>
            )}

            {/* SOURCE TAB: CASES IMPORT */}
            {sourceTab === 'cases' && (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                <p className="text-xs text-slate-400 mb-2">
                  Select farmer diagnostic cases to convert into ground-truth dataset training samples:
                </p>
                {effectiveCases.map(c => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={c.imageUrl || '/cotton_leaf_spot.svg'}
                        alt={c.cropName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">{c.id}</span>
                          <span className="text-xs font-bold text-white truncate">{c.cropName}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate">{c.diseaseName || 'Suspected Disease'}</p>
                        <p className="text-[10px] text-slate-400">{c.village}, {c.district}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectCase(c)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Stage</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SOURCE TAB: PRESETS */}
            {sourceTab === 'presets' && (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                <p className="text-xs text-slate-400 mb-2">
                  Pre-configured high-resolution botanical specimens ready for 1-click staging:
                </p>
                {SAMPLE_FIELD_PRESETS.map(p => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/80 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{p.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
                            {p.crop}
                          </span>
                          <span className="text-[10px] text-rose-300 font-medium">
                            {p.disease}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectPreset(p)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Stage</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Staged Queue List */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Staged Queue ({stagedImages.length})
                </span>
                {stagedImages.length > 0 && (
                  <button
                    onClick={() => setStagedImages([])}
                    className="text-[11px] text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {stagedImages.length === 0 ? (
                <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
                  No images staged yet. Choose an image above to configure metadata and add to this dataset.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {stagedImages.map((stg, idx) => (
                    <div
                      key={stg.tempId}
                      onClick={() => setActiveStageIndex(idx)}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        activeStageIndex === idx
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={stg.imageUrl}
                          alt="Thumbnail"
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-700"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate leading-tight">{stg.title || stg.fileName}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {stg.diseaseLabel} • {stg.split.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleRemoveStaged(idx);
                        }}
                        className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Metadata & Annotation Configuration (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950/50 p-5 rounded-2xl border border-slate-800/80 space-y-4">
            
            {currentStaged ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shrink-0 group">
                      <img
                        src={currentStaged.imageUrl}
                        alt="Active Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ImageIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Image #{activeStageIndex + 1} of {stagedImages.length}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1 truncate max-w-sm">
                        {currentStaged.title || currentStaged.fileName}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate max-w-sm">
                        {currentStaged.fileName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">ML Split:</span>
                    {(['train', 'val', 'test'] as const).map(split => (
                      <button
                        key={split}
                        type="button"
                        onClick={() => updateActiveStaged('split', split)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          currentStaged.split === split
                            ? split === 'train'
                              ? 'bg-emerald-600 text-white'
                              : split === 'val'
                              ? 'bg-amber-600 text-white'
                              : 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {split}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  
                  {/* Title / Specimen Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Specimen Label / Title
                    </label>
                    <input
                      type="text"
                      value={currentStaged.title}
                      onChange={e => updateActiveStaged('title', e.target.value)}
                      placeholder="e.g. Cotton Cercospora Field Sample"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Crop Selection */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Crop Variety
                    </label>
                    <input
                      type="text"
                      value={currentStaged.crop}
                      onChange={e => updateActiveStaged('crop', e.target.value)}
                      placeholder="e.g. Cotton (Bt-2)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Disease / Pest Class */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-emerald-400" />
                        Target Disease / Pest Classification Label
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomDisease(!isAddingCustomDisease)}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                      >
                        {isAddingCustomDisease ? 'Select from list' : '+ Custom Class'}
                      </button>
                    </div>

                    {!isAddingCustomDisease ? (
                      <select
                        value={currentStaged.diseaseLabel}
                        onChange={e => updateActiveStaged('diseaseLabel', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        {targetDiseasesList.map(dis => (
                          <option key={dis} value={dis}>
                            {dis}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customDiseaseInput}
                          onChange={e => setCustomDiseaseInput(e.target.value)}
                          placeholder="Type new classification label (e.g. Powdery Mildew)"
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customDiseaseInput.trim()) {
                              updateActiveStaged('diseaseLabel', customDiseaseInput.trim());
                              setIsAddingCustomDisease(false);
                            }
                          }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Severity Level & Percentage Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-300">
                        Foliar Severity (%)
                      </label>
                      <span className="text-xs font-bold text-rose-400">
                        {currentStaged.severityPercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentStaged.severityPercent}
                      onChange={e => updateActiveStaged('severityPercent', Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  {/* Growth Stage */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Crop Growth Stage
                    </label>
                    <select
                      value={currentStaged.growthStage}
                      onChange={e => updateActiveStaged('growthStage', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Seedling">Seedling</option>
                      <option value="Vegetative">Vegetative</option>
                      <option value="Flowering">Flowering</option>
                      <option value="Pod / Boll Formation">Pod / Boll Formation</option>
                      <option value="Maturity / Harvest">Maturity / Harvest</option>
                    </select>
                  </div>

                  {/* Foliar Side / Plant Part */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Foliar Surface / Part
                    </label>
                    <select
                      value={currentStaged.foliarSide}
                      onChange={e => updateActiveStaged('foliarSide', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Adaxial (Top Surface)">Adaxial (Top Surface)</option>
                      <option value="Abaxial (Underside)">Abaxial (Underside)</option>
                      <option value="Full Canopy">Full Canopy</option>
                      <option value="Stem">Stem</option>
                      <option value="Root / Pod">Root / Pod</option>
                    </select>
                  </div>

                  {/* Location (Village & District) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      Village & District
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={currentStaged.village}
                        onChange={e => updateActiveStaged('village', e.target.value)}
                        placeholder="Village"
                        className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        value={currentStaged.district}
                        onChange={e => updateActiveStaged('district', e.target.value)}
                        placeholder="District"
                        className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Field Diagnostic Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Symptom Patterns & Field Observations
                    </label>
                    <textarea
                      rows={2}
                      value={currentStaged.notes}
                      onChange={e => updateActiveStaged('notes', e.target.value)}
                      placeholder="e.g. Distinct necrotic spots with chlorotic halo on upper third canopy under high humidity."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Ground Truth Verification Switch */}
                  <div className="sm:col-span-2 p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">Mark as Ground-Truth Verified</p>
                        <p className="text-[10px] text-emerald-300/80">
                          Tags this sample as verified by ICAR scientist / agronomist for immediate training inclusion.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentStaged.verified}
                      onChange={e => updateActiveStaged('verified', e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </div>

                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <ImageIcon className="w-12 h-12 text-slate-600 mb-3" />
                <h4 className="text-sm font-bold text-slate-300">No Image Selected for Editing</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Select or upload an image on the left panel to configure its bounding boxes, crop variety, and disease classifications.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">{stagedImages.length}</span> image(s) queued for{' '}
            <span className="text-emerald-400 font-bold">{activeDataset?.name || 'Dataset'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={stagedImages.length === 0 || isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding Images...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save {stagedImages.length} Images to Dataset</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
