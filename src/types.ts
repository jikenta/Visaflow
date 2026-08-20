export type UserRole = 'client' | 'admin' | 'blueprint';

export type ClientStep = 
  | 'appointment'
  | 'passport'
  | 'biometrics'
  | 'signature'
  | 'documents'
  | 'confirmation';

export interface VfsCenter {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  address: string;
  nextAvailableDate: string;
  slotsAvailable: number;
  operatingHours: string;
}

export interface VisaCategory {
  id: string;
  code: string;
  name: string;
  destination: string;
  duration: string;
  fee: number;
  processingTime: string;
  requiredDocsCount: number;
}

export interface TimeSlot {
  time: string;
  type: 'standard' | 'premium_lounge' | 'prime_time';
  available: boolean;
  priceAddon?: number;
}

export interface AppointmentState {
  centerId: string;
  destinationCountry: string;
  visaCategoryId: string;
  date: string;
  timeSlot: string;
  slotType: 'standard' | 'premium_lounge' | 'prime_time';
  applicantCount: number;
  smsUpdates: boolean;
  courierReturn: boolean;
  loungeAccess: boolean;
  totalFee: number;
}

export interface PassportOcrData {
  documentType: string;
  issuingCountry: string;
  surname: string;
  givenNames: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'X';
  dateOfExpiry: string;
  personalNumber: string;
  mrzLine1: string;
  mrzLine2: string;
  checksumValid: boolean;
  confidenceScore: number;
  imageUri: string | null;
  boundingBoxes: {
    photo: { x: number; y: number; w: number; h: number; label: string };
    mrz: { x: number; y: number; w: number; h: number; label: string };
    personalData: { x: number; y: number; w: number; h: number; label: string };
    securityEmboss: { x: number; y: number; w: number; h: number; label: string };
  };
}

export interface BiometricVerificationState {
  status: 'idle' | 'capturing' | 'evaluating' | 'passed' | 'failed';
  livenessScore: number; // 0-100
  antiSpoofingScore: number; // 0-100
  faceMatchScore: number; // 0-100 vs passport photo
  lightingAdequacy: number; // 0-100
  neutralExpression: boolean;
  eyesOpen: boolean;
  blinkDetected: boolean;
  headTurnDetected: boolean;
  icaoCompliance: boolean;
  capturedFrame: string | null;
  failureReason?: string;
}

export interface DigitalSignatureState {
  signatureDataUrl: string | null;
  sha256Hash: string | null;
  signedAt: string | null;
  signerLegalName: string;
  ipAddress: string;
  legalConsentChecked: boolean;
  declarationAccepted: boolean;
}

export type DocumentStatus = 'pending' | 'processing' | 'validated' | 'error' | 'compliant' | 'flagged' | 'scanning';

export interface DocumentChecklistItem {
  id: string;
  title: string;
  category: 'identity' | 'financial' | 'travel' | 'employment' | 'accommodation';
  description: string;
  isRequired: boolean;
  status: DocumentStatus;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  uploadDate?: string;
  ocrConfidence?: number;
  extractedData?: {
    documentId?: string;
    entityName?: string;
    issueDate?: string;
    expiryDate?: string;
    issuer?: string;
    financialAmount?: string;
  };
  complianceChecks: {
    resolutionCheck: boolean;
    validityDateCheck: boolean;
    tamperCheck: boolean;
    nameMatchCheck: boolean;
  };
  flagReason?: string;
}

export interface VisaApplicationRecord {
  id: string;
  refNumber: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  passportNumber: string;
  nationality: string;
  destinationCountry: string;
  visaType: string;
  appointmentDate: string;
  appointmentTime: string;
  centerName: string;
  submissionDate: string;
  riskScore: number; // 0-100 (higher = riskier)
  status: 'Ready for Review' | 'Flagged' | 'Approved' | 'Rejected' | 'Docs Required' | 'Consular Escalated';
  biometricScore: number;
  documentComplianceScore: number;
  assignedOfficer?: string;
  botThreatScore?: number;
  flags: {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    ruleId: string;
  }[];
  passportData: PassportOcrData;
  documents: DocumentChecklistItem[];
  biometricImage: string;
  signatureHash: string;
  auditTrail: {
    timestamp: string;
    actor: string;
    action: string;
  }[];
}

export interface BotThreatEvent {
  id: string;
  timestamp: string;
  threatType: 'Slot Hoarding / Bot Rapid Fire' | 'Headless Browser Signature' | 'CAPTCHA Bypass Velocity' | 'Residential Proxy Pool' | 'Credential Stuffing';
  attackerIp: string;
  geoLocation: string;
  asnName: string;
  requestsPerSec: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigationAction: 'Auto-Banned IP' | 'Rate-Limited (429)' | 'Biometric CAPTCHA Challenged' | 'Fingerprint Blacklisted';
  status: 'Mitigated' | 'Active Monitoring';
}

export interface MicroserviceBlueprint {
  id: string;
  name: string;
  shortCode: string;
  domain: string;
  description: string;
  technologies: string[];
  protocol: 'gRPC' | 'REST/HTTPS' | 'Kafka Event' | 'WebSockets';
  throughputSla: string;
  dataClassification: 'PCI-DSS' | 'GDPR PII' | 'ICAO 9303' | 'Consular Restricted';
  keyEndpoints: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'STREAM';
    path: string;
    purpose: string;
  }[];
}

// ============================================================================
// AI & COMPUTER VISION MICROSERVICE SCHEMA TYPES
// ============================================================================

export interface BoundingBoxNormalized {
  x: number; // 0-100%
  y: number; // 0-100%
  w: number; // 0-100%
  h: number; // 0-100%
  label: string;
  confidence?: number;
  textContent?: string;
  isTampered?: boolean;
  borderColor?: string;
}

export interface HeadPoseMetrics {
  yaw: number; // degrees (-180 to 180)
  pitch: number; // degrees (-90 to 90)
  roll: number; // degrees (-180 to 180)
  isFrontal: boolean;
}

export interface IcaoPhotoMetrics {
  backgroundPurityScore: number; // 0-100
  dimensionCheckPassed: boolean; // 35mm x 45mm
  faceCoveragePercentage: number; // 70-80%
  headPose: HeadPoseMetrics;
  eyesOpen: boolean;
  neutralExpression: boolean;
  glareDetected: boolean;
  allConstraintsMet: boolean;
}

export interface RuleCheckResult {
  ruleId: string;
  title: string;
  category: 'PASSPORT_VALIDITY' | 'INSURANCE_COVERAGE' | 'FINANCIAL_SUBSISTENCE' | 'IDENTITY_ALIGNMENT' | 'SCHENGEN_COMPLIANCE';
  passed: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  statutoryCode: string;
  observedValue: string;
  expectedThreshold: string;
  description: string;
  remediationAction?: string;
  targetBoundingBox?: BoundingBoxNormalized;
}

export interface TamperAnomalyRecord {
  anomalyId: string;
  anomalyType: 'ELA_COMPRESSION_SPIKE' | 'FONT_METRIC_INCONSISTENCY' | 'SPLICED_TEXT_BOUNDARY' | 'METADATA_STREAM_TAMPER' | 'CLONED_PIXEL_REGION';
  confidence: number;
  description: string;
  boundingBox: BoundingBoxNormalized;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface TamperDetectionResult {
  tamperDetected: boolean;
  overallIntegrityScore: number; // 0-100
  elaMaxDifferenceRatio: number; // 0-1.0
  fontInconsistencyScore: number; // 0-1.0
  metadataAlterationDetected: boolean;
  anomalies: TamperAnomalyRecord[];
  elaHeatmapAvailable: boolean;
}

export interface MicroserviceApiPayload {
  endpoint: string;
  method: 'POST' | 'GET';
  requestPayload: Record<string, any>;
  responsePayload: Record<string, any>;
  statusCode: number;
  latencyMs: number;
}

// ==========================================
// RAG, Conversational AI & PII Masking Types
// ==========================================

export type SupportedLanguage = 'en' | 'fr' | 'ar' | 'hi' | 'zh' | 'es' | 'ru';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system' | 'idp_proactive';
  content: string;
  timestamp: string;
  language?: SupportedLanguage;
  ragSources?: RagSourceCitation[];
  proactiveTrigger?: {
    type: 'doc_error' | 'biometric_tip' | 'booking_rule';
    docId?: string;
    docTitle?: string;
    issueDescription: string;
    actionLabel?: string;
    actionType?: 'open_doc_upload' | 'recheck_camera' | 'change_appointment' | 'view_rule';
  };
  piiMaskedLog?: {
    originalLength: number;
    maskedEntities: Array<{
      type: string;
      token: string;
      originalValueMasked: string;
    }>;
  };
  audioBase64?: string;
  isStreaming?: boolean;
}

export interface RagSourceCitation {
  id: string;
  title: string;
  country: string;
  statutoryArticle: string;
  snippet: string;
  relevanceScore: number; // 0.0 - 1.0
  category: 'checklist' | 'financial' | 'biometrics' | 'exemption' | 'validity' | 'rules';
}

export interface RagKnowledgeItem {
  id: string;
  country: string;
  visaCategory: string;
  topic: string;
  statutoryCode: string;
  title: string;
  content: string;
  keywords: string[];
  embeddingVector?: number[];
  category: 'checklist' | 'financial' | 'biometrics' | 'exemption' | 'validity' | 'rules';
}

export interface PiiRedactionResult {
  sanitizedText: string;
  entitiesRedacted: Array<{
    type: 'NAME' | 'PASSPORT' | 'DOB' | 'ACCOUNT' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'NATIONAL_ID';
    originalMasked: string;
    replacementToken: string;
    confidence: number;
  }>;
  piiDetected: boolean;
  processingTimeMs: number;
}

export interface StaffCopilotSummary {
  applicantId: string;
  applicantName: string;
  refNumber: string;
  executiveSummary: string;
  keyRiskFactors: string[];
  idpComplianceAssessment: string;
  biometricVerificationStatus: string;
  botAnomaliesScore: string;
  recommendedConsularAction: 'APPROVE' | 'REQUEST_ADDITIONAL_DOCS' | 'ESCALATE_TO_CONSULATE' | 'REFUSE_STATUTORY';
  statutoryPrecedents: string[];
}

// ============================================================================
// PROBLEM 2: ANTI-FRAUD, ML TELEMETRY & IDENTITY ANCHORING TYPES
// ============================================================================

export interface BehavioralBiometricsTelemetry {
  sessionDurationMs: number;
  mouseMovementsCount: number;
  cursorVelocityMean: number; // pixels/ms
  cursorVelocityMax: number;
  cursorTrajectoryCurvature: number; // Jitter / curvature entropy (0 = linear bot)
  cursorStraightLineRatio: number; // 0.0 - 1.0 (1.0 = synthetic interpolation)
  keystrokesCount: number;
  keystrokeFlightTimeMeanMs: number;
  keystrokeFlightTimeStdDev: number; // < 5ms indicates robotic programmatic typing
  clickCoordinatesCount: number;
  scrollEventsCount: number;
  touchEventsCount: number;
  tabFocusChanges: number;
  navigatorEntropy: {
    userAgent: string;
    hardwareConcurrency: number;
    deviceMemory: number;
    screenResolution: string;
    colorDepth: number;
    timezoneOffset: number;
    canvasFingerprintHash: string;
    audioFingerprintHash: string;
    webGlVendor: string;
    webGlRenderer: string;
    languages: string[];
    doNotTrack: string;
  };
  automatedDriverFlag: boolean; // navigator.webdriver
  devtoolsDetected: boolean;
  syntheticEventDetected: boolean;
}

export interface MlBotInferenceResult {
  botThreatScore: number; // 0 - 100
  classification: 'LEGITIMATE_HUMAN' | 'SUSPICIOUS_AUTOMATION' | 'BOT_SNIPER' | 'HEADLESS_SCRAPER';
  confidence: number; // 0.0 - 1.0
  isolationForestScore: number; // outlier metric
  xgboostProbability: number; // probability of bot behavior
  identifiedRiskFactors: string[];
  featureImportances: Array<{
    featureName: string;
    shapValue: number;
    description: string;
  }>;
  mitigationAction: 'ALLOW' | 'REQUIRE_CAPTCHA' | 'CHALLENGE_3D_LIVENESS' | 'BLOCK_SLOT_LOCK' | 'AUTO_BAN_IP';
  evaluatedAt: string;
}

export interface IdentityAnchorLock {
  lockId: string;
  canonicalPayloadHash: string; // SHA-256 hash of (Passport + BioHash + SlotTime + VAC Center)
  passportNumber: string;
  issuingCountry: string;
  applicantFullName: string;
  biometricTemplateHash: string; // 512-dim embedding SHA-256
  centerId: string;
  appointmentDate: string;
  timeSlot: string;
  lockedAt: string;
  expiresAt: string;
  isImmutable: boolean;
  transferabilityProhibited: boolean;
  hsmSignature: string; // Hardware Security Module cryptographic proof
  verifyingNodeId: string;
}

export interface LivenessChallengeSession {
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
  challengeSequence: Array<'BLINK_TWICE' | 'TURN_HEAD_LEFT' | 'TURN_HEAD_RIGHT' | 'NOD_DOWN' | 'SMILE_THEN_NEUTRAL'>;
  currentStepIndex: number;
  depthMapGridVerified: boolean;
  photometricGlintVerified: boolean;
  frequencyDomainAttackScore: number; // Fourier / Moiré analysis
  moiréPatternDetected: boolean;
  deviceScreenReflectionDetected: boolean;
}



