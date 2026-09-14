import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Tag,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  FolderPlus,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Dataset, DatasetImage, UserRole, CaseRecord } from '../../types';
import { StorageService } from '../../services/storageService';
import { AddImagesModal } from './AddImagesModal';
import { CreateDatasetModal } from './CreateDatasetModal';
import { ImageDetailModal } from './ImageDetailModal';

interface DatasetViewProps {
  userRole?: UserRole;
  availableCases?: CaseRecord[];
}

export const DatasetView: React.FC<DatasetViewProps> = ({
  userRole = 'expert',
  availableCases = []
}) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [allImages, setAllImages] = useState<DatasetImage[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'gallery' | 'retraining' | 'export'>('gallery');

  // Modals state
  const [isAddImagesOpen, setIsAddImagesOpen] = useState(false);
  const [isCreateDatasetOpen, setIsCreateDatasetOpen] = useState(false);
  const [inspectedImage, setInspectedImage] = useState<DatasetImage | null>(null);

  // Retraining simulation state
  const [isTraining, setIsTraining] = useState(false);
  const [trainingEpoch, setTrainingEpoch] = useState(0);
  const [trainingStatus, setTrainingStatus] = useState<string>('');
  const [retrainedSuccess, setRetrainedSuccess] = useState(false);

  const loadData = () => {
    const ds = StorageService.getDatasets();
    const imgs = StorageService.getDatasetImages();
    setDatasets(ds);
    setAllImages(imgs);

    if (ds.length > 0 && (!selectedDatasetId || !ds.some(d => d.id === selectedDatasetId))) {
      setSelectedDatasetId(ds[0].id);
    }
  };

  useEffect(() => {
    loadData();

    const handleStateChange = (e: any) => {
      if (['datasets', 'dataset_images', 'reset_all'].includes(e.detail?.key)) {
        loadData();
      }
    };
    window.addEventListener('krishi_state_change', handleStateChange);
    return () => {
      window.removeEventListener('krishi_state_change', handleStateChange);
    };
  }, []);

  const activeDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0] || null;

  // Filter images for active dataset
  const activeDatasetImages = allImages.filter(img => img.datasetId === activeDataset?.id);

  const filteredImages = activeDatasetImages.filter(img => {
    const matchesSearch =
      img.diseaseLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.location.village ? img.location.village.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (img.notes && img.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDisease = diseaseFilter === 'all' || img.diseaseLabel === diseaseFilter;

    const matchesVerification =
      verificationFilter === 'all' ||
      (verificationFilter === 'verified' && img.verificationStatus === 'verified_by_scientist') ||
      (verificationFilter === 'extension' && img.verificationStatus === 'verified_by_extension') ||
      (verificationFilter === 'pending' && img.verificationStatus === 'pending_review');

    return matchesSearch && matchesDisease && matchesVerification;
  });

  // Unique diseases in the active dataset for filter chips
  const uniqueDiseasesInActive = Array.from(new Set(activeDatasetImages.map(img => img.diseaseLabel)));

  // Global metrics
  const totalDatasets = datasets.length;
  const totalImages = allImages.length;
  const verifiedCount = allImages.filter(img => img.verificationStatus === 'verified_by_scientist').length;
  const verifiedPercent = totalImages > 0 ? Math.round((verifiedCount / totalImages) * 100) : 0;

  // Simulate Retraining
  const startRetrainingSimulation = () => {
    if (isTraining || !activeDataset) return;
    setIsTraining(true);
    setRetrainedSuccess(false);
    setTrainingEpoch(0);
    setTrainingStatus('Initializing Vision Transformer (ViT-L/16) backbone weights...');

    const totalEpochs = 10;
    let currentEpoch = 0;

    const interval = setInterval(() => {
      currentEpoch += 1;
      setTrainingEpoch(currentEpoch);

      if (currentEpoch === 2) {
        setTrainingStatus('Ingesting annotated ground truth & bounding box patches...');
      } else if (currentEpoch === 5) {
        setTrainingStatus('Computing Cross-Entropy Loss & Focal Loss on hard negatives...');
      } else if (currentEpoch === 8) {
        setTrainingStatus('Validation accuracy reaching 96.8% (+5.4% improvement on field cases)...');
      } else if (currentEpoch >= totalEpochs) {
        clearInterval(interval);
        setIsTraining(false);
        setRetrainedSuccess(true);
        setTrainingStatus('Retraining complete! Model weights synced to field inference engine.');

        // Update dataset record
        StorageService.updateDataset(activeDataset.id, {
          status: 'retraining_ready',
          modelRetrainedAccuracy: 96.8
        });
        loadData();
      }
    }, 600);
  };

  const handleDownloadDatasetJson = () => {
    if (!activeDataset) return;
    const exportBundle = {
      dataset: activeDataset,
      images: activeDatasetImages,
      exportedAt: new Date().toISOString(),
      format: 'COCO_Agricultural_Annotation_Format_v1.0',
      totalSamples: activeDatasetImages.length
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeDataset.id}_COCO_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="dataset-management-hub" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Database className="w-3.5 h-3.5" />
              <span>Closed-Loop Active Learning & Dataset Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agricultural Vision Datasets
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Curate, label, and contribute verified field images to train KrishiRakshak's deep multimodal diagnostic model. Every added image fortifies early disease detection accuracy across regional farms.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              id="open-create-dataset-modal-btn"
              onClick={() => setIsCreateDatasetOpen(true)}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <FolderPlus className="w-4 h-4 text-purple-400" />
              <span>Create Dataset</span>
            </button>

            <button
              type="button"
              id="open-add-images-modal-btn"
              onClick={() => setIsAddImagesOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40 transform hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4" />
              <span>+ Add Images to Dataset</span>
            </button>
          </div>
        </div>

        {/* Global Summary Metrics Strip */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Datasets</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{totalDatasets}</span>
            <span className="text-[10px] text-emerald-400">Multi-crop archives</span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Labeled Images</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{totalImages}</span>
            <span className="text-[10px] text-emerald-400">In-situ foliar & pest samples</span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-semibold block">Scientist Ground-Truth</span>
            <span className="text-xl font-extrabold text-purple-300 mt-1 block">{verifiedPercent}%</span>
            <span className="text-[10px] text-purple-400">{verifiedCount} lab-verified samples</span>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 font-semibold block">AI Retrained Accuracy</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">96.8%</span>
            <span className="text-[10px] text-emerald-300">+5.4% boost on regional strains</span>
          </div>
        </div>
      </div>

      {/* Dataset Selector Carousel / Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Select Active Dataset</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Switch datasets to inspect or train
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {datasets.map(ds => {
            const isSelected = ds.id === activeDataset?.id;
            return (
              <div
                key={ds.id}
                onClick={() => {
                  setSelectedDatasetId(ds.id);
                  setDiseaseFilter('all');
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {ds.crop}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ds.status === 'retraining_ready'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ds.status === 'retraining_ready' ? 'Retraining Ready' : 'Active Collection'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                    {ds.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {ds.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-extrabold text-slate-900">{ds.imageCount}</span>
                    <span className="text-slate-500">images</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-purple-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{ds.verifiedCount} verified</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Dataset Workspace */}
      {activeDataset && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Workspace Header */}
          <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase">
                  Dataset ID: {activeDataset.id}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {activeDataset.region}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 font-semibold">
                  {activeDataset.season}
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900">
                {activeDataset.name}
              </h2>
            </div>

            {/* Quick Actions & Tab Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Tab Switcher */}
              <div className="flex rounded-xl bg-slate-200/80 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('gallery')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'gallery'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Image Gallery ({activeDatasetImages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('retraining')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'retraining'
                      ? 'bg-white text-purple-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI Retraining</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('export')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'export'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>

              {/* Direct Add Images Button for this dataset */}
              <button
                type="button"
                onClick={() => setIsAddImagesOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Images</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Image Gallery */}
          {activeTab === 'gallery' && (
            <div className="p-6 space-y-5">
              {/* Search and Filters Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by disease, location, symptom or notes..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Verification Filter */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <select
                    value={verificationFilter}
                    onChange={e => setVerificationFilter(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Images ({activeDatasetImages.length})</option>
                    <option value="verified">Scientist Ground Truth Only</option>
                    <option value="extension">Field Extension Verified</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>

              {/* Disease Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Disease Class:
                </span>
                <button
                  type="button"
                  onClick={() => setDiseaseFilter('all')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    diseaseFilter === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  All ({activeDatasetImages.length})
                </button>
                {uniqueDiseasesInActive.map(disease => {
                  const count = activeDatasetImages.filter(i => i.diseaseLabel === disease).length;
                  return (
                    <button
                      key={disease}
                      type="button"
                      onClick={() => setDiseaseFilter(disease)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        diseaseFilter === disease
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      {disease} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Image Grid */}
              {filteredImages.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 space-y-3">
                  <Database className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">No images match your filter</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      No images found in this dataset with the current criteria. Add new photos using the button below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddImagesOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Add Images to this Dataset</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map(img => (
                    <div
                      key={img.id}
                      onClick={() => setInspectedImage(img)}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                    >
                      {/* Image Thumbnail Stage */}
                      <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                        <img
                          src={img.imageUrl}
                          alt={img.diseaseLabel}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                            {img.cropName}
                          </span>

                          {img.verificationStatus === 'verified_by_scientist' ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-600/90 text-white flex items-center gap-1 backdrop-blur-xs">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-500/90 text-white backdrop-blur-xs">
                              Field Scan
                            </span>
                          )}
                        </div>

                        {/* Bounding box marker indicator */}
                        {img.boundingBoxes && img.boundingBoxes.length > 0 && (
                          <div className="absolute bottom-2 left-2 text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded-sm border border-emerald-500/40">
                            {img.boundingBoxes.length} Box{img.boundingBoxes.length > 1 ? 'es' : ''} Annotated
                          </div>
                        )}

                        <div className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-sm">
                          {img.severityPercent}% Sev
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                            {img.diseaseLabel}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{img.location.village ? `${img.location.village}, ` : ''}{img.location.district}</span>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{img.growthStage}</span>
                          <span className="font-medium text-slate-500">{img.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Model Retraining Pipeline */}
          {activeTab === 'retraining' && (
            <div className="p-6 space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Closed-Loop Fine-Tuning Pipeline</span>
                  </div>
                  <h3 className="text-lg font-bold">
                    Retrain KrishiRakshak Diagnostic Vision Model
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automatically inject {activeDatasetImages.length} labeled field images ({activeDataset.verifiedCount} verified ground-truth) into the next model checkpoint. Improves local pathogen detection precision on regional strains.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <button
                    type="button"
                    id="trigger-retraining-btn"
                    onClick={startRetrainingSimulation}
                    disabled={isTraining}
                    className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-950/40 disabled:opacity-50"
                  >
                    {isTraining ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Training Epoch {trainingEpoch}/10...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Run Retraining on this Dataset</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-slate-400">
                    Est. validation compute: ~6 seconds
                  </span>
                </div>
              </div>

              {/* Progress Bar when Training */}
              {isTraining && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                    <span>{trainingStatus}</span>
                    <span>{trainingEpoch * 10}%</span>
                  </div>
                  <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full transition-all duration-300"
                      style={{ width: `${trainingEpoch * 10}%` }}
                    />
                  </div>
                </div>
              )}

              {retrainedSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong>Retraining Succeeded!</strong> Vision model updated with 96.8% accuracy (+5.4% boost). New model checkpoint active for all real-time field scans.
                  </div>
                </div>
              )}

              {/* Accuracy Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Baseline Generic Model
                  </span>
                  <div className="text-3xl font-extrabold text-slate-800">
                    {activeDataset.modelAccuracyBaseline || 89.2}%
                  </div>
                  <p className="text-xs text-slate-500">
                    Trained on public generic datasets (PlantVillage). Struggled with dusty leaves, low-light field scans, and regional Malwa rust variations.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase">
                      In-Situ Retrained Model
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      +5.4% Boost
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-800">
                    {activeDataset.modelRetrainedAccuracy || 96.8}%
                  </div>
                  <p className="text-xs text-emerald-900">
                    Enhanced with local field benchmark images, scientist-verified pustule bounding boxes, and IoT micro-climate context.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Export & Integration */}
          {activeTab === 'export' && (
            <div className="p-6 space-y-6">
              <div className="max-w-xl space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  Export Dataset Annotations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Download structured dataset bundles for external ML training (PyTorch, TensorFlow, YOLOv8) or academic research with ICAR / SAU institutions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors bg-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900">COCO Annotation Format (JSON)</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Includes full bounding box geometries, categories, pathogen tags, and regional coordinates.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadDatasetJson}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Download COCO JSON
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors bg-white space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900">CSV Field Surveillance Summary</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Spreadsheet with image IDs, disease names, severity metrics, villages, and lab verification status.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const csvHeader = "id,datasetId,cropName,diseaseLabel,severityPercent,growthStage,village,district,state,verified\n";
                      const csvRows = activeDatasetImages.map(img =>
                        `"${img.id}","${img.datasetId}","${img.cropName}","${img.diseaseLabel}",${img.severityPercent},"${img.growthStage}","${img.location.village || ''}","${img.location.district}","${img.location.state}","${img.verificationStatus}"`
                      ).join("\n");
                      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${activeDataset.id}_summary.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Add Images Modal */}
      <AddImagesModal
        isOpen={isAddImagesOpen}
        onClose={() => setIsAddImagesOpen(false)}
        datasets={datasets}
        selectedDatasetId={selectedDatasetId}
        availableCases={availableCases}
        onSuccess={(newImages, targetId) => {
          loadData();
          setSelectedDatasetId(targetId);
        }}
      />

      {/* Create Dataset Modal */}
      <CreateDatasetModal
        isOpen={isCreateDatasetOpen}
        onClose={() => setIsCreateDatasetOpen(false)}
        onCreated={newDs => {
          loadData();
          setSelectedDatasetId(newDs.id);
        }}
      />

      {/* Image Detail Inspection Modal */}
      <ImageDetailModal
        image={inspectedImage}
        onClose={() => setInspectedImage(null)}
        onImageDeleted={id => {
          loadData();
          setInspectedImage(null);
        }}
        onImageUpdated={updated => {
          loadData();
          setInspectedImage(updated);
        }}
      />

    </div>
  );
};
