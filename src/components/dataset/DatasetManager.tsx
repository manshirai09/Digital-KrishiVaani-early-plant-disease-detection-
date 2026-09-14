import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  Plus,
  Upload,
  Search,
  Filter,
  Layers,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Clock,
  Download,
  Trash2,
  Tag,
  Eye,
  Grid,
  List,
  ChevronRight,
  TrendingUp,
  Brain,
  Share2,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { Dataset, DatasetImage, CaseRecord } from '../../types';
import { StorageService } from '../../services/storageService';
import { AddImagesModal } from './AddImagesModal';
import { CreateDatasetModal } from './CreateDatasetModal';
import { ImageDetailModal } from './ImageDetailModal';

interface DatasetManagerProps {
  onBackToDashboard?: () => void;
  initialDatasetId?: string;
  openAddModalInitially?: boolean;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  onBackToDashboard,
  initialDatasetId,
  openAddModalInitially = false
}) => {
  // State
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [images, setImages] = useState<DatasetImage[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);

  // Modals
  const [isAddImagesModalOpen, setIsAddImagesModalOpen] = useState(openAddModalInitially);
  const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] = useState(false);
  const [selectedImageForDetail, setSelectedImageForDetail] = useState<DatasetImage | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState('all');
  const [selectedSplitFilter, setSelectedSplitFilter] = useState<'all' | 'train' | 'val' | 'test'>('all');
  const [selectedVerificationFilter, setSelectedVerificationFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load datasets & images on mount or change
  const refreshData = () => {
    const dsList = StorageService.getDatasets();
    setDatasets(dsList);

    const activeId = selectedDatasetId && dsList.some(d => d.id === selectedDatasetId)
      ? selectedDatasetId
      : (initialDatasetId && dsList.some(d => d.id === initialDatasetId))
      ? initialDatasetId
      : dsList[0]?.id || '';

    setSelectedDatasetId(activeId);
    setImages(StorageService.getDatasetImages(activeId));
    setCases(StorageService.getCases());
  };

  useEffect(() => {
    refreshData();

    // Listen for storage events
    const handleStorageChange = () => {
      refreshData();
    };
    window.addEventListener('krishi_state_change', handleStorageChange);
    return () => window.removeEventListener('krishi_state_change', handleStorageChange);
  }, []);

  // Update images when selected dataset changes
  useEffect(() => {
    if (selectedDatasetId) {
      setImages(StorageService.getDatasetImages(selectedDatasetId));
    }
  }, [selectedDatasetId]);

  const activeDataset = useMemo(() => {
    return datasets.find(d => d.id === selectedDatasetId) || datasets[0];
  }, [datasets, selectedDatasetId]);

  // Overall platform dataset metrics
  const allImages = useMemo(() => {
    return StorageService.getDatasetImages();
  }, [images]);

  const stats = useMemo(() => {
    const totalDatasets = datasets.length;
    const totalImages = allImages.length;
    const verifiedImages = allImages.filter(img => img.verificationStatus === 'verified_by_scientist').length;
    const verifiedPercent = totalImages > 0 ? Math.round((verifiedImages / totalImages) * 100) : 0;
    
    // Unique disease classes
    const diseaseSet = new Set<string>();
    allImages.forEach(img => {
      if (img.diseaseLabel) diseaseSet.add(img.diseaseLabel);
    });

    return {
      totalDatasets,
      totalImages,
      verifiedPercent,
      uniqueDiseases: diseaseSet.size || 12
    };
  }, [datasets, allImages]);

  // Filtered dataset images
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (img.title || '').toLowerCase().includes(q);
        const matchesFileName = (img.fileName || '').toLowerCase().includes(q);
        const matchesDisease = (img.diseaseLabel || '').toLowerCase().includes(q);
        const matchesCrop = (img.cropName || '').toLowerCase().includes(q);
        const matchesLocation = `${img.location?.district || ''} ${img.location?.village || ''}`.toLowerCase().includes(q);
        const matchesNotes = (img.notes || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesFileName && !matchesDisease && !matchesCrop && !matchesLocation && !matchesNotes) {
          return false;
        }
      }

      // Disease label filter
      if (selectedDiseaseFilter !== 'all' && img.diseaseLabel !== selectedDiseaseFilter) {
        return false;
      }

      // Split filter
      if (selectedSplitFilter !== 'all' && (img.split || 'train') !== selectedSplitFilter) {
        return false;
      }

      // Verification filter
      if (selectedVerificationFilter === 'verified' && img.verificationStatus !== 'verified_by_scientist') {
        return false;
      }
      if (selectedVerificationFilter === 'pending' && img.verificationStatus === 'verified_by_scientist') {
        return false;
      }

      return true;
    });
  }, [images, searchQuery, selectedDiseaseFilter, selectedSplitFilter, selectedVerificationFilter]);

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export full dataset manifest JSON
  const handleExportManifest = () => {
    if (!activeDataset) return;
    const manifest = {
      dataset: activeDataset,
      exportedAt: new Date().toISOString(),
      format: 'YOLO_COCO_Multimodal_KrishiRakshak_v1',
      totalImages: images.length,
      images: images
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeDataset.id}_manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${activeDataset.name} manifest (${images.length} images).`);
  };

  // Quick toggle verification on card
  const handleToggleVerificationOnCard = (e: React.MouseEvent, img: DatasetImage) => {
    e.stopPropagation();
    const isNowVerified = img.verificationStatus !== 'verified_by_scientist';
    StorageService.updateDatasetImage(img.id, {
      verificationStatus: isNowVerified ? 'verified_by_scientist' : 'pending_review',
      verifiedBy: isNowVerified ? 'ICAR Validated Agronomist' : undefined
    });
    setImages(prev => prev.map(item => item.id === img.id ? {
      ...item,
      verificationStatus: isNowVerified ? 'verified_by_scientist' : 'pending_review',
      verifiedBy: isNowVerified ? 'ICAR Validated Agronomist' : undefined
    } : item));
    showToast(isNowVerified ? `Verified ${img.diseaseLabel} specimen.` : 'Marked for review.');
  };

  // Quick delete on card
  const handleDeleteOnCard = (e: React.MouseEvent, imgId: string) => {
    e.stopPropagation();
    if (confirm('Delete this image from the dataset?')) {
      StorageService.deleteDatasetImage(imgId);
      setImages(prev => prev.filter(i => i.id !== imgId));
      showToast('Image removed from dataset.');
    }
  };

  // Counts of splits for active dataset
  const splitCounts = useMemo(() => {
    const train = images.filter(i => (i.split || 'train') === 'train').length;
    const val = images.filter(i => i.split === 'val').length;
    const test = images.filter(i => i.split === 'test').length;
    return { train, val, test, total: images.length };
  }, [images]);

  return (
    <div id="dataset-manager-view" className="space-y-6 pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce border border-emerald-400/40">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            {onBackToDashboard && (
              <>
                <button
                  onClick={onBackToDashboard}
                  className="hover:text-emerald-400 font-semibold transition-colors cursor-pointer"
                >
                  Dashboard
                </button>
                <span>/</span>
              </>
            )}
            <span className="text-emerald-400 font-semibold">AI Datasets Hub</span>
            <span>/</span>
            <span className="text-slate-200">Image Ingestion & Ground-Truth Calibration</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>AI Crop Datasets & Ground-Truth Archive</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  ICAR Model v2.4
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage high-resolution foliar benchmarks, add verified field photos, and calibrate machine learning diagnostic weights.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsCreateDatasetModalOpen(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>New Dataset</span>
          </button>

          <button
            onClick={() => setIsAddImagesModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-emerald-950/60 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Add Images to Dataset</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Active Datasets</p>
            <p className="text-lg font-black text-white">{stats.totalDatasets}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Total Curated Images</p>
            <p className="text-lg font-black text-white">{stats.totalImages}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Scientist Ground-Truth</p>
            <p className="text-lg font-black text-white">{stats.verifiedPercent}%</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold">Model Accuracy Delta</p>
            <p className="text-lg font-black text-emerald-400 flex items-center gap-1">
              <span>96.8%</span>
              <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/60 px-1 rounded">
                +5.4%
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Selection Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-xs font-bold text-slate-400 shrink-0 px-1">Datasets:</span>
        {datasets.map(ds => {
          const isSelected = ds.id === selectedDatasetId;
          return (
            <button
              key={ds.id}
              onClick={() => setSelectedDatasetId(ds.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2 border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span>{ds.name}</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 font-mono">
                {ds.imageCount || 0}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setIsCreateDatasetModalOpen(true)}
          className="px-3 py-2 rounded-2xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800 border border-dashed border-slate-700 shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Dataset</span>
        </button>
      </div>

      {/* Active Dataset Detail Card */}
      {activeDataset && (
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  {activeDataset.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 font-semibold text-slate-300">
                  {activeDataset.crop}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 font-semibold text-slate-300">
                  {activeDataset.season}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 font-semibold text-slate-400">
                  {activeDataset.region}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-teal-950/60 text-teal-300 border border-teal-500/30 font-bold">
                  {activeDataset.status === 'retraining_ready' ? 'Model Retraining Ready' : 'Active Ingestion'}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white">{activeDataset.name}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                {activeDataset.description}
              </p>
            </div>

            {/* Retrained Accuracy Badge & Export Action */}
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-right">
                <p className="text-[10px] text-slate-400 font-medium">Vision Calibration Delta</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 line-through">
                    {activeDataset.modelAccuracyBaseline || 91.2}%
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm font-black text-emerald-400">
                    {activeDataset.modelRetrainedAccuracy || 96.8}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportManifest}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  title="Export full COCO/YOLO annotations"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Manifest</span>
                </button>

                <button
                  onClick={() => setIsAddImagesModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Images</span>
                </button>
              </div>
            </div>
          </div>

          {/* Disease Tags & Train/Val/Test Split Indicator */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-semibold mr-1">Target Classes:</span>
              {activeDataset.targetDiseases.map((dis, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700"
                >
                  {dis}
                </span>
              ))}
            </div>

            {/* Split pills */}
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">ML Split:</span>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold">
                Train: {splitCounts.train}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/30 font-bold">
                Val: {splitCounts.val}
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-purple-950/60 text-purple-300 border border-purple-500/30 font-bold">
                Test: {splitCounts.test}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Image Gallery Toolbar (Search, Filter, Actions) */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search images, disease, notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Disease Filter */}
          <select
            value={selectedDiseaseFilter}
            onChange={e => setSelectedDiseaseFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Diseases ({images.length})</option>
            {activeDataset?.targetDiseases.map(dis => (
              <option key={dis} value={dis}>
                {dis}
              </option>
            ))}
          </select>

          {/* Split Filter */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            {(['all', 'train', 'val', 'test'] as const).map(split => (
              <button
                key={split}
                onClick={() => setSelectedSplitFilter(split)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  selectedSplitFilter === split
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {split}
              </button>
            ))}
          </div>

          {/* Verification Status Filter */}
          <select
            value={selectedVerificationFilter}
            onChange={e => setSelectedVerificationFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Verifications</option>
            <option value="verified">Verified by Scientist</option>
            <option value="pending">Pending Review</option>
          </select>

        </div>

        {/* Right: View Mode Toggle & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsAddImagesModalOpen(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Add Images ({filteredImages.length})</span>
          </button>
        </div>

      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Images Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery || selectedDiseaseFilter !== 'all'
                ? 'Try adjusting your search query or class filter to match specimens.'
                : 'This dataset has no images yet. Click below to upload photos, convert diagnostic cases, or import specimens.'}
            </p>
          </div>
          <button
            onClick={() => setIsAddImagesModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-emerald-950/60 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Image to {activeDataset?.name || 'Dataset'}</span>
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filteredImages.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map(img => {
            const isVerified = img.verificationStatus === 'verified_by_scientist';
            const isHealthy = (img.diseaseLabel || '').toLowerCase().includes('healthy');

            return (
              <div
                key={img.id}
                onClick={() => setSelectedImageForDetail(img)}
                className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col cursor-pointer"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={img.imageUrl}
                    alt={img.diseaseLabel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur text-emerald-400 border border-slate-700">
                      {img.id}
                    </span>

                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase backdrop-blur border ${
                      img.split === 'train'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : img.split === 'val'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        : 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                    }`}>
                      {img.split || 'train'}
                    </span>
                  </div>

                  {/* Bounding box marker indicator if boxes exist */}
                  {img.boundingBoxes && img.boundingBoxes.length > 0 && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] text-slate-300 font-semibold border border-slate-700">
                      {img.boundingBoxes.length} Box(es)
                    </div>
                  )}

                  {/* Hover Overlay Button */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white text-xs truncate leading-snug">
                        {img.diseaseLabel}
                      </h3>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {img.cropName}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {img.notes || `${img.growthStage || 'Vegetative'} • ${img.foliarSide || 'Canopy'}`}
                    </p>
                  </div>

                  {/* Foliar Severity Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Severity</span>
                      <span className={isHealthy ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {isHealthy ? '0% (Healthy)' : `${img.severityPercent}%`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${img.severityPercent}%` }}
                        className={`h-full rounded-full ${
                          isHealthy ? 'bg-emerald-400' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Footer on Card: Verification & Action Icons */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={e => handleToggleVerificationOnCard(e, img)}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                        isVerified ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                      }`}
                      title={isVerified ? 'Scientist Verified' : 'Click to Verify'}
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 ${isVerified ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span>{isVerified ? 'Verified' : 'Pending'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={e => handleDeleteOnCard(e, img.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete from dataset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredImages.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Image / Specimen</th>
                  <th className="px-4 py-3">Crop & Class</th>
                  <th className="px-4 py-3">Split</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Origin</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredImages.map(img => {
                  const isVerified = img.verificationStatus === 'verified_by_scientist';

                  return (
                    <tr
                      key={img.id}
                      onClick={() => setSelectedImageForDetail(img)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={img.imageUrl}
                            alt={img.diseaseLabel}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <p className="font-mono text-[10px] text-emerald-400 font-bold">{img.id}</p>
                            <p className="text-xs font-semibold text-white truncate max-w-[180px]">
                              {img.title || img.fileName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{img.diseaseLabel}</p>
                        <p className="text-[10px] text-slate-400">{img.cropName}</p>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          img.split === 'train'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : img.split === 'val'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-purple-950 text-purple-300 border border-purple-500/30'
                        }`}>
                          {img.split || 'train'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-rose-400">{img.severityPercent}%</span>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          isVerified ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{isVerified ? 'Verified' : 'Pending'}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {img.location?.district || 'Indore'}, {img.location?.state || 'MP'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedImageForDetail(img)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Inspect"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={e => handleDeleteOnCard(e, img.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      <AddImagesModal
        isOpen={isAddImagesModalOpen}
        onClose={() => setIsAddImagesModalOpen(false)}
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        cases={cases}
        onImagesAdded={added => {
          showToast(`Added ${added.length} image(s) to dataset.`);
          refreshData();
        }}
      />

      <CreateDatasetModal
        isOpen={isCreateDatasetModalOpen}
        onClose={() => setIsCreateDatasetModalOpen(false)}
        onDatasetCreated={newDs => {
          showToast(`Created dataset: ${newDs.name}`);
          refreshData();
          setSelectedDatasetId(newDs.id);
          // Offer to add images immediately
          setTimeout(() => setIsAddImagesModalOpen(true), 400);
        }}
      />

      <ImageDetailModal
        image={selectedImageForDetail}
        dataset={activeDataset}
        isOpen={!!selectedImageForDetail}
        onClose={() => setSelectedImageForDetail(null)}
        onImageUpdated={updated => {
          setImages(prev => prev.map(item => item.id === updated.id ? updated : item));
          showToast('Updated image details.');
        }}
        onImageDeleted={delId => {
          setImages(prev => prev.filter(item => item.id !== delId));
          showToast('Image deleted.');
        }}
      />

    </div>
  );
};
