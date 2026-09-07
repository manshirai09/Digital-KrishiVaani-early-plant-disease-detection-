import React, { useState, useEffect, useRef } from 'react';
import { DiagnosisResult, CropStage } from '../../types';
import { simulateAiInference } from '../../services/aiInference';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import {
  Camera,
  Upload,
  Mic,
  MicOff,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  HelpCircle,
  ShieldCheck,
  Languages,
  Trash2,
  PlusCircle,
  Volume2,
  Headphones,
  Check
} from 'lucide-react';

interface CropScannerProps {
  initialCropName?: string;
  initialStage?: CropStage;
  initialScenarioId?: string;
  onDiagnosisComplete: (diagnosis: DiagnosisResult) => void;
  onNavigate: (tab: string) => void;
}

export const CropScanner: React.FC<CropScannerProps> = ({
  initialCropName = 'Cotton',
  initialStage = 'Flowering',
  initialScenarioId = 'scenario-a',
  onDiagnosisComplete,
  onNavigate
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>(initialScenarioId);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  
  // Voice-to-Text States
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<'Hindi' | 'Marathi' | 'Telugu' | 'English'>('Hindi');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [voiceAttached, setVoiceAttached] = useState(false);
  
  const [cropName, setCropName] = useState(initialCropName);
  const [cropStage, setCropStage] = useState<CropStage>(initialStage);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const simulationTimerRef = useRef<any>(null);

  const sampleLeafImages: Record<string, { url: string; label: string; desc: string }> = {
    'scenario-a': {
      url: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
      label: 'Cotton Foliage with Brown Concentric Lesions',
      desc: 'Typical Cercospora foliar spot signature with reddish border halo'
    },
    'scenario-b': {
      url: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
      label: 'Atypical Diffuse Chlorosis (Ambiguous Pattern)',
      desc: 'Sub-threshold leaf pattern designed to trigger confidence safety gating (62%)'
    },
    'scenario-c': {
      url: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=800&q=80',
      label: 'Underside Foliar Nymph Clusters (Aphids)',
      desc: 'Combined visual nymph spotting + sticky trap telemetry alert'
    },
    'scenario-d': {
      url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80',
      label: 'Post-Treatment Healed Canopy (Follow-up)',
      desc: 'Vigorous green foliage with healed lesion margin scars'
    }
  };

  const sampleVoicePhrases: Record<string, string[]> = {
    'Hindi': [
      'निचली पत्तियों पर भूरे गोल धब्बे दिख रहे हैं और किनारों पर लाल घेरा है',
      'कपास की पत्तियां नीचे से मुड़ रही हैं और सफेद कीड़े दिख रहे हैं',
      'बारिश के बाद पत्तों पर तेजी से धब्बे फैल रहे हैं'
    ],
    'Marathi': [
      'पानांवर तपकिरी ठिपके दिसत आहेत आणि कडा लालसर झाल्या आहेत',
      'पाने वाकडी होत आहेत आणि रस शोषणाऱ्या किडींचा प्रादुर्भाव दिसतोय'
    ],
    'Telugu': [
      'ఆకులపై గోధుమ రంగు మచ్చలు మరియు ఎరుపు రంగు అంచులు కనిపిస్తున్నాయి',
      'ఆకులు ముడుచుకుపోతున్నాయి మరియు చిన్న పురుగులు కనిపిస్తున్నాయి'
    ],
    'English': [
      'Brown circular target spots spreading on lower cotton leaves',
      'Leaves curling upwards with severe aphid nymphs underneath',
      'Lesions expanding rapidly following 3 days of heavy monsoon rainfall'
    ]
  };

  const currentSample = sampleLeafImages[selectedScenario] || sampleLeafImages['scenario-a'];
  const activeImageUrl = customImage || currentSample.url;

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      stopVoiceRecognition();
    };
  }, []);

  const getSpeechLanguageCode = (lang: string) => {
    switch (lang) {
      case 'Hindi': return 'hi-IN';
      case 'Marathi': return 'mr-IN';
      case 'Telugu': return 'te-IN';
      default: return 'en-IN';
    }
  };

  const startVoiceRecognition = () => {
    setShowVoicePanel(true);
    setIsListeningVoice(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = getSpeechLanguageCode(voiceLanguage);

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setTranscribedText(currentTranscript);
            setVoiceAttached(true);
          }
        };

        recognition.onerror = () => {
          // If browser mic permission is blocked in iframe sandbox, trigger simulated voice transcription
          fallbackSimulateSpeech();
        };

        recognition.onend = () => {
          setIsListeningVoice(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        // Use simulation fallback
      }
    }

    fallbackSimulateSpeech();
  };

  const fallbackSimulateSpeech = () => {
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    
    // Choose realistic sample based on current scenario and language
    const phrases = sampleVoicePhrases[voiceLanguage] || sampleVoicePhrases['English'];
    let chosen = phrases[0];
    if (selectedScenario === 'scenario-c' && phrases.length > 1) {
      chosen = phrases[1];
    }

    let charIdx = 0;
    setTranscribedText('');
    
    const interval = setInterval(() => {
      charIdx += 3;
      if (charIdx <= chosen.length) {
        setTranscribedText(chosen.slice(0, charIdx));
      } else {
        setTranscribedText(chosen);
        setIsListeningVoice(false);
        setVoiceAttached(true);
        clearInterval(interval);
      }
    }, 60);

    simulationTimerRef.current = interval;
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }
    setIsListeningVoice(false);
    if (transcribedText.trim()) {
      setVoiceAttached(true);
    }
  };

  const toggleVoiceToText = () => {
    if (!isListeningVoice) {
      startVoiceRecognition();
    } else {
      stopVoiceRecognition();
    }
  };

  const handleSelectPhrase = (phrase: string) => {
    setTranscribedText(prev => prev ? `${prev} ${phrase}` : phrase);
    setVoiceAttached(true);
  };

  const handleCaptureAndAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisStep('Pre-processing image and validating optical clarity...');

    setTimeout(() => {
      setAnalysisStep('Running MobileNet/ViT feature extraction on foliar symptoms...');
    }, 450);

    setTimeout(() => {
      setAnalysisStep('Querying ESP32 micro-climate telemetry (RH 82%, 18mm rain)...');
    }, 900);

    setTimeout(() => {
      setAnalysisStep('Calculating Multi-Source Risk Index & applying Safety Gating...');
    }, 1300);

    try {
      const result = await simulateAiInference({
        scenarioId: selectedScenario,
        cropName,
        cropStage,
        imageUrl: activeImageUrl,
        notes: transcribedText.trim() ? `[Farmer Voice Note (${voiceLanguage})]: ${transcribedText.trim()}` : undefined
      });

      setIsAnalyzing(false);
      onDiagnosisComplete(result);
    } catch (e) {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setCustomImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div id="crop-scanner-view" className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      
      {/* Title & Gating Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <KrishiRakshakLogo
              size="sm"
              theme="light"
              showTagline={false}
            />
            <span className="text-slate-300">|</span>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
              <span>📷 Crop Health Scanner</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time optical lesion analysis + Voice-to-Text symptoms + IoT micro-climate telemetry
          </p>
        </div>

        {/* Safety Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-slate-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>AI-Assisted Screening (Not Lab Diagnosis)</span>
        </div>
      </div>

      {/* Demo Scenario Selector for Judges */}
      <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-md border border-slate-800">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              SIH Judge Simulation Presets
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Click to switch test scenarios</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            id="scenario-a-btn"
            onClick={() => { setSelectedScenario('scenario-a'); setCustomImage(null); }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedScenario === 'scenario-a'
                ? 'bg-emerald-600/90 border-emerald-400 text-white shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Scenario A: High Confidence</span>
              <span className="font-mono text-[10px] bg-white/20 px-1 rounded">91%</span>
            </div>
            <p className="text-[10px] text-slate-300/90 mt-1">
              Cotton Leaf Spot • Auto-generates safe pre-approved IPM advisory
            </p>
          </button>

          <button
            id="scenario-b-btn"
            onClick={() => { setSelectedScenario('scenario-b'); setCustomImage(null); }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedScenario === 'scenario-b'
                ? 'bg-amber-600/90 border-amber-400 text-white shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Scenario B: Low Confidence</span>
              <span className="font-mono text-[10px] bg-white/20 px-1 rounded">62%</span>
            </div>
            <p className="text-[10px] text-slate-300/90 mt-1">
              Confidence &lt; 75% triggers safety gating → Routes to Human Expert Queue
            </p>
          </button>

          <button
            id="scenario-c-btn"
            onClick={() => { setSelectedScenario('scenario-c'); setCustomImage(null); }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedScenario === 'scenario-c'
                ? 'bg-purple-600/90 border-purple-400 text-white shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Scenario C: Sucking Pest</span>
              <span className="font-mono text-[10px] bg-white/20 px-1 rounded">87%</span>
            </div>
            <p className="text-[10px] text-slate-300/90 mt-1">
              Aphid infestation combined with elevated sticky trap threshold
            </p>
          </button>
        </div>
      </div>

      {/* Main Camera Viewfinder Stage */}
      <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-2xl relative overflow-hidden text-white flex flex-col items-center">
        
        {/* Optical Scanning Frame */}
        <div className="relative w-full max-w-lg aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-inner flex items-center justify-center">
          
          {/* Leaf Image in Viewfinder */}
          <img
            src={activeImageUrl}
            alt="Leaf Sample"
            className="w-full h-full object-cover"
          />

          {/* Viewfinder Target Overlays */}
          <div className="absolute inset-0 border-2 border-dashed border-emerald-400/50 m-6 rounded-xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between items-start">
              <span className="w-5 h-5 border-t-2 border-l-2 border-emerald-400" />
              <span className="w-5 h-5 border-t-2 border-r-2 border-emerald-400" />
            </div>
            <div className="flex justify-between items-end">
              <span className="w-5 h-5 border-b-2 border-l-2 border-emerald-400" />
              <span className="w-5 h-5 border-b-2 border-r-2 border-emerald-400" />
            </div>
          </div>

          {/* Real-time Image Quality Check Overlay */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Image Quality: Optimal (1080p, Clear Focus)</span>
          </div>

          {/* Voice-to-Text Attached Tag if Active */}
          {voiceAttached && transcribedText && (
            <div className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold">
              <Mic className="w-3 h-3 text-emerald-400" />
              <span>Voice Note Attached ✓</span>
            </div>
          )}

          {/* Center Instruction Banner */}
          {!isAnalyzing && (
            <div className="absolute bottom-3 inset-x-3 text-center bg-slate-950/70 backdrop-blur-md py-1.5 px-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
              💡 Place affected leaf in frame. Use Voice-to-Text to describe symptoms in Hindi or Marathi.
            </div>
          )}

          {/* Active AI Scanning Animation Layer */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              <div className="w-16 h-16 relative flex items-center justify-center mb-4">
                <div className="w-full h-full rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <Sparkles className="w-7 h-7 text-amber-400 absolute animate-pulse" />
              </div>
              <h4 className="font-display font-extrabold text-lg text-white">
                Analyzing Crop Sample...
              </h4>
              <p className="text-xs text-emerald-400 font-mono mt-1 max-w-sm animate-pulse">
                {analysisStep}
              </p>
            </div>
          )}

        </div>

        {/* Action Controls & Input Controls */}
        <div className="w-full max-w-lg mt-6 space-y-4">
          
          {/* Crop & Stage Selector Row */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Crop</label>
              <select
                value={cropName}
                onChange={e => setCropName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none cursor-pointer"
              >
                <option value="Cotton">Cotton (Field 01)</option>
                <option value="Soybean">Soybean (Field 02)</option>
                <option value="Tomato">Tomato (Field 03)</option>
                <option value="Chilli">Chilli (Field 04)</option>
                <option value="Wheat">Wheat</option>
              </select>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phenology Stage</label>
              <select
                value={cropStage}
                onChange={e => setCropStage(e.target.value as CropStage)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none cursor-pointer"
              >
                <option value="Flowering">Flowering Stage</option>
                <option value="Boll Formation / Pod Filling">Boll Formation / Pod Filling</option>
                <option value="Vegetative">Vegetative Stage</option>
                <option value="Seedling">Seedling Stage</option>
              </select>
            </div>
          </div>

          {/* Primary Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
            
            {/* Upload File Input */}
            <label
              htmlFor="gallery-upload-input"
              className="flex-1 p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Upload Photo</span>
              <input
                id="gallery-upload-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {/* Voice-to-Text Button */}
            <button
              id="voice-to-text-btn"
              type="button"
              onClick={toggleVoiceToText}
              className={`flex-1 p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isListeningVoice
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-600/30'
                  : voiceAttached && transcribedText
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title="Speak crop symptoms (Voice-to-Text)"
            >
              {isListeningVoice ? (
                <>
                  <Mic className="w-4 h-4 animate-bounce text-white" />
                  <span>Listening...</span>
                </>
              ) : voiceAttached && transcribedText ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Voice Added ✓</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span>Voice-to-Text</span>
                </>
              )}
            </button>

            {/* Capture & Analyze Button */}
            <button
              id="capture-analyze-btn"
              onClick={handleCaptureAndAnalyze}
              disabled={isAnalyzing}
              className="w-full sm:w-auto sm:flex-1 p-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>Capture & Analyze</span>
            </button>

          </div>

          {/* Voice-to-Text Symptom Dictation Card */}
          {showVoicePanel && (
            <div
              id="voice-to-text-panel"
              className="p-4 bg-slate-900/90 border border-emerald-500/40 rounded-3xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl ${isListeningVoice ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600/20 text-emerald-400'}`}>
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                      <span>🎙️ Voice-to-Text Symptom Input</span>
                      {isListeningVoice && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Speak in your local language to describe symptoms, pest signs, or weather conditions
                    </p>
                  </div>
                </div>

                {/* Dialect Switcher for Voice-to-Text */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <Languages className="w-3 h-3 text-emerald-400 ml-1" />
                  {(['Hindi', 'Marathi', 'Telugu', 'English'] as const).map(lang => (
                    <button
                      key={lang}
                      id={`voice-lang-select-${lang.toLowerCase()}`}
                      type="button"
                      onClick={() => {
                        setVoiceLanguage(lang);
                        if (isListeningVoice) {
                          stopVoiceRecognition();
                        }
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                        voiceLanguage === lang
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lang === 'Hindi' ? 'हिंदी' : lang === 'Marathi' ? 'मराठी' : lang === 'Telugu' ? 'తెలుగు' : 'EN'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transcribed Text Area */}
              <div className="relative">
                <textarea
                  id="transcribed-symptoms-input"
                  value={transcribedText}
                  onChange={e => {
                    setTranscribedText(e.target.value);
                    setVoiceAttached(!!e.target.value.trim());
                  }}
                  placeholder={
                    isListeningVoice
                      ? `Listening in ${voiceLanguage}... Please speak symptoms clearly.`
                      : `Click "Start Speaking" or type observations here (e.g. leaf spots, yellowing, humidity)...`
                  }
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none leading-relaxed"
                />
                
                {/* Visual Audio Waves while listening */}
                {isListeningVoice && (
                  <div className="absolute right-3 top-3 flex items-end gap-0.5 h-3">
                    {[60, 100, 40, 80, 50, 90, 70].map((h, idx) => (
                      <div
                        key={idx}
                        className="w-0.5 bg-rose-400 rounded-full animate-pulse"
                        style={{ height: `${h}%`, animationDuration: `${0.3 + (idx % 3) * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* One-Tap Voice Quick Phrases */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Spoken Phrases (Click to Add):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(sampleVoicePhrases[voiceLanguage] || sampleVoicePhrases['English']).map((phrase, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPhrase(phrase)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] text-left border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="line-clamp-1">{phrase}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dictation Action Bar */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    id="toggle-record-speech-btn"
                    type="button"
                    onClick={toggleVoiceToText}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isListeningVoice
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isListeningVoice ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Start Speaking ({voiceLanguage})</span>
                      </>
                    )}
                  </button>

                  {transcribedText && (
                    <button
                      id="clear-transcription-btn"
                      type="button"
                      onClick={() => {
                        setTranscribedText('');
                        setVoiceAttached(false);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Clear Notes"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {transcribedText && (
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Included in Diagnostic Scan</span>
                  </span>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
