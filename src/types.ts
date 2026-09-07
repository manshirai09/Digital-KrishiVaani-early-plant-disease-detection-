export type UserRole = 'farmer' | 'extension' | 'officer' | 'expert';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type CropStage = 'Vegetative' | 'Flowering' | 'Boll Formation / Pod Filling' | 'Pod Filling' | 'Maturity / Harvesting' | 'Seedling';

export interface ForecastDay {
  day?: string;
  dayName?: string;
  date?: string;
  temp?: number;
  tempHigh?: number;
  tempLow?: number;
  humidity: number;
  rainMm?: number;
  rainfallMm?: number;
  risk?: RiskLevel;
  riskLevel?: RiskLevel;
  riskScore?: number;
  predictedRiskScore?: number;
  conduciveConditions?: string;
  recommendedAction?: string;
}

export interface WeatherData {
  temperature?: number;
  temp: number;
  humidity: number;
  rainProbability: number;
  rainfallMm24h?: number;
  rainfallLast24h: number;
  windSpeedKmH?: number;
  windDirection?: string;
  condition: string;
  leafWetness: 'Low' | 'Moderate' | 'High' | 'Very High';
  forecast7Days?: ForecastDay[];
  forecast: ForecastDay[];
}

export interface IotSensorData {
  nodeId: string;
  battery: number;
  status: 'online' | 'offline';
  temperature: number;
  humidity: number;
  soilMoisture: number;
  leafWetnessScore: number; // 0 - 100
  leafWetnessLabel: 'Low' | 'Moderate' | 'High' | 'Critical';
  rainfallMm: number;
  lastUpdated: string;
  history: {
    time: string;
    temp: number;
    humidity: number;
    moisture: number;
    leafWetness: number;
  }[];
}

export interface PestTrapData {
  trapId: string;
  name: string;
  fieldId: string;
  location: string;
  pestType: string;
  currentCount: number;
  threshold: number;
  status: 'normal' | 'warning' | 'above_threshold';
  lastChecked: string;
  history: {
    date: string;
    count: number;
  }[];
  trapImageUrl?: string;
}

export interface Farm {
  id: string;
  name: string;
  farmerName: string;
  farmerPhone: string;
  village: string;
  block: string;
  district: string;
  totalAreaAcres: number;
  soilType: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  crops: Crop[];
  sensorNodeId?: string;
  overallRisk: RiskLevel;
  overallRiskScore: number;
}

export interface Crop {
  id: string;
  farmId: string;
  cropName: 'Cotton' | 'Soybean' | 'Wheat' | 'Tomato' | 'Chilli' | 'Rice' | string;
  variety: string;
  areaAcres: number;
  sowingDate: string;
  stage: CropStage;
  riskLevel: RiskLevel;
  riskScore: number;
  lastScanDate?: string;
  activeDisease?: string;
}

export interface RiskFactor {
  id?: string;
  name: string;
  label?: string;
  rawScore?: number;
  score: number;
  weight: number;
  contribution: number;
  category: string;
  status: 'Safe' | 'Moderate' | 'High Risk' | 'Critical';
  notes?: string;
  evidenceNote?: string;
}

export interface MultiSourceRiskScore {
  overallScore: number; // 0 - 100
  riskLevel: RiskLevel;
  factors?: RiskFactor[];
  breakdown: {
    imageEvidence: { score: number; weight: number; contribution: number; description: string };
    environmentalRisk: { score: number; weight: number; contribution: number; description: string };
    pestTrend: { score: number; weight: number; contribution: number; description: string };
    historicalRisk: { score: number; weight: number; contribution: number; description: string };
    cropStageSensitivity: { score: number; weight: number; contribution: number; description: string };
  };
  keyDrivers: string[];
  recommendationType: 'pre_approved_ipm' | 'expert_review_required';
}

export interface DiagnosisResult {
  id: string;
  caseId: string;
  diseaseName: string;
  pathogenType: 'Fungal' | 'Bacterial' | 'Viral' | 'Pest Infestation' | 'Physiological';
  confidence: number; // 0 - 100
  severityPercent: number; // e.g. 34%
  severityLevel: RiskLevel;
  affectedAreaVisualUrl?: string;
  sampleImageUrl: string;
  symptomPattern: string;
  isSimulated: boolean;
  needsExpertReview: boolean;
  escalationReason?: string;
  riskScore: MultiSourceRiskScore;
  evidenceFactors: {
    label: string;
    value: string;
    isConducive: boolean;
  }[];
}

export interface AdvisoryPlan {
  id?: string;
  caseId?: string;
  diseaseName: string;
  riskLevel?: RiskLevel;
  status?: 'pre_approved_ipm' | 'expert_approved' | string;
  severity?: string;
  culturalPractices?: string[];
  culturalManagement: string[];
  biologicalPractices?: string[];
  biologicalManagement: string[];
  chemicalGuidance: {
    allowed?: boolean;
    activeIngredient?: string;
    dosagePerAcre?: string;
    applicationMethod?: string;
    waitingPeriodDays?: number;
    safetyPrecautions?: string[];
    cibrcApproved?: boolean;
    warning?: string;
    regulatoryNote?: string;
    approvedMoleculesExample?: string[];
    safetyIntervalDays?: number;
  };
  audioAdvisoryText?: string;
  audioGuideUrl?: string;
  audioDurationSec?: number;
  expertConfirmedBy?: string;
  expertName?: string;
  isExpertApproved: boolean;
  approvalTimestamp?: string;
}

export interface FollowUpRecord {
  id?: string;
  caseId: string;
  fieldId?: string;
  fieldLocation?: string;
  cropName: string;
  initialScanDate?: string;
  initialDate?: string;
  initialSeverity?: number;
  beforeSeverityPercent?: number;
  initialRiskScore?: number;
  beforeRiskScore?: number;
  initialImageUrl?: string;
  beforeImageUrl?: string;
  followUpDate: string;
  followUpSeverity?: number;
  afterSeverityPercent?: number;
  followUpRiskScore?: number;
  afterRiskScore?: number;
  followUpImageUrl?: string;
  afterImageUrl?: string;
  farmerFeedback?: 'Significantly Improved' | 'Partially Improved' | 'No Change' | 'Deteriorated';
  outcomeStatus?: 'improved' | 'stable' | 'deteriorated';
  treatmentApplied: string[] | string;
  expertVerified?: boolean;
  expertVerifiedBy?: string;
  status?: 'In Progress' | 'Completed' | 'Pending Review' | string;
  notes?: string;
  datasetContributionId?: string;
  addedToRetrainingQueue?: boolean;
  retrainingQueueId?: string;
}

export interface LabReferralDetails {
  labId: string; // e.g. "LAB-2026-MP-0941"
  labName: string;
  sampleType: string;
  testRequested: string;
  priority: 'Urgent (24h)' | 'High (48h)' | 'Standard (72h)';
  suspectedPathogen: string;
  referralDate: string;
  referralReason: string;
  referredByExpert: string;
  sampleDispatchStatus: 'Dispatched with Field Agent' | 'In Transit to Lab' | 'Sample Received & Checked In' | 'Assay in Progress';
  sampleCollector?: string;
  digitalBarcodeTag?: string;
  estimatedReportDate?: string;
}

export interface CaseRecord {
  id: string; // e.g. KR-1024
  farmerId?: string;
  farmerName: string;
  farmerPhone?: string;
  village: string;
  block: string;
  district: string;
  cropName: string;
  diseaseName?: string;
  variety?: string;
  imageUrl?: string;
  confidence?: number;
  riskScore?: MultiSourceRiskScore;
  timestamp?: string;
  escalationReason?: string;
  expertNotes?: string;
  updatedAt?: string;
  stage: CropStage;
  dateCreated?: string;
  status: 'ai_screened' | 'needs_expert_review' | 'pending_expert' | 'expert_approved' | 'expert_confirmed' | 'lab_requested' | 'lab_investigation_pending' | 'closed';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  diagnosis?: DiagnosisResult;
  advisory?: AdvisoryPlan;
  labReferral?: LabReferralDetails;
  expertReview?: {
    expertId: string;
    expertName: string;
    reviewedAt: string;
    action: 'confirmed' | 'corrected' | 'lab_requested';
    confirmedDisease: string;
    comments: string;
    adjustedSeverity?: string;
  };
  followUp?: FollowUpRecord;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface FieldVisit {
  id: string;
  caseId?: string;
  farmerName: string;
  farmerPhone?: string;
  village: string;
  cropName: string;
  scheduledDate: string;
  distanceKm?: string;
  reason?: string;
  riskLevel?: RiskLevel;
  priority?: 'High' | 'Medium' | 'Low';
  status: 'Scheduled' | 'Completed' | 'Escalated' | 'scheduled' | 'completed';
  inspectionNotes?: string;
  visitNotes?: string;
  observations?: string;
  geoVerified?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'risk_alert' | 'expert_update' | 'followup_reminder' | 'sync_status' | 'general';
  riskLevel?: RiskLevel;
  read: boolean;
  targetRole: UserRole | 'all';
  actionPath?: string;
}

export interface GisHotspot {
  id: string;
  village?: string;
  villageName?: string;
  block: string;
  district: string;
  crop?: string;
  primaryDisease?: string;
  dominantIssue?: string;
  activeCases?: number;
  caseCount?: number;
  confirmedCases?: number;
  affectedAcres?: number;
  activeFarmers?: number;
  riskLevel: RiskLevel;
  riskScore?: number;
  averageRiskScore?: number;
  containmentStatus?: 'contained' | 'active_containment' | 'monitoring' | string;
  trend?: 'increasing' | 'stable' | 'decreasing';
  coordinates: {
    lat: number;
    lng: number;
  };
  farmersAffected?: number;
  weatherCondition?: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  tag: string;
  description: string;
  crop: string;
  disease: string;
  confidence: number;
  severity: number;
  riskScore: number;
  requiresExpert: boolean;
  sampleImage: string;
  leafType: string;
  notes: string;
}

// ----------------------------------------------------
// AUTHENTICATION & USER PROFILE TYPES
// ----------------------------------------------------
export type AppUserRole = 'farmer' | 'extension' | 'officer' | 'expert' | 'admin';

export type SupportedLanguageCode = 
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'mr' // Marathi (मराठी)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'bn' // Bengali (বাংলা)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'or'; // Odia (ଓଡ଼ିଆ)

export interface UserVoiceSettings {
  enabled: boolean;
  rate: number; // 0.8 - 1.2
  pitch: number;
  autoPlayVoice: boolean;
  guidedModeDefault: boolean;
  voiceGender?: 'female' | 'male';
}

export interface UserAccount {
  id: string; // e.g. "usr-farmer-01"
  name: string;
  phone: string;
  email: string;
  role: UserRole | 'admin';
  state: string;
  district: string;
  village: string;
  preferredLanguage: SupportedLanguageCode;
  avatarUrl?: string;
  voiceSettings: UserVoiceSettings;
  farmIds?: string[];
  createdAt: string;
  lastLoginAt?: string;
  passwordHash?: string; // Simulated SHA-256 for demo safety
}

export interface AuthSession {
  token: string;
  user: UserAccount;
  expiresAt: number;
  rememberMe: boolean;
}

// ----------------------------------------------------
// VAANI MULTILINGUAL VOICE ASSISTANT TYPES
// ----------------------------------------------------
export type VaaniAssistantState = 
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error'
  | 'guided_active';

export type VaaniIntentType =
  | 'NAVIGATE'
  | 'EXPLAIN_CROP_RISK'
  | 'EXPLAIN_WEATHER'
  | 'EXPLAIN_7DAY_FORECAST'
  | 'EXPLAIN_DIAGNOSIS'
  | 'EXPLAIN_IPM_ADVISORY'
  | 'READ_NOTIFICATIONS'
  | 'EXPLAIN_IOT_SENSORS'
  | 'EXPLAIN_PEST_TRAPS'
  | 'START_GUIDED_SCAN'
  | 'REQUEST_EXPERT_HELP'
  | 'ADD_FIELD_HELP'
  | 'GENERAL_AGRI_QA'
  | 'UNKNOWN'
  | 'CLARIFICATION';

export interface VaaniMessage {
  id: string;
  sender: 'user' | 'vaani';
  text: string;
  timestamp: string;
  language: SupportedLanguageCode;
  intent?: VaaniIntentType;
  actionType?: 'NAVIGATE' | 'TRIGGER_SCAN' | 'OPEN_MODAL' | 'REPLAY_AUDIO' | 'CONTACT_EXPERT' | 'NONE';
  actionPayload?: any;
  confidence?: number;
  audioDurationSec?: number;
  suggestedFollowups?: string[];
}

export interface GuidedScanStep {
  stepNumber: number;
  titleKey: string;
  titleText: string;
  voiceInstruction: string;
  helperTip: string;
  highlightElementId?: string;
  actionRequired: 'tap_camera' | 'center_leaf' | 'confirm_clarity' | 'view_risk' | 'view_advisory';
}

