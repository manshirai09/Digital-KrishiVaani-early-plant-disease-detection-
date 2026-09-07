import { MultiSourceRiskScore, RiskLevel, CropStage, IotSensorData, PestTrapData, WeatherData, RiskFactor } from '../types';

export interface RiskCalculationInput {
  cropName?: string;
  cropStage: CropStage;
  imageConfidence: number; // 0 - 100
  imageSeverityScore: number; // 0 - 100
  weather?: WeatherData;
  iotData?: IotSensorData;
  pestTrap?: PestTrapData;
  humidity?: number;
  leafWetnessHours?: number;
  rainfall24h?: number;
  temperature?: number;
  pestTrapCount?: number;
  pestThreshold?: number;
  historicalOutbreakRisk?: number; // 0 - 100
  historicalOutbreakSeverity?: string;
  villagePreviousCases?: number;
}

export function computeMultiSourceRisk(input: RiskCalculationInput): MultiSourceRiskScore {
  // 1. Image Evidence Component (0 - 100)
  const imageEvidenceScore = Math.min(100, Math.round((input.imageConfidence * 0.4) + (input.imageSeverityScore * 0.6)));

  // 2. Environmental Risk Component (Weather + IoT)
  const hum = input.humidity ?? input.iotData?.humidity ?? input.weather?.humidity ?? 82;
  const rain = input.rainfall24h ?? input.iotData?.rainfallMm ?? input.weather?.rainfallLast24h ?? 18;
  const wetnessHours = input.leafWetnessHours ?? (input.iotData?.leafWetnessScore ? input.iotData.leafWetnessScore / 10 : 8.5);

  let envScore = 40;
  if (hum > 80) envScore += 25;
  else if (hum > 70) envScore += 15;

  if (rain > 15) envScore += 20;
  else if (rain > 5) envScore += 10;

  if (wetnessHours > 6) envScore += 15;
  envScore = Math.min(100, Math.max(10, envScore));

  // 3. Pest Trend Component
  const trapCount = input.pestTrapCount ?? input.pestTrap?.currentCount ?? 18;
  const threshold = input.pestThreshold ?? input.pestTrap?.threshold ?? 12;
  let pestScore = 30;
  const ratio = trapCount / Math.max(1, threshold);
  if (ratio >= 1.5) pestScore = 90;
  else if (ratio >= 1.0) pestScore = 75;
  else if (ratio >= 0.7) pestScore = 55;
  else pestScore = 30;

  // 4. Historical Outbreak Risk
  const historicalRisk = input.historicalOutbreakRisk ?? 65;

  // 5. Crop Stage Sensitivity (Flowering & Pod/Boll formation are highest sensitivity)
  let stageScore = 50;
  switch (input.cropStage) {
    case 'Flowering':
      stageScore = 85;
      break;
    case 'Boll Formation / Pod Filling':
    case 'Pod Filling':
      stageScore = 90;
      break;
    case 'Vegetative':
      stageScore = 55;
      break;
    case 'Seedling':
      stageScore = 70;
      break;
    case 'Maturity / Harvesting':
      stageScore = 40;
      break;
  }

  // Multi-source Weighted Calculation:
  const wImage = 0.30;
  const wEnv = 0.25;
  const wPest = 0.20;
  const wHistory = 0.15;
  const wStage = 0.10;

  const cImage = +(imageEvidenceScore * wImage).toFixed(1);
  const cEnv = +(envScore * wEnv).toFixed(1);
  const cPest = +(pestScore * wPest).toFixed(1);
  const cHistory = +(historicalRisk * wHistory).toFixed(1);
  const cStage = +(stageScore * wStage).toFixed(1);

  const overallScore = Math.round(cImage + cEnv + cPest + cHistory + cStage);

  // Determine Semantic Risk Level
  let riskLevel: RiskLevel = 'low';
  if (overallScore >= 85) riskLevel = 'critical';
  else if (overallScore >= 66) riskLevel = 'high';
  else if (overallScore >= 36) riskLevel = 'moderate';
  else riskLevel = 'low';

  // Identify Key Drivers
  const drivers: string[] = [];
  if (envScore >= 75) drivers.push(`High ambient humidity (${hum}%) & leaf wetness (${wetnessHours}h) favoring spore germination`);
  if (pestScore >= 70) drivers.push(`Pest trap count (${trapCount}) exceeding economic threshold (${threshold})`);
  if (imageEvidenceScore >= 70) drivers.push(`Significant foliar lesion coverage detected on leaf scan (${input.imageSeverityScore}%)`);
  if (stageScore >= 80) drivers.push(`Vulnerable phenological stage (${input.cropStage}) with peak yield sensitivity`);
  if (drivers.length === 0) drivers.push('Stable micro-climatic parameters and low pest population');

  // Confidence Gating Rule
  const needsExpert = input.imageConfidence < 75 || overallScore >= 80 || input.imageSeverityScore >= 50;

  const factors: RiskFactor[] = [
    {
      name: 'Leaf Image Evidence',
      score: imageEvidenceScore,
      weight: 30,
      contribution: cImage,
      category: 'Computer Vision',
      status: imageEvidenceScore >= 70 ? 'High Risk' : imageEvidenceScore >= 40 ? 'Moderate' : 'Safe',
      notes: `Optical model confidence ${input.imageConfidence}% & lesion area`
    },
    {
      name: 'Environmental Conduciveness',
      score: envScore,
      weight: 25,
      contribution: cEnv,
      category: 'Weather & IoT',
      status: envScore >= 70 ? 'High Risk' : envScore >= 40 ? 'Moderate' : 'Safe',
      notes: `${hum}% RH, ${rain}mm rain, ${wetnessHours}h leaf wetness`
    },
    {
      name: 'Pest Density & Vector Trend',
      score: pestScore,
      weight: 20,
      contribution: cPest,
      category: 'Smart Traps',
      status: pestScore >= 70 ? 'High Risk' : pestScore >= 40 ? 'Moderate' : 'Safe',
      notes: `${trapCount} insects vs ${threshold} threshold`
    },
    {
      name: 'Historical Outbreak Probability',
      score: historicalRisk,
      weight: 15,
      contribution: cHistory,
      category: 'Epidemiology',
      status: historicalRisk >= 70 ? 'High Risk' : historicalRisk >= 40 ? 'Moderate' : 'Safe',
      notes: 'Malwa plateau seasonal recurrence index'
    },
    {
      name: 'Phenological Stage Sensitivity',
      score: stageScore,
      weight: 10,
      contribution: cStage,
      category: 'Agronomy',
      status: stageScore >= 70 ? 'High Risk' : stageScore >= 40 ? 'Moderate' : 'Safe',
      notes: `${input.cropStage} canopy susceptibility`
    }
  ];

  return {
    overallScore,
    riskLevel,
    factors,
    breakdown: {
      imageEvidence: {
        score: imageEvidenceScore,
        weight: wImage,
        contribution: cImage,
        description: `Visual pattern confidence (${input.imageConfidence}%) & estimated lesion coverage`
      },
      environmentalRisk: {
        score: envScore,
        weight: wEnv,
        contribution: cEnv,
        description: `${hum}% RH + ${rain}mm rain`
      },
      pestTrend: {
        score: pestScore,
        weight: wPest,
        contribution: cPest,
        description: `Trap density at ${trapCount} insects/trap`
      },
      historicalRisk: {
        score: historicalRisk,
        weight: wHistory,
        contribution: cHistory,
        description: 'Indore agro-climatic zone seasonal historical epidemiology'
      },
      cropStageSensitivity: {
        score: stageScore,
        weight: wStage,
        contribution: cStage,
        description: `${input.cropStage} stage canopy susceptibility index`
      }
    },
    keyDrivers: drivers,
    recommendationType: needsExpert ? 'expert_review_required' : 'pre_approved_ipm'
  };
}
