import {
  Farm,
  CaseRecord,
  IotSensorData,
  PestTrapData,
  WeatherData,
  GisHotspot,
  NotificationItem,
  DemoScenario,
  FieldVisit,
  FollowUpRecord,
  Dataset,
  DatasetImage
} from '../types';

export const INITIAL_WEATHER: WeatherData = {
  temp: 28.4,
  humidity: 82,
  rainProbability: 70,
  rainfallLast24h: 18,
  condition: 'Humid Overcast / Intermittent Rain',
  leafWetness: 'High',
  forecast: [
    { day: 'Today', temp: 28.4, humidity: 82, rainMm: 18, risk: 'high', riskScore: 78 },
    { day: '+1 Day', temp: 29.1, humidity: 85, rainMm: 24, risk: 'high', riskScore: 81 },
    { day: '+2 Days', temp: 27.8, humidity: 88, rainMm: 32, risk: 'critical', riskScore: 85 },
    { day: '+3 Days', temp: 26.5, humidity: 90, rainMm: 28, risk: 'critical', riskScore: 89 },
    { day: '+4 Days', temp: 28.0, humidity: 84, rainMm: 12, risk: 'high', riskScore: 83 },
    { day: '+5 Days', temp: 30.2, humidity: 76, rainMm: 4, risk: 'moderate', riskScore: 74 },
    { day: '+6 Days', temp: 31.5, humidity: 68, rainMm: 0, risk: 'moderate', riskScore: 68 },
  ]
};

export const INITIAL_IOT_NODE: IotSensorData = {
  nodeId: 'ESP32-AGRI-IND04',
  battery: 92,
  status: 'online',
  temperature: 28.4,
  humidity: 82,
  soilMoisture: 46,
  leafWetnessScore: 84,
  leafWetnessLabel: 'High',
  rainfallMm: 18.2,
  lastUpdated: 'Just now (Live Telemetry)',
  history: [
    { time: '06:00', temp: 24.2, humidity: 89, moisture: 48, leafWetness: 92 },
    { time: '08:00', temp: 25.8, humidity: 86, moisture: 47, leafWetness: 88 },
    { time: '10:00', temp: 27.5, humidity: 83, moisture: 46, leafWetness: 85 },
    { time: '12:00', temp: 29.1, humidity: 80, moisture: 45, leafWetness: 80 },
    { time: '14:00', temp: 28.4, humidity: 82, moisture: 46, leafWetness: 84 },
  ]
};

export const INITIAL_PEST_TRAPS: PestTrapData[] = [
  {
    trapId: 'TRAP-01-SANWER',
    name: 'Pheromone Trap A1 (South Block)',
    fieldId: 'farm-1-f1',
    location: 'Sanwer Field A - Cotton',
    pestType: 'Cotton Bollworm & Whitefly',
    currentCount: 18,
    threshold: 12,
    status: 'above_threshold',
    lastChecked: 'Today, 08:30 AM',
    history: [
      { date: 'Day -4', count: 8 },
      { date: 'Day -3', count: 10 },
      { date: 'Day -2', count: 11 },
      { date: 'Yesterday', count: 14 },
      { date: 'Today', count: 18 },
    ],
    trapImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/CSIRO_ScienceImage_7848_Aphids_on_cotton_8.jpg'
  },
  {
    trapId: 'TRAP-02-DEPALPUR',
    name: 'Yellow Sticky Trap B2',
    fieldId: 'farm-1-f2',
    location: 'Sanwer Field B - Soybean',
    pestType: 'Aphids & Thrips',
    currentCount: 7,
    threshold: 15,
    status: 'normal',
    lastChecked: 'Yesterday, 05:00 PM',
    history: [
      { date: 'Day -4', count: 4 },
      { date: 'Day -3', count: 5 },
      { date: 'Day -2', count: 6 },
      { date: 'Yesterday', count: 7 },
      { date: 'Today', count: 7 },
    ]
  }
];

export const INITIAL_FARMS: Farm[] = [
  {
    id: 'farm-01',
    name: 'Patidar Krishi Farm',
    farmerName: 'Ramesh Patidar',
    farmerPhone: '+91 98260 14820',
    village: 'Sanwer',
    block: 'Sanwer',
    district: 'Indore',
    totalAreaAcres: 4.2,
    soilType: 'Medium Black Clayey Loam',
    coordinates: { lat: 22.9734, lng: 75.8267 },
    sensorNodeId: 'ESP32-AGRI-IND04',
    overallRisk: 'high',
    overallRiskScore: 78,
    crops: [
      {
        id: 'farm-1-f1',
        farmId: 'farm-01',
        cropName: 'Cotton',
        variety: 'BG-II Bt Hybrid',
        areaAcres: 2.4,
        sowingDate: '2026-06-15',
        stage: 'Flowering',
        riskLevel: 'high',
        riskScore: 78,
        lastScanDate: 'Today, 09:15 AM',
        activeDisease: 'Cotton Leaf Spot (Cercospora)'
      },
      {
        id: 'farm-1-f2',
        farmId: 'farm-01',
        cropName: 'Soybean',
        variety: 'JS 95-60',
        areaAcres: 1.8,
        sowingDate: '2026-07-02',
        stage: 'Pod Filling',
        riskLevel: 'low',
        riskScore: 24,
        lastScanDate: 'Yesterday',
        activeDisease: 'None (Healthy foliage)'
      }
    ]
  },
  {
    id: 'farm-02',
    name: 'Annapurna Organic Farm',
    farmerName: 'Sunita Bai',
    farmerPhone: '+91 94250 88219',
    village: 'Depalpur',
    block: 'Depalpur',
    district: 'Indore',
    totalAreaAcres: 3.5,
    soilType: 'Deep Black Cotton Soil',
    coordinates: { lat: 22.8465, lng: 75.5482 },
    sensorNodeId: 'ESP32-AGRI-IND09',
    overallRisk: 'critical',
    overallRiskScore: 86,
    crops: [
      {
        id: 'farm-2-f1',
        farmId: 'farm-02',
        cropName: 'Soybean',
        variety: 'JS 20-34',
        areaAcres: 3.5,
        sowingDate: '2026-06-25',
        stage: 'Boll Formation / Pod Filling',
        riskLevel: 'critical',
        riskScore: 86,
        lastScanDate: 'Today, 07:45 AM',
        activeDisease: 'Soybean Rust / Blight'
      }
    ]
  },
  {
    id: 'farm-03',
    name: 'Verma Krishi Kendra',
    farmerName: 'Arjun Verma',
    farmerPhone: '+91 98931 44512',
    village: 'Mhow (Dr. Ambedkar Nagar)',
    block: 'Mhow',
    district: 'Indore',
    totalAreaAcres: 2.8,
    soilType: 'Red-Yellow Mixed Loam',
    coordinates: { lat: 22.5539, lng: 75.7644 },
    overallRisk: 'moderate',
    overallRiskScore: 54,
    crops: [
      {
        id: 'farm-3-f1',
        farmId: 'farm-03',
        cropName: 'Tomato',
        variety: 'Abhinav Hybrid',
        areaAcres: 1.5,
        sowingDate: '2026-07-10',
        stage: 'Flowering',
        riskLevel: 'moderate',
        riskScore: 54,
        lastScanDate: '2 days ago',
        activeDisease: 'Early Blight risk'
      },
      {
        id: 'farm-3-f2',
        farmId: 'farm-03',
        cropName: 'Chilli',
        variety: 'Pusa Jwala',
        areaAcres: 1.3,
        sowingDate: '2026-07-15',
        stage: 'Vegetative',
        riskLevel: 'low',
        riskScore: 28,
        lastScanDate: '3 days ago',
        activeDisease: 'None'
      }
    ]
  }
];

export const INITIAL_CASES: CaseRecord[] = [
  {
    id: 'KR-1024',
    farmerId: 'farm-01',
    farmerName: 'Ramesh Patidar',
    farmerPhone: '+91 98260 14820',
    village: 'Sanwer',
    block: 'Sanwer',
    district: 'Indore',
    cropName: 'Cotton',
    diseaseName: 'Cotton Leaf Spot (Cercospora)',
    variety: 'BG-II Bt Hybrid',
    stage: 'Flowering',
    confidence: 62,
    imageUrl: '/TomatoYellowCurlVirus1.JPG.jpeg',
    timestamp: '2026-08-29 09:15 AM',
    dateCreated: '2026-08-29 09:15 AM',
    status: 'pending_expert',
    urgency: 'high',
    escalationReason: 'AI Confidence below 75% threshold (62%) & High environmental risk index',
    coordinates: { lat: 22.9734, lng: 75.8267 },
    riskScore: {
      overallScore: 78,
      riskLevel: 'high',
      breakdown: {
        imageEvidence: { score: 62, weight: 0.30, contribution: 18.6, description: 'Moderate leaf necrotic lesion signature' },
        environmentalRisk: { score: 86, weight: 0.25, contribution: 21.5, description: '82% RH + 18mm rain in 24h (highly conducive to fungal sporulation)' },
        pestTrend: { score: 82, weight: 0.20, contribution: 16.4, description: 'Trap count (18) exceeding economic threshold (12)' },
        historicalRisk: { score: 70, weight: 0.15, contribution: 10.5, description: 'Sanwer block history of August-September foliar outbreaks' },
        cropStageSensitivity: { score: 80, weight: 0.10, contribution: 8.0, description: 'Flowering stage vulnerable to leaf canopy loss' }
      },
      keyDrivers: [
        'High relative humidity (82%) with prolonged leaf wetness',
        'Rising sucking pest pressure facilitating fungal entry',
        'Recent continuous rainfall (18mm in 24h)'
      ],
      recommendationType: 'expert_review_required'
    },
    diagnosis: {
      id: 'diag-1024',
      caseId: 'KR-1024',
      diseaseName: 'Cotton Leaf Spot (Cercospora)',
      pathogenType: 'Fungal',
      confidence: 62,
      severityPercent: 42,
      severityLevel: 'high',
      sampleImageUrl: '/TomatoYellowCurlVirus1.JPG.jpeg',
      symptomPattern: 'Concentric necrotic circular lesions on mid-canopy leaves with reddish borders',
      isSimulated: true,
      needsExpertReview: true,
      escalationReason: 'AI Confidence below 75% threshold (62%) & High environmental risk index',
      riskScore: {
        overallScore: 78,
        riskLevel: 'high',
        breakdown: {
          imageEvidence: { score: 62, weight: 0.30, contribution: 18.6, description: 'Moderate leaf necrotic lesion signature' },
          environmentalRisk: { score: 86, weight: 0.25, contribution: 21.5, description: '82% RH + 18mm rain in 24h (highly conducive to fungal sporulation)' },
          pestTrend: { score: 82, weight: 0.20, contribution: 16.4, description: 'Trap count (18) exceeding economic threshold (12)' },
          historicalRisk: { score: 70, weight: 0.15, contribution: 10.5, description: 'Sanwer block history of August-September foliar outbreaks' },
          cropStageSensitivity: { score: 80, weight: 0.10, contribution: 8.0, description: 'Flowering stage vulnerable to leaf canopy loss' }
        },
        keyDrivers: [
          'High relative humidity (82%) with prolonged leaf wetness',
          'Rising sucking pest pressure facilitating fungal entry',
          'Recent continuous rainfall (18mm in 24h)'
        ],
        recommendationType: 'expert_review_required'
      },
      evidenceFactors: [
        { label: 'Leaf Symptom Pattern', value: 'Concentric necrotic spots', isConducive: true },
        { label: 'Ambient Humidity', value: '82% (Critical for spore germ)', isConducive: true },
        { label: '24h Precipitation', value: '18 mm rainfall', isConducive: true },
        { label: 'Leaf Wetness Duration', value: '> 8.5 continuous hours', isConducive: true },
        { label: 'Crop Phenology', value: 'Flowering & Early Boll Formation', isConducive: true }
      ]
    },
    advisory: {
      diseaseName: 'Cotton Leaf Spot (Cercospora)',
      severity: 'High (42% foliar coverage)',
      culturalManagement: [
        'Prune and safely destroy heavily infected lower canopy leaves to reduce inoculum load.',
        'Avoid flood irrigation during high humidity; ensure furrows have clean drainage.',
        'Weed around crop borders to improve solar canopy penetration and airflow.'
      ],
      biologicalManagement: [
        'Apply foliar spray of Trichoderma harzianum or Pseudomonas fluorescens @ 5g/L during overcast hours.',
        'Apply 5% Neem Seed Kernel Extract (NSKE) to suppress sucking insect vectors.'
      ],
      chemicalGuidance: {
        warning: 'Chemical intervention must strictly follow Central Insecticides Board & Registration Committee (CIBRC) approved labels.',
        regulatoryNote: 'Restricted advisory. Extension Officer / Scientist validation mandatory before high-potency chemical application.',
        approvedMoleculesExample: [
          'Copper Oxychloride 50% WP @ 2.5 g/L OR Carbendazim 12% + Mancozeb 63% WP @ 2 g/L (as per state agronomy package)',
          'Maintain 14-day pre-harvest waiting period.'
        ],
        safetyIntervalDays: 14
      },
      audioDurationSec: 42,
      isExpertApproved: false
    }
  },
  {
    id: 'KR-1025',
    farmerId: 'farm-02',
    farmerName: 'Sunita Bai',
    farmerPhone: '+91 94250 88219',
    village: 'Depalpur',
    block: 'Depalpur',
    district: 'Indore',
    cropName: 'Soybean',
    diseaseName: 'Soybean Aerial Blight / Rust',
    variety: 'JS 20-34',
    stage: 'Boll Formation / Pod Filling',
    confidence: 89,
    imageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80',
    timestamp: '2026-08-29 07:45 AM',
    dateCreated: '2026-08-29 07:45 AM',
    status: 'expert_confirmed',
    urgency: 'critical',
    escalationReason: 'Critical severity index (>50%) flagged for immediate containment',
    coordinates: { lat: 22.8465, lng: 75.5482 },
    riskScore: {
      overallScore: 86,
      riskLevel: 'critical',
      breakdown: {
        imageEvidence: { score: 89, weight: 0.30, contribution: 26.7, description: 'High visual confidence of aerial web blight' },
        environmentalRisk: { score: 92, weight: 0.25, contribution: 23.0, description: 'Extreme humidity + saturated topsoil' },
        pestTrend: { score: 74, weight: 0.20, contribution: 14.8, description: 'Moderate caterpillar activity' },
        historicalRisk: { score: 80, weight: 0.15, contribution: 12.0, description: 'Depalpur block endemic hotspot in late August' },
        cropStageSensitivity: { score: 95, weight: 0.10, contribution: 9.5, description: 'Pod filling stage loss causes 60%+ yield drop' }
      },
      keyDrivers: [
        'High temperature combined with 90%+ microclimate canopy humidity',
        'Heavy soil saturation preventing root oxygenation',
        'Nearby community cluster with confirmed rust spots'
      ],
      recommendationType: 'expert_review_required'
    },
    diagnosis: {
      id: 'diag-1025',
      caseId: 'KR-1025',
      diseaseName: 'Soybean Aerial Blight / Rust',
      pathogenType: 'Fungal',
      confidence: 89,
      severityPercent: 58,
      severityLevel: 'critical',
      sampleImageUrl: 'https://images.unsplash.com/photo-1598880940371-c756e015fea1?auto=format&fit=crop&w=600&q=80',
      symptomPattern: 'Water-soaked irregular blighted patches with rapid foliar desiccation',
      isSimulated: true,
      needsExpertReview: true,
      escalationReason: 'Critical severity index (>50%) flagged for immediate containment',
      riskScore: {
        overallScore: 86,
        riskLevel: 'critical',
        breakdown: {
          imageEvidence: { score: 89, weight: 0.30, contribution: 26.7, description: 'High visual confidence of aerial web blight' },
          environmentalRisk: { score: 92, weight: 0.25, contribution: 23.0, description: 'Extreme humidity + saturated topsoil' },
          pestTrend: { score: 74, weight: 0.20, contribution: 14.8, description: 'Moderate caterpillar activity' },
          historicalRisk: { score: 80, weight: 0.15, contribution: 12.0, description: 'Depalpur block endemic hotspot in late August' },
          cropStageSensitivity: { score: 95, weight: 0.10, contribution: 9.5, description: 'Pod filling stage loss causes 60%+ yield drop' }
        },
        keyDrivers: [
          'High temperature combined with 90%+ microclimate canopy humidity',
          'Heavy soil saturation preventing root oxygenation',
          'Nearby community cluster with confirmed rust spots'
        ],
        recommendationType: 'expert_review_required'
      },
      evidenceFactors: [
        { label: 'Blight Lesion Density', value: 'High (>50% canopy)', isConducive: true },
        { label: 'Soil Saturation', value: '88% field capacity', isConducive: true },
        { label: 'Leaf Temperature', value: '26.8°C (Optimal pathogen range)', isConducive: true }
      ]
    },
    advisory: {
      diseaseName: 'Soybean Aerial Blight / Rust',
      severity: 'Critical — Stage 3',
      culturalManagement: [
        'Immediately drain excess surface water from furrows.',
        'Avoid intercultural operations while leaves are wet to prevent mechanical spore transfer.'
      ],
      biologicalManagement: [
        'Spray Trichoderma viride bio-agent formulation 10g/L early morning.'
      ],
      chemicalGuidance: {
        warning: 'High risk outbreak zone. Apply emergency containment spray per KVK recommendation.',
        regulatoryNote: 'Approved by Dr. Ananya Sharma (Senior Agronomist, Indore Zonal Research).',
        approvedMoleculesExample: [
          'Hexaconazole 5% EC @ 2ml/L OR Tebuconazole 25.9% EC @ 1.5ml/L under protective equipment.'
        ],
        safetyIntervalDays: 21
      },
      expertName: 'Dr. Ananya Sharma, ZARS Indore',
      isExpertApproved: true
    },
    expertReview: {
      expertId: 'EXP-09',
      expertName: 'Dr. Ananya Sharma',
      reviewedAt: '2026-08-29 08:30 AM',
      action: 'confirmed',
      confirmedDisease: 'Soybean Aerial Blight / Rust',
      comments: 'Confirmed severe Rhizoctonia aerial blight. Immediate containment advised to prevent spread across Depalpur cluster.',
      adjustedSeverity: 'Critical (58%)'
    }
  },
  {
    id: 'KR-1019',
    farmerId: 'farm-01',
    farmerName: 'Ramesh Patidar',
    farmerPhone: '+91 98260 14820',
    village: 'Sanwer',
    block: 'Sanwer',
    district: 'Indore',
    cropName: 'Soybean',
    diseaseName: 'Healthy Soybean Canopy (Minor Nutrient Stress)',
    variety: 'JS 95-60',
    stage: 'Pod Filling',
    confidence: 94,
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    timestamp: '2026-08-26 03:20 PM',
    dateCreated: '2026-08-26 03:20 PM',
    status: 'ai_screened',
    urgency: 'low',
    coordinates: { lat: 22.9741, lng: 75.8272 },
    riskScore: {
      overallScore: 24,
      riskLevel: 'low',
      breakdown: {
        imageEvidence: { score: 15, weight: 0.30, contribution: 4.5, description: 'No fungal/bacterial lesion detected' },
        environmentalRisk: { score: 32, weight: 0.25, contribution: 8.0, description: 'Moderate humidity with good solar radiation' },
        pestTrend: { score: 28, weight: 0.20, contribution: 5.6, description: 'Pest trap below economic threshold (6/15)' },
        historicalRisk: { score: 25, weight: 0.15, contribution: 3.75, description: 'Low historical incidence in late August' },
        cropStageSensitivity: { score: 20, weight: 0.10, contribution: 2.0, description: 'Crop vigor strong in pod-fill stage' }
      },
      keyDrivers: ['Adequate sun exposure', 'Low pest density'],
      recommendationType: 'pre_approved_ipm'
    },
    diagnosis: {
      id: 'diag-1019',
      caseId: 'KR-1019',
      diseaseName: 'Healthy Soybean Canopy (Minor Nutrient Stress)',
      pathogenType: 'Physiological',
      confidence: 94,
      severityPercent: 5,
      severityLevel: 'low',
      sampleImageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
      symptomPattern: 'Uniform green foliage with minor interveinal yellowing indicative of slight zinc micronutrient deficiency.',
      isSimulated: false,
      needsExpertReview: false,
      riskScore: {
        overallScore: 24,
        riskLevel: 'low',
        breakdown: {
          imageEvidence: { score: 15, weight: 0.30, contribution: 4.5, description: 'No fungal/bacterial lesion detected' },
          environmentalRisk: { score: 32, weight: 0.25, contribution: 8.0, description: 'Moderate humidity with good solar radiation' },
          pestTrend: { score: 28, weight: 0.20, contribution: 5.6, description: 'Pest trap below economic threshold (6/15)' },
          historicalRisk: { score: 25, weight: 0.15, contribution: 3.75, description: 'Low historical incidence in late August' },
          cropStageSensitivity: { score: 20, weight: 0.10, contribution: 2.0, description: 'Crop vigor strong in pod-fill stage' }
        },
        keyDrivers: ['Adequate sun exposure', 'Low pest density'],
        recommendationType: 'pre_approved_ipm'
      },
      evidenceFactors: [
        { label: 'Leaf Discoloration', value: 'Minimal interveinal chlorosis (<5%)', isConducive: false },
        { label: 'Canopy Density', value: 'High Vigor (Pod Filling)', isConducive: false },
        { label: 'Moisture Level', value: 'Adequate Topsoil Field Capacity', isConducive: false }
      ]
    },
    advisory: {
      diseaseName: 'Healthy Soybean Canopy (Minor Zinc Stress)',
      severity: 'Low / Normal',
      culturalManagement: ['Continue standard irrigation scheduling.', 'Maintain weed-free furrows.'],
      biologicalManagement: ['Foliar application of Chelated Zinc (Zn-EDTA 12%) @ 1g/L for vibrant chlorophyll synthesis.'],
      chemicalGuidance: {
        allowed: false,
        warning: 'No synthetic fungicide or pesticide required for nutrient balance.'
      },
      isExpertApproved: true
    }
  },
  {
    id: 'KR-1012',
    farmerId: 'farm-01',
    farmerName: 'Ramesh Patidar',
    farmerPhone: '+91 98260 14820',
    village: 'Sanwer',
    block: 'Sanwer',
    district: 'Indore',
    cropName: 'Cotton',
    diseaseName: 'Early Bacterial Blight (Angular Leaf Spot)',
    variety: 'BG-II Bt Hybrid',
    stage: 'Flowering',
    confidence: 88,
    imageUrl: '/cotton_leaf_spot.svg',
    timestamp: '2026-08-21 11:40 AM',
    dateCreated: '2026-08-21 11:40 AM',
    status: 'expert_approved',
    urgency: 'medium',
    coordinates: { lat: 22.9734, lng: 75.8267 },
    riskScore: {
      overallScore: 52,
      riskLevel: 'moderate',
      breakdown: {
        imageEvidence: { score: 55, weight: 0.30, contribution: 16.5, description: 'Angular vein-delimited lesions visible' },
        environmentalRisk: { score: 60, weight: 0.25, contribution: 15.0, description: 'Intermittent rains with 76% RH' },
        pestTrend: { score: 45, weight: 0.20, contribution: 9.0, description: 'Moderate jassid counts on yellow sticky traps' },
        historicalRisk: { score: 40, weight: 0.15, contribution: 6.0, description: 'Sanwer sector has recurring angular leaf spot' },
        cropStageSensitivity: { score: 55, weight: 0.10, contribution: 5.5, description: 'Squaring phase vulnerable to leaf shedding' }
      },
      keyDrivers: ['Leaf wetness following rain showers', 'Moderate vector activity'],
      recommendationType: 'pre_approved_ipm'
    },
    diagnosis: {
      id: 'diag-1012',
      caseId: 'KR-1012',
      diseaseName: 'Early Bacterial Blight (Angular Leaf Spot)',
      pathogenType: 'Bacterial',
      confidence: 88,
      severityPercent: 18,
      severityLevel: 'moderate',
      sampleImageUrl: '/cotton_leaf_spot.svg',
      symptomPattern: 'Angular water-soaked spots bounded by leaf veinlets with slight chlorotic halos.',
      isSimulated: false,
      needsExpertReview: false,
      riskScore: {
        overallScore: 52,
        riskLevel: 'moderate',
        breakdown: {
          imageEvidence: { score: 55, weight: 0.30, contribution: 16.5, description: 'Angular vein-delimited lesions visible' },
          environmentalRisk: { score: 60, weight: 0.25, contribution: 15.0, description: 'Intermittent rains with 76% RH' },
          pestTrend: { score: 45, weight: 0.20, contribution: 9.0, description: 'Moderate jassid counts on yellow sticky traps' },
          historicalRisk: { score: 40, weight: 0.15, contribution: 6.0, description: 'Sanwer sector has recurring angular leaf spot' },
          cropStageSensitivity: { score: 55, weight: 0.10, contribution: 5.5, description: 'Squaring phase vulnerable to leaf shedding' }
        },
        keyDrivers: ['Leaf wetness following rain showers', 'Moderate vector activity'],
        recommendationType: 'pre_approved_ipm'
      },
      evidenceFactors: [
        { label: 'Lesion Morphology', value: 'Angular, vein-bound spots', isConducive: true },
        { label: 'Canopy Microclimate', value: '76% RH with overcast periods', isConducive: true }
      ]
    },
    advisory: {
      diseaseName: 'Early Bacterial Blight (Angular Leaf Spot)',
      severity: 'Moderate (18% canopy)',
      culturalManagement: ['Avoid overhead irrigation.', 'Collect fallen diseased squares.'],
      biologicalManagement: ['Spray Streptocycline 100ppm (1g/10L) combined with Copper Oxychloride 50% WP @ 2.5g/L.'],
      chemicalGuidance: {
        allowed: true,
        warning: 'Apply prophylactic copper formulation per label directions.',
        safetyIntervalDays: 14
      },
      isExpertApproved: true
    },
    expertReview: {
      expertId: 'EXP-04',
      expertName: 'Dr. R.K. Verma',
      reviewedAt: '2026-08-21 01:15 PM',
      action: 'confirmed',
      confirmedDisease: 'Early Bacterial Blight (Xanthomonas malvacearum)',
      comments: 'Early stage angular spot confirmed. Copper oxychloride formulation approved for prophylactic containment.'
    }
  },
  {
    id: 'KR-0988',
    farmerId: 'farm-01',
    farmerName: 'Ramesh Patidar',
    farmerPhone: '+91 98260 14820',
    village: 'Sanwer',
    block: 'Sanwer',
    district: 'Indore',
    cropName: 'Cotton',
    diseaseName: 'Early Cercospora Leaf Spot',
    variety: 'BG-II Bt Hybrid',
    stage: 'Vegetative',
    confidence: 86,
    imageUrl: '/cotton_leaf_spot.svg',
    timestamp: '2026-08-12 10:10 AM',
    dateCreated: '2026-08-12 10:10 AM',
    status: 'expert_confirmed',
    urgency: 'high',
    escalationReason: 'Historical endemic cluster + elevated leaf wetness index',
    coordinates: { lat: 22.9734, lng: 75.8267 },
    riskScore: {
      overallScore: 78,
      riskLevel: 'high',
      breakdown: {
        imageEvidence: { score: 72, weight: 0.30, contribution: 21.6, description: 'Circular leaf spotting on 34% leaf area' },
        environmentalRisk: { score: 85, weight: 0.25, contribution: 21.25, description: 'Heavy monsoon showers + 88% humidity' },
        pestTrend: { score: 75, weight: 0.20, contribution: 15.0, description: 'Trap count 15 insects' },
        historicalRisk: { score: 70, weight: 0.15, contribution: 10.5, description: 'Mid-August endemic window' },
        cropStageSensitivity: { score: 70, weight: 0.10, contribution: 7.0, description: 'Early canopy development' }
      },
      keyDrivers: ['High humidity post heavy rainfall', 'Spore germination window open'],
      recommendationType: 'expert_review_required'
    },
    diagnosis: {
      id: 'diag-0988',
      caseId: 'KR-0988',
      diseaseName: 'Early Cercospora Leaf Spot',
      pathogenType: 'Fungal',
      confidence: 86,
      severityPercent: 34,
      severityLevel: 'high',
      sampleImageUrl: '/cotton_leaf_spot.svg',
      symptomPattern: 'Initial red-brown circular spots on lower vegetative foliage with clear center drop-out.',
      isSimulated: false,
      needsExpertReview: true,
      riskScore: {
        overallScore: 78,
        riskLevel: 'high',
        breakdown: {
          imageEvidence: { score: 72, weight: 0.30, contribution: 21.6, description: 'Circular leaf spotting on 34% leaf area' },
          environmentalRisk: { score: 85, weight: 0.25, contribution: 21.25, description: 'Heavy monsoon showers + 88% humidity' },
          pestTrend: { score: 75, weight: 0.20, contribution: 15.0, description: 'Trap count 15 insects' },
          historicalRisk: { score: 70, weight: 0.15, contribution: 10.5, description: 'Mid-August endemic window' },
          cropStageSensitivity: { score: 70, weight: 0.10, contribution: 7.0, description: 'Early canopy development' }
        },
        keyDrivers: ['High humidity post heavy rainfall', 'Spore germination window open'],
        recommendationType: 'expert_review_required'
      },
      evidenceFactors: [
        { label: 'Leaf Spot Pattern', value: 'Red-brown circular spots', isConducive: true },
        { label: 'Humidity', value: '88% RH', isConducive: true }
      ]
    },
    advisory: {
      diseaseName: 'Early Cercospora Leaf Spot',
      severity: 'High (34% canopy)',
      culturalManagement: ['Sanitize lower leaves and maintain drainage trenches.'],
      biologicalManagement: ['Foliar bio-agent Trichoderma viride @ 5g/L applied.'],
      chemicalGuidance: {
        allowed: true,
        warning: 'Restricted chemical spray subject to extension verification.'
      },
      isExpertApproved: true
    }
  },
  {
    id: 'KR-0972',
    farmerId: 'farm-01',
    farmerName: 'Ramesh Patidar',
    farmerPhone: '+91 98260 14820',
    village: 'Sanwer',
    block: 'Sanwer',
    district: 'Indore',
    cropName: 'Tomato',
    diseaseName: 'Healthy Tomato Foliage',
    variety: 'Abhinav Hybrid',
    stage: 'Flowering',
    confidence: 96,
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    timestamp: '2026-08-04 08:50 AM',
    dateCreated: '2026-08-04 08:50 AM',
    status: 'ai_screened',
    urgency: 'low',
    coordinates: { lat: 22.9730, lng: 75.8260 },
    riskScore: {
      overallScore: 18,
      riskLevel: 'low',
      breakdown: {
        imageEvidence: { score: 10, weight: 0.30, contribution: 3.0, description: 'Pristine foliar signature' },
        environmentalRisk: { score: 25, weight: 0.25, contribution: 6.25, description: 'Good ventilation' },
        pestTrend: { score: 20, weight: 0.20, contribution: 4.0, description: 'Trap counts 3 (well below threshold)' },
        historicalRisk: { score: 20, weight: 0.15, contribution: 3.0, description: 'Low August risk' },
        cropStageSensitivity: { score: 20, weight: 0.10, contribution: 2.0, description: 'Robust flower set' }
      },
      keyDrivers: ['Ideal solar exposure', 'Negligible pest count'],
      recommendationType: 'pre_approved_ipm'
    },
    diagnosis: {
      id: 'diag-0972',
      caseId: 'KR-0972',
      diseaseName: 'Healthy Tomato Foliage (Clean Inspection)',
      pathogenType: 'Physiological',
      confidence: 96,
      severityPercent: 0,
      severityLevel: 'low',
      sampleImageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
      symptomPattern: 'Lush dark green leaves, no chlorosis, clean flower clusters with zero active lesions.',
      isSimulated: false,
      needsExpertReview: false,
      riskScore: {
        overallScore: 18,
        riskLevel: 'low',
        breakdown: {
          imageEvidence: { score: 10, weight: 0.30, contribution: 3.0, description: 'Pristine foliar signature' },
          environmentalRisk: { score: 25, weight: 0.25, contribution: 6.25, description: 'Good ventilation' },
          pestTrend: { score: 20, weight: 0.20, contribution: 4.0, description: 'Trap counts 3 (well below threshold)' },
          historicalRisk: { score: 20, weight: 0.15, contribution: 3.0, description: 'Low August risk' },
          cropStageSensitivity: { score: 20, weight: 0.10, contribution: 2.0, description: 'Robust flower set' }
        },
        keyDrivers: ['Ideal solar exposure', 'Negligible pest count'],
        recommendationType: 'pre_approved_ipm'
      },
      evidenceFactors: [
        { label: 'Foliar Appearance', value: 'Pristine emerald foliage', isConducive: false },
        { label: 'Microclimate', value: 'Optimal 28°C / 65% RH', isConducive: false }
      ]
    },
    advisory: {
      diseaseName: 'Healthy Tomato Foliage',
      severity: 'Nil',
      culturalManagement: ['Maintain regular drip irrigation cycles.', 'Prune lower sucker shoots.'],
      biologicalManagement: ['Apply Panchagavya or sea-weed extract foliar spray for enhanced bloom vigor.'],
      chemicalGuidance: {
        allowed: false,
        warning: 'No chemicals required.'
      },
      isExpertApproved: true
    }
  }
];

export const INITIAL_FOLLOW_UPS: FollowUpRecord[] = [
  {
    caseId: 'KR-0988',
    fieldId: 'farm-1-f1',
    cropName: 'Cotton',
    initialScanDate: '2026-08-12',
    initialSeverity: 34,
    initialRiskScore: 78,
    initialImageUrl: '/cotton_leaf_spot.svg',
    followUpDate: '2026-08-26',
    followUpSeverity: 12,
    followUpRiskScore: 39,
    followUpImageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    farmerFeedback: 'Significantly Improved',
    treatmentApplied: [
      'Field sanitation & infected leaf removal (Cultural)',
      'Trichoderma harzianum biological foliar spray',
      'Improved furrow drainage'
    ],
    expertVerified: true,
    status: 'Completed',
    notes: 'Lesions dried up; new shoots free from chlorosis. Crop risk index safely plummeted from 78 down to 39.',
    datasetContributionId: 'MP-IND-2026-COTTON-0988'
  }
];

export const INITIAL_HOTSPOTS: GisHotspot[] = [
  {
    id: 'HOT-01',
    village: 'Sanwer Kalan',
    block: 'Sanwer',
    district: 'Indore',
    crop: 'Cotton',
    dominantIssue: 'Cotton Leaf Spot & Sucking Pest',
    activeCases: 14,
    confirmedCases: 9,
    riskLevel: 'high',
    riskScore: 78,
    trend: 'increasing',
    coordinates: { lat: 22.9734, lng: 75.8267 },
    farmersAffected: 42,
    weatherCondition: '82% RH, 18mm rain'
  },
  {
    id: 'HOT-02',
    village: 'Depalpur Rural',
    block: 'Depalpur',
    district: 'Indore',
    crop: 'Soybean',
    dominantIssue: 'Soybean Aerial Blight',
    activeCases: 22,
    confirmedCases: 17,
    riskLevel: 'critical',
    riskScore: 86,
    trend: 'increasing',
    coordinates: { lat: 22.8465, lng: 75.5482 },
    farmersAffected: 68,
    weatherCondition: '90% RH, standing water'
  },
  {
    id: 'HOT-03',
    village: 'Mhow Cantt Perimeter',
    block: 'Mhow',
    district: 'Indore',
    crop: 'Tomato & Chilli',
    dominantIssue: 'Early Blight & Whitefly',
    activeCases: 8,
    confirmedCases: 4,
    riskLevel: 'moderate',
    riskScore: 52,
    trend: 'stable',
    coordinates: { lat: 22.5539, lng: 75.7644 },
    farmersAffected: 24,
    weatherCondition: '74% RH, intermittent breeze'
  },
  {
    id: 'HOT-04',
    village: 'Hatod Khurd',
    block: 'Hatod',
    district: 'Indore',
    crop: 'Cotton',
    dominantIssue: 'Aphid Colony Pressure',
    activeCases: 11,
    confirmedCases: 6,
    riskLevel: 'high',
    riskScore: 74,
    trend: 'increasing',
    coordinates: { lat: 22.7938, lng: 75.7289 },
    farmersAffected: 31,
    weatherCondition: 'Overcast, high trap count'
  },
  {
    id: 'HOT-05',
    village: 'Kanadia Agro Zone',
    block: 'Indore Urban Rural',
    district: 'Indore',
    crop: 'Wheat / Nursery',
    dominantIssue: 'Healthy / Minor Rust Watch',
    activeCases: 3,
    confirmedCases: 1,
    riskLevel: 'low',
    riskScore: 22,
    trend: 'decreasing',
    coordinates: { lat: 22.7196, lng: 75.9064 },
    farmersAffected: 12,
    weatherCondition: 'Optimal solar exposure'
  }
];

export const INITIAL_FIELD_VISITS: FieldVisit[] = [
  {
    id: 'VISIT-101',
    caseId: 'KR-1024',
    farmerName: 'Ramesh Patidar',
    farmerPhone: '+91 98260 14820',
    village: 'Sanwer',
    cropName: 'Cotton',
    scheduledDate: 'Today, 02:00 PM',
    priority: 'High',
    status: 'Scheduled',
    observations: 'Inspect middle canopy leaf spot spread and verify yellow sticky trap count.'
  },
  {
    id: 'VISIT-102',
    caseId: 'KR-1025',
    farmerName: 'Sunita Bai',
    farmerPhone: '+91 94250 88219',
    village: 'Depalpur',
    cropName: 'Soybean',
    scheduledDate: 'Today, 04:30 PM',
    priority: 'High',
    status: 'Scheduled',
    observations: 'Deliver emergency KVK bio-agent kit and check furrow drainage.'
  },
  {
    id: 'VISIT-103',
    farmerName: 'Arjun Verma',
    farmerPhone: '+91 98931 44512',
    village: 'Mhow',
    cropName: 'Tomato',
    scheduledDate: 'Tomorrow, 10:00 AM',
    priority: 'Medium',
    status: 'Scheduled',
    observations: 'Routine IPM check on tomato staking and early blight prevention.'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'High Disease Risk Alert — Cotton Field 01',
    message: 'High humidity (82%) + rainfall creates an active window for Cercospora leaf spot. Inspect crop now.',
    timestamp: '15 mins ago',
    type: 'risk_alert',
    riskLevel: 'high',
    read: false,
    targetRole: 'farmer',
    actionPath: 'crop-health'
  },
  {
    id: 'notif-2',
    title: 'Expert Response Received for Case #KR-1025',
    message: 'Dr. Ananya Sharma confirmed Soybean Blight diagnosis and approved tailored IPM containment advisory.',
    timestamp: '45 mins ago',
    type: 'expert_update',
    riskLevel: 'critical',
    read: false,
    targetRole: 'farmer',
    actionPath: 'advisory'
  },
  {
    id: 'notif-3',
    title: 'Follow-Up Verification Reminder',
    message: 'Upload a 14-day recovery photo for Cotton Field 01 to update your field health risk score.',
    timestamp: '2 hours ago',
    type: 'followup_reminder',
    riskLevel: 'moderate',
    read: true,
    targetRole: 'farmer',
    actionPath: 'follow-up'
  },
  {
    id: 'notif-4',
    title: 'New Escalation: Case #KR-1024 Pending Review',
    message: 'AI Confidence 62% on Cotton crop in Sanwer block. Human expert validation required.',
    timestamp: '30 mins ago',
    type: 'expert_update',
    riskLevel: 'high',
    read: false,
    targetRole: 'expert',
    actionPath: 'expert-queue'
  },
  {
    id: 'notif-5',
    title: 'District Cluster Alert: Depalpur Outbreak',
    message: '17 confirmed Soybean Blight cases recorded in Depalpur block. Intervention plan triggered.',
    timestamp: '1 hour ago',
    type: 'risk_alert',
    riskLevel: 'critical',
    read: false,
    targetRole: 'officer',
    actionPath: 'gis-map'
  }
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-a',
    name: 'Scenario A: High AI Confidence (91%)',
    tag: 'Standard IPM Flow',
    description: 'Clear image symptoms of Cotton Leaf Spot. Auto-generates safe IPM advisory with no expert bottleneck.',
    crop: 'Cotton',
    disease: 'Cotton Leaf Spot (Cercospora)',
    confidence: 91,
    severity: 34,
    riskScore: 78,
    requiresExpert: false,
    sampleImage: '/cotton_leaf_spot.svg',
    leafType: 'Cotton Foliage with Brown Necrotic Rings',
    notes: 'Demonstrates confident AI screening with pre-approved cultural & biological advisory.'
  },
  {
    id: 'scenario-b',
    name: 'Scenario B: Low Confidence (62%) Escalation',
    tag: 'Safety Guardrail Flow',
    description: 'Ambiguous lesion pattern triggers confidence gating (<75%). Automatically routes case to Expert Scientist.',
    crop: 'Cotton',
    disease: 'Suspected Leaf Spot / Foliar Blight',
    confidence: 62,
    severity: 42,
    riskScore: 82,
    requiresExpert: true,
    sampleImage: '/cotton_leaf_spot.svg',
    leafType: 'Irregular chlorotic leaf spots with leaf curl',
    notes: 'Demonstrates human-in-the-loop expert review preventing AI hallucination in critical farming.'
  },
  {
    id: 'scenario-c',
    name: 'Scenario C: Sucking Pest Outbreak (87%)',
    tag: 'IoT + Pest Trap Trigger',
    description: 'Trap count (18/12) + high temperature triggers sucking pest early warning before foliar destruction.',
    crop: 'Soybean',
    disease: 'Aphids & Whitefly Infestation',
    confidence: 87,
    severity: 48,
    riskScore: 84,
    requiresExpert: true,
    sampleImage: 'https://upload.wikimedia.org/wikipedia/commons/3/34/CSIRO_ScienceImage_7848_Aphids_on_cotton_8.jpg',
    leafType: 'Soybean leaf underside with aphid clusters & honeydew',
    notes: 'Demonstrates multi-source early warning combining physical IoT traps with AI vision.'
  },
  {
    id: 'scenario-d',
    name: 'Scenario D: Before vs After Follow-up',
    tag: 'Feedback Loop & AI Retraining',
    description: '14 days post biological treatment, farmer submits recovered image. Risk drops from 78 to 39.',
    crop: 'Cotton',
    disease: 'Cotton Leaf Spot (Resolved)',
    confidence: 94,
    severity: 12,
    riskScore: 39,
    requiresExpert: false,
    sampleImage: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    leafType: 'Healthy green canopy with healed lesion scars',
    notes: 'Demonstrates closed-loop verification and dataset accumulation for continuous model retraining.'
  }
];

export const INITIAL_DATASETS: Dataset[] = [
  {
    id: 'DS-SOYBEAN-RUST-2026',
    name: 'Central India Soybean Rust & Cercospora Benchmark',
    description: 'High-resolution in-situ leaf dataset capturing Asian Soybean Rust (Phakopsora pachyrhizi), Cercospora leaf spot, and healthy controls across the Malwa Plateau.',
    crop: 'Soybean',
    targetDiseases: ['Asian Soybean Rust', 'Cercospora Leaf Spot', 'Yellow Mosaic Virus', 'Healthy Foliage'],
    season: 'Kharif 2026',
    region: 'Indore & Malwa Plateau, MP',
    imageCount: 4,
    annotatedCount: 4,
    verifiedCount: 4,
    createdAt: '2026-08-15',
    updatedAt: '2026-09-08',
    status: 'retraining_ready',
    author: 'ICAR-IISR Indore & KrishiRakshak AI Lab',
    tags: ['Field Benchmark', 'High-Res In-Situ', 'Ground Truth Validated', 'AI Retraining Ready'],
    coverImage: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a47?auto=format&fit=crop&w=600&q=80',
    modelAccuracyBaseline: 91.4,
    modelRetrainedAccuracy: 96.8
  },
  {
    id: 'DS-COTTON-CURL-2026',
    name: 'Cotton Whitefly, Leaf Curl & Bacterial Blight Archive',
    description: 'Curated field imagery of Bt-2 and indigenous desi cotton cultivars with whitefly nymphs, leaf curl virus upward curling, and bacterial angular blight lesions.',
    crop: 'Cotton',
    targetDiseases: ['Cotton Leaf Curl Virus (CLCuV)', 'Bacterial Blight (Xanthomonas)', 'Aphids & Sucking Pests', 'Healthy Foliage'],
    season: 'Kharif 2026',
    region: 'Nimar & Khandwa Belt, MP',
    imageCount: 3,
    annotatedCount: 3,
    verifiedCount: 3,
    createdAt: '2026-08-20',
    updatedAt: '2026-09-09',
    status: 'active',
    author: 'Central Institute for Cotton Research (CICR) & Krishi Cluster',
    tags: ['Sucking Pests', 'Whitefly Vector', 'Viral Phenotype', 'Field Labeled'],
    coverImage: '/cotton_leaf_spot.svg',
    modelAccuracyBaseline: 88.5,
    modelRetrainedAccuracy: 94.6
  },
  {
    id: 'DS-WHEAT-RUST-2026',
    name: 'Wheat Yellow & Brown Rust Multi-Stage Benchmark',
    description: 'Diagnostic leaf dataset covering Stripe (Yellow) Rust pustules, Powdery Mildew, and healthy canopy in irrigated wheat plots.',
    crop: 'Wheat',
    targetDiseases: ['Yellow Stripe Rust', 'Brown Leaf Rust', 'Powdery Mildew', 'Healthy Foliage'],
    season: 'Rabi 2025-26',
    region: 'Malwa & Narmadapuram Plains',
    imageCount: 3,
    annotatedCount: 3,
    verifiedCount: 3,
    createdAt: '2026-08-28',
    updatedAt: '2026-09-06',
    status: 'active',
    author: 'IARI Regional Station & Krishi Vigyan Kendra',
    tags: ['Stripe Rust', 'Pustule Detection', 'Micro-Lesions', 'Rabi Benchmark'],
    coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    modelAccuracyBaseline: 93.1,
    modelRetrainedAccuracy: 97.4
  },
  {
    id: 'DS-PADDY-BLAST-2026',
    name: 'Paddy Blast & Bacterial Leaf Streak Diagnostic Set',
    description: 'Spindle-shaped blast lesions and bacterial streak observations collected from canal command areas under high relative humidity.',
    crop: 'Paddy / Rice',
    targetDiseases: ['Rice Blast (Pyricularia)', 'Bacterial Leaf Blight', 'Sheath Rot', 'Healthy Foliage'],
    season: 'Kharif 2026',
    region: 'Chambal & Central Basin',
    imageCount: 2,
    annotatedCount: 2,
    verifiedCount: 2,
    createdAt: '2026-09-01',
    updatedAt: '2026-09-07',
    status: 'active',
    author: 'Directorate of Rice Research & State Agri Dept',
    tags: ['Blast Lesions', 'High Humidity Phenotype', 'Field Labeled'],
    coverImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    modelAccuracyBaseline: 90.2,
    modelRetrainedAccuracy: 95.8
  }
];

export const INITIAL_DATASET_IMAGES: DatasetImage[] = [
  {
    id: 'IMG-DS-0101',
    datasetId: 'DS-SOYBEAN-RUST-2026',
    imageUrl: '/cotton_leaf_spot.svg',
    cropName: 'Soybean',
    variety: 'JS 9560',
    diseaseLabel: 'Asian Soybean Rust',
    pathogenType: 'fungal',
    healthStatus: 'diseased',
    severityPercent: 55,
    growthStage: 'Pod / Boll Formation',
    foliarSide: 'Abaxial (Underside)',
    location: {
      state: 'Madhya Pradesh',
      district: 'Indore',
      village: 'Sanwer Kalan',
      gps: { lat: 22.9734, lng: 75.8267 }
    },
    capturedAt: '2026-09-07 10:30',
    contributedBy: {
      name: 'Ramesh Patel',
      role: 'farmer',
      id: 'usr-farmer-01'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. Anita Sharma (IISR)',
    boundingBoxes: [
      { id: 'box-1', x: 28, y: 35, width: 22, height: 26, label: 'Rust Pustules', confidence: 0.96 },
      { id: 'box-2', x: 55, y: 48, width: 20, height: 24, label: 'Chlorotic Halo', confidence: 0.92 }
    ],
    notes: 'Brown powdery uredinia on lower foliar surface. Confirmed microscopic spore morphology.',
    cameraInfo: 'Redmi Note 12 (Macro lens, 50MP)',
    tags: ['Ground Truth', 'Uredinia Pustules', 'Foliar Infection']
  },
  {
    id: 'IMG-DS-0102',
    datasetId: 'DS-SOYBEAN-RUST-2026',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a47?auto=format&fit=crop&w=600&q=80',
    cropName: 'Soybean',
    variety: 'JS 20-34',
    diseaseLabel: 'Cercospora Leaf Spot',
    pathogenType: 'fungal',
    healthStatus: 'diseased',
    severityPercent: 42,
    growthStage: 'Vegetative',
    foliarSide: 'Adaxial (Top Surface)',
    location: {
      state: 'Madhya Pradesh',
      district: 'Indore',
      village: 'Depalpur Rural',
      gps: { lat: 22.8465, lng: 75.5482 }
    },
    capturedAt: '2026-09-06 14:15',
    contributedBy: {
      name: 'Suresh Verma (Field Officer)',
      role: 'extension',
      id: 'usr-ext-01'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. Anita Sharma (IISR)',
    boundingBoxes: [
      { id: 'box-3', x: 40, y: 30, width: 28, height: 30, label: 'Frogeye Spot', confidence: 0.94 }
    ],
    notes: 'Circular lesions with grey center and reddish-brown margin.',
    cameraInfo: 'Samsung Galaxy A54 (Natural Sunlight)',
    tags: ['Frogeye Lesion', 'Early Inception']
  },
  {
    id: 'IMG-DS-0103',
    datasetId: 'DS-SOYBEAN-RUST-2026',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/CSIRO_ScienceImage_7848_Aphids_on_cotton_8.jpg',
    cropName: 'Soybean',
    variety: 'RVS 2001-4',
    diseaseLabel: 'Yellow Mosaic Virus',
    pathogenType: 'viral',
    healthStatus: 'diseased',
    severityPercent: 68,
    growthStage: 'Flowering',
    foliarSide: 'Full Canopy',
    location: {
      state: 'Madhya Pradesh',
      district: 'Ujjain',
      village: 'Ghatiya',
      gps: { lat: 23.2845, lng: 75.7892 }
    },
    capturedAt: '2026-09-05 09:45',
    contributedBy: {
      name: 'Dr. Anita Sharma',
      role: 'expert',
      id: 'usr-expert-01'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. Anita Sharma (IISR)',
    boundingBoxes: [
      { id: 'box-4', x: 20, y: 25, width: 60, height: 50, label: 'Mosaic Chlorosis', confidence: 0.98 }
    ],
    notes: 'Interspersed yellow and green mosaic patches. Whitefly vector observed in field.',
    cameraInfo: 'Sony Alpha 6400 (Macro)',
    tags: ['Whitefly Vector', 'Viral Mosaic', 'Severe Stunting']
  },
  {
    id: 'IMG-DS-0104',
    datasetId: 'DS-SOYBEAN-RUST-2026',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    cropName: 'Soybean',
    variety: 'JS 9560',
    diseaseLabel: 'Healthy Foliage',
    pathogenType: 'healthy',
    healthStatus: 'healthy',
    severityPercent: 0,
    growthStage: 'Flowering',
    foliarSide: 'Adaxial (Top Surface)',
    location: {
      state: 'Madhya Pradesh',
      district: 'Indore',
      village: 'Sanwer Kalan',
      gps: { lat: 22.9734, lng: 75.8267 }
    },
    capturedAt: '2026-09-08 11:00',
    contributedBy: {
      name: 'Ramesh Patel',
      role: 'farmer',
      id: 'usr-farmer-01'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. Anita Sharma (IISR)',
    boundingBoxes: [
      { id: 'box-5', x: 15, y: 15, width: 70, height: 70, label: 'Healthy Vigorous Leaf', confidence: 0.99 }
    ],
    notes: 'Control sample. Vigorous green coloration, no foliar blemishes, optimal chlorophyll index.',
    cameraInfo: 'Redmi Note 12',
    tags: ['Negative Control', 'Healthy Baseline']
  },
  {
    id: 'IMG-DS-0201',
    datasetId: 'DS-COTTON-CURL-2026',
    imageUrl: '/cotton_leaf_spot.svg',
    cropName: 'Cotton',
    variety: 'Bt-2 RCH-659',
    diseaseLabel: 'Cotton Leaf Curl Virus (CLCuV)',
    pathogenType: 'viral',
    healthStatus: 'diseased',
    severityPercent: 62,
    growthStage: 'Vegetative',
    foliarSide: 'Full Canopy',
    location: {
      state: 'Madhya Pradesh',
      district: 'Khargone',
      village: 'Barwah',
      gps: { lat: 22.2536, lng: 76.0354 }
    },
    capturedAt: '2026-09-07 16:20',
    contributedBy: {
      name: 'Mukesh Mandloi',
      role: 'farmer',
      id: 'usr-farmer-02'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. K. S. Rathore (CICR)',
    boundingBoxes: [
      { id: 'box-6', x: 25, y: 20, width: 50, height: 55, label: 'Upward Leaf Curling & Enation', confidence: 0.95 }
    ],
    notes: 'Severe vein thickening with downward and upward leaf cup curling.',
    cameraInfo: 'Realme 11 Pro (Direct Sunlight)',
    tags: ['CLCuV', 'Enation', 'Vein Thickening']
  },
  {
    id: 'IMG-DS-0202',
    datasetId: 'DS-COTTON-CURL-2026',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/CSIRO_ScienceImage_7848_Aphids_on_cotton_8.jpg',
    cropName: 'Cotton',
    variety: 'Bollgard II',
    diseaseLabel: 'Aphids & Sucking Pests',
    pathogenType: 'pest',
    healthStatus: 'pest_damaged',
    severityPercent: 48,
    growthStage: 'Flowering',
    foliarSide: 'Abaxial (Underside)',
    location: {
      state: 'Madhya Pradesh',
      district: 'Khandwa',
      village: 'Pandhana',
      gps: { lat: 21.7123, lng: 76.2234 }
    },
    capturedAt: '2026-09-06 08:30',
    contributedBy: {
      name: 'Vikas Solanki',
      role: 'extension',
      id: 'usr-ext-02'
    },
    verificationStatus: 'verified_by_extension',
    verifiedBy: 'Vikas Solanki',
    boundingBoxes: [
      { id: 'box-7', x: 30, y: 35, width: 40, height: 35, label: 'Aphid Colony & Sooty Mould', confidence: 0.91 }
    ],
    notes: 'Dense nymph colonies clustered along leaf veins on the abaxial face.',
    cameraInfo: 'OnePlus Nord CE 3',
    tags: ['Aphis gossypii', 'Sooty Mould', 'Nymph Cluster']
  },
  {
    id: 'IMG-DS-0203',
    datasetId: 'DS-COTTON-CURL-2026',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    cropName: 'Cotton',
    variety: 'Bt-2 RCH-659',
    diseaseLabel: 'Healthy Foliage',
    pathogenType: 'healthy',
    healthStatus: 'healthy',
    severityPercent: 0,
    growthStage: 'Flowering',
    foliarSide: 'Full Canopy',
    location: {
      state: 'Madhya Pradesh',
      district: 'Khargone',
      village: 'Barwah',
      gps: { lat: 22.2536, lng: 76.0354 }
    },
    capturedAt: '2026-09-07 16:45',
    contributedBy: {
      name: 'Mukesh Mandloi',
      role: 'farmer',
      id: 'usr-farmer-02'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. K. S. Rathore (CICR)',
    boundingBoxes: [
      { id: 'box-8', x: 20, y: 20, width: 60, height: 60, label: 'Broad Healthy Cotton Canopy', confidence: 0.98 }
    ],
    notes: 'Healthy control plant. Broad palmate leaves with zero curl or vein darkening.',
    cameraInfo: 'Realme 11 Pro',
    tags: ['Healthy Control', 'Clean Margin']
  },
  {
    id: 'IMG-DS-0301',
    datasetId: 'DS-WHEAT-RUST-2026',
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    cropName: 'Wheat',
    variety: 'Sharbati GW-322',
    diseaseLabel: 'Yellow Stripe Rust',
    pathogenType: 'fungal',
    healthStatus: 'diseased',
    severityPercent: 60,
    growthStage: 'Vegetative',
    foliarSide: 'Adaxial (Top Surface)',
    location: {
      state: 'Madhya Pradesh',
      district: 'Sehore',
      village: 'Ashta',
      gps: { lat: 23.0189, lng: 76.5492 }
    },
    capturedAt: '2026-08-30 11:15',
    contributedBy: {
      name: 'KVK Agronomist Team',
      role: 'expert',
      id: 'usr-kvk-01'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. R. K. Agrawal (IARI)',
    boundingBoxes: [
      { id: 'box-9', x: 25, y: 20, width: 50, height: 60, label: 'Linear Yellow Pustules in Stripes', confidence: 0.97 }
    ],
    notes: 'Characteristic bright yellow urediniospores organized in parallel rows along leaf veins.',
    cameraInfo: 'Nikon D3500 (Field kit)',
    tags: ['Stripe Rust', 'Puccinia striiformis', 'Linear Pustules']
  },
  {
    id: 'IMG-DS-0302',
    datasetId: 'DS-WHEAT-RUST-2026',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a47?auto=format&fit=crop&w=600&q=80',
    cropName: 'Wheat',
    variety: 'HI-1544 (Purna)',
    diseaseLabel: 'Powdery Mildew',
    pathogenType: 'fungal',
    healthStatus: 'diseased',
    severityPercent: 38,
    growthStage: 'Flowering',
    foliarSide: 'Adaxial (Top Surface)',
    location: {
      state: 'Madhya Pradesh',
      district: 'Hoshangabad',
      village: 'Pipariya',
      gps: { lat: 22.7584, lng: 78.3491 }
    },
    capturedAt: '2026-09-02 15:40',
    contributedBy: {
      name: 'Pooja Chouhan',
      role: 'extension',
      id: 'usr-ext-03'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. R. K. Agrawal (IARI)',
    boundingBoxes: [
      { id: 'box-10', x: 35, y: 30, width: 30, height: 35, label: 'White Powdery Fungal Mats', confidence: 0.93 }
    ],
    notes: 'Cottony white patches turning dull grey with black cleistothecia.',
    cameraInfo: 'Motorola Edge 40',
    tags: ['Blumeria graminis', 'Powdery Mycelium']
  },
  {
    id: 'IMG-DS-0303',
    datasetId: 'DS-WHEAT-RUST-2026',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    cropName: 'Wheat',
    variety: 'Sharbati GW-322',
    diseaseLabel: 'Healthy Foliage',
    pathogenType: 'healthy',
    healthStatus: 'healthy',
    severityPercent: 0,
    growthStage: 'Flowering',
    foliarSide: 'Full Canopy',
    location: {
      state: 'Madhya Pradesh',
      district: 'Sehore',
      village: 'Ashta',
      gps: { lat: 23.0189, lng: 76.5492 }
    },
    capturedAt: '2026-08-30 11:45',
    contributedBy: {
      name: 'KVK Agronomist Team',
      role: 'expert',
      id: 'usr-kvk-01'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. R. K. Agrawal (IARI)',
    boundingBoxes: [
      { id: 'box-11', x: 20, y: 20, width: 60, height: 60, label: 'Erect Deep Green Wheat Blades', confidence: 0.99 }
    ],
    notes: 'Healthy flag leaf and sub-canopy. High photosynthetic efficiency.',
    cameraInfo: 'Nikon D3500',
    tags: ['Control Baseline', 'Healthy Flag Leaf']
  },
  {
    id: 'IMG-DS-0401',
    datasetId: 'DS-PADDY-BLAST-2026',
    imageUrl: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    cropName: 'Paddy / Rice',
    variety: 'Pusa Basmati 1121',
    diseaseLabel: 'Rice Blast (Pyricularia)',
    pathogenType: 'fungal',
    healthStatus: 'diseased',
    severityPercent: 52,
    growthStage: 'Vegetative',
    foliarSide: 'Adaxial (Top Surface)',
    location: {
      state: 'Madhya Pradesh',
      district: 'Balaghat',
      village: 'Lalbarra',
      gps: { lat: 21.9421, lng: 80.0124 }
    },
    capturedAt: '2026-09-04 10:10',
    contributedBy: {
      name: 'Ravi Dongre',
      role: 'extension',
      id: 'usr-ext-04'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. B. K. Jena (DRR)',
    boundingBoxes: [
      { id: 'box-12', x: 30, y: 35, width: 35, height: 28, label: 'Spindle-shaped Blast Lesions', confidence: 0.95 }
    ],
    notes: 'Elliptical diamond-shaped lesions with grey center and brownish margin.',
    cameraInfo: 'Vivo V29',
    tags: ['Magnaporthe oryzae', 'Diamond Lesion', 'Spindle Shape']
  },
  {
    id: 'IMG-DS-0402',
    datasetId: 'DS-PADDY-BLAST-2026',
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
    cropName: 'Paddy / Rice',
    variety: 'Kranti',
    diseaseLabel: 'Healthy Foliage',
    pathogenType: 'healthy',
    healthStatus: 'healthy',
    severityPercent: 0,
    growthStage: 'Vegetative',
    foliarSide: 'Full Canopy',
    location: {
      state: 'Madhya Pradesh',
      district: 'Balaghat',
      village: 'Waraseoni',
      gps: { lat: 21.7645, lng: 80.0482 }
    },
    capturedAt: '2026-09-04 11:20',
    contributedBy: {
      name: 'Ravi Dongre',
      role: 'extension',
      id: 'usr-ext-04'
    },
    verificationStatus: 'verified_by_scientist',
    verifiedBy: 'Dr. B. K. Jena (DRR)',
    boundingBoxes: [
      { id: 'box-13', x: 20, y: 20, width: 60, height: 60, label: 'Lush Healthy Tillers', confidence: 0.99 }
    ],
    notes: 'Unblemished tillering stage. Clean green foliage.',
    cameraInfo: 'Vivo V29',
    tags: ['Paddy Control', 'Healthy Tillers']
  }
];
