import { SupportedLanguageCode } from '../types';

export interface PageTourStep {
  stepNumber: number;
  title: string;
  hindiTitle: string;
  description: string;
  hindiDescription: string;
  highlightSelector?: string;
  badge?: string;
}

export interface PageGuideConfig {
  pageId: string;
  title: string;
  hindiTitle: string;
  subtitle: string;
  hindiSubtitle: string;
  category: string;
  tourSteps: PageTourStep[];
  readAloudSummary: string;
  hindiReadAloudSummary: string;
  quickTips: { en: string; hi: string }[];
}

export const PAGE_GUIDE_REGISTRY: Record<string, PageGuideConfig> = {
  'farmer-dashboard': {
    pageId: 'farmer-dashboard',
    title: 'Farm Home & Health Dashboard',
    hindiTitle: 'मुख्य पृष्ठ (किसान डैशबोर्ड)',
    subtitle: 'Real-time overview of your farm, IoT microclimate, early disease risks, and fast actions.',
    hindiSubtitle: 'आपके खेत का संपूर्ण विवरण, लाइव आईओटी सेंसर डेटा, मौसम व बीमारी का प्रारंभिक जोखिम।',
    category: 'Farmer Hub',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Crop Status & Microclimate Summary',
        hindiTitle: 'फसल की स्थिति और मौसम सारांश',
        description: 'Shows your active crop (Soybean / Cotton), growth stage, and current environmental risk calculated from local sensors.',
        hindiDescription: 'यह कार्ड आपकी फसल, विकास अवस्था और खेत के सेंसर से आंके गए बीमारी के जोखिम को दर्शाता है।',
        highlightSelector: '#dashboard-overview-card',
        badge: 'Status'
      },
      {
        stepNumber: 2,
        title: 'Live IoT Telemetry & Sensor Readings',
        hindiTitle: 'लाइव आईओटी सेंसर और नमी स्तर',
        description: 'Displays real-time canopy temperature, relative humidity, leaf wetness duration, and soil moisture from in-field sensor nodes.',
        hindiDescription: 'खेत में लगे सेंसर से तापमान, हवा में नमी, पत्तियों का गीलापन और मिट्टी की नमी का लाइव डेटा यहां दिखता है।',
        highlightSelector: '#dashboard-iot-card',
        badge: 'IoT Live'
      },
      {
        stepNumber: 3,
        title: 'One-Tap Crop Health Scanner',
        hindiTitle: 'फसल स्वास्थ्य स्कैनर (कैमरा जांच)',
        description: 'Tap the camera button to instantly snap a photo of any abnormal leaf or pest damage for AI optical screening.',
        hindiDescription: 'कैमरा बटन दबाकर किसी भी संदिग्ध पत्ते की फोटो खींचें और तुरंत एआई जांच रिपोर्ट पाएं।',
        highlightSelector: '#quick-scan-button',
        badge: 'Action'
      },
      {
        stepNumber: 4,
        title: 'Outbreak Alerts & Pest Trap Counts',
        hindiTitle: 'प्रकोप चेतावनी और कीट ट्रैप संख्या',
        description: 'Monitors insect trap counts and active epidemiological disease clusters in your district (Sanwer, Depalpur, Hatod).',
        hindiDescription: 'आपके तहसील या गांव के आसपास कीटों की संख्या और बीमारी के फैलाव की समय पर चेतावनी यहां मिलती है।',
        highlightSelector: '#dashboard-pest-card',
        badge: 'Early Warning'
      }
    ],
    readAloudSummary: 'Welcome to your Farm Home Dashboard. Your primary crop is Cotton and Soybean in vegetative and flowering stages. Current microclimate risk is moderate, with relative humidity at 78 percent and canopy temperature at 28 degrees Celsius. You have one active pest trap showing elevated insect count in Block Sanwer. Tap the Scan Crop button at any time to check suspected leaf spots, or speak with VAANI assistant for instant voice advice.',
    hindiReadAloudSummary: 'नमस्ते, डिजिटल कृषिवाणी के मुख्य पृष्ठ पर आपका स्वागत है। आपकी सोयाबीन और कपास की फसल वर्तमान में वानस्पतिक और फूल आने की अवस्था में है। खेत में नमी 78 प्रतिशत और तापमान 28 डिग्री सेल्सियस है, जो फफूंद के लिए मध्यम जोखिम पैदा कर सकता है। सांवेर ब्लॉक में कीटों की संख्या में वृद्धि दर्ज की गई है। किसी भी पत्ते पर धब्बे दिखने पर तुरंत फसल स्कैन करें या वाणी सहायक से अपनी भाषा में बात करें।',
    quickTips: [
      { en: 'Scan leaves early in the morning for best natural lighting and clear spore detection.', hi: 'सुबह के समय पत्तों की फोटो लेने से बीमारी के लक्षण सबसे साफ दिखाई देते हैं।' },
      { en: 'Maintain leaf wetness below 8 hours by avoiding evening overhead irrigation.', hi: 'शाम के समय ज्यादा सिंचाई न करें ताकि पत्तियों पर रातभर पानी न जमा रहे।' }
    ]
  },

  'crop-scanner': {
    pageId: 'crop-scanner',
    title: 'Crop Health Scanner (Edge AI)',
    hindiTitle: 'फसल स्वास्थ्य स्कैनर (एआई कैमरा)',
    subtitle: 'Instant optical disease screening with voice symptom notes and zero-data offline edge inference.',
    hindiSubtitle: 'पत्तियों के लक्षणों की त्वरित जांच, बोलकर लक्षण दर्ज करने की सुविधा और बिना इंटरनेट ऑफलाइन जांच।',
    category: 'Diagnosis',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Optical Viewfinder & Framing',
        hindiTitle: 'कैमरा फ्रेमिंग और दूरी',
        description: 'Center the infected leaf in the frame from a distance of 15 to 20 cm under good natural light.',
        hindiDescription: 'प्रभावित पत्ते को कैमरे के बीच में रखें, 15 से 20 सेंटीमीटर की दूरी रखें और अच्छी रोशनी में फोटो लें।',
        highlightSelector: '#scanner-viewfinder',
        badge: 'Camera'
      },
      {
        stepNumber: 2,
        title: 'Voice Symptom Description',
        hindiTitle: 'बोलकर लक्षण बताएं (वॉइस नोट)',
        description: 'Tap the microphone to speak your field observations in Hindi or your local language to enrich the AI diagnosis.',
        hindiDescription: 'माइक बटन दबाकर अपनी भाषा में बताएं कि पत्ते पर क्या दिख रहा है, जैसे धब्बे, पीलापन या कीड़े।',
        highlightSelector: '#scanner-voice-button',
        badge: 'Voice'
      },
      {
        stepNumber: 3,
        title: 'Offline Farm Scan (Zero Internet)',
        hindiTitle: 'ऑफलाइन फार्म स्कैन (बिना इंटरनेट)',
        description: 'In remote fields with no mobile network, activate Offline Mode to run on-device MobileNetV3 AI inference.',
        hindiDescription: 'खेत में नेटवर्क न होने पर ऑफलाइन मोड चालू करें, यह आपके फोन में सीधे जांच करके रिपोर्ट सुरक्षित कर लेगा।',
        highlightSelector: '#scanner-toggle-offline-btn',
        badge: 'Offline'
      },
      {
        stepNumber: 4,
        title: 'Safety Gating & Expert Referral',
        hindiTitle: 'सुरक्षा नियम और वैज्ञानिक समीक्षा',
        description: 'If AI confidence falls below 75 percent, the case is automatically escalated to certified agricultural scientists.',
        hindiDescription: 'यदि एआई का विश्वास 75 प्रतिशत से कम होता है, तो मामला तुरंत कृषि विज्ञान केंद्र के वैज्ञानिकों को भेजा जाता है।',
        badge: 'Safety'
      }
    ],
    readAloudSummary: 'Crop Health Scanner page. Here you can diagnose plant diseases instantly. Use the camera viewport to frame diseased leaves or pests. You can select pre-loaded field scenarios or snap live photos. Press the microphone to record your voice notes in your mother tongue. If you are in a remote farm with no cellular signal, switch to Offline Mode for on-device inference.',
    hindiReadAloudSummary: 'फसल स्वास्थ्य स्कैनर पेज। यहां आप अपनी फसल की बीमारी तुरंत जांच सकते हैं। कैमरे को बीमार पत्ते के सामने रखें। आप माइक दबाकर अपनी आवाज में लक्षण भी दर्ज कर सकते हैं। यदि आपके खेत में मोबाइल नेटवर्क नहीं है, तो ऑफलाइन मोड चालू करें जिससे बिना इंटरनेट आपके फोन में ही जांच पूरी हो जाएगी।',
    quickTips: [
      { en: 'Avoid casting hand shadows over the leaf while photographing.', hi: 'फोटो खींचते समय पत्ते पर हाथ की परछाई न आने दें।' },
      { en: 'Include both healthy green area and lesion boundary for maximum accuracy.', hi: 'पत्ते का हरा हिस्सा और धब्बा दोनों फोटो में आने चाहिए।' }
    ]
  },

  'advisory': {
    pageId: 'advisory',
    title: 'Safe Agricultural Advisory (IPM)',
    hindiTitle: 'सुरक्षित कृषि सलाह (आईपीएम)',
    subtitle: 'Scientifically validated Integrated Pest Management protocols, safety gear, and dosage timelines.',
    hindiSubtitle: 'वैज्ञानिक रूप से प्रमाणित एकीकृत कीट प्रबंधन, सुरक्षा उपकरण और दवाई की सही मात्रा।',
    category: 'Advisory',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Disease Classification & Severity',
        hindiTitle: 'रोग की पहचान और गंभीरता स्तर',
        description: 'Details confirmed pathogen name, severity percentage, and immediate crop threat level.',
        hindiDescription: 'बीमारी का नाम, पत्तों पर इसका फैलाव और फसल को होने वाले नुकसान का सटीक प्रतिशत।',
        badge: 'Diagnosis'
      },
      {
        stepNumber: 2,
        title: 'Three-Tier Treatment Plan',
        hindiTitle: 'तीन चरणों वाला उपचार प्रोटोकॉल',
        description: 'Presents cultural preventive practices, biological bio-fungicides (e.g. Trichoderma), and calibrated chemical remedies.',
        hindiDescription: 'जैविक उपाय जैसे ट्राइकोडर्मा, खेत की साफ-सफाई और जरूरत पड़ने पर प्रमाणित रासायनिक छिड़काव की सलाह।',
        badge: 'Treatment'
      },
      {
        stepNumber: 3,
        title: 'Dosage & Pre-Harvest Intervals (PHI)',
        hindiTitle: 'मात्रा और तुड़ाई से पहले का अंतराल (PHI)',
        description: 'Lists exact milliliter per liter dilution rates and safety waiting periods before harvesting crops.',
        hindiDescription: 'प्रति एकड़ और प्रति लीटर पानी में दवा की सही मात्रा और फसल काटने से पहले कितने दिन रुकना है, यह जानकारी।',
        badge: 'Dosage'
      },
      {
        stepNumber: 4,
        title: 'Mandatory Protective Equipment (PPE)',
        hindiTitle: 'आवश्यक सुरक्षा उपकरण (पीपीई)',
        description: 'Highlights critical safety precautions: rubber gloves, eye goggles, and N95 masks during chemical preparation.',
        hindiDescription: 'छिड़काव करते समय मास्क, चश्मा और दस्ताने पहनने के आवश्यक सुरक्षा नियम।',
        badge: 'Safety'
      }
    ],
    readAloudSummary: 'Safe Agricultural Advisory view. This screen provides step-by-step Integrated Pest Management guidelines for your detected crop disease. Review the three-tier action plan: first cultural sanitation, second biological bio-agents, and third safe targeted chemical controls. Follow the exact dosage calculations and mandatory safety equipment before spraying.',
    hindiReadAloudSummary: 'सुरक्षित कृषि सलाह पृष्ठ। यहां आपकी फसल के लिए वैज्ञानिक एकीकृत कीट प्रबंधन की जानकारी दी गई है। सबसे पहले जैविक व देसी उपचार अपनाएं, इसके बाद अनुशंसित जैविक कीटनाशक और जरूरत पड़ने पर ही रासायनिक दवा का प्रयोग करें। छिड़काव के समय सुरक्षा मास्क और दस्ताने अवश्य पहनें।',
    quickTips: [
      { en: 'Never spray against the wind direction to avoid chemical inhalation.', hi: 'हवा के विपरीत दिशा में कभी भी छिड़काव न करें।' },
      { en: 'Always check water pH before mixing systemic fungicides.', hi: 'दवा घोलने से पहले पानी की शुद्धता और मात्रा की जांच करें।' }
    ]
  },

  'weather-intel': {
    pageId: 'weather-intel',
    title: 'Weather & Rain Risk Intelligence',
    hindiTitle: 'मौसम व वर्षा जोखिम विश्लेषण',
    subtitle: '7-day hyper-local forecasts, leaf wetness duration, and pathogen micro-climate suitability indices.',
    hindiSubtitle: '7 दिनों का सटीक स्थानीय मौसम, पत्तियों की नमी की अवधि और बीमारी फैलने के मौसमी अनुकूलता सूचकांक।',
    category: 'Weather & IoT',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Hyper-Local Microclimate Forecast',
        hindiTitle: 'स्थानीय मौसम का 7-दिवसीय पूर्वानुमान',
        description: 'Real-time temperature, precipitation probability, humidity trends, and wind speeds.',
        hindiDescription: 'आगामी दिनों का तापमान, बारिश की संभावना, हवा की गति और बादलों की स्थिति।',
        badge: 'Forecast'
      },
      {
        stepNumber: 2,
        title: 'Disease Favorable Conditions Alert',
        hindiTitle: 'रोग अनुकूल मौसम चेतावनी',
        description: 'Warns when humidity exceeds 80 percent and leaf wetness exceeds 6 hours, creating high fungal spore risks.',
        hindiDescription: 'जब हवा में नमी 80 प्रतिशत से ऊपर और पत्ते 6 घंटे से अधिक गीले रहते हैं, तो फफूंद का खतरा बढ़ जाता है।',
        badge: 'Alert'
      },
      {
        stepNumber: 3,
        title: 'Optimal Spray Window Advisor',
        hindiTitle: 'छिड़काव के लिए उपयुक्त समय',
        description: 'Calculates the safest spray hours based on rain forecast, dew evaporation, and wind drift.',
        hindiDescription: 'बारिश और तेज हवा से बचते हुए छिड़काव करने के लिए सबसे सुरक्षित घंटों की जानकारी।',
        badge: 'Advisory'
      }
    ],
    readAloudSummary: 'Weather and Rain Risk Intelligence page. Current conditions in your village show moderate rainfall probability in the next 36 hours. Humidity is currently high at 82 percent. Fungal pathogens thrive under prolonged leaf moisture. Review the 7-day forecast and safe spray windows before scheduling any irrigation or foliar application.',
    hindiReadAloudSummary: 'मौसम व वर्षा जोखिम विश्लेषण पेज। आपके क्षेत्र में अगले 36 घंटों में वर्षा की संभावना है। हवा में नमी 82 प्रतिशत है, जो पत्तों पर फफूंद के फैलाव के लिए अनुकूल हो सकती है। कोई भी छिड़काव या सिंचाई करने से पहले सुरक्षित छिड़काव समय की जांच अवश्य करें।',
    quickTips: [
      { en: 'Do not spray chemicals if rain is predicted within 4 hours.', hi: 'यदि 4 घंटे के भीतर बारिश की संभावना हो तो दवा का छिड़काव न करें।' }
    ]
  },

  'pest-monitoring': {
    pageId: 'pest-monitoring',
    title: 'Pest & Disease Traps Console',
    hindiTitle: 'कीट निगरानी व फेरोमोन ट्रैप',
    subtitle: 'Pheromone and sticky trap telemetry with Economic Threshold Level (ETL) breach tracking.',
    hindiSubtitle: 'फेरोमोन व स्टिकी ट्रैप की स्वचालित गिनती और आर्थिक नुकसान सीमा (ईटीएल) की निगरानी।',
    category: 'Pest Control',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Trap Catch Rate & Counts',
        hindiTitle: 'ट्रैप में फंसे कीटों की संख्या',
        description: 'Monitors adult pest captures per trap across your plots (Bollworm, Whitefly, Fall Armyworm).',
        hindiDescription: 'आपके खेत में लगे ट्रैप में प्रतिदिन पकड़े गए कीटों की सटीक संख्या।',
        badge: 'Traps'
      },
      {
        stepNumber: 2,
        title: 'Economic Threshold Level (ETL) Bar',
        hindiTitle: 'आर्थिक नुकसान सीमा (ETL)',
        description: 'Color-coded progress bar indicating whether pest count is below or above the damage threshold.',
        hindiDescription: 'रंगीन मीटर जो बताता है कि कीटों की संख्या फसल को नुकसान पहुंचाने की सीमा से कम है या ज्यादा।',
        badge: 'Threshold'
      },
      {
        stepNumber: 3,
        title: 'Lure Replacement Schedule',
        hindiTitle: 'फेरोमोन ल्यूर बदलने का समय',
        description: 'Tracks lure expiry dates to ensure continuous pheromone attraction and trap effectiveness.',
        hindiDescription: 'ट्रैप में लगी दवा (ल्यूर) की वैधता और उसे बदलने की तारीख की सूचना।',
        badge: 'Maintenance'
      }
    ],
    readAloudSummary: 'Pest Monitoring page. You have active pheromone traps installed in Block A and Block B. Whitefly count is currently 14 per trap, which approaches the Economic Threshold Level of 16. Monitor trap levels closely over the next 48 hours to determine if biological parasitoids or neem sprays are required.',
    hindiReadAloudSummary: 'कीट निगरानी व ट्रैप पेज। आपके खेत में लगे फेरोमोन ट्रैप में सफेद मक्खी और सुंडी की संख्या दर्ज की जा रही है। वर्तमान कीट संख्या नुकसान की सीमा के करीब पहुंच रही है। अगले दो दिनों में नीम के अर्क या जैविक परभक्षी कीटों का उपयोग करने की तैयारी रखें।',
    quickTips: [
      { en: 'Change pheromone lures every 21 days for maximum attraction.', hi: 'फेरोमोन ल्यूर को हर 21 दिन में बदलें ताकि कीट सही आकर्षित होते रहें।' }
    ]
  },

  'government-schemes': {
    pageId: 'government-schemes',
    title: 'Government Schemes & Subsidies',
    hindiTitle: 'सरकारी योजनाएं व कृषि सब्सिडी',
    subtitle: 'Eligible Central and State schemes (PM-KMY, PM-FBY, SMAM) with DBT direct application guides.',
    hindiSubtitle: 'पीएम किसान, फसल बीमा और कृषि यंत्र सब्सिडी की पात्रता, लाभ और आवेदन की पूरी प्रक्रिया।',
    category: 'Financial Aid',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Personalized Eligibility Filter',
        hindiTitle: 'पात्रता अनुसार योजनाएं',
        description: 'Filter schemes by your landholding size, crop type, and state subsidies.',
        hindiDescription: 'आपकी जमीन के रकबे और फसल के आधार पर मिलने वाले सरकारी लाभ।',
        badge: 'Eligibility'
      },
      {
        stepNumber: 2,
        title: 'Direct Benefit Transfer (DBT) Status',
        hindiTitle: 'डीबीटी और सब्सिडी सहायता',
        description: 'Details subsidy amount, equipment assistance, and direct account transfer requirements.',
        hindiDescription: 'योजना के तहत मिलने वाली राशि और बैंक खाते में सीधे आने वाली सब्सिडी की जानकारी।',
        badge: 'Benefit'
      },
      {
        stepNumber: 3,
        title: 'Required Documents & CSC Center Guide',
        hindiTitle: 'जरूरी दस्तावेज और आवेदन केंद्र',
        description: 'Clear checklist of Aadhaar, Khasra, and bank passbook needed for enrollment.',
        hindiDescription: 'आवेदन के लिए आधार कार्ड, खसरा-खतौनी और बैंक पासबुक की सूची।',
        badge: 'Documents'
      }
    ],
    readAloudSummary: 'Government Schemes and Subsidies portal. Explore active farmer welfare schemes including Pradhan Mantri Fasal Bima Yojana, PM-KISAN income support, and solar pump subsidies. Review your eligibility based on your registered land record and view required documents for immediate application.',
    hindiReadAloudSummary: 'सरकारी योजनाएं व सब्सिडी पोर्टल। यहां आप प्रधानमंत्री फसल बीमा योजना, पीएम-किसान सम्मान निधि, और कृषि उपकरण सब्सिडी की जानकारी पा सकते हैं। अपनी जमीन के अनुसार पात्र योजना चुनें और आवश्यक दस्तावेजों की सूची देखकर तुरंत लाभ उठाएं।',
    quickTips: [
      { en: 'Ensure your Aadhaar is linked to your bank account for timely DBT subsidy transfer.', hi: 'सब्सिडी सीधे खाते में पाने के लिए बैंक खाते में आधार ई-केवाईसी अवश्य करवाएं।' }
    ]
  },

  'my-fields': {
    pageId: 'my-fields',
    title: 'My Farm & Geo-Plots',
    hindiTitle: 'मेरा खेत व भू-नक्शा',
    subtitle: 'Interactive GPS farm plot boundaries, soil profile analysis, and active crop stages.',
    hindiSubtitle: 'आपके खेत का जीपीएस भू-नक्शा, मिट्टी की गुणवत्ता और वर्तमान फसल चक्र।',
    category: 'Land & Plots',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Geo-Fenced Farm Boundaries',
        hindiTitle: 'खेत की जीपीएस सीमाएं',
        description: 'Satellite map view displaying your registered farm parcels and GPS coordinates.',
        hindiDescription: 'सेटेलाइट नक्शे पर आपके खेत के टुकड़े और उनकी सीमाओं का सटीक दृश्य।',
        badge: 'Map'
      },
      {
        stepNumber: 2,
        title: 'Soil Profile & Fertility Index',
        hindiTitle: 'मिट्टी की जांच और उर्वरकता',
        description: 'Shows soil pH, organic carbon, nitrogen, phosphorus, and potassium levels.',
        hindiDescription: 'खेत की मिट्टी का पीएच मान, जैविक कार्बन और जरूरी पोषक तत्वों की स्थिति।',
        badge: 'Soil'
      },
      {
        stepNumber: 3,
        title: 'Plot Crop Allocations',
        hindiTitle: 'खेत में बोई गई फसलें',
        description: 'Manage active crops planted on each plot, sowing dates, and expected harvest windows.',
        hindiDescription: 'किस हिस्से में कौन सी फसल बोई गई है और अनुमानित कटाई का समय।',
        badge: 'Crops'
      }
    ],
    readAloudSummary: 'My Farm and Geo-Plots page. You have two registered farm plots totaling 5.2 acres in Sanwer district. Plot 1 is under Cotton, currently in Flowering stage. Plot 2 is under Soybean in Vegetative stage. Review your soil fertility metrics and GPS coordinates on this interactive map.',
    hindiReadAloudSummary: 'मेरा खेत व भू-नक्शा पेज। आपके पास कुल 5.2 एकड़ जमीन पंजीकृत है। प्लॉट 1 पर कपास और प्लॉट 2 पर सोयाबीन की फसल है। यहां आप अपने खेत का सेटेलाइट नक्शा और मिट्टी परीक्षण रिपोर्ट देख सकते हैं।',
    quickTips: [
      { en: 'Update sowing dates accurately to receive stage-specific agronomic advice.', hi: 'बुवाई की सही तारीख दर्ज करने से फसल की हर अवस्था पर सही सलाह मिलती है।' }
    ]
  },

  'cluster-alerts': {
    pageId: 'cluster-alerts',
    title: 'Cluster Alerts & Outbreak Hotspots',
    hindiTitle: 'क्लस्टर अलर्ट व प्रकोप नक्शा',
    subtitle: 'Epidemiological surveillance tracking disease spread velocity across neighboring village clusters.',
    hindiSubtitle: 'आसपास के गांवों में बीमारी के फैलाव की गति, प्रभावित रकबा और सामूहिक नियंत्रण निर्देश।',
    category: 'Surveillance',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Cluster Spread Radius & Threat Index',
        hindiTitle: 'प्रकोप का दायरा और खतरा स्तर',
        description: 'Shows active containment radius and how fast fungal or pest vectors are spreading.',
        hindiDescription: 'बीमारी का फैलाव कितने किलोमीटर के दायरे में हो चुका है और खतरा कितना गंभीर है।',
        badge: 'Radius'
      },
      {
        stepNumber: 2,
        title: 'Affected Village Blocks',
        hindiTitle: 'प्रभावित गांव और तहसील',
        description: 'Lists specific tehsils (Sanwer, Depalpur, Mhow) with verified case counts.',
        hindiDescription: 'सांवेर, देपालपुर और महू के उन गांवों की सूची जहां बीमारी के मामले सामने आए हैं।',
        badge: 'Blocks'
      },
      {
        stepNumber: 3,
        title: 'Community Broadcast Actions',
        hindiTitle: 'सामूहिक बचाव निर्देश',
        description: 'Access joint IPM advisories issued by District Agricultural Officers.',
        hindiDescription: 'कृषि विभाग द्वारा पूरे गांव के लिए जारी किए गए सामूहिक बचाव निर्देश।',
        badge: 'Containment'
      }
    ],
    readAloudSummary: 'Cluster Alerts and Outbreaks console. A high-risk fungal leaf spot cluster is active within 4.8 kilometers of your farm boundary in Sanwer block. Over 18 farm parcels have reported symptoms. Neighboring farmers are advised to conduct prophylactic bio-fungicide sprays within the next 48 hours.',
    hindiReadAloudSummary: 'क्लस्टर अलर्ट और प्रकोप पृष्ठ। आपके खेत से 4.8 किलोमीटर की दूरी पर फफूंद जनित पत्ती धब्बा रोग का क्लस्टर सक्रिय है। इस क्षेत्र के 18 खेतों में लक्षण देखे गए हैं। आसपास के सभी किसानों को सलाह दी जाती है कि तुरंत एहतियाती छिड़काव करें।',
    quickTips: [
      { en: 'Coordinate with neighboring farmers for simultaneous preventive spraying.', hi: 'पड़ोसी किसानों के साथ मिलकर एक ही समय पर छिड़काव करें ताकि कीट एक खेत से दूसरे में न भागें।' }
    ]
  },

  'crop-health': {
    pageId: 'crop-health',
    title: 'Crop Health Status & Diagnostics',
    hindiTitle: 'फसल स्वास्थ्य स्थिति व रिपोर्ट',
    subtitle: 'Comprehensive agronomic health indicators, canopy vigor metrics, and diagnosis history.',
    hindiSubtitle: 'फसल की संपूर्ण सेहत, पत्तियों का हरापन, पिछली जांचें और सुधार की स्थिति।',
    category: 'Diagnostics',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Overall Crop Health Score',
        hindiTitle: 'कुल फसल स्वास्थ्य स्कोर',
        description: 'Aggregated percentage combining visual canopy vigor, soil metrics, and microclimate risk.',
        hindiDescription: 'आपकी फसल का समग्र स्वास्थ्य स्कोर जो पत्तियों, मिट्टी और मौसम के आधार पर तैयार होता है।',
        badge: 'Score'
      },
      {
        stepNumber: 2,
        title: 'Pathogen Vulnerability Index',
        hindiTitle: 'रोग लगने की संभावना सूचकांक',
        description: 'Predictive risk for specific diseases like Cercospora, Anthracnose, and Aphid infestation.',
        hindiDescription: 'आगामी दिनों में किन-किन बीमारियों के आने की संभावना अधिक है, उसका विवरण।',
        badge: 'Risk'
      },
      {
        stepNumber: 3,
        title: 'Recent Diagnostic Records',
        hindiTitle: 'हालिया स्कैन और जांच रिकॉर्ड',
        description: 'Audit trail of previous leaf scans with comparative healing progress.',
        hindiDescription: 'पिछले स्कैन के परिणाम और दवा छिड़कने के बाद फसल में हुए सुधार की स्थिति।',
        badge: 'History'
      }
    ],
    readAloudSummary: 'Crop Health Status overview. Your Cotton crop health is rated at 74 percent, which is in the Moderate category. High humidity has increased susceptibility to fungal spore germination. Follow the recommended nutrient and protection schedule to improve canopy vigor.',
    hindiReadAloudSummary: 'फसल स्वास्थ्य स्थिति अवलोकन। आपकी कपास की फसल का स्वास्थ्य स्कोर 74 प्रतिशत है। अधिक नमी के कारण पत्तों पर बीमारी का खतरा बना हुआ है। फसल को स्वस्थ रखने के लिए सुझाए गए पोषण और बचाव के उपाय अपनाएं।',
    quickTips: [
      { en: 'Conduct a follow-up scan 5 days after applying treatments to track recovery.', hi: 'दवा के छिड़काव के 5 दिन बाद दोबारा स्कैन करके फसल के सुधार की जांच करें।' }
    ]
  },

  'gis-map': {
    pageId: 'gis-map',
    title: 'District GIS Hotspot Map',
    hindiTitle: 'जिला प्रकोप व जीआईएस नक्शा',
    subtitle: 'Geospatial epidemiological map with disease clustering, weather overlays, and containment zones.',
    hindiSubtitle: 'पूरे जिले का नक्शा, बीमारियों के हॉटस्पॉट, मौसम का असर और नियंत्रण क्षेत्र।',
    category: 'District GIS',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Interactive Hotspot Layer',
        hindiTitle: 'हॉटस्पॉट मैप लेयर्स',
        description: 'Color-coded disease clusters showing low, moderate, and critical outbreak zones.',
        hindiDescription: 'नक्शे पर लाल, पीले और हरे रंगों में बीमारियों के कम या ज्यादा फैलाव वाले क्षेत्र।',
        badge: 'Heatmap'
      },
      {
        stepNumber: 2,
        title: 'Block Vulnerability Statistics',
        hindiTitle: 'तहसील अनुसार आंकड़े',
        description: 'Displays verified infection counts, risk velocity, and hectares affected per block.',
        hindiDescription: 'प्रत्येक ब्लॉक में प्रभावित एकड़ जमीन और संक्रमित मामलों की वास्तविक संख्या।',
        badge: 'Stats'
      },
      {
        stepNumber: 3,
        title: 'Weather Radar Overlays',
        hindiTitle: 'मौसम व वर्षा रडार',
        description: 'Overlay live Doppler rain radar and humidity contours onto agricultural land.',
        hindiDescription: 'नक्शे पर बारिश के बादलों और तेज हवा की दिशा का लाइव दृश्य।',
        badge: 'Radar'
      }
    ],
    readAloudSummary: 'District GIS Hotspot Map. Visualizing pest and disease distribution across Indore district. There are currently 4 active clusters in Sanwer, Depalpur, and Hatod blocks. The dominant pathogen is Cercospora Leaf Spot in Soybean, with an estimated spread rate of 1.2 kilometers per day.',
    hindiReadAloudSummary: 'जिला प्रकोप व जीआईएस नक्शा। इंदौर जिले के सभी तहसीलों में फसल रोगों का नक्शा। सांवेर और देपालपुर में 4 मुख्य हॉटस्पॉट बने हुए हैं। बीमारी के फैलाव को रोकने के लिए विभाग द्वारा निगरानी रखी जा रही है।',
    quickTips: [
      { en: 'Zoom in on red hotspot clusters to inspect individual farm parcel reports.', hi: 'लाल रंग के हॉटस्पॉट पर जूम करके प्रभावित खेतों की विस्तृत जानकारी देखें।' }
    ]
  },

  'profile': {
    pageId: 'profile',
    title: 'Farmer Profile & Voice Settings',
    hindiTitle: 'किसान प्रोफ़ाइल व वॉइस सेटिंग्स',
    subtitle: 'Manage your farmer identity, preferred advisory language, voice narration speed, and farm details.',
    hindiSubtitle: 'अपनी प्रोफ़ाइल, पसंदीदा भाषा, बोलने की गति और पंजीकृत खेत की जानकारी प्रबंधित करें।',
    category: 'Settings',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Language & Voice Preferences',
        hindiTitle: 'भाषा व आवाज की प्राथमिकता',
        description: 'Choose from 11 Indian languages and customize text-to-speech readout speed.',
        hindiDescription: '11 भारतीय भाषाओं में से अपनी भाषा चुनें और आवाज की गति तय करें।',
        badge: 'Language'
      },
      {
        stepNumber: 2,
        title: 'Farmer & Village Identity',
        hindiTitle: 'किसान का नाम व गांव',
        description: 'Update phone number, state, district, and village for localized agronomic advisories.',
        hindiDescription: 'अपना नाम, मोबाइल नंबर और गांव का पता अपडेट करें।',
        badge: 'Profile'
      },
      {
        stepNumber: 3,
        title: 'Offline Storage & Device Cache',
        hindiTitle: 'ऑफलाइन डेटा और मेमोरी',
        description: 'View saved offline scans, sync pending records, and manage cached AI weights.',
        hindiDescription: 'फोन में सुरक्षित ऑफलाइन स्कैन और एआई मॉडल की मेमोरी की स्थिति।',
        badge: 'Storage'
      }
    ],
    readAloudSummary: 'Farmer Profile and Settings page. Review your account credentials, preferred advisory language, and speech synthesis rate. You can customize accessibility options or sync offline farm data to the cloud at any time.',
    hindiReadAloudSummary: 'किसान प्रोफ़ाइल व सेटिंग्स पेज। यहां आप अपनी भाषा, आवाज की गति और खेत की जानकारी बदल सकते हैं। जरूरत पड़ने पर ऑफलाइन डेटा को क्लाउड से सिंक भी कर सकते हैं।',
    quickTips: [
      { en: 'Set speech rate to Slow if you prefer calm, deliberate voice guidance.', hi: 'यदि आप धीमी और स्पष्ट आवाज सुनना चाहते हैं, तो गति को धीमा (0.8x) पर सेट करें।' }
    ]
  }
};

export const getPageGuideConfig = (pageId: string): PageGuideConfig => {
  if (PAGE_GUIDE_REGISTRY[pageId]) {
    return PAGE_GUIDE_REGISTRY[pageId];
  }

  // Sensible default fallback for any dynamic or officer sub-tab
  return {
    pageId,
    title: formatTabTitle(pageId),
    hindiTitle: `${formatTabTitle(pageId)} (पृष्ठ गाइड)`,
    subtitle: 'Overview of features, telemetry data, and guided actions available on this screen.',
    hindiSubtitle: 'इस स्क्रीन पर उपलब्ध सभी सुविधाओं, आंकड़ों और दिशा-निर्देशों का संक्षिप्त विवरण।',
    category: 'System View',
    tourSteps: [
      {
        stepNumber: 1,
        title: 'Page Purpose & Content',
        hindiTitle: 'पेज का उद्देश्य और जानकारी',
        description: 'Displays targeted agricultural intelligence and interactive controls for this section.',
        hindiDescription: 'इस अनुभाग में कृषि से जुड़ी महत्वपूर्ण जानकारी और नियंत्रण विकल्प दिए गए हैं।',
        badge: 'Overview'
      },
      {
        stepNumber: 2,
        title: 'Interactive Actions & Controls',
        hindiTitle: 'कार्य और विकल्प',
        description: 'Use the buttons and filters on this page to analyze records or execute workflows.',
        hindiDescription: 'स्क्रीन पर मौजूद बटनों और फिल्टर का उपयोग करके अपनी आवश्यकतानुसार कार्य करें।',
        badge: 'Controls'
      },
      {
        stepNumber: 3,
        title: 'Voice & Language Support',
        hindiTitle: 'आवाज और भाषा सहायता',
        description: 'You can listen to this page anytime using the top voice guide button in your mother tongue.',
        hindiDescription: 'आप शीर्ष पर दिए गए वॉइस गाइड बटन से कभी भी इस पेज की जानकारी अपनी भाषा में सुन सकते हैं।',
        badge: 'Voice'
      }
    ],
    readAloudSummary: `You are viewing the ${formatTabTitle(pageId)} page in Digital KrishiVaani. This screen provides specialized agronomic intelligence, data tables, and interactive management tools. You can listen to the guided walkthrough or explore the page controls.`,
    hindiReadAloudSummary: `आप डिजिटल कृषिवाणी का ${formatTabTitle(pageId)} पेज देख रहे हैं। यहां कृषि डेटा, तालिकाएं और प्रबंधन उपकरण उपलब्ध हैं। आप इस गाइड को सुनकर या बटनों का उपयोग करके आगे बढ़ सकते हैं।`,
    quickTips: [
      { en: 'Use the top navigation bar to switch personas or open voice tools.', hi: 'अन्य सुविधाएं देखने के लिए ऊपर दिए गए नेविगेशन बार का उपयोग करें।' }
    ]
  };
};

function formatTabTitle(tab: string): string {
  return tab
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
