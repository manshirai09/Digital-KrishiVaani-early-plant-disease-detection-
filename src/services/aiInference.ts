import { DiagnosisResult, CropStage, RiskLevel } from '../types';
import { StorageService } from './storageService';
import { computeMultiSourceRisk } from './riskEngine';

export interface ScanOptions {
  scenarioId?: string;
  cropName: string;
  cropVariety?: string;
  cropStage?: CropStage;
  imageUrl?: string;
  farmId?: string;
  notes?: string;
  isOffline?: boolean;
}

export async function simulateAiInference(options: ScanOptions): Promise<DiagnosisResult> {
  // Simulate inference latency (slightly faster on quantized edge)
  await new Promise(resolve => setTimeout(resolve, options.isOffline ? 900 : 1400));

  const weather = StorageService.getWeather();
  const iotData = StorageService.getIotData();
  const pestTraps = StorageService.getPestTraps();
  const primaryTrap = pestTraps[0];

  const stage: CropStage = options.cropStage || 'Flowering';

  // Check if Tomato Yellow Leaf Curl Virus scenario or Tomato crop requested
  if (
    options.scenarioId === 'scenario-tomato-curl' ||
    options.cropName?.toLowerCase() === 'tomato' ||
    options.imageUrl?.includes('tomato') ||
    options.imageUrl?.includes('TomatoYellowCurlVirus')
  ) {
    const riskScore = computeMultiSourceRisk({
      imageConfidence: 96,
      imageSeverityScore: 58,
      cropStage: stage,
      weather,
      iotData,
      pestTrap: primaryTrap,
      historicalOutbreakRisk: 82
    });

    const edgeFactor = options.isOffline
      ? [{ label: 'Edge AI Execution', value: 'MobileNetV3 quantized on-device (0 KB network)', isConducive: true }]
      : [];

    return {
      id: `diag-${Date.now()}`,
      caseId: `KR-${Math.floor(1000 + Math.random() * 9000)}`,
      diseaseName: 'Tomato Yellow Leaf Curl Virus (TYLCV)',
      pathogenType: 'Viral',
      confidence: 96,
      severityPercent: 58,
      severityLevel: 'high',
      sampleImageUrl: options.imageUrl || '/tomato_yellow_leaf_curl.svg',
      symptomPattern: 'Marked upward curling & cupping of leaflet margins, severe interveinal chlorosis, stunted apical growth & mottled rugose lamina',
      isSimulated: true,
      needsExpertReview: false,
      riskScore,
      isOfflineScan: options.isOffline,
      evidenceFactors: [
        ...edgeFactor,
        { label: 'Leaf Morphology', value: 'Upward margin cupping & severe chlorosis (96% visual match)', isConducive: true },
        { label: 'Insect Vector Status', value: 'Whitefly (Bemisia tabaci) pressure detected in vicinity', isConducive: true },
        { label: 'Micro-Climate Conduciveness', value: `${weather.temperature}°C (Optimal vector transmission)`, isConducive: true },
        { label: 'Crop Phenology', value: `${stage} Stage (High viral susceptibility)`, isConducive: true }
      ]
    };
  }

  // Check if specific scenario requested
  if (options.scenarioId === 'scenario-b') {
    // Low Confidence Scenario (62%) -> Expert review required
    const riskScore = computeMultiSourceRisk({
      imageConfidence: 62,
      imageSeverityScore: 42,
      cropStage: stage,
      weather,
      iotData,
      pestTrap: primaryTrap,
      historicalOutbreakRisk: 70
    });

    const edgeFactor = options.isOffline
      ? [{ label: 'Edge AI Execution', value: 'MobileNetV3 quantized on-device (0 KB network)', isConducive: true }]
      : [];

    return {
      id: `diag-${Date.now()}`,
      caseId: `KR-${Math.floor(1000 + Math.random() * 9000)}`,
      diseaseName: 'Cotton Leaf Spot (Cercospora)',
      pathogenType: 'Fungal',
      confidence: 62,
      severityPercent: 42,
      severityLevel: 'high',
      sampleImageUrl: options.imageUrl || '/cotton_leaf_spot.svg',
      symptomPattern: 'Ambiguous irregular chlorotic spots with atypical margin necrosis',
      isSimulated: true,
      needsExpertReview: true,
      escalationReason: 'AI Confidence (62%) is below the 75% safety threshold. Flagged for human expert review.',
      riskScore,
      isOfflineScan: options.isOffline,
      evidenceFactors: [
        ...edgeFactor,
        { label: 'Leaf Symptom Confidence', value: '62% (Ambiguous pattern)', isConducive: true },
        { label: 'Relative Humidity (IoT)', value: `${iotData.humidity}% (High)`, isConducive: true },
        { label: 'Leaf Wetness Duration', value: '> 8 hours', isConducive: true },
        { label: 'Pest Trap Population', value: `${primaryTrap.currentCount} / ${primaryTrap.threshold} threshold`, isConducive: true }
      ]
    };
  } else if (options.scenarioId === 'scenario-c') {
    // Pest Infestation (87%)
    const riskScore = computeMultiSourceRisk({
      imageConfidence: 87,
      imageSeverityScore: 48,
      cropStage: stage,
      weather,
      iotData,
      pestTrap: primaryTrap,
      historicalOutbreakRisk: 75
    });

    const edgeFactor = options.isOffline
      ? [{ label: 'Edge AI Execution', value: 'MobileNetV3 quantized on-device (0 KB network)', isConducive: true }]
      : [];

    return {
      id: `diag-${Date.now()}`,
      caseId: `KR-${Math.floor(1000 + Math.random() * 9000)}`,
      diseaseName: 'Aphids & Sucking Pest Colony',
      pathogenType: 'Pest Infestation',
      confidence: 87,
      severityPercent: 48,
      severityLevel: 'high',
      sampleImageUrl: options.imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/3/34/CSIRO_ScienceImage_7848_Aphids_on_cotton_8.jpg',
      symptomPattern: 'Underside foliar nymph clusters with curling & honeydew secretion',
      isSimulated: true,
      needsExpertReview: true,
      escalationReason: 'High pest density exceeding threshold + favorable thermal range',
      riskScore,
      isOfflineScan: options.isOffline,
      evidenceFactors: [
        ...edgeFactor,
        { label: 'Pest Colony Density', value: '87% Visual match', isConducive: true },
        { label: 'Trap Catch Rate', value: '18 insects / trap (Alert)', isConducive: true },
        { label: 'Canopy Temperature', value: `${iotData.temperature}°C (Optimal vector reproduction)`, isConducive: true }
      ]
    };
  } else if (options.scenarioId === 'scenario-d') {
    // Follow-up healthy recovery
    const riskScore = computeMultiSourceRisk({
      imageConfidence: 94,
      imageSeverityScore: 12,
      cropStage: stage,
      weather,
      iotData,
      pestTrap: { ...primaryTrap, currentCount: 4 },
      historicalOutbreakRisk: 30
    });

    const edgeFactor = options.isOffline
      ? [{ label: 'Edge AI Execution', value: 'MobileNetV3 quantized on-device (0 KB network)', isConducive: true }]
      : [];

    return {
      id: `diag-${Date.now()}`,
      caseId: `KR-${Math.floor(1000 + Math.random() * 9000)}`,
      diseaseName: 'Resolved / Healed Foliar Scars',
      pathogenType: 'Physiological',
      confidence: 94,
      severityPercent: 12,
      severityLevel: 'low',
      sampleImageUrl: options.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
      symptomPattern: 'Healthy vigorous green foliage with dry healed lesion edges',
      isSimulated: true,
      needsExpertReview: false,
      riskScore,
      isOfflineScan: options.isOffline,
      evidenceFactors: [
        ...edgeFactor,
        { label: 'Vigorous Green Leaf Area', value: '88% of total canopy', isConducive: false },
        { label: 'Active Spore Activity', value: 'None detected', isConducive: false },
        { label: 'Post-Treatment Status', value: 'Significantly improved', isConducive: false }
      ]
    };
  } else {
    // Default Scenario A: High Confidence (91%) Cotton Leaf Spot
    const riskScore = computeMultiSourceRisk({
      imageConfidence: 91,
      imageSeverityScore: 34,
      cropStage: stage,
      weather,
      iotData,
      pestTrap: primaryTrap,
      historicalOutbreakRisk: 64
    });

    const edgeFactor = options.isOffline
      ? [{ label: 'Edge AI Execution', value: 'MobileNetV3 quantized on-device (0 KB network)', isConducive: true }]
      : [];

    return {
      id: `diag-${Date.now()}`,
      caseId: `KR-${Math.floor(1000 + Math.random() * 9000)}`,
      diseaseName: options.cropName === 'Soybean' ? 'Soybean Cercospora Blight' : 'Cotton Leaf Spot (Cercospora)',
      pathogenType: 'Fungal',
      confidence: 91,
      severityPercent: 34,
      severityLevel: 'moderate' as RiskLevel,
      sampleImageUrl: options.imageUrl || '/cotton_leaf_spot.svg',
      symptomPattern: 'Concentric reddish-brown circular spots with characteristic halo',
      isSimulated: true,
      needsExpertReview: false,
      riskScore,
      isOfflineScan: options.isOffline,
      evidenceFactors: [
        ...edgeFactor,
        { label: 'Leaf Symptom Pattern', value: 'Concentric target spots (91% match)', isConducive: true },
        { label: 'Current Humidity (IoT)', value: `${iotData.humidity}% RH (Conducive)`, isConducive: true },
        { label: 'Recent Rainfall', value: `${weather.rainfallLast24h} mm in last 24h`, isConducive: true },
        { label: 'Crop Phenology', value: `${stage} Stage`, isConducive: true }
      ]
    };
  }
}
