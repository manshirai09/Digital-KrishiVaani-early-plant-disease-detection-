import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Download,
  Trash2,
  Edit2,
  Check,
  MapPin,
  Calendar,
  User,
  Layers,
  Sparkles,
  Tag,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { DatasetImage, Dataset } from '../../types';
import { StorageService } from '../../services/storageService';

interface ImageDetailModalProps {
  image: DatasetImage | null;
  dataset?: Dataset;
  isOpen?: boolean;
  onClose: () => void;
  onImageUpdated: (updated: DatasetImage) => void;
  onImageDeleted: (deletedId: string) => void;
}

export const ImageDetailModal: React.FC<ImageDetailModalProps> = ({
  image,
  dataset,
  isOpen = Boolean(image),
  onClose,
  onImageUpdated,
  onImageDeleted
}) => {
  if (!isOpen || !image) return null;

  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [editedLabel, setEditedLabel] = useState(image.diseaseLabel);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle Verification status
  const handleToggleVerification = () => {
    const isNowVerified = image.verificationStatus !== 'verified_by_scientist';
    const updates: Partial<DatasetImage> = {
      verificationStatus: isNowVerified ? 'verified_by_scientist' : 'pending_review',
      verifiedBy: isNowVerified ? 'ICAR Validated Agronomist' : undefined
    };
    StorageService.updateDatasetImage(image.id, updates);
    onImageUpdated({ ...image, ...updates });
  };

  // Save edited disease label
  const handleSaveLabel = () => {
    if (!editedLabel.trim()) return;
    const updates: Partial<DatasetImage> = {
      diseaseLabel: editedLabel.trim(),
      tags: [image.cropName, editedLabel.trim(), (image.split || 'train').toUpperCase()]
    };
    StorageService.updateDatasetImage(image.id, updates);
    onImageUpdated({ ...image, ...updates });
    setIsEditingLabel(false);
  };

  // Export Annotation JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(image, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${image.id}_annotation.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Delete image
  const handleDelete = () => {
    StorageService.deleteDatasetImage(image.id);
    onImageDeleted(image.id);
    onClose();
  };

  const isVerified = image.verificationStatus === 'verified_by_scientist';

  return (
    <div
      id="dataset-image-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700">
              {image.id}
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {image.title || image.fileName || `${image.cropName} Specimen`}
              </h2>
              <p className="text-[11px] text-slate-400">
                In Dataset: <span className="text-slate-300 font-semibold">{dataset?.name || image.datasetId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Export COCO/YOLO Annotation JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Image with Bounding Box Overlay (7 cols) */}
          <div className="md:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-square max-h-[420px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-inner">
              <img
                src={image.imageUrl}
                alt={image.diseaseLabel}
                className="w-full h-full object-contain"
              />

              {/* Bounding Boxes Layer */}
              {showBoundingBoxes && image.boundingBoxes && image.boundingBoxes.map(box => (
                <div
                  key={box.id}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`
                  }}
                  className="absolute border-2 border-emerald-400 bg-emerald-500/15 rounded pointer-events-none transition-all shadow-xs"
                >
                  <span className="absolute -top-6 left-0 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap">
                    {box.label} ({Math.round((box.confidence || 0.95) * 100)}%)
                  </span>
                </div>
              ))}

              {/* Top Controls Overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                {image.boundingBoxes && image.boundingBoxes.length > 0 && (
                  <button
                    onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur text-xs font-semibold text-white hover:bg-slate-800 flex items-center gap-1.5 border border-slate-700 shadow-md cursor-pointer"
                  >
                    {showBoundingBoxes ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{showBoundingBoxes ? 'Hide Boxes' : 'Show Boxes'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Split & Bounding box count info */}
            <div className="w-full flex items-center justify-between mt-3 px-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Split: <strong className="text-white uppercase">{image.split || 'train'}</strong></span>
              </span>
              <span>
                {image.boundingBoxes && image.boundingBoxes.length > 0
                  ? `${image.boundingBoxes.length} Bounding Box Annotation(s)`
                  : 'Full image label classification'}
              </span>
            </div>
          </div>

          {/* Right Column: Metadata & Annotation Details (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-xs">
            
            {/* Classification & Verification Card */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Classification Label
                </span>
                {!isEditingLabel ? (
                  <button
                    onClick={() => setIsEditingLabel(true)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveLabel}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                )}
              </div>

              {!isEditingLabel ? (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-bold text-white">{image.diseaseLabel}</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={editedLabel}
                  onChange={e => setEditedLabel(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              )}

              {/* Verification Status Pill */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isVerified ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  )}
                  <div>
                    <p className="font-bold text-white">
                      {isVerified ? 'Scientist Verified' : 'Pending Verification'}
                    </p>
                    {image.verifiedBy && (
                      <p className="text-[10px] text-slate-400">{image.verifiedBy}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleToggleVerification}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    isVerified
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  {isVerified ? 'Unverify' : 'Verify'}
                </button>
              </div>
            </div>

            {/* Botanical & Agronomic Details */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Botanical Metadata
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Crop:</span>
                  <span className="font-semibold text-white">{image.cropName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Foliar Severity:</span>
                  <span className="font-semibold text-rose-400">
                    {image.severityPercent}% Coverage
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Growth Stage:</span>
                  <span className="font-semibold text-slate-200">{image.growthStage || 'Vegetative'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Foliar Position:</span>
                  <span className="font-semibold text-slate-200">{image.foliarSide || 'Full Canopy'}</span>
                </div>
              </div>

              {image.notes && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">Observations:</span>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {image.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Origin & Provenance */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2 text-[11px]">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Provenance & Geolocation
              </h4>

              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {image.location?.village ? `${image.location.village}, ` : ''}
                  {image.location?.district || 'Indore'}, {image.location?.state || 'Madhya Pradesh'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Captured: {image.capturedAt}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Contributed by: {image.contributedBy?.name} ({image.contributedBy?.role})</span>
              </div>
            </div>

            {/* Delete Image Action */}
            <div className="pt-2">
              {!isDeleting ? (
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="w-full py-2 bg-slate-800/80 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Image from Dataset</span>
                </button>
              ) : (
                <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl space-y-2">
                  <p className="text-[11px] text-rose-200 font-semibold">
                    Are you sure you want to remove this image from the dataset?
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
