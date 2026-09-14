import React, { useState, useEffect } from 'react';
import { DiagnosisResult, UserRole } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { StorageService } from '../../services/storageService';
import { VoicePlayer } from '../common/VoicePlayer';
import { KrishiRakshakLogo } from '../common/KrishiRakshakLogo';
import { I18nService, SupportedLanguageCode } from '../../services/i18nService';
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
  Activity,
  WifiOff
} from 'lucide-react';

interface AiDiagnosisResultProps {
  diagnosis: DiagnosisResult;
  onNavigate: (tab: string, extra?: any) => void;
  onSwitchRole?: (role: UserRole) => void;
  onRescan: () => void;
  onOpenVaani?: () => void;
}

// Comprehensive localized content dictionary
const DIAGNOSIS_I18N: Record<string, {
  headerTitle: string;
  headerSubtitle: string;
  rescanBtn: string;
  lowConfTitle: string;
  lowConfDesc: string;
  sendToExpertBtn: string;
  sentToExpertBtn: string;
  segmentedLesion: string;
  cropFieldLabel: string;
  pathogenSuffix: string;
  detectedTitle: string;
  healthScoreLabel: string;
  healthStatusHealthy: string;
  healthStatusAttention: string;
  healthStatusHighRisk: string;
  aiConfidenceLabel: string;
  complianceMeetsStandard: string;
  complianceNeedsVerify: string;
  listenReportLabel: string;
  whyAtRiskTitle: string;
  multimodalEngineBadge: string;
  whyAtRiskDesc: string;
  weatherImpactLabel: string;
  weatherImpactNote: string;
  cropStageLabel: string;
  cropStageValue: string;
  cropStageNote: string;
  hotspotsLabel: string;
  hotspotsValue: string;
  hotspotsNote: string;
  ipmTitle: string;
  ipmBadge: string;
  bioTitle: string;
  bioDesc: string;
  culturalTitle: string;
  culturalDesc: string;
  chemicalTitle: string;
  chemicalDesc: string;
  btnAskVaani: string;
  btnAskExpert: string;
  btnScheduleFollowUp: string;
  safetyNotice: string;
}> = {
  en: {
    headerTitle: 'Crop Health Analysis (Diagnosis Result)',
    headerSubtitle: '“Aapka AI Krishi Saathi” • Multimodal AI Diagnostic Analysis + Verification',
    rescanBtn: 'Scan Another Leaf',
    lowConfTitle: 'AI Confidence Below Safety Threshold',
    lowConfDesc: 'Expert agronomist verification recommended before applying chemical sprays. An agricultural scientist will review this case to prevent misdiagnosis.',
    sendToExpertBtn: 'Send to Agronomist (1-Tap Send)',
    sentToExpertBtn: 'Sent to Agronomist ✓',
    segmentedLesion: 'Segmented Lesion',
    cropFieldLabel: 'Crop: Cotton / Soybean (Field A)',
    pathogenSuffix: 'Infection',
    detectedTitle: 'Detected Disease / Pest Observation',
    healthScoreLabel: 'Crop Health Score',
    healthStatusHealthy: '🟢 Healthy / Under Control',
    healthStatusAttention: '🟡 Needs Attention / Early Blight',
    healthStatusHighRisk: '🔴 High Risk / Immediate Action Needed',
    aiConfidenceLabel: 'AI Model Confidence',
    complianceMeetsStandard: 'Meets Safety Standards',
    complianceNeedsVerify: 'Agronomist Confirmation Required',
    listenReportLabel: 'Listen to Full Audio Report',
    whyAtRiskTitle: 'Why is my crop at risk?',
    multimodalEngineBadge: 'Multimodal Risk Engine',
    whyAtRiskDesc: 'Our AI does not rely solely on photos. It calculates real-world risk by fusing crop phenology stage, ambient humidity, past disease history, and localized regional outbreak hotspots:',
    weatherImpactLabel: 'Weather Impact',
    weatherImpactNote: 'Conducive micro-climate for fungal spore propagation',
    cropStageLabel: 'Crop Growth Stage',
    cropStageValue: 'Flowering & Pod Formation Stage',
    cropStageNote: 'High vulnerability developmental window',
    hotspotsLabel: 'Nearby Outbreak Hotspots',
    hotspotsValue: '14 Reports in Sanwer Block',
    hotspotsNote: 'Moderate Regional Spread Risk',
    ipmTitle: 'Recommended Action & Safe IPM Guidance',
    ipmBadge: 'Safe & Non-Toxic First',
    bioTitle: '1. Biological Control (Recommended First):',
    bioDesc: 'Spray Trichoderma viride @ 5 g/litre of water or cold-pressed Neem Oil (10,000 PPM) @ 3 ml/litre in cool evening hours to suppress fungal pathogen load safely.',
    culturalTitle: '2. Cultural & Field Management:',
    culturalDesc: 'Prune and safely bury heavily infected lower leaves away from the field. Avoid excess nitrogen/urea fertilizer and ensure proper field drainage to prevent water stagnation.',
    chemicalTitle: '3. Chemical Alternative (Only if severity exceeds 15% threshold):',
    chemicalDesc: 'Apply University-recommended Hexaconazole 5% EC (2 ml/L) or Tebuconazole 25.9% EC with personal protective equipment, adhering strictly to waiting periods.',
    btnAskVaani: 'Ask VAANI Voice Assistant',
    btnAskExpert: 'Consult Agronomist',
    btnScheduleFollowUp: 'Schedule Follow-up Monitoring',
    safetyNotice: '⚠️ KrishiRakshak AI assistance is for guidance only. Always consult a local agronomist or refer to certified CIBRC product labels before chemical application.'
  },
  hi: {
    headerTitle: 'स्कैन परिणाम (Crop Health Analysis)',
    headerSubtitle: '“आपका एआई कृषि साथी” • मल्टीमॉडल एआई विश्लेषण + सत्यापन',
    rescanBtn: 'दूसरी पत्ती स्कैन करें',
    lowConfTitle: 'एआई विश्वसनीयता सामान्य से कम (पुष्टि आवश्यक)',
    lowConfDesc: 'कृषि वैज्ञानिक से सत्यापन की सलाह दी जाती है। गलत दवा के छिड़काव से बचने के लिए विशेषज्ञ जांच कराएं।',
    sendToExpertBtn: 'कृषि वैज्ञानिक को भेजें (1-टैप)',
    sentToExpertBtn: 'विशेषज्ञ को भेज दिया गया ✓',
    segmentedLesion: 'पहचाने गए धब्बे',
    cropFieldLabel: 'फसल: कपास / सोयाबीन (खेत A)',
    pathogenSuffix: 'संक्रमण',
    detectedTitle: 'पहचाना गया रोग / कीट लक्षण',
    healthScoreLabel: 'फसल स्वास्थ्य स्कोर',
    healthStatusHealthy: '🟢 स्वस्थ / नियंत्रण में',
    healthStatusAttention: '🟡 ध्यान देने योग्य / प्रारंभिक लक्षण',
    healthStatusHighRisk: '🔴 उच्च जोखिम / तत्काल कार्रवाई',
    aiConfidenceLabel: 'एआई मॉडल विश्वसनीयता',
    complianceMeetsStandard: 'सुरक्षा मानक के अनुरूप',
    complianceNeedsVerify: 'पुष्टि आवश्यक',
    listenReportLabel: 'पूरी रिपोर्ट आवाज में सुनें',
    whyAtRiskTitle: 'मेरी फसल जोखिम में क्यों है? (यह जोखिम क्यों बढ़ा?)',
    multimodalEngineBadge: 'मल्टीमॉडल जोखिम इंजन',
    whyAtRiskDesc: 'हमारा एआई केवल फोटो देखकर निर्णय नहीं लेता, बल्कि फसल अवस्था, मौसम की नमी, पिछले इतिहास और आसपास के मामलों को मिलाकर वास्तविक जोखिम की गणना करता है:',
    weatherImpactLabel: 'मौसम प्रभाव (Weather Impact)',
    weatherImpactNote: 'अनुकूल फंगल फैलाव वातावरण',
    cropStageLabel: 'फसल वृद्धि अवस्था (Crop Stage)',
    cropStageValue: 'फूल आना व फली बनना (Pod Development)',
    cropStageNote: 'अति संवेदनशील विकास अवस्था',
    hotspotsLabel: 'निकटतम क्षेत्र मामले (Hotspots)',
    hotspotsValue: 'सांवेर ब्लॉक में 14 रिपोर्ट',
    hotspotsNote: 'क्षेत्रीय जोखिम मध्यम',
    ipmTitle: 'अनुशंसित कार्रवाई एवं सुरक्षित फसल सुरक्षा (IPM)',
    ipmBadge: 'सुरक्षित एवं जैविक उपाय पहले',
    bioTitle: '1. जैविक नियंत्रण (सबसे पहले अपनाएं):',
    bioDesc: 'ट्राइकोडर्मा विरिडी (Trichoderma viride) 5 ग्राम प्रति लीटर पानी या नीम तेल (10,000 PPM) 3 मिली प्रति लीटर का शाम के समय छिड़काव करें।',
    culturalTitle: '2. खेत प्रबंधन (Cultural/Mechanical):',
    culturalDesc: 'संक्रमित निचली पत्तियों को तोड़कर खेत से दूर मिट्टी में दबाएं। अधिक यूरिया का प्रयोग रोकें व जल निकासी सुधारें।',
    chemicalTitle: '3. रासायनिक विकल्प (यदि प्रकोप 15% से अधिक हो):',
    chemicalDesc: 'हेक्साकोनाजोल 5% EC (2 मिली/लीटर) या टेबुकोनाजोल 25.9% EC का अनुशंसित मात्रा में छिड़काव करें। प्रतीक्षा अवधि का पालन करें।',
    btnAskVaani: 'वाणी से सवाल पूछें',
    btnAskExpert: 'कृषि विशेषज्ञ से पूछें',
    btnScheduleFollowUp: 'पुनः निगरानी शेड्यूल करें',
    safetyNotice: '⚠️ कृषिरक्षक एआई सहायता केवल मार्गदर्शन के लिए है। किसी भी रासायनिक प्रयोग से पहले स्थानीय कृषि मित्र या उत्पाद लेबल का पालन करें।'
  },
  mr: {
    headerTitle: 'तपासणी निकाल (Crop Health Analysis)',
    headerSubtitle: '“आपला एआय कृषी साथी” • बहुआयामी एआय विश्लेषण + पडताळणी',
    rescanBtn: 'दुसरे पान स्कॅन करा',
    lowConfTitle: 'एआय विश्वासार्हता कमी (तपासणी आवश्यक)',
    lowConfDesc: 'रासायनिक फवारणीपूर्वी कृषी तज्ज्ञांकडून पडताळणीची शिफारस केली जाते. चुकीचे औषध टाळण्यासाठी तज्ज्ञांची तपासणी करा.',
    sendToExpertBtn: 'कृषी तज्ज्ञांकडे पाठवा (1-टॅप)',
    sentToExpertBtn: 'तज्ज्ञांकडे पाठवले आहे ✓',
    segmentedLesion: 'ओळखलेले ठिपके',
    cropFieldLabel: 'पीक: कापूस / सोयाबीन (शेत A)',
    pathogenSuffix: 'संसर्ग',
    detectedTitle: 'ओळखलेला रोग / कीड लक्षण',
    healthScoreLabel: 'पीक आरोग्य स्कोअर',
    healthStatusHealthy: '🟢 निरोगी / नियंत्रणात',
    healthStatusAttention: '🟡 लक्ष देणे गरजेचे',
    healthStatusHighRisk: '🔴 उच्च धोका / तातडीने उपाय करा',
    aiConfidenceLabel: 'एआय मॉडेल विश्वासार्हता',
    complianceMeetsStandard: 'सुरक्षा मानकांनुसार योग्य',
    complianceNeedsVerify: 'तज्ज्ञ पडताळणी आवश्यक',
    listenReportLabel: 'संपूर्ण अहवाल आवाजात ऐका',
    whyAtRiskTitle: 'माझे पीक धोक्यात का आहे? (हा धोका का वाढला?)',
    multimodalEngineBadge: 'मल्टीमॉडल जोखीम इंजिन',
    whyAtRiskDesc: 'आमचा एआय केवळ फोटो पाहून निर्णय घेत नाही, तर पिकाची वाढीची अवस्था, हवेतील आर्द्रता, जुना इतिहास आणि परिसरातील प्रादुर्भाव एकत्र करून खऱ्या धोक्याची गणना करतो:',
    weatherImpactLabel: 'हवामान प्रभाव (Weather Impact)',
    weatherImpactNote: 'बुरशीच्या वाढीसाठी अनुकूल वातावरण',
    cropStageLabel: 'पिकाची वाढीची अवस्था (Crop Stage)',
    cropStageValue: 'फुलोरा व बोंड/शेंगा निर्मिती',
    cropStageNote: 'अतिसंवेदनशील वाढीचा काळ',
    hotspotsLabel: 'जवळपासचे प्रादुर्भाव क्षेत्र (Hotspots)',
    hotspotsValue: 'सांवेर ब्लॉकमध्ये 14 अहवाल',
    hotspotsNote: 'स्थानिक प्रादुर्भाव धोका मध्यम',
    ipmTitle: 'शिफारस केलेली कृती आणि सुरक्षित पीक संरक्षण (IPM)',
    ipmBadge: 'सुरक्षित आणि सेंद्रिय उपाय प्रथम',
    bioTitle: '1. जैविक नियंत्रण (सर्वात आधी करा):',
    bioDesc: 'ट्रायकोडर्मा व्हिरिडी 5 ग्रॅम प्रति लिटर पाणी किंवा निंबोळी अर्क (10,000 PPM) 3 मिली प्रति लिटर संध्याकाळी फवारा.',
    culturalTitle: '2. शेती व्यवस्थापन (सांस्कृतिक/यांत्रिकी):',
    culturalDesc: 'संक्रमित झालेली खालची पाने काढून शेताबाहेर खड्ड्यात पुरा. अतिरिक्त युरियाचा वापर टाळा आणि शेतात पाण्याचा निचरा योग्य ठेवा.',
    chemicalTitle: '3. रासायनिक पर्याय (प्रादुर्भाव 15% पेक्षा जास्त असल्यास):',
    chemicalDesc: 'हेक्साकोनाझोल 5% EC (2 मिली/लिटर) किंवा टेबुकोनाझोल 25.9% EC मास्क घालून शिफारस केलेल्या प्रमाणातच फवारा.',
    btnAskVaani: 'वाणीशी बोला (आवाजात विचारा)',
    btnAskExpert: 'कृषी शास्त्रज्ञांचा सल्ला घ्या',
    btnScheduleFollowUp: 'पुन्हा तपासणी शेड्युल करा',
    safetyNotice: '⚠️ कृषिरक्षक एआय केवळ मार्गदर्शनासाठी आहे. कोणत्याही रासायनिक फवारणीपूर्वी मान्यताप्राप्त लेबल आणि कृषी सहाय्यकांचा सल्ला घ्या.'
  },
  gu: {
    headerTitle: 'તપાસ પરિણામ (Crop Health Analysis)',
    headerSubtitle: '“તમારો એઆઈ કૃષિ સાથી” • બહુઆયામી એઆઈ વિશ્લેષણ',
    rescanBtn: 'બીજું પાંદડું સ્કેન કરો',
    lowConfTitle: 'એઆઈ વિશ્વસનીયતા ઓછી (ચકાસણી જરૂરી)',
    lowConfDesc: 'રાસાયણિક છંટકાવ પહેલાં કૃષિ વૈજ્ઞાનિક પાસે ચકાસણીની ભલામણ કરવામાં આવે છે.',
    sendToExpertBtn: 'કૃષિ વૈજ્ઞાનિકને મોકલો (1-ટેપ)',
    sentToExpertBtn: 'નિષ્ણાતને મોકલાઈ ગયું ✓',
    segmentedLesion: 'ઓળખાયેલા ડાઘ',
    cropFieldLabel: 'પાક: કપાસ / સોયાબીન (ખેતર A)',
    pathogenSuffix: 'ચેપ',
    detectedTitle: 'ઓળખાયેલ રોગ / જીવાત',
    healthScoreLabel: 'પાક આરોગ્ય સ્કોર',
    healthStatusHealthy: '🟢 સ્વસ્થ / નિયંત્રણમાં',
    healthStatusAttention: '🟡 ધ્યાન આપવાની જરૂર',
    healthStatusHighRisk: '🔴 ઉચ્ચ જોખમ / તાત્કાલિક પગલાં',
    aiConfidenceLabel: 'એઆઈ મોડેલ વિશ્વસનીયતા',
    complianceMeetsStandard: 'સુરક્ષા ધોરણ મુજબ',
    complianceNeedsVerify: 'ચકાસણી જરૂરી',
    listenReportLabel: 'આખો અહેવાલ અવાજમાં સાંભળો',
    whyAtRiskTitle: 'મારો પાક જોખમમાં કેમ છે? (આ જોખમ કેમ વધ્યું?)',
    multimodalEngineBadge: 'મલ્ટીમોડલ જોખમ એન્જિન',
    whyAtRiskDesc: 'અમારું એઆઈ માત્ર ફોટો જોઈને નિર્ણય લેતું નથી, પરંતુ પાકની વૃદ્ધિ, હવામાનની ભેજ અને આસપાસના કેસોને જોડીને જોખમ નક્કી કરે છે:',
    weatherImpactLabel: 'હવામાન પ્રભાવ (Weather Impact)',
    weatherImpactNote: 'ફંગલ ફેલાવા માટે અનુકૂળ વાતાવરણ',
    cropStageLabel: 'પાક વૃદ્ધિ તબક્કો (Crop Stage)',
    cropStageValue: 'ફૂલ અને શીંગ નિર્માણ (Pod Development)',
    cropStageNote: 'અતિ સંવેદનશીલ તબક્કો',
    hotspotsLabel: 'નજીકના રોગચાળાના કેસ (Hotspots)',
    hotspotsValue: 'સાંવેર બ્લોકમાં 14 અહેવાલ',
    hotspotsNote: 'પ્રાદેશિક જોખમ મધ્યમ',
    ipmTitle: 'ભલામણ કરેલ પગલાં અને સુરક્ષિત પાક સંરક્ષણ (IPM)',
    ipmBadge: 'સુરક્ષિત અને જૈવિક ઉપાય પ્રથમ',
    bioTitle: '1. જૈવિક નિયંત્રણ (સૌ પ્રથમ અપનાવો):',
    bioDesc: 'ટ્રાઇકોડર્મા વિરીડી 5 ગ્રામ પ્રતિ લીટર અથવા લીમડાનું તેલ (10,000 PPM) 3 મિલી સાંજે છાંટો.',
    culturalTitle: '2. ખેતર વ્યવસ્થાપન (Cultural/Mechanical):',
    culturalDesc: 'ચેપગ્રસ્ત નીચલા પાંદડા તોડી ખેતરથી દૂર દાટો. વધુ યુરિયા ટાળો અને પાણી નિકાલ સુધારો.',
    chemicalTitle: '3. રાસાયણિક વિકલ્પ (જો ઉપદ્રવ 15% થી વધુ હોય):',
    chemicalDesc: 'હેક્સાકોનાઝોલ 5% EC (2 મિલી/લીટર) ભલામણ કરેલ માત્રામાં જ છાંટો.',
    btnAskVaani: 'વાણીને પ્રશ્ન પૂછો',
    btnAskExpert: 'કૃષિ નિષ્ણાતને પૂછો',
    btnScheduleFollowUp: 'ફરીથી તપાસણી શેડ્યૂલ કરો',
    safetyNotice: '⚠️ કૃષિરક્ષક એઆઈ સહાય માત્ર માર્ગદર્શન માટે છે. કોઈપણ રાસાયણિક ઉપયોગ પહેલાં કૃષિ અધિકારીની સલાહ લો.'
  },
  te: {
    headerTitle: 'పంట ఆరోగ్య విశ్లేషణ (Crop Health Analysis)',
    headerSubtitle: '“మీ AI కృషి సాథి” • మల్టీమోడల్ నిర్ధారణ + శాస్త్రవేత్త ధృవీకరణ',
    rescanBtn: 'మరో ఆకును స్కాన్ చేయండి',
    lowConfTitle: 'AI విశ్వసనీయత తక్కువగా ఉంది (ధృవీకరణ అవసరం)',
    lowConfDesc: 'రసాయన మందుల పిచికారీకి ముందు వ్యవసాయ శాస్త్రవేత్త ధృవీకరణ సిఫార్సు చేయబడింది.',
    sendToExpertBtn: 'శాస్త్రవేత్తకు పంపండి (1-ట్యాప్)',
    sentToExpertBtn: 'నిపుణుడికి పంపబడింది ✓',
    segmentedLesion: 'గుర్తించిన మచ్చలు',
    cropFieldLabel: 'పంట: పత్తి / సోయాబీన్ (పొలం A)',
    pathogenSuffix: 'తెగులు',
    detectedTitle: 'గుర్తించిన తెగులు / పురుగు లక్షణం',
    healthScoreLabel: 'పంట ఆరోగ్య స్కోరు',
    healthStatusHealthy: '🟢 ఆరోగ్యకరం / అదుపులో ఉంది',
    healthStatusAttention: '🟡 శ్రద్ధ అవసరం / ప్రారంభ లక్షణాలు',
    healthStatusHighRisk: '🔴 అధిక ప్రమాదం / తక్షణ చర్య అవసరం',
    aiConfidenceLabel: 'AI మోడల్ విశ్వసనీయత',
    complianceMeetsStandard: 'భద్రతా ప్రమాణాలకు అనుగుణంగా ఉంది',
    complianceNeedsVerify: 'ధృవీకరణ అవసరం',
    listenReportLabel: 'పూర్తి నివేదికను వినండి',
    whyAtRiskTitle: 'నా పంట ఎందుకు ప్రమాదంలో ఉంది? (ఈ ప్రమాదం ఎందుకు పెరిగింది?)',
    multimodalEngineBadge: 'మల్టీమోడల్ రిస్క్ ఇంజిన్',
    whyAtRiskDesc: 'మా AI ఫోటో మాత్రమే చూడదు; పంట దశ, వాతావరణంలో తేమ, గత చరిత్ర మరియు సమీప వ్యాప్తిని కలిపి అసలైన ప్రమాదాన్ని లెక్కిస్తుంది:',
    weatherImpactLabel: 'వాతావరణ ప్రభావం (Weather Impact)',
    weatherImpactNote: 'శిలీంధ్రాల వ్యాప్తికి అనుకూల వాతావరణం',
    cropStageLabel: 'పంట పెరుగుదల దశ (Crop Stage)',
    cropStageValue: 'పూత మరియు కాయ దశ (Pod Development)',
    cropStageNote: 'అత్యంత సున్నితమైన దశ',
    hotspotsLabel: 'సమీప వ్యాప్తి ప్రాంతాలు (Hotspots)',
    hotspotsValue: 'సాంవేర్ బ్లాక్‌లో 14 నివేదికలు',
    hotspotsNote: 'ప్రాంతీయ ప్రమాదం మధ్యస్థం',
    ipmTitle: 'సిఫార్సు చేసిన చర్యలు & సురక్షిత పంట రక్షణ (IPM)',
    ipmBadge: 'సురక్షిత మరియు సేంద్రీయ పరిష్కారం మొదట',
    bioTitle: '1. జీవ నియంత్రణ (మొదట పాటించండి):',
    bioDesc: 'ట్రైకోడెర్మా విరిడే 5 గ్రా/లీ లేదా వేప నూనె (10,000 PPM) 3 మి.లీ/లీ సాయంత్రం వేళల్లో పిచికారీ చేయండి.',
    culturalTitle: '2. పొలం యాజమాన్యం (Cultural/Mechanical):',
    culturalDesc: 'సోకిన ఆకులను తీసివేసి గుంతలో పూడ్చండి. అధిక యూరియా వినియోగాన్ని ఆపండి, నీటి పారుదల మెరుగుపరచండి.',
    chemicalTitle: '3. రసాయన ప్రత్యామ్నాయం (తీవ్రత 15% మించి ఉంటే మాత్రమే):',
    chemicalDesc: 'హెక్సాకోనాజోల్ 5% EC (2 మి.లీ/లీ) లేదా టెబుకోనాజోల్ సిఫార్సు చేసిన మోతాదులో మాత్రమే వాడండి.',
    btnAskVaani: 'వాణితో మాట్లాడండి',
    btnAskExpert: 'వ్యవసాయ నిపుణుడిని అడగండి',
    btnScheduleFollowUp: 'మళ్లీ పరిశీలన షెడ్యూల్ చేయండి',
    safetyNotice: '⚠️ కృషీరక్షక్ AI సలహా కేవలం మార్గదర్శకత్వం కొరకు మాత్రమే. రసాయనాలను వాడే ముందు వ్యవసాయ అధికారిని సంప్రదించండి.'
  }
};

export const AiDiagnosisResult: React.FC<AiDiagnosisResultProps> = ({
  diagnosis,
  onNavigate,
  onSwitchRole,
  onRescan,
  onOpenVaani
}) => {
  const [currentLang, setCurrentLang] = useState<SupportedLanguageCode>(I18nService.getCurrentLanguage());
  const [isEscalated, setIsEscalated] = useState(false);

  // Subscribe to language changes so this view responds instantly to header language switch
  useEffect(() => {
    const unsub = I18nService.subscribe(langCode => {
      setCurrentLang(langCode);
    });
    return unsub;
  }, []);

  const isConfidenceLow = diagnosis.confidence < 75 || diagnosis.needsExpertReview;

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

  // Pick language pack (default to English if chosen or fallback)
  const isEn = currentLang === 'en';
  const t = DIAGNOSIS_I18N[currentLang] || (isEn ? DIAGNOSIS_I18N['en'] : DIAGNOSIS_I18N['hi']);

  // Extract clean humidity value without the symptom pattern string bug
  const extractCleanHumidity = (): string => {
    const humidityFactor = diagnosis.evidenceFactors?.find(f =>
      f.label.toLowerCase().includes('humidity') ||
      f.label.toLowerCase().includes('नमी') ||
      f.label.toLowerCase().includes('rh')
    );
    if (humidityFactor) {
      const match = humidityFactor.value.match(/\d+%/);
      if (match) return match[0];
    }
    return '78%';
  };

  const cleanHumidity = extractCleanHumidity();
  const weatherImpactValue = isEn
    ? `Relative Humidity ${cleanHumidity} RH & Temp 28°C`
    : currentLang === 'mr'
    ? `हवेतील आर्द्रता ${cleanHumidity} RH आणि तापमान 28°C`
    : `हवा में नमी ${cleanHumidity} RH व तापमान 28°C`;

  // Voice narration text localized to selected language
  const voiceSummary = isEn
    ? `Crop Diagnostic Report: Primary condition detected is ${diagnosis.diseaseName}. Crop health score is ${cropHealthScore} out of 100, with a ${riskLevelText} risk level. AI diagnostic confidence is ${diagnosis.confidence} percent. Recommended action: Apply Trichoderma viride or neem oil at recommended dosages in the cool evening hours.`
    : currentLang === 'mr'
    ? `पीक विश्लेषण अहवाल: मुख्य रोग ${diagnosis.diseaseName} आढळला आहे. पीक आरोग्य स्कोअर ${cropHealthScore} आहे आणि जोखीम पातळी ${riskLevelText} आहे. एआय विश्वासार्हता ${diagnosis.confidence} टक्के आहे. सुरक्षित सल्ला: संध्याकाळी ट्रायकोडर्मा किंवा निंबोळी अर्काची फवारणी करा.`
    : `फसल विश्लेषण रिपोर्ट: मुख्य रोग ${diagnosis.diseaseName} पाया गया है। फसल स्वास्थ्य स्कोर ${cropHealthScore} है और जोखिम स्तर ${riskLevelText} है। एआई विश्वसनीयता ${diagnosis.confidence} प्रतिशत है। अनुशंसित सलाह: ट्राइकोडर्मा या नीम तेल का 5 मिली प्रति लीटर पानी में शाम के समय छिड़काव करें।`;

  const voiceLangCode = isEn ? 'English' : currentLang === 'mr' ? 'Marathi' : currentLang === 'te' ? 'Telugu' : 'Hindi';

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
              <span className="font-display font-extrabold text-base sm:text-lg">{t.headerTitle}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Case #{diagnosis.caseId}
              </span>
            </div>
            <p className="text-xs text-emerald-200/80">{t.headerSubtitle}</p>
          </div>
        </div>

        <button
          onClick={onRescan}
          type="button"
          className="text-xs font-bold text-emerald-100 hover:text-white px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-emerald-300" />
          <span>{t.rescanBtn}</span>
        </button>
      </div>

      {/* OFFLINE EDGE SCAN NOTICE (If diagnosed while offline) */}
      {diagnosis.isOfflineScan && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-400/80 rounded-3xl text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shrink-0 mt-0.5 shadow-2xs">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm">
                  ⚡ OFFLINE EDGE SCAN: Saved on Device
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-amber-200 text-amber-900 border border-amber-300">
                  MobileNetV3 Local Inference
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1 max-w-2xl leading-relaxed">
                This diagnosis was computed 100% locally on your device without cellular internet. The complete optical and agronomic telemetry has been stored in your device's offline queue and will automatically synchronize with Krishi Cloud when connectivity is restored.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200/80 text-amber-900 rounded-xl text-xs font-bold shrink-0 self-end sm:self-center">
            Queued in IndexedDB
          </span>
        </div>
      )}

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
                  {t.lowConfTitle}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                  {diagnosis.confidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 font-medium">
                {t.lowConfDesc}
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
                <span>{t.sentToExpertBtn}</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>{t.sendToExpertBtn}</span>
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
                {t.segmentedLesion}: {diagnosis.severityPercent}% Foliar Area
              </span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-slate-300 font-mono text-center flex items-center justify-between">
              <span>{t.cropFieldLabel}</span>
              <span className="text-amber-300 font-bold">{diagnosis.pathogenType} {t.pathogenSuffix}</span>
            </div>
          </div>

          {/* Right: Disease Info, Score, and Confidence */}
          <div className="md:col-span-7 space-y-4">
            
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.detectedTitle}
                </span>
                <RiskBadge level={diagnosis.riskScore.riskLevel} size="sm" />
              </div>
              
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mt-1">
                {diagnosis.diseaseName}
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
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
                    <span>{t.healthScoreLabel}</span>
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
                  {cropHealthScore >= 70 ? t.healthStatusHealthy : cropHealthScore >= 40 ? t.healthStatusAttention : t.healthStatusHighRisk}
                </span>
              </div>

              {/* Confidence Meter */}
              <div className={`p-4 rounded-2xl border ${
                diagnosis.confidence >= 75
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/70 border-amber-300 text-amber-950'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold">{t.aiConfidenceLabel}</span>
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
                  {diagnosis.confidence >= 75 ? t.complianceMeetsStandard : t.complianceNeedsVerify}
                </span>
              </div>

            </div>

            {/* Voice Narration Player for Low Literacy Farmers */}
            <div className="pt-2">
              <VoicePlayer
                defaultText={voiceSummary}
                language={voiceLangCode}
                label={t.listenReportLabel}
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
              <span>{t.whyAtRiskTitle}</span>
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
              {t.multimodalEngineBadge}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {t.whyAtRiskDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 text-xs">
            {/* Weather Impact */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <CloudSun className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.weatherImpactLabel}</span>
              </span>
              <span className="font-bold text-slate-900">{weatherImpactValue}</span>
              <span className="text-[10px] text-amber-700">{t.weatherImpactNote}</span>
            </div>

            {/* Crop Stage */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.cropStageLabel}</span>
              </span>
              <span className="font-bold text-slate-900">{t.cropStageValue}</span>
              <span className="text-[10px] text-slate-600">{t.cropStageNote}</span>
            </div>

            {/* Outbreak Hotspots */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col justify-between space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.hotspotsLabel}</span>
              </span>
              <span className="font-bold text-slate-900">{t.hotspotsValue}</span>
              <span className="text-[10px] text-rose-700 font-semibold">{t.hotspotsNote}</span>
            </div>
          </div>
        </div>

        {/* 5. SAFE IPM GUIDANCE & ACTION PLAN */}
        <div className="p-5 sm:p-6 bg-emerald-50/70 rounded-3xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-base text-emerald-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>{t.ipmTitle}</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              {t.ipmBadge}
            </span>
          </div>

          <div className="space-y-2 text-xs text-emerald-950 font-medium">
            <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">{t.bioTitle}</strong>
                <span>{t.bioDesc}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">{t.culturalTitle}</strong>
                <span>{t.culturalDesc}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-emerald-200 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">{t.chemicalTitle}</strong>
                <span>{t.chemicalDesc}</span>
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
            <span>{t.btnAskVaani}</span>
          </button>

          {/* Button 2: Contact Expert */}
          <button
            type="button"
            disabled={isEscalated}
            onClick={handleRequestManualExpertReview}
            className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>{isEscalated ? t.sentToExpertBtn : t.btnAskExpert}</span>
          </button>

          {/* Button 3: Monitor Again */}
          <button
            type="button"
            onClick={() => onNavigate('follow-up')}
            className="p-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 text-emerald-200" />
            <span>{t.btnScheduleFollowUp}</span>
          </button>

        </div>

      </div>

      {/* Safety Notice Footer */}
      <div className="text-center text-xs text-slate-500 py-2">
        <p>{t.safetyNotice}</p>
      </div>

    </div>
  );
};


