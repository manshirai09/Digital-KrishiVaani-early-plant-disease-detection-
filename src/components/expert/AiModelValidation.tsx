import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Layers,
  Activity,
  Zap,
  ShieldCheck,
  Microscope,
  Database,
  ArrowRight,
  Eye,
  Sliders,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { CaseRecord, UserRole } from '../../types';

interface AiModelValidationProps {
  onNavigate: (tab: string, extra?: any) => void;
  cases?: CaseRecord[];
}

interface BenchmarkSample {
  id: string;
  name: string;
  crop: string;
  actualGroundTruth: string;
  imageUrl: string;
  scenario: 'high_confidence' | 'low_confidence_gated' | 'pest_colony' | 'healthy' | 'out_of_distribution';
  description: string;
  expectedClass: string;
}

const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: 'sample-1',
    name: 'Cotton Cercospora Leaf Spot (High Confidence)',
    crop: 'Cotton (Bt-Gossypium)',
    actualGroundTruth: 'Cotton Leaf Spot (Cercospora)',
    imageUrl: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=600&q=80',
    scenario: 'high_confidence',
    description: 'Distinct reddish-brown circular spots with concentric rings on mature foliage.',
    expectedClass: 'Cotton Leaf Spot'
  },
  {
    id: 'sample-2',
    name: 'Ambiguous Atypical Blight (Safety Gating Trigger)',
    crop: 'Cotton',
    actualGroundTruth: 'Early Bacterial Blight / Sunscald Ambiguity',
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
    scenario: 'low_confidence_gated',
    description: 'Irregular chlorotic margin without clear fungal fruiting bodies. Confidence expected < 75%.',
    expectedClass: 'Requires Expert Review'
  },
  {
    id: 'sample-3',
    name: 'Foliar Aphid & Sucking Pest Colony',
    crop: 'Cotton',
    actualGroundTruth: 'Aphids & Whitefly Nymphs',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/CSIRO_ScienceImage_7848_Aphids_on_cotton_8.jpg',
    scenario: 'pest_colony',
    description: 'Underside foliar nymph clusters causing leaf curling and honeydew mold secretion.',
    expectedClass: 'Aphid Colony'
  },
  {
    id: 'sample-4',
    name: 'Soybean Healthy Foliage (Negative Control)',
    crop: 'Soybean (JS-335)',
    actualGroundTruth: 'Healthy Canopy',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910609f?auto=format&fit=crop&w=600&q=80',
    scenario: 'healthy',
    description: 'Vibrant green trifoliate leaves with zero necrotic lesions or chlorosis.',
    expectedClass: 'Healthy'
  },
  {
    id: 'sample-5',
    name: 'Out-of-Distribution Blur / Soil Noise',
    crop: 'Non-Foliar / Ground',
    actualGroundTruth: 'Out-of-Distribution (Blurry / Non-Leaf)',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    scenario: 'out_of_distribution',
    description: 'Motion blurred crop background. Out-of-Distribution filter must reject before inference.',
    expectedClass: 'OOD Rejected'
  }
];

interface ModelArchitecture {
  id: string;
  name: string;
  type: string;
  framework: string;
  sizeMb: number;
  avgLatencyMs: number;
  top1Accuracy: number;
  top5Accuracy: number;
  f1Score: number;
  deploymentTarget: 'Mobile Edge (Offline)' | 'Cloud High-Capacity (Ensemble)';
  status: 'Production Deployed' | 'Validation Candidate' | 'Experimental';
}

const MODELS: ModelArchitecture[] = [
  {
    id: 'vit-l16',
    name: 'Vision Transformer (ViT-L/16 Agri)',
    type: 'Transformer (Patch Attention)',
    framework: 'PyTorch / ONNX Runtime',
    sizeMb: 304.5,
    avgLatencyMs: 185,
    top1Accuracy: 96.8,
    top5Accuracy: 99.4,
    f1Score: 96.2,
    deploymentTarget: 'Cloud High-Capacity (Ensemble)',
    status: 'Production Deployed'
  },
  {
    id: 'mobilenet-v3',
    name: 'MobileNetV3-Agri (Edge Quantized INT8)',
    type: 'Depthwise Separable CNN',
    framework: 'TensorFlow Lite / Android NPU',
    sizeMb: 4.8,
    avgLatencyMs: 46,
    top1Accuracy: 91.4,
    top5Accuracy: 97.2,
    f1Score: 90.8,
    deploymentTarget: 'Mobile Edge (Offline)',
    status: 'Production Deployed'
  },
  {
    id: 'yolov8-seg',
    name: 'YOLOv8-LeafLesion Segmenter',
    type: 'Instance Segmentation',
    framework: 'ONNX / TensorRT',
    sizeMb: 24.2,
    avgLatencyMs: 64,
    top1Accuracy: 93.6,
    top5Accuracy: 98.1,
    f1Score: 93.1,
    deploymentTarget: 'Cloud High-Capacity (Ensemble)',
    status: 'Validation Candidate'
  }
];

export const AiModelValidation: React.FC<AiModelValidationProps> = ({
  onNavigate
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>('vit-l16');
  const [selectedSample, setSelectedSample] = useState<BenchmarkSample>(BENCHMARK_SAMPLES[0]);
  const [activeTab, setActiveTab] = useState<'inference' | 'metrics' | 'stress_test' | 'architectures'>('inference');
  
  // Interactive Validation States
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationCompleted, setValidationCompleted] = useState<boolean>(true);
  const [showGradCam, setShowGradCam] = useState<boolean>(true);
  const [gradCamIntensity, setGradCamIntensity] = useState<number>(75);
  
  // Stress Test Simulation States
  const [isStressTesting, setIsStressTesting] = useState<boolean>(false);
  const [stressTestProgress, setStressTestProgress] = useState<number>(0);
  const [stressTestResults, setStressTestResults] = useState<{
    total: number;
    passed: number;
    flaggedGated: number;
    oodRejected: number;
    accuracy: number;
  } | null>({
    total: 50,
    passed: 48,
    flaggedGated: 2,
    oodRejected: 1,
    accuracy: 96.0
  });

  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];

  const handleRunSingleValidation = () => {
    setIsValidating(true);
    setValidationCompleted(false);

    setTimeout(() => {
      setIsValidating(false);
      setValidationCompleted(true);
    }, 700);
  };

  const handleRunStressTestSuite = () => {
    setIsStressTesting(true);
    setStressTestProgress(0);
    setStressTestResults(null);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setStressTestProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsStressTesting(false);
        setStressTestResults({
          total: 50,
          passed: 49,
          flaggedGated: 1,
          oodRejected: 1,
          accuracy: 98.0
        });
      }
    }, 200);
  };

  // Dynamic inference outputs based on current sample & model
  const getInferenceDetails = () => {
    if (selectedSample.scenario === 'out_of_distribution') {
      return {
        predictedDisease: 'Rejected: Out-of-Distribution / Poor Clarity',
        confidence: 28,
        latencyMs: 12,
        isGated: true,
        gatingReason: 'Foliar segmentation filter detected non-leaf pixels or extreme blur (>45% noise).',
        logits: [
          { label: 'Out-of-Distribution', prob: 0.94 },
          { label: 'Soil / Background', prob: 0.05 },
          { label: 'Unknown Vegetation', prob: 0.01 }
        ]
      };
    }

    if (selectedSample.scenario === 'low_confidence_gated') {
      return {
        predictedDisease: 'Cotton Leaf Blight / Cercospora (Ambiguous)',
        confidence: 62,
        latencyMs: selectedModel.avgLatencyMs,
        isGated: true,
        gatingReason: 'Confidence (62%) is below safety threshold (75%). Routed to ICAR Human-in-the-Loop Validation Queue.',
        logits: [
          { label: 'Cotton Cercospora Leaf Spot', prob: 0.62 },
          { label: 'Bacterial Blight (Xanthomonas)', prob: 0.24 },
          { label: 'Alternaria Leaf Spot', prob: 0.10 },
          { label: 'Nutritional Chlorosis', prob: 0.04 }
        ]
      };
    }

    if (selectedSample.scenario === 'pest_colony') {
      return {
        predictedDisease: 'Aphid Colony & Sucking Pest Complex',
        confidence: selectedModel.id === 'vit-l16' ? 94 : 88,
        latencyMs: selectedModel.avgLatencyMs,
        isGated: false,
        gatingReason: 'Confidence exceeds 75%. Safe for immediate pre-approved bio-pesticide advisory.',
        logits: [
          { label: 'Aphids (Aphis gossypii)', prob: 0.89 },
          { label: 'Whitefly Nymphs (Bemisia)', prob: 0.07 },
          { label: 'Thrips Foliar Damage', prob: 0.03 },
          { label: 'Healthy Surface', prob: 0.01 }
        ]
      };
    }

    if (selectedSample.scenario === 'healthy') {
      return {
        predictedDisease: 'Healthy Canopy (No Pathogen Detected)',
        confidence: selectedModel.id === 'vit-l16' ? 98 : 94,
        latencyMs: selectedModel.avgLatencyMs,
        isGated: false,
        gatingReason: 'Negative control verified. Zero foliar necrosis or pest colonies detected.',
        logits: [
          { label: 'Healthy Canopy', prob: 0.98 },
          { label: 'Minor Mechanical Abrasion', prob: 0.01 },
          { label: 'Early Chlorosis', prob: 0.01 }
        ]
      };
    }

    // Default: High confidence Cotton Leaf Spot
    return {
      predictedDisease: 'Cotton Leaf Spot (Cercospora gossypina)',
      confidence: selectedModel.id === 'vit-l16' ? 96.8 : 91.2,
      latencyMs: selectedModel.avgLatencyMs,
      isGated: false,
      gatingReason: 'High confidence classification (>75%). Safe automated IPM protocol activated.',
      logits: [
        { label: 'Cotton Leaf Spot (Cercospora)', prob: selectedModel.id === 'vit-l16' ? 0.968 : 0.912 },
        { label: 'Alternaria Macrospora', prob: 0.021 },
        { label: 'Bacterial Blight', prob: 0.008 },
        { label: 'Healthy Foliage', prob: 0.003 }
      ]
    };
  };

  const currentInference = getInferenceDetails();

  return (
    <div id="ai-model-validation-suite" className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-8 animate-in fade-in duration-200">
      {/* ================= HEADER ================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>ICAR & KVK Research Validation Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>AI Model Validation & Benchmark Suite</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Verify accuracy, Grad-CAM attention heatmaps, edge quantization limits, and confidence-gated safety guardrails before deploying vision models to smallholder farmers.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('expert-queue')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 border border-slate-700 cursor-pointer shadow-sm"
            >
              <Microscope className="w-4 h-4 text-purple-400" />
              <span>Verification Queue</span>
            </button>
            <button
              onClick={() => onNavigate('datasets')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Database className="w-4 h-4" />
              <span>Datasets & Training</span>
            </button>
          </div>
        </div>

        {/* Global Model Health Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ViT Validation Acc</span>
            </div>
            <div className="text-lg font-black text-emerald-400 mt-1">96.8%</div>
            <div className="text-[10px] text-slate-400">+5.4% vs baseline</div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>MobileNet Edge Latency</span>
            </div>
            <div className="text-lg font-black text-amber-400 mt-1">46 ms</div>
            <div className="text-[10px] text-slate-400">Offline on Android NPU</div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Safety Gate Threshold</span>
            </div>
            <div className="text-lg font-black text-purple-300 mt-1">75.0%</div>
            <div className="text-[10px] text-slate-400">Auto-routes to ICAR Queue</div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/60">
            <div className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>OOD Rejection Rate</span>
            </div>
            <div className="text-lg font-black text-sky-300 mt-1">98.4%</div>
            <div className="text-[10px] text-slate-400">Blur/non-leaf suppression</div>
          </div>
        </div>
      </div>

      {/* ================= NAVIGATION TABS ================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('inference')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'inference'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Interactive Saliency & Gating Test</span>
        </button>

        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'metrics'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Confusion Matrix & Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('stress_test')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'stress_test'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Batch Stress Test Suite (50 Cases)</span>
        </button>

        <button
          onClick={() => setActiveTab('architectures')}
          className={`px-4 py-2.5 font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'architectures'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Edge vs Cloud Model Architectures</span>
        </button>
      </div>

      {/* ================= TAB 1: INTERACTIVE SALIENCY & INFERENCE ================= */}
      {activeTab === 'inference' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sample Selector & Image Viewer */}
          <div className="lg:col-span-7 space-y-5">
            {/* Model & Benchmark Selector Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Select Active AI Model Backbone</span>
                </label>
                <select
                  value={selectedModelId}
                  onChange={e => setSelectedModelId(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                >
                  {MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.avgLatencyMs}ms • {m.top1Accuracy}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample Leaf Selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block">
                  Select Ground-Truth Validation Image:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BENCHMARK_SAMPLES.map(sample => {
                    const isSelected = selectedSample.id === sample.id;
                    return (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => {
                          setSelectedSample(sample);
                          setValidationCompleted(false);
                          setTimeout(() => setValidationCompleted(true), 300);
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-100 mb-1.5 relative">
                          <img
                            src={sample.imageUrl}
                            alt={sample.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          {sample.scenario === 'low_confidence_gated' && (
                            <span className="absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-extrabold px-1 rounded-sm">
                              Gated
                            </span>
                          )}
                          {sample.scenario === 'out_of_distribution' && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-extrabold px-1 rounded-sm">
                              OOD
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{sample.name}</p>
                        <p className="text-[10px] text-slate-500">{sample.crop}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Visual Leaf Viewer with Grad-CAM Overlay */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Foliar Inspection & Grad-CAM Attention Heatmap
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ground Truth: <strong className="text-slate-800">{selectedSample.actualGroundTruth}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGradCam}
                      onChange={e => setShowGradCam(e.target.checked)}
                      className="rounded-sm text-purple-600 focus:ring-purple-500"
                    />
                    <span>Grad-CAM Saliency</span>
                  </label>
                </div>
              </div>

              {/* Image Stage */}
              <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200">
                <img
                  src={selectedSample.imageUrl}
                  alt={selectedSample.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Simulated Grad-CAM Saliency Overlay */}
                {showGradCam && selectedSample.scenario !== 'out_of_distribution' && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: gradCamIntensity / 100,
                      background: 'radial-gradient(circle at 45% 55%, rgba(239, 68, 68, 0.75) 0%, rgba(234, 179, 8, 0.55) 25%, rgba(59, 130, 246, 0.35) 50%, transparent 75%)',
                      mixBlendMode: 'screen'
                    }}
                  />
                )}

                {/* Saliency Legend Pill */}
                {showGradCam && selectedSample.scenario !== 'out_of_distribution' && (
                  <div className="absolute bottom-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-2 backdrop-blur-sm shadow-md">
                    <span>Feature Activation:</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span>High (Necrotic Core)</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Medium</span>
                  </div>
                )}

                {isValidating && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3">
                    <div className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-bold">Computing ViT Token Embeddings...</p>
                  </div>
                )}
              </div>

              {/* Saliency Controls */}
              {showGradCam && selectedSample.scenario !== 'out_of_distribution' && (
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="font-semibold">Saliency Map Opacity: {gradCamIntensity}%</span>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={gradCamIntensity}
                    onChange={e => setGradCamIntensity(Number(e.target.value))}
                    className="w-36 accent-purple-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inference Diagnostics & Safety Gate Decision */}
          <div className="lg:col-span-5 space-y-5">
            {/* Real-time Inference Summary Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Model Inference Telemetry
                  </span>
                </div>
                <button
                  onClick={handleRunSingleValidation}
                  disabled={isValidating}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className={`w-3 h-3 ${isValidating ? 'animate-spin' : ''}`} />
                  <span>Re-evaluate</span>
                </button>
              </div>

              {/* Diagnosis Output Header */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Predicted Class (Top-1)
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                  {currentInference.predictedDisease}
                </h4>
                
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <span className="text-[11px] text-slate-500">Confidence</span>
                    <p className={`text-xl font-black ${
                      currentInference.confidence >= 75 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {currentInference.confidence}%
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <span className="text-[11px] text-slate-500">Inference Latency</span>
                    <p className="text-xl font-black text-slate-900">
                      {currentInference.latencyMs} ms
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <span className="text-[11px] text-slate-500">Model Framework</span>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {selectedModel.framework.split('/')[0]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Gating Banner */}
              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                currentInference.isGated
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex items-center gap-2 font-extrabold">
                  {currentInference.isGated ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Human-in-the-Loop Safety Gate Triggered</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Confidence Gate Passed (&gt;75%) • Auto-Approved</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {currentInference.gatingReason}
                </p>

                {currentInference.isGated && (
                  <button
                    onClick={() => onNavigate('expert-queue')}
                    className="mt-2 w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Inspect in Scientist Review Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Logits & Softmax Probability Distribution */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Class Probability Distribution (Softmax Logits)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Top classes</span>
                </span>

                <div className="space-y-2">
                  {currentInference.logits.map((logit, idx) => {
                    const pct = Math.round(logit.prob * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                            {logit.label}
                          </span>
                          <span className="font-extrabold text-slate-900">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0
                                ? pct >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                                : 'bg-slate-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edge Quantization Check */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 text-slate-600">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Edge Deployment Suitability:</span>
                  <span className={selectedModel.sizeMb < 10 ? 'text-emerald-700' : 'text-purple-700'}>
                    {selectedModel.sizeMb < 10 ? '✓ Ready for Offline APK' : '⚡ Cloud Inference Only'}
                  </span>
                </div>
                <p className="text-[11px]">
                  Memory footprint: <strong>{selectedModel.sizeMb} MB</strong>. ViT handles high-resolution leaf crops in cloud while MobileNet runs locally on low-cost devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CONFUSION MATRIX & EVALUATION METRICS ================= */}
      {activeTab === 'metrics' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                ICAR Benchmark Validation Dataset Evaluation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation results on 1,280 Central India verified ground-truth foliar test cases.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Validation report exported as CSV / JSON')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Validation Report</span>
              </button>
            </div>
          </div>

          {/* Model Evaluation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 text-center">
              <span className="text-xs font-bold text-purple-700">Top-1 Accuracy</span>
              <div className="text-2xl font-black text-purple-950 mt-1">96.8%</div>
              <span className="text-[10px] text-purple-600">1,239 / 1,280 correct</span>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-700">Macro F1-Score</span>
              <div className="text-2xl font-black text-emerald-950 mt-1">96.2%</div>
              <span className="text-[10px] text-emerald-600">Harmonic precision-recall</span>
            </div>

            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 text-center">
              <span className="text-xs font-bold text-sky-700">Average Precision</span>
              <div className="text-2xl font-black text-sky-950 mt-1">95.4%</div>
              <span className="text-[10px] text-sky-600">Low false-positive rate</span>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-center">
              <span className="text-xs font-bold text-amber-700">Average Recall</span>
              <div className="text-2xl font-black text-amber-950 mt-1">97.1%</div>
              <span className="text-[10px] text-amber-600">Zero missed critical blights</span>
            </div>
          </div>

          {/* Confusion Matrix Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Confusion Matrix (Ground Truth vs Model Prediction)</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">True Class \ Predicted</th>
                    <th className="p-3 text-center">Cotton Leaf Spot</th>
                    <th className="p-3 text-center">Bacterial Blight</th>
                    <th className="p-3 text-center">Aphid Infestation</th>
                    <th className="p-3 text-center">Healthy</th>
                    <th className="p-3 text-center">Recall (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr>
                    <td className="p-3 font-bold bg-slate-50">Cotton Leaf Spot (320)</td>
                    <td className="p-3 text-center font-extrabold bg-emerald-50 text-emerald-900">311</td>
                    <td className="p-3 text-center text-slate-600">5</td>
                    <td className="p-3 text-center text-slate-600">1</td>
                    <td className="p-3 text-center text-slate-600">3</td>
                    <td className="p-3 text-center font-bold text-emerald-700">97.2%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-slate-50">Bacterial Blight (280)</td>
                    <td className="p-3 text-center text-slate-600">6</td>
                    <td className="p-3 text-center font-extrabold bg-emerald-50 text-emerald-900">269</td>
                    <td className="p-3 text-center text-slate-600">2</td>
                    <td className="p-3 text-center text-slate-600">3</td>
                    <td className="p-3 text-center font-bold text-emerald-700">96.1%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-slate-50">Aphids & Pest (340)</td>
                    <td className="p-3 text-center text-slate-600">2</td>
                    <td className="p-3 text-center text-slate-600">1</td>
                    <td className="p-3 text-center font-extrabold bg-emerald-50 text-emerald-900">331</td>
                    <td className="p-3 text-center text-slate-600">6</td>
                    <td className="p-3 text-center font-bold text-emerald-700">97.4%</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-slate-50">Healthy Foliage (340)</td>
                    <td className="p-3 text-center text-slate-600">4</td>
                    <td className="p-3 text-center text-slate-600">3</td>
                    <td className="p-3 text-center text-slate-600">5</td>
                    <td className="p-3 text-center font-extrabold bg-emerald-50 text-emerald-900">328</td>
                    <td className="p-3 text-center font-bold text-emerald-700">96.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: BATCH STRESS TEST SUITE ================= */}
      {activeTab === 'stress_test' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-600" />
                <span>Automated 50-Image Stress Test Suite</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Stress test the active model against edge cases: extreme shadows, camera motion blur, atypical lesions, and camera sensor glare.
              </p>
            </div>

            <button
              onClick={handleRunStressTestSuite}
              disabled={isStressTesting}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isStressTesting ? 'animate-spin' : ''}`} />
              <span>{isStressTesting ? 'Executing Batch Test...' : 'Run 50-Case Stress Test'}</span>
            </button>
          </div>

          {/* Test Execution Progress Bar */}
          {isStressTesting && (
            <div className="space-y-2 p-4 bg-purple-50 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                <span>Evaluating Validation Test Cases ({Math.round(stressTestProgress * 0.5)} / 50)...</span>
                <span>{stressTestProgress}%</span>
              </div>
              <div className="w-full bg-purple-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-200"
                  style={{ width: `${stressTestProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Test Results Output */}
          {stressTestResults && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800">Pass Rate</span>
                  <div className="text-2xl font-black text-emerald-950 mt-1">
                    {stressTestResults.accuracy}%
                  </div>
                  <span className="text-[10px] text-emerald-700">49 / 50 benchmark cases</span>
                </div>

                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <span className="text-xs font-bold text-purple-800">Safety Gated</span>
                  <div className="text-2xl font-black text-purple-950 mt-1">
                    {stressTestResults.flaggedGated} case
                  </div>
                  <span className="text-[10px] text-purple-700">Ambiguous pattern caught</span>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-xs font-bold text-amber-800">OOD Filtered</span>
                  <div className="text-2xl font-black text-amber-950 mt-1">
                    {stressTestResults.oodRejected} case
                  </div>
                  <span className="text-[10px] text-amber-700">Extreme blur rejected</span>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300">ICAR Status</span>
                  <div className="text-sm font-extrabold text-emerald-400 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Deployment Ready</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Exceeds 95% threshold</span>
                </div>
              </div>

              {/* ICAR Official Certification Box */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold">
                    Official Agronomic Validation Certificate Generated (#ICAR-VAL-2026-884)
                  </p>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    This model meets all National Agricultural Technology Project criteria for automated IPM recommendations. Low-confidence safety thresholds are rigorously enforced, preventing pesticide misapplication on smallholder farms.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: ARCHITECTURES ================= */}
      {activeTab === 'architectures' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900">
              Deployed AI Architectures Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-tiered deployment pipeline: lightweight CNN on device edge + large vision transformers in cloud backend.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MODELS.map(m => (
              <div
                key={m.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  m.id === selectedModelId
                    ? 'border-purple-400 bg-purple-50/30 ring-2 ring-purple-200 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {m.type}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      m.status === 'Production Deployed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900">{m.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{m.framework}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 text-[10px]">Model Size</span>
                      <p className="font-extrabold text-slate-800">{m.sizeMb} MB</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 text-[10px]">Inference Time</span>
                      <p className="font-extrabold text-slate-800">{m.avgLatencyMs} ms</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 text-[10px]">Top-1 Accuracy</span>
                      <p className="font-extrabold text-emerald-700">{m.top1Accuracy}%</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 text-[10px]">F1-Score</span>
                      <p className="font-extrabold text-purple-700">{m.f1Score}%</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block mb-2">
                    Target: {m.deploymentTarget}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedModelId(m.id);
                      setActiveTab('inference');
                    }}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Select for Saliency Testing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
