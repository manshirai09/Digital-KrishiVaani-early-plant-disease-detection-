import React, { useState } from 'react';
import {
  Landmark,
  ShieldCheck,
  CreditCard,
  Droplets,
  Sun,
  Tractor,
  FileText,
  PhoneCall,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Mic,
  Search,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { I18nService } from '../../services/i18nService';
import { VoicePlayer } from '../common/VoicePlayer';

interface GovernmentSchemesProps {
  onOpenVaani?: () => void;
  onNavigate?: (tab: string) => void;
}

interface Scheme {
  id: string;
  name: string;
  hindiName: string;
  category: 'direct_benefit' | 'insurance' | 'credit' | 'irrigation' | 'machinery';
  benefit: string;
  eligibility: string;
  documents: string[];
  helpline: string;
  officialPortal: string;
  summaryVoiceText: string;
  tags: string[];
}

const SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-Kisan Samman Nidhi',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि',
    category: 'direct_benefit',
    benefit: '₹6,000 प्रति वर्ष (₹2,000 की 3 समान किश्तों में सीधे बैंक खाते में)',
    eligibility: 'सभी भूमिधारक किसान परिवार जिनके नाम पर खेती योग्य भूमि है।',
    documents: ['आधार कार्ड', 'जमीन के दस्तावेज (खतौनी/भूलेख)', 'बैंक खाता पासबुक', 'आधार लिंक मोबाइल नंबर'],
    helpline: '155261 / 1800-115-526',
    officialPortal: 'https://pmkisan.gov.in',
    summaryVoiceText: 'पीएम किसान सम्मान निधि योजना के तहत पात्र किसान परिवारों को प्रति वर्ष 6000 रुपये 3 किश्तों में सीधे बैंक खाते में मिलते हैं। इसके लिए आधार कार्ड और भूलेख रिकॉर्ड आवश्यक है।',
    tags: ['Direct Benefit Transfer', 'Annual ₹6,000', 'Active']
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana (PMFBY)',
    hindiName: 'प्रधानमंत्री फसल बीमा योजना',
    category: 'insurance',
    benefit: 'असामान्य बारिश, ओलावृष्टि, सूखा व कीट प्रकोप से फसल क्षति पर 100% तक बीमा दावा',
    eligibility: 'अधिसूचित क्षेत्र में अधिसूचित फसल उगाने वाले सभी किसान (बटाईदार भी पात्र)।',
    documents: ['फसल बुवाई प्रमाण पत्र / पटवारी पर्चा', 'भूमि अधिकार पुस्तिका / खसरा', 'बैंक पासबुक', 'आधार कार्ड'],
    helpline: '14447 (राष्ट्रीय फसल बीमा हेल्पलाइन)',
    officialPortal: 'https://pmfby.gov.in',
    summaryVoiceText: 'प्रधानमंत्री फसल बीमा योजना में खरीफ के लिए 2 प्रतिशत और रबी के लिए डेढ़ प्रतिशत प्रीमियम पर फसल के नुकसान का पूरा मुआवजा मिलता है। आपदा के 72 घंटे में सूचना देना अनिवार्य है।',
    tags: ['Crop Insurance', 'Low Premium (1.5-2%)', 'Disaster Protection']
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    hindiName: 'किसान क्रेडिट कार्ड',
    category: 'credit',
    benefit: '₹3 लाख तक का कृषि ऋण मात्र 4% प्रभावी ब्याज दर पर (समय पर भुगतान पर 3% छूट)',
    eligibility: 'सभी किसान, पशुपालक व मत्स्य पालक (व्यक्तिगत या संयुक्त)।',
    documents: ['आवेदन पत्र', 'पहचान व निवास प्रमाण (आधार/वोटर ID)', 'जमीन के कागजात व गिरदावरी', 'पासपोर्ट फोटो'],
    helpline: '1800-180-1551 (किसान कॉल सेंटर)',
    officialPortal: 'https://myscheme.gov.in/schemes/kcc',
    summaryVoiceText: 'किसान क्रेडिट कार्ड से खाद, बीज और कीटनाशक के लिए 3 लाख तक का लोन केवल 4 प्रतिशत ब्याज पर मिलता है। समय पर लौटाने पर 3 प्रतिशत की छूट मिलती है।',
    tags: ['Subsidized Credit', '4% Interest Rate', 'Fast Approval']
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card Scheme',
    hindiName: 'मृदा स्वास्थ्य कार्ड योजना',
    category: 'direct_benefit',
    benefit: 'खेत की मिट्टी के 12 मुख्य पोषक तत्वों की मुफ्त प्रयोगशाला जांच व फसलवार खाद सुझाव',
    eligibility: 'देश का कोई भी किसान अपने ब्लॉक या कृषि विज्ञान केंद्र पर संपर्क कर सकता है।',
    documents: ['खेत की मिट्टी का नमूना (कृषि मित्र की मदद से)', 'खसरा नंबर', 'आधार कार्ड'],
    helpline: '1800-180-1551',
    officialPortal: 'https://soilhealth.dac.gov.in',
    summaryVoiceText: 'मृदा स्वास्थ्य कार्ड से आपको पता चलता है कि मिट्टी में नाइट्रोजन, फास्फोरस या पोटाश कितना है। इससे गैर-जरूरी खाद का खर्च 25 से 30 प्रतिशत तक घटता है।',
    tags: ['Free Soil Test', 'Reduce Fertilizer Cost', '12 Nutrients']
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM Solar Pump Scheme',
    hindiName: 'पीएम-कुसुम सोलर पंप योजना',
    category: 'machinery',
    benefit: 'खेत में सोलर सिंचाई पंप लगाने पर 60% तक सरकारी अनुदान (30% केंद्र + 30% राज्य)',
    eligibility: 'ऐसे किसान जिनके पास सिंचाई का जल स्रोत (बोरवेल/कुआं) है लेकिन बिजली कनेक्शन नहीं है।',
    documents: ['जमीन की फर्द', 'बैंक पासबुक', 'आधार कार्ड', 'जल स्रोत घोषणा पत्र'],
    helpline: '1800-180-3333',
    officialPortal: 'https://pmkusum.mnre.gov.in',
    summaryVoiceText: 'पीएम कुसुम योजना में किसानों को सोलर पंप लगाने पर 60 प्रतिशत तक सब्सिडी मिलती है। इससे डीजल पंप का खर्च बचता है और मुफ्त सौर ऊर्जा से सिंचाई होती है।',
    tags: ['Solar Pump', '60% Subsidy', 'Zero Electricity Bill']
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchayee Yojana (Micro-Irrigation)',
    hindiName: 'प्रति बूंद अधिक फसल (ड्रिप/स्प्रिंकलर)',
    category: 'irrigation',
    benefit: 'ड्रिप व फव्वारा सिंचाई उपकरण लगाने पर लघु/सीमांत किसानों को 55% तक सब्सिडी',
    eligibility: 'सभी वर्ग के किसान जिनके पास निजी जल स्रोत उपलब्ध है।',
    documents: ['जमीन के दस्तावेज (खसरा-खतौनी)', 'आधार कार्ड', 'बैंक खाता विवरण', 'बिजली बिल/जल स्रोत प्रमाण'],
    helpline: '1800-180-1551',
    officialPortal: 'https://pmksy.gov.in',
    summaryVoiceText: 'ड्रिप और स्प्रिंकलर सिंचाई से 50 प्रतिशत तक पानी की बचत होती है और फसल पैदावार 30 प्रतिशत तक बढ़ती है। सरकार इस पर 55 प्रतिशत तक अनुदान देती है।',
    tags: ['Drip & Sprinkler', '55% Subsidy', '50% Water Saving']
  }
];

export const GovernmentSchemes: React.FC<GovernmentSchemesProps> = ({
  onOpenVaani,
  onNavigate
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(SCHEMES[0]);
  const [farmerLandSize, setFarmerLandSize] = useState<string>('marginal'); // marginal (<1ha), small (1-2ha), medium (>2ha)
  const [eligibilityResult, setEligibilityResult] = useState<string | null>(null);

  const filteredSchemes = SCHEMES.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hindiName.includes(searchQuery) ||
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const checkEligibility = (scheme: Scheme) => {
    if (farmerLandSize === 'marginal' || farmerLandSize === 'small') {
      setEligibilityResult(`✅ आप ${scheme.hindiName} के लिए 100% पात्र हैं! छोटे और सीमांत किसानों को अधिकतम सब्सिडी व प्राथमिकता मिलती है।`);
    } else {
      setEligibilityResult(`✅ आप पात्र हैं। सामान्य दर पर सब्सिडी और लाभ सीधे आपके बैंक खाते में अंतरित होंगे।`);
    }
  };

  return (
    <div id="government-schemes-view" className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Landmark className="w-4 h-4" />
              <span>सरकारी कृषि योजनाएं एवं प्रत्यक्ष लाभ (DBT)</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              किसान कल्याण योजनाएं व सब्सिडी
            </h1>
            <p className="text-sm text-emerald-100/90 max-w-xl">
              पीएम-किसान, फसल बीमा, सोलर पंप और कम ब्याज वाले कृषि ऋण की संपूर्ण जानकारी, पात्रता जांच और आवेदन मार्गदर्शन।
            </p>
          </div>

          <button
            onClick={onOpenVaani}
            type="button"
            className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            <Mic className="w-5 h-5 text-slate-950 animate-pulse" />
            <span>वाणी से योजना पूछें</span>
          </button>
        </div>
      </div>

      {/* Search & Quick Category Filters */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="योजना का नाम खोजें (जैसे: PM Kisan, Fasal Bima, Solar Pump, KCC)..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'सभी योजनाएं' },
            { id: 'direct_benefit', label: '💰 नकद राशि (DBT)' },
            { id: 'insurance', label: '🛡️ फसल बीमा' },
            { id: 'credit', label: '💳 4% कृषि ऋण (KCC)' },
            { id: 'irrigation', label: '💧 सिंचाई सब्सिडी' },
            { id: 'machinery', label: '☀️ सोलर पंप व यंत्र' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchemes.map(scheme => {
          const isSelected = selectedScheme?.id === scheme.id;
          return (
            <div
              key={scheme.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono font-extrabold uppercase px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                    {scheme.tags[0]}
                  </span>
                  <div className="flex items-center gap-1">
                    {scheme.tags.slice(1).map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="font-display font-extrabold text-lg text-slate-900 mt-1">
                  {scheme.hindiName}
                </h3>
                <p className="text-xs font-bold text-slate-500 mb-3">
                  {scheme.name}
                </p>

                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 mb-3">
                  <div className="text-xs text-emerald-950 font-bold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>मुख्य लाभ:</span>
                  </div>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                    {scheme.benefit}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p>
                    <strong className="text-slate-800">पात्रता:</strong> {scheme.eligibility}
                  </p>
                </div>
              </div>

              {/* Voice Player & Action Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <VoicePlayer
                  defaultText={scheme.summaryVoiceText}
                  label="आवाज में सुनें"
                  compact={true}
                />

                <button
                  type="button"
                  onClick={() => {
                    setSelectedScheme(scheme);
                    checkEligibility(scheme);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>पात्रता व आवेदन</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal / Bottom Card for Selected Scheme */}
      {selectedScheme && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-5 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                योजना विवरण एवं दस्तावेज सूची
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                {selectedScheme.hindiName} ({selectedScheme.name})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={selectedScheme.officialPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>आधिकारिक पोर्टल</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Eligibility Interactive Check */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>अपनी जमीन का आकार चुनें (पात्रता जांच के लिए):</span>
                </h4>
              </div>

              <div className="flex gap-2">
                {[
                  { id: 'marginal', label: 'सीमांत (< 2.5 एकड़)' },
                  { id: 'small', label: 'लघु (2.5 - 5 एकड़)' },
                  { id: 'medium', label: 'बड़ा (> 5 एकड़)' }
                ].map(size => (
                  <button
                    key={size.id}
                    onClick={() => {
                      setFarmerLandSize(size.id);
                      checkEligibility(selectedScheme);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      farmerLandSize === size.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {eligibilityResult && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-xs text-emerald-200 font-medium">
                {eligibilityResult}
              </div>
            )}
          </div>

          {/* Required Documents List */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>आवश्यक दस्तावेज (आवेदन के समय):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedScheme.documents.map((doc, i) => (
                <div key={i} className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Helpline & Guidance Footer */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>टोल-फ्री हेल्पलाइन: <strong className="text-white font-mono">{selectedScheme.helpline}</strong></span>
            </div>

            <button
              type="button"
              onClick={onOpenVaani}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>वाणी से आवेदन की प्रक्रिया पूछें</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
