import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Languages,
  Gauge,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  Sprout,
  FlaskConical,
  Headphones
} from 'lucide-react';
import { AdvisoryPlan } from '../../types';

interface VoicePlayerProps {
  textToSpeak?: string;
  text?: string;
  language?: string;
  title?: string;
  diseaseName?: string;
  advisoryPlan?: AdvisoryPlan;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  textToSpeak,
  text,
  language = 'Hindi',
  title = 'Voice Advisory Narration (Text-to-Speech)',
  diseaseName = 'Crop Health Advisory',
  advisoryPlan
}) => {
  const defaultText = text || textToSpeak || 'नमस्ते किसान भाई, आपके खेत के लिए सुरक्षित एकीकृत कीट व रोग प्रबंधन परामर्श तैयार है।';
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [readoutMode, setReadoutMode] = useState<'summary' | 'cultural' | 'biological' | 'chemical' | 'full'>('summary');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.9); // Slightly slower for clear farmer understanding
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<any>(null);

  // Multilingual script generators for different advisory parts
  const generateNarrativeText = (lang: string, mode: typeof readoutMode): string => {
    const isHindi = lang.toLowerCase().includes('hindi') || lang.toLowerCase().includes('hi');
    const isMarathi = lang.toLowerCase().includes('marathi') || lang.toLowerCase().includes('mr');
    const isTelugu = lang.toLowerCase().includes('telugu') || lang.toLowerCase().includes('te');

    if (isHindi) {
      if (mode === 'cultural') {
        const cult = advisoryPlan?.culturalPractices?.join('. ') || 'संक्रमित पत्तियों को तोड़कर नष्ट करें और जलभराव रोकें।';
        return `सांस्कृतिक प्रबंधन: सबसे पहले बिना किसी रासायनिक खर्च के यह कार्य करें। ${cult}`;
      }
      if (mode === 'biological') {
        const bio = advisoryPlan?.biologicalPractices?.join('. ') || 'स्यूडोमोनास फ्लोरोसेंस का 5 ग्राम प्रति लीटर पानी में छिड़काव करें।';
        return `जैविक नियंत्रण: पर्यावरण और मित्र कीटों की सुरक्षा के लिए जैविक उपचार करें। ${bio}`;
      }
      if (mode === 'chemical') {
        const chem = advisoryPlan?.chemicalGuidance;
        if (chem) {
          return `रासायनिक सुरक्षा परामर्श: केंद्रीय कीटनाशक बोर्ड द्वारा अनुमोदित। अनुशंसित दवा: ${chem.activeIngredient}। मात्रा: ${chem.dosagePerAcre}। छिड़काव के बाद ${chem.waitingPeriodDays} दिनों का प्रतीक्षा समय अनिवार्य है। दस्ताने और मास्क अवश्य पहनें।`;
        }
        return `रासायनिक दवा का उपयोग केवल आवश्यकता पड़ने पर ही सीआईबीआरसी दिशानिर्देशों के अनुसार करें।`;
      }
      if (mode === 'full') {
        return `कृषि रक्षक सम्पूर्ण सलाहकार। फसल: ${diseaseName}। सांस्कृतिक चरण: ${advisoryPlan?.culturalPractices?.[0] || 'संक्रमित पत्तियां हटाएं'}। जैविक चरण: ${advisoryPlan?.biologicalPractices?.[0] || 'जैविक कवकनाशी स्प्रे करें'}। रासायनिक सुरक्षा: केवल अनुशंसित मात्रा का ही छिड़काव करें।`;
      }
      // default summary
      return defaultText || `नमस्ते किसान भाई, आपके खेत में ${diseaseName} की पहचान हुई है। रोग को रोकने के लिए सबसे पहले सांस्कृतिक उपाय अपनाएं और शाम के समय जैविक स्प्रे करें।`;
    }

    if (isMarathi) {
      if (mode === 'cultural') {
        return `सांस्कृतिक व्यवस्थापन: सर्वप्रथम संक्रमित पाने काढून सुरक्षित नष्ट करा आणि शेतात पाण्याचा निचरा योग्य ठेवा.`;
      }
      if (mode === 'biological') {
        return `जैविक नियंत्रण: संध्याकाळच्या वेळी स्यूडोमोनास किंवा ट्रायकोडर्माची जैविक फवारणी करा.`;
      }
      if (mode === 'chemical') {
        return `रासायनिक फवारणी: फक्त शिफारस केलेल्या प्रमाणातच कीटकनाशक वापरा. फवारणी करताना मास्क व हातमोजे वापरा.`;
      }
      return `नमस्कार शेतकरी बंधूंनो, तुमच्या पिकासाठी सुरक्षित सल्ला तयार आहे. सुरुवातीला जैविक व सांस्कृतिक पद्धतींचा अवलंब करा.`;
    }

    if (isTelugu) {
      return `నమస్కారం రైతు సోదరులారా. మీ పంట రక్షణ కోసం సిఫార్సు చేసిన ఐపీఎం సలహా సిద్ధంగా ఉంది. మొదట సేంద్రీయ మరియు యాజమాన్య పద్ధతులను పాటించండి.`;
    }

    // Default English
    if (mode === 'cultural') {
      return `Cultural Management (Zero chemical cost): ${advisoryPlan?.culturalPractices?.join('. ') || 'Prune infected foliage and maintain proper field drainage.'}`;
    }
    if (mode === 'biological') {
      return `Biological Control: ${advisoryPlan?.biologicalPractices?.join('. ') || 'Apply biocontrol foliar spray such as Pseudomonas fluorescens during evening hours.'}`;
    }
    if (mode === 'chemical') {
      const chem = advisoryPlan?.chemicalGuidance;
      if (chem) {
        return `Regulated Chemical Guidance (CIBRC Approved): Recommended active ingredient is ${chem.activeIngredient}. Standard dosage is ${chem.dosagePerAcre}. Observe mandatory ${chem.waitingPeriodDays} days waiting period. Wear protective face mask and gloves.`;
      }
      return `Apply regulated chemical fungicides strictly following CIBRC label directions.`;
    }
    if (mode === 'full') {
      return `Full IPM Advisory for ${diseaseName}. Step 1: Cultural sanitation. Step 2: Biocontrol foliar application. Step 3: CIBRC approved formulation with strict waiting period.`;
    }
    return `Audio advisory for ${diseaseName}. Prioritize zero-cost cultural practices and evening biological foliar application. Follow chemical safety guidelines if disease pressure exceeds threshold.`;
  };

  const activeScript = generateNarrativeText(selectedLanguage, readoutMode);

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        setVoicesLoaded(true);
      };
      window.speechSynthesis.onvoiceschanged = updateVoices;
      updateVoices();
    }
    return () => {
      stopAudio();
    };
  }, []);

  const getLanguageCode = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.includes('hindi') || l.includes('hi')) return 'hi-IN';
    if (l.includes('marathi') || l.includes('mr')) return 'mr-IN';
    if (l.includes('telugu') || l.includes('te')) return 'te-IN';
    return 'en-IN';
  };

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setActiveSentenceIndex(0);
  };

  const startSpeaking = (textToPlay?: string) => {
    stopAudio();

    const safeText = String(textToPlay || defaultText || '');
    const estimatedDurationSec = Math.max(8, Math.round(((safeText ? safeText.split(' ').length : 10) / 2.2) / playbackSpeed));
    let elapsedMs = 0;
    const intervalMs = 100;
    const totalMs = estimatedDurationSec * 1000;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(safeText);
        utterance.rate = playbackSpeed;
        utterance.pitch = 1.0;
        utterance.lang = getLanguageCode(selectedLanguage);

        // Try to match available voices
        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find(v => v.lang === utterance.lang || v.lang.startsWith(utterance.lang.slice(0, 2)));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onstart = () => {
          setIsPlaying(true);
          setIsPaused(false);
        };

        utterance.onend = () => {
          stopAudio();
        };

        utterance.onerror = () => {
          // Keep simulated progress going if audio output fails in iframe
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Fallback simulation for sandbox iframes
      }
    }

    setIsPlaying(true);
    setIsPaused(false);

    // Simulated progress tracker for UI feedback
    progressTimerRef.current = setInterval(() => {
      elapsedMs += intervalMs;
      const currentProg = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
      setProgress(currentProg);
      if (currentProg >= 100) {
        stopAudio();
      }
    }, intervalMs);
  };

  const togglePlayPause = () => {
    if (!isPlaying) {
      startSpeaking(activeScript);
    } else if (isPaused) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.resume();
        } catch (e) {}
      }
      setIsPaused(false);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.pause();
        } catch (e) {}
      }
      setIsPaused(true);
    }
  };

  return (
    <div
      id="voice-advisory-tts-card"
      className="p-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl border border-emerald-500/30 shadow-xl space-y-4"
    >
      {/* Top Bar: Title, Accessibility Badge, Language Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            {isPlaying && !isPaused ? (
              <Volume2 className="w-5 h-5 animate-pulse text-slate-950" />
            ) : (
              <Headphones className="w-5 h-5 text-slate-950" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-base text-white">
                {title}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                Farmer Accessibility
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Clear spoken instructions in local dialects with speed control
            </p>
          </div>
        </div>

        {/* Dialect / Language Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700">
          <Languages className="w-3.5 h-3.5 text-emerald-400 ml-1.5" />
          <div className="flex gap-1 text-[11px] font-bold">
            {['Hindi', 'Marathi', 'English', 'Telugu'].map(lang => (
              <button
                key={lang}
                id={`tts-lang-select-${lang.toLowerCase()}`}
                type="button"
                onClick={() => {
                  setSelectedLanguage(lang);
                  if (isPlaying) {
                    stopAudio();
                  }
                }}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  selectedLanguage.toLowerCase() === lang.toLowerCase()
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {lang === 'Hindi' ? 'हिंदी' : lang === 'Marathi' ? 'मराठी' : lang === 'Telugu' ? 'తెలుగు' : 'EN'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory Section Quick Chips (What to Read Aloud) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Readout Section:</span>
        <button
          id="tts-mode-summary"
          type="button"
          onClick={() => { setReadoutMode('summary'); if (isPlaying) stopAudio(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            readoutMode === 'summary'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Summary</span>
        </button>

        <button
          id="tts-mode-cultural"
          type="button"
          onClick={() => { setReadoutMode('cultural'); if (isPlaying) stopAudio(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            readoutMode === 'cultural'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>Tier 1: Cultural Steps</span>
        </button>

        <button
          id="tts-mode-biological"
          type="button"
          onClick={() => { setReadoutMode('biological'); if (isPlaying) stopAudio(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            readoutMode === 'biological'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Tier 2: Bio-Control</span>
        </button>

        <button
          id="tts-mode-chemical"
          type="button"
          onClick={() => { setReadoutMode('chemical'); if (isPlaying) stopAudio(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            readoutMode === 'chemical'
              ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Tier 3: Chemical & Safety</span>
        </button>

        <button
          id="tts-mode-full"
          type="button"
          onClick={() => { setReadoutMode('full'); if (isPlaying) stopAudio(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            readoutMode === 'full'
              ? 'bg-teal-400 text-slate-950 shadow-md font-extrabold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
          }`}
        >
          <span>Full Plan</span>
        </button>
      </div>

      {/* Spoken Script Preview Box */}
      <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans relative overflow-hidden">
        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold mb-1.5">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isPlaying && !isPaused ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            <span>Spoken Script ({selectedLanguage}):</span>
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {isPlaying && !isPaused ? 'Speaking...' : isPaused ? 'Paused' : 'Ready to Read'}
          </span>
        </div>
        <p className="text-slate-100 font-medium">
          "{activeScript}"
        </p>

        {/* Audio Wave Visualizer while active */}
        {isPlaying && !isPaused && (
          <div className="flex items-end gap-1 h-4 mt-2.5">
            {[40, 80, 55, 100, 70, 90, 45, 95, 60, 85, 50, 75, 90, 65].map((height, idx) => (
              <div
                key={idx}
                className="w-1 bg-emerald-400 rounded-full animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDuration: `${0.4 + (idx % 4) * 0.2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls Bar: Big Readout Button, Speed Multiplier, Progress Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        
        {/* Main Speak / Pause Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            id="tts-read-aloud-btn"
            type="button"
            onClick={togglePlayPause}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
              isPlaying && !isPaused
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-400/20'
            }`}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Pause Readout</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Resume Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-slate-950" />
                <span>🔊 Read Advisory Aloud (Text-to-Speech)</span>
              </>
            )}
          </button>

          {/* Reset Button */}
          {(isPlaying || progress > 0) && (
            <button
              id="tts-stop-btn"
              type="button"
              onClick={stopAudio}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors cursor-pointer"
              title="Stop and Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Speed Adjustment for Elderly Farmers */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-2xl border border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold">Speed:</span>
          </div>
          <div className="flex gap-1 text-[10px] font-mono font-bold">
            {[
              { label: '0.8x (Slow)', val: 0.8 },
              { label: '1.0x (Normal)', val: 1.0 },
              { label: '1.2x (Fast)', val: 1.2 }
            ].map(spd => (
              <button
                key={spd.val}
                type="button"
                onClick={() => {
                  setPlaybackSpeed(spd.val);
                  if (isPlaying) {
                    startSpeaking(activeScript);
                  }
                }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  playbackSpeed === spd.val
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-1">
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
