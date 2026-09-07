import React, { useState } from 'react';
import { DiagnosisResult, UserRole } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { StorageService } from '../../services/storageService';
import { VoicePlayer } from '../common/VoicePlayer';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Clock,
  Send,
  Lock,
  ChevronRight,
  ExternalLink,
  Mic,
  Camera,
  Layers,
  CloudSun,
  UserCheck,
  RefreshCw,
  Info,
  Sprout,
  Activity
} from 'lucide-react';

interface AiDiagnosisResultProps {
  diagnosis: DiagnosisResult;
  onNavigate: (tab: string, extra?: any) => void;
  onSwitchRole?: (role: UserRole) => void;
  onRescan: () => void;
  onOpenVaani?: () => void;
}

export const AiDiagnosisResult: React.FC<AiDiagnosisResultProps> = ({
  diagnosis,
  onNavigate,
  onSwitchRole,
  onRescan,
  onOpenVaani
}) => {
  const isConfidenceLow = diagnosis.confidence < 75 || diagnosis.needsExpertReview;
  const [isEscalated, setIsEscalated] = useState(false);

  const handleRequestManualExpertReview = () => {
    StorageService.addNotification({
      id: `notif-manual-${Date.now()}`,
      title: `Expert Review Requested for Case #${diagnosis.caseId}`,
      message: `Farmer submitted a priority validation request for ${diagnosis.diseaseName}.`,
      timestamp: 'Just now',
      type: 'expert_update',
      riskLevel: diagnosis.riskScore.riskLevel,
      read: false,
      targetRole: 'expert',
      actionPath: 'expert-queue'
    });
    setIsEscalated(true);
  };

  const cropHealthScore = Math.max(10, 100 - diagnosis.riskScore.overallScore);

  const riskLevelText = (diagnosis?.riskScore?.riskLevel || 'MODERATE').toUpperCase();
  const voiceSummary = `फसल विश्लेषण रिपोर्ट: मुख्य रोग ${diagnosis.diseaseName} पाया गया है। फसल स्वास्थ्य स्कोर ${cropHealthScore} है और जोखिम स्तर ${riskLevelText} है। एआई विश्वसनीयता ${diagnosis.confidence} प्रतिशत है। अनुशंसित सलाह: ट्राइकोडर्मा या नीम तेल का 5 मिली प्रति लीटर पानी में छिड़काव करें।`;

  return (
    <div id="ai-diagnosis-result-view" className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200 pb-16">
      
      {/* 1. TOP HEADER & RESCAN BUTTON */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl border border-emerald-800/60 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <KrishiRakshakLogo
            size="sm"
            theme="dark"
            showTagline={false}
          />
          <div className="h-7 w-px bg-emerald-700/60" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base sm:text-lg">स्कैन परिणाम (Crop Health Analysis)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Case #{diagnosis.caseId}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80">“Aapka AI Krishi Saathi” • मल्टीमॉडल एआई विश्लेषण + सत्यापन</p>
          </div>
        </div>

        <button
          onClick={onRescan}
          type="button"
          className="text-xs font-bold text-emerald-100 hover:text-white px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-emerald-300" />
          <span>दूसरी पत्ती स्कैन करें</span>
        </button>
      </div>

      {/* 2. LOW CONFIDENCE EXPERT WARNING (If AI confidence < 75%) */}
      {isConfidenceLow && (
        <div className="p-5 bg-amber-500/10 border-2 border-amber-400 rounded-3xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-extrabold text-base text-amber-950">
                  AI Confidence Low (एआई विश्वसनीयता सामान्य से कम)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                  {diagnosis.confidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 font-medium">
                Expert verification recommended. (कृषि वैज्ञानिक से सत्यापन की सलाह दी जाती है।) गलत दवा के छिड़काव से बचने के लिए विशेषज्ञ जांच कराएं।
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isEscalated}
            onClick={handleRequestManualExpertReview}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              isEscalated
                ? 'bg-emerald-700 text-white cursor-default'
                : 'bg-slate-950 hover:bg-slate-900 text-amber-300'
            }`}
          >
            {isEscalated ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>विशेषज्ञ को भेज दिया गया</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>कृषि वैज्ञानिक को भेजें (1-Tap Send)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 3. MAIN DIAGNOSIS & MULTIMODAL OVERVIEW CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left: Scanned Image with Visual AI Segmentation */}
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group">
            <img
              src={diagnosis.sampleImageUrl}
              alt="Scanned Crop"
              className="w-full aspect-square object-cover"
            />
            
            {/* Visual Bounding Box Lesion */}
            <div className="absolute inset-0 m-6 border-2 border-dashed border-amber-400/90 rounded-2xl bg-amber-400/10 flex items-center justify-center p-2 text-center">
              <span className="bg-slate-950/85 text-amber-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs border border-amber-400/40">
                Segmented Lesion: {diagnosis.severityPercent}% Foliar Area
              </span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-slate-300 font-mono text-center flex items-center justify-between">
              <span>फसल: सोयाबीन (JS 9560)</span>
              <span className="text-amber-300 font-bold">{diagnosis.pathogenType}</span>
            </div>
          </div>

          {/* Right: Disease Info, Score, and Confidence */}
          <div className="md:col-span-7 space-y-4">
            
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  पहचाना गया रोग / कीट (Detected Disease)
                </span>
                <RiskBadge level={diagnosis.riskScore.riskLevel} size="sm" />
              </div>
              
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
                {diagnosis.diseaseName}
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                {diagnosis.symptomPattern}
              </p>
            </div>

            {/* Metrics: Crop Health Score & AI Confidence */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              
              {/* Crop Health Score Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>फसल स्वास्थ्य स्कोर</span>
                  </span>
                  <span className="font-mono font-extrabold text-sm text-slate-900">{cropHealthScore}/100</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${
                      cropHealthScore >= 70 ? 'bg-emerald-600' : cropHealthScore >= 40 ? 'bg-amber-500' : 'bg-rose-600'
                    }`}
                    style={{ width: `${cropHealthScore}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 block mt-1.5">
                  {cropHealthScore >= 70 ? '🟢 Healthy / नियंत्रण में' : cropHealthScore >= 40 ? '🟡 Needs Attention' : '🔴 High Risk'}
                </span>
              </div>

              {/* Confidence Meter */}
              <div className={`p-4 rounded-2xl border ${
                diagnosis.confidence >= 75
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">AI Confidence</span>
                  <span className="font-mono font-extrabold text-sm">{diagnosis.confidence}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${
                      diagnosis.confidence >= 75 ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${diagnosis.confidence}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium block mt-1.5">
                  {diagnosis.confidence >= 75 ? 'सुरक्षा मानक के अनुरूप' : 'पुष्टि आवश्यक'}
                </span>
              </div>

            </div>

            {/* Voice Narration Player for Low Literacy Farmers */}
            <div className="pt-2">
              <VoicePlayer
                defaultText={voiceSummary}
                label="पूरी रिपोर्ट आवाज में सुनें"
                compact={false}
              />
            </div>

          </div>

        </div>

        {/* 4. “WHY THIS RISK?” EXPLAINABLE AI ENGINE BREAKDOWN */}
        <div className="p-5 sm:p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              <span>Why is my crop at risk? (यह जोखिम क्यों बढ़ा?)</span>
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
              Multimodal Risk Engine
            </span>
          </div>

          <p className="text-xs text-slate-600">
            हमारा एआई केवल फोटो देखकर निर्णय नहीं लेता, बल्कि फसल अवस्था, मौसम की नमी, पिछले इतिहास और आसपास के मामलों को मिलाकर वास्तविक जोखिम की गणना करता है:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 text-xs">
            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-sky-600" />
                <span>मौसम प्रभाव (Weather Impact)</span>
              </span>
              <span className="font-bold text-slate-900">हवा में नमी {diagnosis.evidenceFactors[0]?.value || '78%'} & तापमान 28°C</span>
              <span className="text-[10px] text-amber-700">अनुकूल फंगल फैलाव वातावरण</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>फसल वृद्धि अवस्था (Stage)</span>
              </span>
              <span className="font-bold text-slate-900">फली बनना (Pod Development)</span>
              <span className="text-[10px] text-slate-600">अति संवेदनशील अवस्था</span>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>निकटतम क्षेत्र मामले (Hotspots)</span>
              </span>
              <span className="font-bold text-slate-900">सांवेर ब्लॉक में 14 रिपोर्ट</span>
              <span className="text-[10px] text-rose-700 font-semibold">क्षेत्रीय जोखिम मध्यम</span>
            </div>
          </div>
        </div>

        {/* 5. SAFE IPM GUIDANCE & ACTION PLAN */}
        <div className="p-5 sm:p-6 bg-emerald-50/70 rounded-3xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-base text-emerald-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Recommended Action & Safe IPM Guidance (सुरक्षित फसल सुरक्षा सलाह)</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              Safe & Non-Toxic First
            </span>
          </div>

          <div className="space-y-2 text-xs text-emerald-950 font-medium">
            <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">जैविक नियंत्रण (Biological):</strong>
                <span>ट्राइकोडर्मा विरिडी (Trichoderma viride) 5 ग्राम प्रति लीटर पानी या नीम तेल (10,000 PPM) 3 मिली प्रति लीटर का छिड़काव करें।</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">खेत प्रबंधन (Cultural/Mechanical):</strong>
                <span>संक्रमित पत्तियों को तोड़कर खेत से दूर दबाएं। अधिक यूरिया का प्रयोग रोकें व जल निकासी सुधारें।</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">रासायनिक विकल्प (यदि प्रकोप 15% से अधिक हो):</strong>
                <span>हेक्साकोनाजोल 5% EC (2 मिली/लीटर) या टेबुकोनाजोल 25.9% EC का अनुशंसित मात्रा में छिड़काव करें।</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. PRIMARY ACTION BUTTONS: ASK VAANI, CONTACT EXPERT, MONITOR AGAIN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Button 1: Ask VAANI */}
          <button
            type="button"
            onClick={onOpenVaani}
            className="p-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Mic className="w-5 h-5 text-slate-950" />
            <span>वाणी से सवाल पूछें</span>
          </button>

          {/* Button 2: Contact Expert */}
          <button
            type="button"
            disabled={isEscalated}
            onClick={handleRequestManualExpertReview}
            className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>{isEscalated ? 'विशेषज्ञ को भेजा गया' : 'कृषि विशेषज्ञ से पूछें'}</span>
          </button>

          {/* Button 3: Monitor Again */}
          <button
            type="button"
            onClick={() => onNavigate('follow-up')}
            className="p-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 text-emerald-200" />
            <span>पुनः निगरानी शेड्यूल करें</span>
          </button>

        </div>

      </div>

      {/* Safety Notice Footer */}
      <div className="text-center text-xs text-slate-500 py-2">
        <p>⚠️ कृषिरक्षक एआई सहायता केवल मार्गदर्शन के लिए है। किसी भी रासायनिक प्रयोग से पहले स्थानीय कृषि मित्र या उत्पाद लेबल का पालन करें।</p>
      </div>

    </div>
  );
};

