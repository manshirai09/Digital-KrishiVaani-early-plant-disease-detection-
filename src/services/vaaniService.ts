import {
  SupportedLanguageCode,
  VaaniAssistantState,
  VaaniIntentType,
  VaaniMessage,
  GuidedScanStep
} from '../types';
import { I18nService } from './i18nService';
import { StorageService } from './storageService';

// Browser SpeechRecognition interface
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export interface VaaniResponseResult {
  message: VaaniMessage;
  actionType?: 'NAVIGATE' | 'TRIGGER_SCAN' | 'OPEN_MODAL' | 'REPLAY_AUDIO' | 'CONTACT_EXPERT' | 'NONE';
  actionPayload?: any;
  spokenText: string;
}

class VaaniServiceClass {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private messageHistory: VaaniMessage[] = [];
  private listeners = new Set<(state: VaaniAssistantState, data?: any) => void>();
  private currentState: VaaniAssistantState = 'idle';

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        try {
          this.recognition = new SpeechRecognitionConstructor();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.maxAlternatives = 1;
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
        }
      }
    }
  }

  public getState(): VaaniAssistantState {
    return this.currentState;
  }

  private setState(state: VaaniAssistantState, data?: any) {
    this.currentState = state;
    this.listeners.forEach(cb => cb(state, data));
  }

  public subscribe(callback: (state: VaaniAssistantState, data?: any) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // ----------------------------------------------------
  // SPEECH-TO-TEXT (STT)
  // ----------------------------------------------------
  public startListening(
    onInterimTranscript?: (text: string) => void,
    onError?: (errorMsg: string) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Stop ongoing speech before listening
      this.stopSpeaking();

      if (!this.recognition) {
        this.initSpeechRecognition();
      }

      if (!this.recognition) {
        const msg = 'Speech Recognition is not supported on this browser. You can type your question in the text box below.';
        this.setState('error', msg);
        onError?.(msg);
        return reject(new Error(msg));
      }

      const activeLang = I18nService.getCurrentLanguage();
      const voiceTag = I18nService.getSpeechVoiceTag(activeLang);
      this.recognition.lang = voiceTag;

      this.isListening = true;
      this.setState('listening');

      let finalTranscript = '';

      this.recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim && onInterimTranscript) {
          onInterimTranscript(interim);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        let errDesc = 'Voice recognition error. Please try again or type your question.';
        if (event.error === 'not-allowed') {
          errDesc = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'no-speech') {
          errDesc = 'No speech was detected. Please tap the microphone and speak again.';
        } else if (event.error === 'network') {
          errDesc = 'Network issue with voice server. You can type your query.';
        }
        this.setState('error', errDesc);
        onError?.(errDesc);
        reject(new Error(errDesc));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (finalTranscript.trim()) {
          this.setState('processing');
          resolve(finalTranscript.trim());
        } else {
          this.setState('idle');
          resolve('');
        }
      };

      try {
        this.recognition.start();
      } catch (e: any) {
        this.isListening = false;
        this.setState('idle');
        onError?.(e.message || 'Could not start microphone');
        reject(e);
      }
    });
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
      this.setState('idle');
    }
  }

  // ----------------------------------------------------
  // TEXT-TO-SPEECH (TTS)
  // ----------------------------------------------------
  public speak(
    text: string,
    langCode?: SupportedLanguageCode,
    onFinish?: () => void
  ): boolean {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('SpeechSynthesis not available in this browser');
      return false;
    }

    this.stopSpeaking();

    const targetLang = langCode || I18nService.getCurrentLanguage();
    const voiceTag = I18nService.getSpeechVoiceTag(targetLang);

    // Clean markdown symbols for natural speech
    const cleanText = text
      .replace(/[*_#`[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceTag;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick best available browser voice
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const bestVoice = I18nService.getBestMatchingVoice(voices, targetLang);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
    }

    utterance.onstart = () => {
      this.setState('speaking');
    };

    utterance.onend = () => {
      this.setState('idle');
      onFinish?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.setState('idle');
      onFinish?.();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    if (this.currentState === 'speaking') {
      this.setState('idle');
    }
  }

  // ----------------------------------------------------
  // NATURAL LANGUAGE UNDERSTANDING & INTENT ROUTING
  // ----------------------------------------------------
  public async processUserQuery(
    rawQuery: string,
    langCode?: SupportedLanguageCode
  ): Promise<VaaniResponseResult> {
    const lang = langCode || I18nService.getCurrentLanguage();
    const query = rawQuery.trim().toLowerCase();

    this.setState('processing');
    // Micro-delay for natural feel
    await new Promise(res => setTimeout(res, 450));

    // Intent Classifier with Multilingual Keyword Matrix
    const intent = this.detectIntent(query, lang);
    const result = this.generateResponseForIntent(intent, query, lang);

    const vaaniMsg: VaaniMessage = {
      id: `vaani-${Date.now()}`,
      sender: 'vaani',
      text: result.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: lang,
      intent,
      actionType: result.actionType,
      actionPayload: result.actionPayload,
      confidence: 0.95,
      suggestedFollowups: result.suggestedFollowups
    };

    this.messageHistory.push(vaaniMsg);
    this.setState('idle', vaaniMsg);

    return {
      message: vaaniMsg,
      actionType: result.actionType,
      actionPayload: result.actionPayload,
      spokenText: result.spokenText || result.text
    };
  }

  private detectIntent(query: string, lang: SupportedLanguageCode): VaaniIntentType {
    // 1. Navigation keywords
    if (
      query.includes('scan') ||
      query.includes('camera') ||
      query.includes('फोटो') ||
      query.includes('स्कैन') ||
      query.includes('कॅमेरा') ||
      query.includes('સ્કેન') ||
      query.includes('ਕੈਮਰਾ') ||
      query.includes('கேமரா') ||
      query.includes('కెమెరా') ||
      query.includes('ক্যামেরা') ||
      query.includes('ಕ್ಯಾಮೆರಾ')
    ) {
      if (query.includes('history') || query.includes('पुरानी') || query.includes('जुने') || query.includes('જૂના') || query.includes('ਪੁਰਾਣੇ') || query.includes('முந்தைய') || query.includes('మునుపటి')) {
        return 'NAVIGATE'; // target: scan-history
      }
      if (query.includes('guide') || query.includes('मदद') || query.includes('मार्गदर्शन') || query.includes('मदत') || query.includes('ਸਹਾਇਤਾ') || query.includes('വഴികാട്ടി')) {
        return 'START_GUIDED_SCAN';
      }
      return 'NAVIGATE'; // target: crop-scanner
    }

    // 2. Weather & Climate
    if (
      query.includes('weather') ||
      query.includes('rain') ||
      query.includes('temperature') ||
      query.includes('मौसम') ||
      query.includes('बारिश') ||
      query.includes('हवामान') ||
      query.includes('पाऊस') ||
      query.includes('વરસાદ') ||
      query.includes('ਮੌਸਮ') ||
      query.includes('ਮੀਂਹ') ||
      query.includes('வானிலை') ||
      query.includes('వాతావరణం') ||
      query.includes('আবহাওয়া') ||
      query.includes('ಹವಾಮಾನ')
    ) {
      if (query.includes('7 day') || query.includes('7 दिन') || query.includes('७ दिवस') || query.includes('forecast') || query.includes('पूर्वानुमान') || query.includes('ਅੰਦਾਜ਼ਾ')) {
        return 'EXPLAIN_7DAY_FORECAST';
      }
      return 'EXPLAIN_WEATHER';
    }

    // 3. Crop Health & Risk
    if (
      query.includes('risk') ||
      query.includes('health') ||
      query.includes('jo khim') ||
      query.includes('जोखिम') ||
      query.includes('धोका') ||
      query.includes('જોખમ') ||
      query.includes('ਖ਼ਤਰਾ') ||
      query.includes('ஆபத்து') ||
      query.includes('ప్రమాదం') ||
      query.includes('ঝুঁকি') ||
      query.includes('ಅಪಾಯ')
    ) {
      return 'EXPLAIN_CROP_RISK';
    }

    // 4. Advisory & Treatment
    if (
      query.includes('advisory') ||
      query.includes('medicine') ||
      query.includes('spray') ||
      query.includes('treatment') ||
      query.includes('सलाह') ||
      query.includes('दवा') ||
      query.includes('उपाय') ||
      query.includes('औषध') ||
      query.includes('સલાહ') ||
      query.includes('દવા') ||
      query.includes('ਦਵਾਈ') ||
      query.includes('மருந்து') ||
      query.includes('మందు') ||
      query.includes('ওষুধ') ||
      query.includes('ಔಷಧಿ')
    ) {
      return 'EXPLAIN_IPM_ADVISORY';
    }

    // 5. Pest Traps
    if (
      query.includes('pest') ||
      query.includes('trap') ||
      query.includes('insect') ||
      query.includes('कीट') ||
      query.includes('ट्रैप') ||
      query.includes('कीड') ||
      query.includes('જીવાત') ||
      query.includes('ਕੀੜੇ') ||
      query.includes('பூச்சி') ||
      query.includes('పురుగు') ||
      query.includes('কীটপতঙ্গ') ||
      query.includes('ಕೀಟ')
    ) {
      return 'EXPLAIN_PEST_TRAPS';
    }

    // 6. IoT Sensors
    if (
      query.includes('sensor') ||
      query.includes('iot') ||
      query.includes('node') ||
      query.includes('सेंसर') ||
      query.includes('सेन्सर') ||
      query.includes('સેન્સર') ||
      query.includes('ਸੈਂਸਰ') ||
      query.includes('சென்சார்')
    ) {
      return 'EXPLAIN_IOT_SENSORS';
    }

    // 7. Expert Consultation
    if (
      query.includes('expert') ||
      query.includes('doctor') ||
      query.includes('scientist') ||
      query.includes('वैज्ञानिक') ||
      query.includes('डॉक्टर') ||
      query.includes('शास्त्रज्ञ') ||
      query.includes('તજજ્ઞ') ||
      query.includes('ਵਿਗਿਆਨੀ') ||
      query.includes('விஞ்ஞானி') ||
      query.includes('శాస్త్రవేత్త')
    ) {
      return 'REQUEST_EXPERT_HELP';
    }

    // 8. Notifications
    if (
      query.includes('notification') ||
      query.includes('alert') ||
      query.includes('सूचना') ||
      query.includes('अलर्ट') ||
      query.includes('સૂચના') ||
      query.includes('ਸੂਚਨਾ') ||
      query.includes('அறிவிப்பு') ||
      query.includes('నోటిఫికేషన్')
    ) {
      return 'READ_NOTIFICATIONS';
    }

    // 9. Fields & Crop addition
    if (
      query.includes('field') ||
      query.includes('farm') ||
      query.includes('खेत') ||
      query.includes('शेती') ||
      query.includes('ખેતર') ||
      query.includes('ਜਮੀਨ') ||
      query.includes('பண்ணை') ||
      query.includes('పొలం')
    ) {
      return 'NAVIGATE'; // target: my-fields
    }

    return 'GENERAL_AGRI_QA';
  }

  private generateResponseForIntent(
    intent: VaaniIntentType,
    query: string,
    lang: SupportedLanguageCode
  ): {
    text: string;
    spokenText?: string;
    actionType?: 'NAVIGATE' | 'TRIGGER_SCAN' | 'OPEN_MODAL' | 'REPLAY_AUDIO' | 'CONTACT_EXPERT' | 'NONE';
    actionPayload?: any;
    suggestedFollowups?: string[];
  } {
    const iot = StorageService.getIotData();
    const weather = StorageService.getWeather();
    const traps = StorageService.getPestTraps();
    const cases = StorageService.getCases();
    const primaryTrap = traps[0] || { currentCount: 18, threshold: 12, pestType: 'Cotton Bollworm' };
    const latestCase = cases[0];

    // Multilingual response generation
    switch (intent) {
      case 'NAVIGATE': {
        if (query.includes('history') || query.includes('पुरानी') || query.includes('जुने') || query.includes('જૂના')) {
          return {
            text: this.getLocalizedText({
              en: `Opening your Crop Scan History (${cases.length} records available).`,
              hi: `आपका फसल स्कैन इतिहास खोला जा रहा है (${cases.length} रिकॉर्ड उपलब्ध हैं)।`,
              mr: `तुमचा पीक स्कॅन इतिहास उघडत आहे (${cases.length} नोंदी उपलब्ध).`,
              gu: `તમારો પાક સ્કેન ઇતિહાસ ખોલી રહ્યો છું (${cases.length} રેકોર્ડ ઉપલબ્ધ).`,
              pa: `ਤੁਹਾਡਾ ਫ਼ਸਲ ਸਕੈਨ ਇਤਿਹਾਸ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ (${cases.length} ਰਿਕਾਰਡ ਮੌਜੂਦ ਹਨ)।`,
              ta: `உங்கள் பயிர் ஸ்கேன் வரலாறு திறக்கப்படுகிறது (${cases.length} பதிவுகள் உள்ளன).`,
              te: `మీ పంట స్కాన్ చరిత్ర తెరవబడుతోంది (${cases.length} రికార్డులు అందుబాటులో ఉన్నాయి).`,
              bn: `আপনার ফসলের স্ক্যান ইতিহাস খোলা হচ্ছে (${cases.length}টি রেকর্ড আছে)।`,
              kn: `ನಿಮ್ಮ ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸವನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ (${cases.length} ದಾಖಲೆಗಳು ಲಭ್ಯವಿದೆ).`,
              ml: `നിങ്ങളുടെ വിള സ്കാൻ ചരിത്രം തുറക്കുന്നു (${cases.length} രേഖകൾ ലഭ്യമാണ്).`,
              or: `ଆପଣଙ୍କର ଫସଲ ସ୍କାନ୍ ଇତିହାସ ଖୋଲାଯାଉଛି (${cases.length} ରେକର୍ଡ ଉପଲବ୍ଧ)।`
            }, lang),
            actionType: 'NAVIGATE',
            actionPayload: 'scan-history',
            suggestedFollowups: ['Show current weather', 'Read safe advisory']
          };
        }

        if (query.includes('field') || query.includes('खेत') || query.includes('शेती') || query.includes('ખેતર')) {
          return {
            text: this.getLocalizedText({
              en: 'Navigating to My Fields management screen.',
              hi: 'मेरे खेत स्क्रीन पर ले जाया जा रहा है।',
              mr: 'माझी शेती व्यवस्थापन स्क्रीन उघडत आहे.',
              gu: 'મારા ખેતરો મેનેજમેન્ટ સ્ક્રીન ખોલી રહ્યો છું.',
              pa: 'ਮੇਰੇ ਖੇਤ ਸਕ੍ਰੀਨ ਖੋਲ੍ਹੀ ਜਾ ਰਹੀ ਹੈ।',
              ta: 'எனது பண்ணை மேலாண்மை பக்கத்திற்கு செல்கிறது.',
              te: 'నా పొలాలు నిర్వహణ స్క్రీన్‌కు వెళ్తోంది.',
              bn: 'আমার জমি ব্যবস্থাপনা স্ক্রিনে নিয়ে যাওয়া হচ্ছে।',
              kn: 'ನನ್ನ ಜಮೀನುಗಳ ನಿರ್ವಹಣಾ ಪರದೆಗೆ ಕರೆದೊಯ್ಯಲಾಗುತ್ತಿದೆ.',
              ml: 'എന്റെ കൃഷിയിടം സ്ക്രീനിലേക്ക് പോകുന്നു.',
              or: 'ମୋର କ୍ଷେତ ପରିଚାଳନା ସ୍କ୍ରିନକୁ ଯାଉଛି।'
            }, lang),
            actionType: 'NAVIGATE',
            actionPayload: 'my-fields',
            suggestedFollowups: ['Scan crop now', 'Check risk forecast']
          };
        }

        // Default navigate to scanner
        return {
          text: this.getLocalizedText({
            en: 'Opening AI Crop Scanner. Hold your leaf clearly in the viewfinder.',
            hi: 'AI फसल स्कैनर खोला जा रहा है। पत्ते को कैमरे के बीच में रखें।',
            mr: 'AI पीक स्कॅनर उघडत आहे. पान कॅमेऱ्याच्या मध्यभागी ठेवा.',
            gu: 'AI પાક સ્કેનર ખોલી રહ્યો છું. પાંદડું કેમેરાની વચ્ચે રાખો.',
            pa: 'AI ਫ਼ਸਲ ਸਕੈਨਰ ਖੋਲ੍ਹਿਆ ਜਾ ਰਿਹਾ ਹੈ। ਪੱਤੇ ਨੂੰ ਕੈਮਰੇ ਵਿੱਚ ਸਹੀ ਰੱਖੋ।',
            ta: 'AI பயிர் ஸ்கேனர் திறக்கப்படுகிறது. இலையை கேமராவின் நடுவில் வைக்கவும்.',
            te: 'AI పంట స్కానర్ తెరవబడుతోంది. ఆకును కెమెరా మధ్యలో ఉంచండి.',
            bn: 'AI ফসল স্ক্যানার খোলা হচ্ছে। পাতাটি ক্যামেরার মাঝে রাখুন।',
            kn: 'AI ಬೆಳೆ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ. ಎಲೆಯನ್ನು ಕ್ಯಾಮೆರಾದ ಮಧ್ಯದಲ್ಲಿ ಇರಿಸಿ.',
            ml: 'AI വിള സ്കാനർ തുറക്കുന്നു. ഇല ക്യാമറയ്ക്ക് നേരെ പിടിക്കുക.',
            or: 'AI ଫସଲ ସ୍କାନର ଖୋଲାଯାଉଛି। ପତ୍ରକୁ କ୍ୟାମେରା ମଝିରେ ରଖନ୍ତୁ।'
          }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'crop-scanner',
          suggestedFollowups: ['Start guided scan', 'What is my crop risk?']
        };
      }

      case 'START_GUIDED_SCAN': {
        return {
          text: this.getLocalizedText({
            en: 'Starting Farmer Guided Scan Mode. I will guide you step by step with voice and visuals.',
            hi: 'किसान मार्गदर्शित स्कैन मोड शुरू हो रहा है। मैं आपको बोलकर और चित्र दिखाकर हर कदम समझाऊँगी।',
            mr: 'शेतकरी मार्गदर्शक स्कॅन मोड सुरू होत आहे. मी तुम्हाला प्रत्येक पायरी आवाजात समजावून सांगेन.',
            gu: 'ખેડૂત માર્ગદર્શિત સ્કેન મોડ શરૂ થઈ રહ્યો છે. હું તમને અવાજ અને ચિત્રો સાથે દરેક પગલું સમજાવીશ.',
            pa: 'ਕਿਸਾਨ ਗਾਈਡਡ ਸਕੈਨ ਮੋਡ ਸ਼ੁਰੂ ਹੋ ਰਿਹਾ ਹੈ। ਮੈਂ ਤੁਹਾਨੂੰ ਕਦਮ-ਦਰ-ਕਦਮ ਸਮਝਾਵਾਂਗੀ।',
            ta: 'விவசாயி வழிகாட்டுதல் முறை தொடங்குகிறது. குரல் மற்றும் காட்சிகள் மூலம் உங்களுக்கு வழிகாட்டுகிறேன்.',
            te: 'రైతు మార్గదర్శక స్కాన్ మోడ్ ప్రారంభమవుతోంది. నేను మీకు దశలవారీగా సహాయం చేస్తాను.',
            bn: 'কৃষক নির্দেশিত স্ক্যান মোড শুরু হচ্ছে। আমি আপনাকে ধাপে ধাপে নির্দেশনা দেব।',
            kn: 'ರೈತ ಮಾರ್ಗದರ್ಶಿ ಸ್ಕ್ಯಾನ್ ಮೋಡ್ ಪ್ರಾರಂಭವಾಗುತ್ತಿದೆ. ನಾನು ಹಂತ ಹಂತವಾಗಿ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ.',
            ml: 'കർഷക ഗൈഡഡ് മോഡ് ആരംഭിക്കുന്നു. ഞാൻ നിങ്ങളെ ഓരോ ഘട്ടത്തിലും സഹായിക്കാം.',
            or: 'କୃଷକ ମାର୍ଗଦର୍ଶକ ସ୍କାନ୍ ମୋଡ୍ ଆରମ୍ଭ ହେଉଛି। ମୁଁ ଆପଣଙ୍କୁ ପଦକ୍ଷେପ ବୁଝାଇବି।'
          }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'crop-scanner',
          suggestedFollowups: ['Center the leaf', 'Is lighting good?']
        };
      }

      case 'EXPLAIN_CROP_RISK': {
        return {
          text: this.getLocalizedText({
            en: `Your Cotton field is currently at High Outbreak Risk (78/100). The main factors are high air humidity (${iot.humidity}%), 8+ hours leaf wetness, and ${primaryTrap.currentCount} bollworms in your pheromone trap exceeding the economic threshold of ${primaryTrap.threshold}.`,
            hi: `आपके कपास के खेत में वर्तमान में उच्च रोग जोखिम (78/100) है। मुख्य कारण उच्च आर्द्रता (${iot.humidity}%), पत्ती का लगातार गीलापन, और फेरोमोन ट्रैप में कीट संख्या (${primaryTrap.currentCount}) का आर्थिक सीमा (${primaryTrap.threshold}) से अधिक होना है।`,
            mr: `तुमच्या कापूस शेतात सध्या उच्च धोका (७८/१००) आहे. याचे मुख्य कारण जास्त हवेतील आर्द्रता (${iot.humidity}%), पानांचा ओलावा आणि ट्रॅपमध्ये कीड संख्या (${primaryTrap.currentCount}) मर्यादेपेक्षा जास्त असणे आहे.`,
            gu: `તમારા કપાસના ખેતરમાં હાલમાં ઉચ્ચ જોખમ (૭૮/૧૦૦) છે. મુખ્ય કારણ ભેજ (${iot.humidity}%), પર્ણ ભીનાશ અને ફેરોમોન ટ્રેપમાં જીવાતોની સંખ્યા (${primaryTrap.currentCount}) મર્યાદા કરતા વધુ હોવું છે.`,
            pa: `ਤੁਹਾਡੇ ਨਰਮੇ ਦੇ ਖੇਤ ਵਿੱਚ ਇਸ ਵੇਲੇ ਉੱਚ ਖ਼ਤਰਾ (੭੮/੧੦੦) ਹੈ। ਮੁੱਖ ਕਾਰਨ ਹਵਾ ਵਿੱਚ ਨਮੀ (${iot.humidity}%) ਅਤੇ ਟਰੈਪ ਵਿੱਚ ਕੀੜਿਆਂ ਦੀ ਗਿਣਤੀ (${primaryTrap.currentCount}) ਵੱਧ ਹੋਣਾ ਹੈ।`,
            ta: `உங்கள் பருத்தி பண்ணையில் தற்போது அதிக நோய் ஆபத்து (78/100) உள்ளது. அதிக ஈரப்பதம் (${iot.humidity}%) மற்றும் பொறியில் பூச்சிகள் எண்ணிக்கை (${primaryTrap.currentCount}) வரம்பை விட அதிகமாக இருப்பதே முக்கிய காரணம்.`,
            te: `మీ ప్రత్తి పొలంలో ప్రస్తుతం అధిక వ్యాధి ప్రమాదం (78/100) ఉంది. గాలిలో అధిక తేమ (${iot.humidity}%) మరియు ట్రాప్‌లో పురుగుల సంఖ్య (${primaryTrap.currentCount}) పరిమితి దాటడమే ప్రధాన కారణం.`,
            bn: `আপনার তুলো জমিতে বর্তমানে উচ্চ রোগ ঝুঁকি (৭৮/১০০) রয়েছে। বাতাসের অতিরিক্ত আর্দ্রতা (${iot.humidity}%) এবং ট্র্যাপে কীটের সংখ্যা (${primaryTrap.currentCount}) বেশি হওয়াই মূল কারণ।`,
            kn: `ನಿಮ್ಮ ಹತ್ತಿ ಜಮೀನಿನಲ್ಲಿ ಪ್ರಸ್ತುತ ಹೆಚ್ಚಿನ ರೋಗದ ಅಪಾಯವಿದೆ (78/100). ಗಾಳಿಯ ತೇವಾಂಶ (${iot.humidity}%) ಮತ್ತು ಬಲೆಯಲ್ಲಿ ಕೀಟಗಳ ಸಂಖ್ಯೆ (${primaryTrap.currentCount}) ಹೆಚ್ಚಿರುವುದೇ ಇದಕ್ಕೆ ಕಾರಣ.`,
            ml: `നിങ്ങളുടെ പരുത്തി കൃഷിയിടത്തിൽ ഇപ്പോൾ ഉയർന്ന രോഗസാധ്യതയുണ്ട് (78/100). ഉയർന്ന അന്തരീക്ഷ ഈർപ്പവും (${iot.humidity}%) കെണിയിലെ കീടങ്ങളുടെ എണ്ണവുമാണ് (${primaryTrap.currentCount}) കാരണം.`,
            or: `ଆପଣଙ୍କ କପା କ୍ଷେତରେ ବର୍ତ୍ତମାନ ଉଚ୍ଚ ବିପଦ (୭୮/୧୦୦) ରହିଛି। ବାୟୁର ଆର୍ଦ୍ରତା (${iot.humidity}%) ଏବଂ ଟ୍ରାପରେ କୀଟ ସଂଖ୍ୟା (${primaryTrap.currentCount}) ଅଧିକ ରହିଛି।`
          }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'crop-health',
          suggestedFollowups: ['Show 7-day risk forecast', 'Read IPM disease advisory']
        };
      }

      case 'EXPLAIN_WEATHER': {
        return {
          text: this.getLocalizedText({
            en: `Current field microclimate at Sanwer: Temperature is ${weather.temp}°C, relative humidity is ${weather.humidity}%, with ${weather.rainfallLast24h} mm rainfall recorded in the last 24 hours. The condition is ${weather.condition}.`,
            hi: `सांवेर खेत का वर्तमान मौसम: तापमान ${weather.temp}°C है, आर्द्रता ${weather.humidity}% है, और पिछले 24 घंटों में ${weather.rainfallLast24h} मिमी वर्षा दर्ज की गई है। मौसम ${weather.condition} बना हुआ है।`,
            mr: `सांवेर शेतातील सध्याचे हवामान: तापमान ${weather.temp}°C, हवेतील आर्द्रता ${weather.humidity}% आणि मागील २४ तासांत ${weather.rainfallLast24h} मिमी पाऊस झाला आहे.`,
            gu: `સાંવેર ખેતરનું વર્તમાન હવામાન: તાપમાન ${weather.temp}°C છે, ભેજ ${weather.humidity}% છે, અને છેલ્લા ૨૪ કલાકમાં ${weather.rainfallLast24h} મીમી વરસાદ નોંધાયો છે.`,
            pa: `ਖੇਤ ਦਾ ਮੌਸਮ: ਤਾਪਮਾਨ ${weather.temp}°C, ਨਮੀ ${weather.humidity}% ਅਤੇ ਪਿਛਲੇ ੨੪ ਘੰਟਿਆਂ ਵਿੱਚ ${weather.rainfallLast24h} ਮਿਲੀਮੀਟਰ ਮੀਂਹ ਪਿਆ ਹੈ।`,
            ta: `தற்போதைய பண்ணை வானிலை: வெப்பநிலை ${weather.temp}°C, ஈரப்பதம் ${weather.humidity}%, கடந்த 24 மணி நேரத்தில் ${weather.rainfallLast24h} மிமீ மழை பதிவாகியுள்ளது.`,
            te: `ప్రస్తుత పొలం వాతావరణం: ఉష్ణోగ్రత ${weather.temp}°C, తేమ ${weather.humidity}%, గత 24 గంటల్లో ${weather.rainfallLast24h} మిమీ వర్షం కురిసింది.`,
            bn: `বর্তমান আবহাওয়া: তাপমাত্রা ${weather.temp}°C, আর্দ্রতা ${weather.humidity}%, গত ২৪ ঘণ্টায় ${weather.rainfallLast24h} মিমি বৃষ্টিপাত হয়েছে।`,
            kn: `ಪ್ರಸ್ತುತ ಹವಾಮಾನ: ತಾಪಮಾನ ${weather.temp}°C, ತೇವಾಂಶ ${weather.humidity}%, ಕಳೆದ 24 ಗಂಟೆಗಳಲ್ಲಿ ${weather.rainfallLast24h} ಮಿಮೀ ಮಳೆಯಾಗಿದೆ.`,
            ml: `നിലവിലെ കാലാവസ്ഥ: താപനില ${weather.temp}°C, അന്തരീക്ഷ ഈർപ്പം ${weather.humidity}%, കഴിഞ്ഞ 24 മണിക്കൂറിൽ ${weather.rainfallLast24h} മിമി മഴ ലഭിച്ചു.`,
            or: `ବର୍ତ୍ତମାନର ପାଣିପାଗ: ତାପମାତ୍ରା ${weather.temp}°C, ଆର୍ଦ୍ରତା ${weather.humidity}%, ଗତ ୨୪ ଘଣ୍ଟାରେ ${weather.rainfallLast24h} ମିମି ବର୍ଷା ହୋଇଛି।`
          }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'weather',
          suggestedFollowups: ['Show 7-day risk forecast', 'What is crop risk?']
        };
      }

      case 'EXPLAIN_7DAY_FORECAST': {
        return {
          text: this.getLocalizedText({
            en: 'Over the next 7 days, persistent cloud cover and intermittent rain will maintain favorable conditions for fungal spore germination. Peak risk is predicted on Day +2 and Day +3 (risk score 85-89). Consider preventive bio-fungicide spray before rain.',
            hi: 'अगले 7 दिनों में लगातार बादल और रुक-रुक कर बारिश फंगल बीजाणुओं के अंकुरण के लिए अनुकूल रहेगी। दूसरे और तीसरे दिन सबसे अधिक जोखिम (85-89) रहेगा। बारिश से पहले जैविक फफूंदनाशी का छिड़काव करें।',
            mr: 'पुढील ७ दिवसांत ढगाळ हवामान आणि पावसामुळे बुरशीजन्य रोगाचा धोका वाढेल. दिवस +२ आणि +३ वर सर्वाधिक धोका (८५-८९) असेल. पावसापूर्वी प्रतिबंधात्मक फवारणी करा.',
            gu: 'આગામી ૭ દિવસમાં વાદળછાયું વાતાવરણ અને વરસાદને કારણે ફૂગજન્ય રોગનો ફેલાવો વધવાની શક્યતા છે. બીજા અને ત્રીજા દિવસે સૌથી વધુ જોખમ રહેશે.',
            pa: 'ਅਗਲੇ ੭ ਦਿਨਾਂ ਵਿੱਚ ਮੀਂਹ ਕਾਰਨ ਉੱਲੀ ਰੋਗ ਦਾ ਖ਼ਤਰਾ ਵਧੇਗਾ। ਦੂਜੇ ਅਤੇ ਤੀਜੇ ਦਿਨ ਸਭ ਤੋਂ ਵੱਧ ਖ਼ਤਰਾ ਰਹੇਗਾ।',
            ta: 'அடுத்த 7 நாட்களில் மேகமூட்டம் மற்றும் மழையால் பூஞ்சை தொற்று அதிகரிக்கும் வாய்ப்புள்ளது. 2 மற்றும் 3 ஆம் நாட்களில் அதிக ஆபத்து இருக்கும்.',
            te: 'రాబోయే 7 రోజుల్లో వర్షం కారణంగా శిలీంధ్ర వ్యాప్తి ప్రమాదం ఉంది. 2వ மற்றும் 3వ రోజుల్లో అత్యధిక ప్రమాదం ఉంటుంది.',
            bn: 'আগামী ৭ দিনে মেঘলা আকাশ এবং বৃষ্টির কারণে ছত্রাক সংক্রমণের ঝুঁকি বেশি থাকবে। ২য় এবং ৩য় দিনে সর্বোচ্চ ঝুঁকি থাকবে।',
            kn: 'ಮುಂದಿನ 7 ದಿನಗಳಲ್ಲಿ ಮೋಡ ಕವಿದ ವಾತಾವರಣ ಮತ್ತು ಮಳೆಯಿಂದಾಗಿ ಶಿಲೀಂಧ್ರ ರೋಗ ಹರಡುವ ಅಪಾಯ ಹೆಚ್ಚಿರುತ್ತದೆ.',
            ml: 'അടുത്ത 7 ദിവസങ്ങളിൽ മേഘാവൃതമായ അന്തരീക്ഷവും മഴയും മൂലം കുമിൾ രോഗസാധ്യത കൂടുതലായിരിക്കും.',
            or: 'ଆଗାମୀ ୭ ଦିନରେ ବର୍ଷା ଯୋଗୁଁ କବକ ରୋଗ ବ୍ୟାପିବାର ସମ୍ଭାବନା ଅଧିକ ରହିଛି।'
          }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'risk-forecast',
          suggestedFollowups: ['Open IPM Advisory', 'Scan crop with AI']
        };
      }

      case 'EXPLAIN_IPM_ADVISORY': {
        return {
          text: this.getLocalizedText({
            en: 'Recommended Safe Advisory: 1) Cultural: Drain standing water and clear inter-row weeds. 2) Biological: Spray Trichoderma viride @ 5g/L water in early morning. 3) Chemical (if disease >5%): Copper Oxychloride 50% WP @ 2.5g/L with PPE protection and a 14-day pre-harvest waiting interval.',
            hi: 'अनुशंसित सुरक्षित सलाह: 1) कृषि कार्य: खेत से पानी की निकासी करें और खरपतवार हटाएं। 2) जैविक नियंत्रण: ट्राइकोडर्मा विरिडी 5 ग्राम प्रति लीटर पानी में सुबह छिड़कें। 3) रासायनिक उपाय: कॉपर ऑक्सीक्लोराइड 50% WP 2.5 ग्राम प्रति लीटर, मास्क पहनकर छिड़कें और 14 दिन की प्रतीक्षा अवधि रखें।',
            mr: 'शिफारस केलेला सुरक्षित सल्ला: १) शेतातील साचलेले पाणी काढून टाका. २) ट्रायकोडर्मा ५ ग्रॅम प्रति लिटर सकाळी फवारा. ३) कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम प्रति लिटर, संरक्षणात्मक मास्क वापरून फवारा.',
            gu: 'સલામત IPM સલાહ: ૧) ખેતરમાંથી વધારાનું પાણી કાઢી નાખો. ૨) ટ્રાઇકોડર્મા ૫ ગ્રામ/લિટર સવારે છંટકાવ કરો. ૩) કોપર ઓક્સિક્લોરાઇડ ૨.૫ ગ્રામ/લિટર માસ્ક પહેરીને છાંટો.',
            pa: 'ਸੁਰੱਖਿਅਤ ਸਲਾਹ: ੧) ਖੇਤ ਵਿੱਚੋਂ ਖੜ੍ਹਾ ਪਾਣੀ ਕੱਢੋ। ੨) ਟ੍ਰਾਈਕੋਡਰਮਾ ੫ ਗ੍ਰਾਮ ਪ੍ਰਤੀ ਲੀਟਰ ਸਵੇਰੇ ਛਿੜਕੋ। ੩) ਕਾਪਰ ਆਕਸੀਕਲੋਰਾਈਡ ਦਵਾਈ ਮਾਸਕ ਪਾ ਕੇ ਛਿੜਕੋ।',
            ta: 'பரிந்துரைக்கப்பட்ட ஆலோசனை: 1) வயலில் தேங்கிய தண்ணீரை வெளியேற்றவும். 2) டிரைக்கோடெர்மா 5 கிராம்/லிட்டர் காலையில் தெளிக்கவும். 3) காப்பர் ஆக்ஸிகுளோரைடு 2.5 கிராம்/லிட்டர் முகக்கவசம் அணிந்து தெளிக்கவும்.',
            te: 'సురక్షిత సలహా: 1) పొలంలో నిలిచిన నీటిని తొలగించండి. 2) ట్రైకోడెర్మా 5 గ్రా/లీటర్ ఉదయం పిచికారీ చేయండి. 3) కాపర్ ఆక్సిక్లోరైడ్ 2.5 గ్రా/లీటర్ మాస్క్ ధరించి పిచికారీ చేయండి.',
            bn: 'নিরাপদ পরামর্শ: ১) জমির অতিরিক্ত জল নিষ্কাশন করুন। ২) ট্রাইকোডার্মা ৫ গ্রাম/লিটার সকালে স্প্রে করুন। ৩) কপার অক্সিক্লোরাইড ২.৫ গ্রাম/লিটার মাস্ক পরে স্প্রে করুন।',
            kn: 'ಸುರಕ್ಷಿತ ಸಲಹೆ: 1) ಜಮೀನಿನಿಂದ ನೀರನ್ನು ಹೊರಹಾಕಿ. 2) ಟ್ರೈಕೋಡರ್ಮಾವನ್ನು ಬೆಳಗ್ಗೆ ಸಿಂಪಡಿಸಿ. 3) ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ ಅನ್ನು ಮಾಸ್ಕ್ ಧರಿಸಿ ಸಿಂಪಡಿಸಿ.',
            ml: 'സുരക്ഷിത നിർദ്ദേശം: 1) കെട്ടിക്കിടക്കുന്ന വെള്ളം ഒഴുക്കിക്കളയുക. 2) ട്രൈക്കോഡെർമ രാവിലെ തളിക്കുക. 3) കോപ്പർ ഓക്സിക്ലോറൈഡ് മാസ്ക് ധരിച്ച് തളിക്കുക.',
            or: 'ସୁରକ୍ଷିତ ପରାମର୍ଶ: ୧) ଜମିରୁ ଅଧିକ ପାଣି ନିଷ୍କାସନ କରନ୍ତୁ। ୨) ଟ୍ରାଇକୋଡର୍ମା ସକାଳେ ସ୍ପ୍ରେ କରନ୍ତୁ। ୩) କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ମାସ୍କ ପିନ୍ଧି ସ୍ପ୍ରେ କରନ୍ତୁ।'
          }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'advisory',
          suggestedFollowups: ['What is the weather forecast?', 'Scan another leaf']
        };
      }

      case 'EXPLAIN_PEST_TRAPS': {
        return {
          text: this.getLocalizedText({
            en: `Pest Trap Status: Pheromone Trap A1 at South Block has recorded ${primaryTrap.currentCount} bollworms, exceeding the economic threshold limit of ${primaryTrap.threshold}. Sticky Trap B2 has 7 aphids (normal). Immediate biological baiting or targeted neem-based spray is advised.`,
            hi: `कीट ट्रैप स्थिति: दक्षिण ब्लॉक के फेरोमोन ट्रैप A1 में ${primaryTrap.currentCount} बॉलवर्म पकड़े गए हैं, जो आर्थिक सीमा (${primaryTrap.threshold}) से अधिक है। स्टिकी ट्रैप B2 में 7 एफिड्स (सामान्य) हैं। नीम आधारित दवा के छिड़काव की सलाह दी जाती है।`,
            mr: `कीड ट्रॅप स्थिती: फेरोमोन ट्रॅप A1 मध्ये ${primaryTrap.currentCount} बोंडअळी सापडल्या आहेत, जे मर्यादेपेक्षा (${primaryTrap.threshold}) जास्त आहे. त्वरित जैविक किंवा निंबोळी अर्क फवारणी करा.`,
            gu: `જીવાત ટ્રેપ સ્થિતિ: ફેરોમોન ટ્રેપમાં ${primaryTrap.currentCount} ઈયળો નોંધાઈ છે જે મર્યાદા કરતા વધુ છે. લીમડાના અર્કનો છંટકાવ કરવાની સલાહ છે.`,
            pa: `ਕੀੜੇ ਟਰੈਪ: ਫੇਰੋਮੋਨ ਟਰੈਪ ਵਿੱਚ ${primaryTrap.currentCount} ਕੀੜੇ ਮਿਲੇ ਹਨ ਜੋ ਖ਼ਤਰੇ ਦੀ ਸੀਮਾ ਤੋਂ ਵੱਧ ਹਨ। ਨਿੰਮ ਵਾਲੀ ਦਵਾਈ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।`,
            ta: `பூச்சி பொறி நிலை: ஃபெரமோன் பொறியில் ${primaryTrap.currentCount} புழுக்கள் பதிவாகியுள்ளன, இது வரம்பை விட அதிகம். வேப்ப எண்ணெய் தெளிக்க பரிந்துரைக்கப்படுகிறது.`,
            te: `పురుగుల ట్రాప్ స్థితి: ఫెరోమోన్ ట్రాప్‌లో ${primaryTrap.currentCount} పురుగులు నమోదయ్యాయి. వేప నూనె పిచికారీ చేయాలని సిఫార్సు చేయబడింది.`,
            bn: `কীটপতঙ্গ ট্র্যাপ: ফেরোমোন ট্র্যাপে ${primaryTrap.currentCount}টি পোকা ধরা পড়েছে যা বিপদসীমার বেশি। নিমজাতীয় কীটনাশক স্প্রে করুন।`,
            kn: `ಕೀಟ ಬಲೆ ಸ್ಥಿತಿ: ಫೆರಮೋನ್ ಬಲೆಯಲ್ಲಿ ${primaryTrap.currentCount} ಕೀಟಗಳು ಕಂಡುಬಂದಿವೆ. ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಲು ಸಲಹೆ ನೀಡಲಾಗಿದೆ.`,
            ml: `കീടക്കെണി നിരീക്ഷണം: ഫെറോമോൺ കെണിയിൽ ${primaryTrap.currentCount} പുഴുക്കൾ വീണിട്ടുണ്ട്. വേപ്പെണ്ണ തളിക്കാൻ നിർദ്ദേശിക്കുന്നു.`,
            or: `କୀଟ ଟ୍ରାପ୍: ଫେରୋମୋନ୍ ଟ୍ରାପରେ ${primaryTrap.currentCount} କୀଟ ଧରାପଡ଼ିଛନ୍ତି। ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ କରିବାକୁ ପରାମର୍ଶ ଦିଆଗଲା।`
          }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'pest-monitoring',
          suggestedFollowups: ['Show Crop Health Risk', 'Open IPM Advisory']
        };
      }

      case 'EXPLAIN_IOT_SENSORS': {
        return {
          text: this.getLocalizedText({
            en: `IoT Node ${iot.nodeId} is Online with ${iot.battery}% battery. Readings: Soil Moisture is ${iot.soilMoisture}%, Leaf Wetness Score is ${iot.leafWetnessScore}/100 (${iot.leafWetnessLabel}), and Ambient Temperature is ${iot.temperature}°C.`,
            hi: `IoT सेंसर नोड ${iot.nodeId} ऑनलाइन है (बैटरी ${iot.battery}%)। मिट्टी की नमी ${iot.soilMoisture}%, पत्ती का गीलापन ${iot.leafWetnessScore}/100 (${iot.leafWetnessLabel}), और तापमान ${iot.temperature}°C है।`,
            mr: `IoT नोड ${iot.nodeId} ऑनलाइन आहे (बॅटरी ${iot.battery}%)। मातीतील ओलावा ${iot.soilMoisture}%, पानांचा ओलावा ${iot.leafWetnessScore}/100 आणि तापमान ${iot.temperature}°C आहे.`,
            gu: `IoT સેન્સર ${iot.nodeId} ઑનલાઇન છે (બેટરી ${iot.battery}%)। જમીનનો ભેજ ${iot.soilMoisture}%, પર્ણ ભીનાશ ${iot.leafWetnessScore}/100 અને તાપમાન ${iot.temperature}°C છે.`,
            pa: `IoT ਸੈਂਸਰ ${iot.nodeId} ਆਨਲਾਈਨ ਹੈ। ਮਿੱਟੀ ਦੀ ਨਮੀ ${iot.soilMoisture}% ਅਤੇ ਪੱਤੇ ਦਾ ਗਿੱਲਾਪਣ ${iot.leafWetnessScore}/100 ਹੈ।`,
            ta: `IoT சென்சார் ${iot.nodeId} ஆன்லைனில் உள்ளது. மண் ஈரப்பதம் ${iot.soilMoisture}% மற்றும் இலை ஈரப்பதம் ${iot.leafWetnessScore}/100.`,
            te: `IoT సెన్సార్ ${iot.nodeId} ఆన్‌లైన్‌లో ఉంది. నేల తేమ ${iot.soilMoisture}% మరియు ఆకు తడిదనం ${iot.leafWetnessScore}/100.`,
            bn: `IoT সেন্সর ${iot.nodeId} অনলাইন আছে। মাটির আর্দ্রতা ${iot.soilMoisture}% এবং পাতার আর্দ্রতা ${iot.leafWetnessScore}/100।`,
            kn: `IoT ಸಂವೇದಕ ${iot.nodeId} ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ${iot.soilMoisture}% ಮತ್ತು ಎಲೆಯ ತೇವಾಂಶ ${iot.leafWetnessScore}/100.`,
            ml: `IoT സെൻസർ ${iot.nodeId} ഓൺലൈനാണ്. മണ്ണിലെ ഈർപ്പം ${iot.soilMoisture}% ഇലയിലെ ഈർപ്പം ${iot.leafWetnessScore}/100.`,
            or: `IoT ସେନ୍ସର ${iot.nodeId} ଅନଲାଇନ୍ ଅଛି। ମାଟିର ଆର୍ଦ୍ରତା ${iot.soilMoisture}% ଏବଂ ପତ୍ରର ଓଦାପଣ ${iot.leafWetnessScore}/100।`
          }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'iot-sensors',
          suggestedFollowups: ['Check weather intel', 'What is crop risk?']
        };
      }

      case 'REQUEST_EXPERT_HELP': {
        return {
          text: this.getLocalizedText({
            en: 'Digital KrishiVaani connects you directly with ICAR and KVK agronomists. When an AI scan has low confidence (<75%) or ambiguous foliar symptoms, it is automatically escalated to Senior Scientist Dr. Ananya Sharma for digital validation and lab investigation.',
            hi: 'डिजिटल कृषिवाणी आपको सीधे ICAR और कृषि विज्ञान केंद्र (KVK) के वैज्ञानिकों से जोड़ता है। जब किसी स्कैन में संदेह होता है, तो वह स्वचालित रूप से वरिष्ठ वैज्ञानिक डॉ. अनन्या शर्मा के पास सत्यापन और लैब जांच के लिए पहुंच जाता है।',
            mr: 'डिजिटल कृषीवाणी तुम्हाला थेट कृषी शास्त्रज्ञांशी जोडते. संशयास्पद रोगाच्या बाबतीत वरिष्ठ शास्त्रज्ञांकडून डिजिटल पडताळणी आणि प्रयोगशाळा तपासणी केली जाते.',
            gu: 'ડિજિટલ કૃષિવાણી તમને સીધા કૃષિ વૈજ્ઞાનિકો સાથે જોડે છે. શંકાસ્પદ રોગના કિસ્સામાં લેબ તપાસ માટે કેસ મોકલવામાં આવે છે.',
            pa: 'ਡਿਜੀਟਲ ਕ੍ਰਿਸ਼ੀਵਾਣੀ ਤੁਹਾਨੂੰ ਖੇਤੀ ਵਿਗਿਆਨੀਆਂ ਨਾਲ ਜੋੜਦਾ ਹੈ। ਲੈਬ ਟੈਸਟਿੰਗ ਅਤੇ ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਮਿਲਦੀ ਹੈ।',
            ta: 'டிஜிட்டல் கிருஷிவாணி உங்களை நேரடியாக வேளாண் விஞ்ஞானிகளுடன் இணைக்கிறது. ஆய்வக பரிசோதனை மற்றும் ஆலோசனை வழங்கப்படுகிறது.',
            te: 'డిజిటల్ కృషివాణి మిమ్మల్ని నేరుగా వ్యవసాయ శాస్త్రవేత్తలతో కలుపుతుంది. ల్యాబ్ పరీక్షలు మరియు నిపుణుల సలహాలు లభిస్తాయి.',
            bn: 'ডিজিটাল কৃষিবাণী আপনাকে সরাসরি কৃষি বিজ্ঞানীদের সাথে যুক্ত করে। সন্দেহজনক রোগের ক্ষেত্রে ল্যাব পরীক্ষার ব্যবস্থা রয়েছে।',
            kn: 'ಡಿಜಿಟಲ್ ಕೃಷಿವಾಣಿ ನಿಮ್ಮನ್ನು ನೇರವಾಗಿ ಕೃಷಿ ವಿಜ್ಞಾನಿಗಳೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತದೆ.',
            ml: 'ഡിജിറ്റൽ കൃഷിവാണി നിങ്ങളെ കാർഷിക ശാസ്ത്രജ്ഞരുമായി നേരിട്ട് ബന്ധിപ്പിക്കുന്നു.',
            or: 'ଡିଜିଟାଲ୍ କୃଷିବାଣୀ ଆପଣଙ୍କୁ ସିଧାସଳଖ କୃଷି ବୈଜ୍ଞାନିକଙ୍କ ସହ ଯୋଡ଼ିଥାଏ।'
          }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'scan-history',
          suggestedFollowups: ['Scan crop for review', 'View advisory']
        };
      }

      case 'READ_NOTIFICATIONS': {
        const unread = StorageService.getNotifications().filter(n => !n.read);
        const count = unread.length;
        const top = unread[0];
        return {
          text: count > 0 
            ? this.getLocalizedText({
                en: `You have ${count} unread notifications. Latest: "${top.title} - ${top.message}"`,
                hi: `आपके पास ${count} नई सूचनाएं हैं। ताज़ा: "${top.title} - ${top.message}"`,
                mr: `तुमच्याकडे ${count} नवीन सूचना आहेत. ताजी: "${top.title}"`,
                gu: `તમારી પાસે ${count} નવી સૂચનાઓ છે. તાજી: "${top.title}"`,
                pa: `ਤੁਹਾਡੇ ਕੋਲ ${count} ਨਵੀਆਂ ਸੂਚਨਾਵਾਂ ਹਨ। ਤਾਜ਼ਾ: "${top.title}"`,
                ta: `உங்களிடம் ${count} புதிய அறிவிப்புகள் உள்ளன.`,
                te: `మీకు ${count} కొత్త నోటిఫికేషన్లు ఉన్నాయి.`,
                bn: `আপনার ${count}টি নতুন বিজ্ঞপ্তি রয়েছে।`,
                kn: `ನಿಮಗೆ ${count} ಹೊಸ ಸೂಚನೆಗಳಿವೆ.`,
                ml: `നിങ്ങൾക്ക് ${count} പുതിയ അറിയിപ്പുകളുണ്ട്.`,
                or: `ଆପଣଙ୍କର ${count}ଟି ନୂଆ ବିଜ୍ଞପ୍ତି ଅଛି।`
              }, lang)
            : this.getLocalizedText({
                en: 'You have no unread alerts. All fields and telemetry nodes are operating normally.',
                hi: 'आपके पास कोई नई सूचना नहीं है। सभी खेत और सेंसर सामान्य रूप से काम कर रहे हैं।',
                mr: 'कोणत्याही नवीन सूचना नाहीत. सर्व शेती आणि सेन्सर सामान्य कार्यरत आहेत.',
                gu: 'કોઈ નવી સૂચનાઓ નથી. બધું સામાન્ય છે.',
                pa: 'ਕੋਈ ਨਵਾਂ ਅਲਰਟ ਨਹੀਂ ਹੈ।',
                ta: 'புதிய அறிவிப்புகள் எதுவும் இல்லை.',
                te: 'కొత్త నోటిಫికేషన్లు ఏవీ లేవు.',
                bn: 'কোনো নতুন বিজ্ঞপ্তি নেই।',
                kn: 'ಯಾವುದೇ ಹೊಸ ಸೂಚನೆಗಳಿಲ್ಲ.',
                ml: 'പുതിയ അറിയിപ്പുകളൊന്നുമില്ല.',
                or: 'କୌଣସି ନୂଆ ବିଜ୍ଞପ୍ତି ନାହିଁ।'
              }, lang),
          actionType: 'NAVIGATE',
          actionPayload: 'notifications',
          suggestedFollowups: ['What is crop risk?', 'Open weather']
        };
      }

      default: {
        return {
          text: this.getLocalizedText({
            en: `I am VAANI, your Digital KrishiVaani Agricultural Assistant. I can help you scan diseased crops, explain weather and risk forecasts, guide pest trap thresholds, and read safe IPM advisories in 11 Indian languages. What would you like to check?`,
            hi: `मैं वाणी (VAANI) हूँ, आपकी डिजिटल कृषिवाणी सहायक। मैं आपकी फसल स्कैन करने, मौसम और रोग जोखिम समझाने, कीट ट्रैप और सुरक्षित जैविक दवा की सलाह बताने में मदद कर सकती हूँ। आप क्या जानना चाहते हैं?`,
            mr: `मी वाणी (VAANI) आहे, तुमची कृषी आवाज सहाय्यक. मी पीक स्कॅनिंग, हवामान, रोग धोका आणि सुरक्षित सल्ल्याबाबत मदत करू शकते.`,
            gu: `હું વાણી (VAANI) છું, તમારી કૃષિ વૉઇસ સહાયક. હું પાક સ્કેનિંગ, હવામાન અને રોગ નિયંત્રણ સલાહમાં મદદ કરી શકું છું.`,
            pa: `ਮੈਂ ਵਾਣੀ (VAANI) ਹਾਂ, ਤੁਹਾਡੀ ਖੇਤੀ ਸਹਾਇਕ। ਮੈਂ ਫ਼ਸਲ ਸਕੈਨ ਕਰਨ ਅਤੇ ਮੌਸਮ ਜਾਣਕਾਰੀ ਦੇਣ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ।`,
            ta: `நான் வாணி (VAANI), உங்கள் விவசாய குரல் உதவியாளர். பயிர் ஸ்கேன் மற்றும் வானிலை ஆலோசனைகளில் உதவ முடியும்.`,
            te: `నేను వాణి (VAANI), మీ వ్యవసాయ వాయిస్ అసిస్టెంట్. పంట స్కాన్ మరియు వాతావరణ సలహాలలో సహాయం చేస్తాను.`,
            bn: `আমি বাণী (VAANI), আপনার কৃষি ভয়েস সহকারী। ফসল স্ক্যান এবং রোগ নিয়ন্ত্রণে সাহায্য করতে পারি।`,
            kn: `ನಾನು ವಾಣಿ (VAANI), ನಿಮ್ಮ ಕೃಷಿ ಧ್ವನಿ ಸಹಾಯಕ. ಬೆಳೆ ಸ್ಕ್ಯಾನ್ ಮತ್ತು ಹವಾಮಾನ ಮಾಹಿತಿಯಲ್ಲಿ ನೆರವಾಗಬಲ್ಲೆ.`,
            ml: `ഞാൻ വാണി (VAANI), നിങ്ങളുടെ കാർഷിക വോയ്സ് അസിസ്റ്റന്റ്. വിള സ്കാനിംഗിലും കാലാവസ്ഥ വിവരങ്ങളിലും സഹായിക്കാം.`,
            or: `ମୁଁ ବାଣୀ (VAANI), ଆପଣଙ୍କର କୃଷି ଭଏସ୍ ସହାୟକ। ଫସଲ ସ୍କାନ୍ ଏବଂ ପାଣିପାଗ ସୂଚନାରେ ସାହାଯ୍ୟ କରିପାରିବି।`
          }, lang),
          suggestedFollowups: [
            'What is my crop risk?',
            'How is the weather forecast?',
            'Scan crop with AI',
            'Read safe advisory'
          ]
        };
      }
    }
  }

  private getLocalizedText(dict: Partial<Record<SupportedLanguageCode, string>>, lang: SupportedLanguageCode): string {
    return dict[lang] || dict.hi || dict.en || 'Agricultural guidance ready.';
  }

  public getGuidedSteps(lang: SupportedLanguageCode): GuidedScanStep[] {
    const t = (key: any) => I18nService.t(key);
    return [
      {
        stepNumber: 1,
        titleKey: 'guidedStep1Title',
        titleText: t('guidedStep1Title'),
        voiceInstruction: t('guidedStep1Voice'),
        helperTip: 'Ensure good natural sunlight and steady hand',
        highlightElementId: 'scanner-camera-feed',
        actionRequired: 'tap_camera'
      },
      {
        stepNumber: 2,
        titleKey: 'guidedStep2Title',
        titleText: t('guidedStep2Title'),
        voiceInstruction: t('guidedStep2Voice'),
        helperTip: 'Position foliar lesion or pest spotting right in the center bounding box',
        highlightElementId: 'scanner-viewfinder-box',
        actionRequired: 'center_leaf'
      },
      {
        stepNumber: 3,
        titleKey: 'guidedStep3Title',
        titleText: t('guidedStep3Title'),
        voiceInstruction: t('guidedStep3Voice'),
        helperTip: 'Multi-source risk model is correlating IoT humidity and weather forecast',
        highlightElementId: 'scanner-inference-progress',
        actionRequired: 'confirm_clarity'
      },
      {
        stepNumber: 4,
        titleKey: 'guidedStep4Title',
        titleText: t('guidedStep4Title'),
        voiceInstruction: t('guidedStep4Voice'),
        helperTip: 'Check disease pathogen confidence and severity grade',
        highlightElementId: 'scanner-diagnosis-card',
        actionRequired: 'view_risk'
      },
      {
        stepNumber: 5,
        titleKey: 'guidedStep5Title',
        titleText: t('guidedStep5Title'),
        voiceInstruction: t('guidedStep5Voice'),
        helperTip: 'Adhere to safe dosage, biological controls, and CIBRC pre-harvest intervals',
        highlightElementId: 'scanner-advisory-section',
        actionRequired: 'view_advisory'
      }
    ];
  }
}

export const VaaniService = new VaaniServiceClass();
