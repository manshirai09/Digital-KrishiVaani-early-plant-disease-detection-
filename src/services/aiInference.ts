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
}

export async function simulateAiInference(options: ScanOptions): Promise<DiagnosisResult> {
  // Simulate inference latency
  await new Promise(resolve => setTimeout(resolve, 1400));

  const weather = StorageService.getWeather();
  const iotData = StorageService.getIotData();
  const pestTraps = StorageService.getPestTraps();
  const primaryTrap = pestTraps[0];

  const stage: CropStage = options.cropStage || 'Flowering';

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

    return {
      id: `diag-${Date.now()}`,
      caseId: `KR-${Math.floor(1000 + Math.random() * 9000)}`,
      diseaseName: 'Cotton Leaf Spot (Cercospora)',
      pathogenType: 'Fungal',
      confidence: 62,
      severityPercent: 42,
      severityLevel: 'high',
      sampleImageUrl: options.imageUrl || 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80',
      symptomPattern: 'Ambiguous irregular chlorotic spots with atypical margin necrosis',
      isSimulated: true,
      needsExpertReview: true,
      escalationReason: 'AI Confidence (62%) is below the 75% safety threshold. Flagged for human expert review.',
      riskScore,
      evidenceFactors: [
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

    return {
      id: `diag-${Date.now()}`,
      caseId: `KR-${Math.floor(1000 + Math.random() * 9000)}`,
      diseaseName: 'Aphids & Sucking Pest Colony',
      pathogenType: 'Pest Infestation',
      confidence: 87,
      severityPercent: 48,
      severityLevel: 'high',
      sampleImageUrl: options.imageUrl || 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80',
      symptomPattern: 'Underside foliar nymph clusters with curling & honeydew secretion',
      isSimulated: true,
      needsExpertReview: true,
      escalationReason: 'High pest density exceeding threshold + favorable thermal range',
      riskScore,
      evidenceFactors: [
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
      evidenceFactors: [
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

    return {
      id: `diag-${Date.now()}`,
      caseId: `KR-${Math.floor(1000 + Math.random() * 9000)}`,
      diseaseName: options.cropName === 'Soybean' ? 'Soybean Cercospora Blight' : 'Cotton Leaf Spot (Cercospora)',
      pathogenType: 'Fungal',
      confidence: 91,
      severityPercent: 34,
      severityLevel: 'moderate' as RiskLevel,
      sampleImageUrl: options.imageUrl || 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80',
      symptomPattern: 'Concentric reddish-brown circular spots with characteristic halo',
      isSimulated: true,
      needsExpertReview: false,
      riskScore,
      evidenceFactors: [
        { label: 'Leaf Symptom Pattern', value: 'Concentric target spots (91% match)', isConducive: true },
        { label: 'Current Humidity (IoT)', value: `${iotData.humidity}% RH (Conducive)`, isConducive: true },
        { label: 'Recent Rainfall', value: `${weather.rainfallLast24h} mm in last 24h`, isConducive: true },
        { label: 'Crop Phenology', value: `${stage} Stage`, isConducive: true }
      ]
    };
  }
}
