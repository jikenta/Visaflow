/**
 * VFS Global AI & Computer Vision Service
 * Frontend Client and Algorithmic Engine matching the Python (FastAPI) Microservice
 */

import {
  BoundingBoxNormalized,
  IcaoPhotoMetrics,
  RuleCheckResult,
  TamperAnomalyRecord,
  TamperDetectionResult,
  MicroserviceApiPayload
} from '../types';

export const ICAO_WEIGHTS = [7, 3, 1];

export function calculateModulo7Checksum(str: string): number {
  let total = 0;
  const clean = str.toUpperCase().replace(/</g, '0');
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    let val = 0;
    if (char >= '0' && char <= '9') {
      val = parseInt(char, 10);
    } else if (char >= 'A' && char <= 'Z') {
      val = char.charCodeAt(0) - 65 + 10;
    }
    const weight = ICAO_WEIGHTS[i % 3];
    total += val * weight;
  }
  return total % 10;
}

/**
 * 1. Advanced OCR & Layout Analysis Service
 */
export async function runOcrLayoutAnalysis(
  documentType: string = 'PASSPORT',
  fileName: string = 'passport_scan.jpg'
): Promise<{
  data: {
    documentType: string;
    confidenceScore: number;
    extractedFields: Record<string, any>;
    mrzData: {
      line1: string;
      line2: string;
      checksumValid: boolean;
      surname: string;
      givenNames: string;
      passportNumber: string;
      nationality: string;
      dob: string;
      expiry: string;
      gender: string;
    };
    boundingBoxes: BoundingBoxNormalized[];
  };
  apiPayload: MicroserviceApiPayload;
}> {
  const startTime = performance.now();

  const reqPayload = {
    file_name: fileName,
    document_hint: documentType,
    extraction_mode: "HYBRID_LAYOUTLM_ICAO_MRZ"
  };

  let resData: any;
  if (documentType === 'PASSPORT' || fileName.includes('passport')) {
    resData = {
      documentType: 'PASSPORT',
      confidenceScore: 99.2,
      extractedFields: {
        surname: 'ROSTOVA',
        given_names: 'ELENA',
        passport_number: 'GB89201476',
        nationality: 'GBR',
        date_of_birth: '1992-04-14',
        date_of_expiry: '2031-10-18',
        gender: 'F'
      },
      mrzData: {
        line1: 'P<GBRROSTOVA<<ELENA<<<<<<<<<<<<<<<<<<<<<<<<<',
        line2: 'GB89201476GBR9204144F3110189<<<<<<<<<<<<<<08',
        checksumValid: false, // For testing/demonstrating flagged checksum
        surname: 'ROSTOVA',
        givenNames: 'ELENA',
        passportNumber: 'GB89201476',
        nationality: 'GBR',
        dob: '1992-04-14',
        expiry: '2031-10-18',
        gender: 'F'
      },
      boundingBoxes: [
        { x: 8, y: 15, w: 28, h: 48, label: 'Biometric Face Tile', confidence: 0.99, borderColor: '#0066FF' },
        { x: 40, y: 15, w: 55, h: 58, label: 'Bio-data Text Block', confidence: 0.98, textContent: 'ELENA ROSTOVA', borderColor: '#0066FF' },
        { x: 5, y: 78, w: 90, h: 18, label: 'ICAO MRZ 2-Line Zone (Fail Checksum)', confidence: 0.99, borderColor: '#EF4444' },
        { x: 32, y: 55, w: 18, h: 20, label: 'Holographic Seal', confidence: 0.94, borderColor: '#10B981' }
      ]
    };
  } else if (documentType === 'BANK_STATEMENT_3M' || fileName.includes('bank')) {
    resData = {
      documentType: 'BANK_STATEMENT_3M',
      confidenceScore: 97.5,
      extractedFields: {
        account_holder: 'Elena Rostova',
        bank_name: 'HSBC UK International',
        statement_period: '2026-05-01 to 2026-08-01',
        continuous_months: 3,
        closing_balance: 14850.00,
        currency: 'EUR',
        statement_age_days: 102 // > 90 days triggers rule
      },
      mrzData: null,
      boundingBoxes: [
        { x: 5, y: 5, w: 40, h: 12, label: 'Financial Institution Header', confidence: 0.98, borderColor: '#0066FF' },
        { x: 55, y: 8, w: 40, h: 15, label: 'Account Holder & Period', confidence: 0.97, borderColor: '#0066FF' },
        { x: 5, y: 28, w: 90, h: 55, label: '3-Month Continuous Transaction Table', confidence: 0.95, borderColor: '#0066FF' },
        { x: 55, y: 86, w: 40, h: 10, label: 'Closing Balance (€14,850.00)', confidence: 0.99, borderColor: '#10B981' }
      ]
    };
  } else {
    resData = {
      documentType: 'TRAVEL_INSURANCE_SCHENGEN',
      confidenceScore: 98.8,
      extractedFields: {
        policy_holder: 'Elena Rostova',
        insurer: 'Allianz Care Worldwide',
        policy_period: '2026-09-01 to 2026-09-30',
        medical_coverage_amount: 50000.0,
        repatriation_included: true,
        schengen_compliant: true
      },
      mrzData: null,
      boundingBoxes: [
        { x: 5, y: 5, w: 45, h: 10, label: 'Allianz Global Assistance Header', confidence: 0.99, borderColor: '#0066FF' },
        { x: 5, y: 18, w: 90, h: 20, label: 'Policyholder: Elena Rostova', confidence: 0.98, borderColor: '#0066FF' },
        { x: 5, y: 42, w: 90, h: 18, label: 'Coverage Territory: Schengen Area', confidence: 0.99, borderColor: '#10B981' },
        { x: 5, y: 64, w: 90, h: 25, label: 'Medical Repatriation Limit: €50,000', confidence: 0.99, borderColor: '#10B981' }
      ]
    };
  }

  const latency = Math.round(performance.now() - startTime + 84);

  return {
    data: resData,
    apiPayload: {
      endpoint: '/api/v1/cv/ocr-layout',
      method: 'POST',
      requestPayload: reqPayload,
      responsePayload: resData,
      statusCode: 200,
      latencyMs: latency
    }
  };
}

/**
 * 2. Government Rules Engine Service
 */
export function runGovernmentRulesEngine(
  destinationCountry: string = 'France (Schengen)',
  entryDate: string = '2026-09-01',
  exitDate: string = '2026-09-15',
  passportExpiry: string = '2031-10-18',
  mrzChecksumValid: boolean = false,
  insuranceEndDate: string = '2026-09-30',
  insuranceAmount: number = 50000,
  statementAgeDays: number = 102
): {
  overallCompliant: boolean;
  totalRules: number;
  passedCount: number;
  failedCount: number;
  riskPenalty: number;
  ruleResults: RuleCheckResult[];
  actionRequired: 'NONE' | 'DOCUMENT_REUPLOAD' | 'MFA_ESCALATION' | 'STATUTORY_REFUSAL';
  apiPayload: MicroserviceApiPayload;
} {
  const startTime = performance.now();

  const rules: RuleCheckResult[] = [
    {
      ruleId: 'RULE-PASSPORT-VALIDITY-6M',
      title: 'Passport Validity Buffer (>= 6 Months Beyond Stay)',
      category: 'PASSPORT_VALIDITY',
      passed: true,
      severity: 'CRITICAL',
      statutoryCode: 'Schengen Visa Code Art. 12(a)',
      observedValue: `Expires ${passportExpiry} (5+ years remaining)`,
      expectedThreshold: '>= 180 days (6 months) beyond exit date',
      description: 'Passport must maintain at least 6 months validity from intended departure.',
      targetBoundingBox: { x: 40, y: 55, w: 40, h: 10, label: 'Passport Expiry Date' }
    },
    {
      ruleId: 'RULE-ICAO-MRZ-CHECKSUM',
      title: 'ICAO Doc 9303 Modulo-7 MRZ Checksum Integrity',
      category: 'IDENTITY_ALIGNMENT',
      passed: mrzChecksumValid,
      severity: 'CRITICAL',
      statutoryCode: 'ICAO Doc 9303 Part 3 / ISO/IEC 7501-1',
      observedValue: mrzChecksumValid ? 'MOD-7 Valid Check Digit Pass' : 'MOD-7 Checksum Mismatch on Line 2 (Digit 10 vs Calculated 8)',
      expectedThreshold: 'Exact modulo-7 match on Passport Number, DOB, and Expiry',
      description: 'MRZ mathematical check digit does not align with OCR plain text.',
      remediationAction: 'Manual biometric inspection required for document optical integrity.',
      targetBoundingBox: { x: 5, y: 78, w: 90, h: 18, label: 'MRZ Checksum Fail Zone', isTampered: !mrzChecksumValid }
    },
    {
      ruleId: 'RULE-INS-EXPIRY-AND-MIN-COVERAGE',
      title: 'Schengen Travel Insurance Expiry & Minimum Repatriation (€30k)',
      category: 'INSURANCE_COVERAGE',
      passed: insuranceEndDate >= exitDate && insuranceAmount >= 30000,
      severity: 'HIGH',
      statutoryCode: 'Visa Code Regulation (EC) No 810/2009 Art. 15',
      observedValue: `Valid to ${insuranceEndDate}, Coverage €${insuranceAmount.toLocaleString()}, Repatriation included`,
      expectedThreshold: `Valid through ${exitDate} + Min €30,000 medical repatriation`,
      description: 'Insurance policy must cover entire stay and provide at least €30,000 emergency medical cover.',
      targetBoundingBox: { x: 5, y: 64, w: 90, h: 25, label: 'Medical Coverage Limit' }
    },
    {
      ruleId: 'RULE-BANK-3M-CONTINUOUS-FUNDS',
      title: '3-Month Continuous Bank Statement & Subsistence Funds',
      category: 'FINANCIAL_SUBSISTENCE',
      passed: statementAgeDays <= 90,
      severity: 'HIGH',
      statutoryCode: 'Schengen Visa Code Art. 14(1)(a) & (3)',
      observedValue: `3 months continuous, Balance €14,850.00, Statement Age: ${statementAgeDays} days`,
      expectedThreshold: '>= 3 months continuous ledger, statement issued <= 90 days prior, min €65/day',
      description: statementAgeDays > 90 ? `Bank statement issued ${statementAgeDays} days ago (exceeds 90-day statutory freshness limit).` : 'Financial subsistence requirements fully satisfied.',
      remediationAction: statementAgeDays > 90 ? 'Applicant must upload certified bank statement issued within the last 90 days.' : undefined,
      targetBoundingBox: { x: 55, y: 8, w: 40, h: 15, label: 'Statement Date Stamp', isTampered: statementAgeDays > 90 }
    },
    {
      ruleId: 'RULE-CROSS-DOC-NAME-MATCH',
      title: 'Cross-Document Name Entity Alignment',
      category: 'IDENTITY_ALIGNMENT',
      passed: true,
      severity: 'CRITICAL',
      statutoryCode: 'ICAO 9303 / Consular Fraud Directive 2018/1861',
      observedValue: 'Elena Rostova matching across Passport, Bank, and Insurance',
      expectedThreshold: 'Exact/Fuzzy Levenshtein similarity >= 90% across all dossier files',
      description: 'All financial, insurance, and travel vouchers align with applicant legal name.'
    }
  ];

  const failedCount = rules.filter(r => !r.passed).length;
  const passedCount = rules.length - failedCount;
  
  let penalty = 0;
  rules.forEach(r => {
    if (!r.passed) {
      if (r.severity === 'CRITICAL') penalty += 48;
      else if (r.severity === 'HIGH') penalty += 26;
      else penalty += 10;
    }
  });

  const riskPenalty = Math.min(100, penalty);
  const actionRequired = riskPenalty >= 70 ? 'STATUTORY_REFUSAL' : (riskPenalty >= 40 ? 'DOCUMENT_REUPLOAD' : (riskPenalty > 0 ? 'MFA_ESCALATION' : 'NONE'));

  const reqPayload = {
    destination_country: destinationCountry,
    intended_entry_date: entryDate,
    intended_exit_date: exitDate,
    passport_data: { passport_number: 'GB89201476', expiry: passportExpiry, mrz_checksum_valid: mrzChecksumValid },
    supporting_documents: [
      { type: 'BANK_STATEMENT', statement_age_days: statementAgeDays },
      { type: 'TRAVEL_INSURANCE', policy_end_date: insuranceEndDate, coverage_amount: insuranceAmount }
    ]
  };

  const resPayload = {
    overall_compliant: failedCount === 0,
    total_rules_evaluated: rules.length,
    rules_passed_count: passedCount,
    rules_failed_count: failedCount,
    risk_score_penalty: riskPenalty,
    action_required: actionRequired,
    rule_results: rules
  };

  return {
    overallCompliant: failedCount === 0,
    totalRules: rules.length,
    passedCount,
    failedCount,
    riskPenalty,
    ruleResults: rules,
    actionRequired,
    apiPayload: {
      endpoint: '/api/v1/cv/rules-engine',
      method: 'POST',
      requestPayload: reqPayload,
      responsePayload: resPayload,
      statusCode: 200,
      latencyMs: Math.round(performance.now() - startTime + 42)
    }
  };
}

/**
 * 3. Biometric Photo Verification & ICAO Constraints Service
 */
export function runBiometricVerification(
  yaw: number = 1.2,
  pitch: number = 0.8,
  roll: number = -0.4,
  bgPurity: number = 98.6,
  faceCoverage: number = 76.5,
  matchScore: number = 98.4,
  livenessScore: number = 99.4
): {
  facialMatchScore: number;
  isMatch: boolean;
  livenessPadScore: number;
  livenessPassed: boolean;
  icaoMetrics: IcaoPhotoMetrics;
  flaggedReasons: string[];
  apiPayload: MicroserviceApiPayload;
} {
  const startTime = performance.now();

  const isFrontal = Math.abs(yaw) <= 5.0 && Math.abs(pitch) <= 5.0 && Math.abs(roll) <= 5.0;
  const bgPassed = bgPurity >= 90.0;
  const coveragePassed = faceCoverage >= 70.0 && faceCoverage <= 80.0;
  const livenessPassed = livenessScore >= 95.0;
  const isMatch = matchScore >= 85.0;

  const flagged: string[] = [];
  if (!isFrontal) flagged.push(`Head pose deviation: Yaw ${yaw}°, Pitch ${pitch}°, Roll ${roll}° (Max allowed ±5°)`);
  if (!bgPassed) flagged.push(`Background purity ${bgPurity}% failed (Requires >= 90.0% uniform white/light grey)`);
  if (!coveragePassed) flagged.push(`Face coverage ${faceCoverage}% invalid (Standard: 70-80% of vertical frame)`);
  if (!livenessPassed) flagged.push(`PAD Liveness score ${livenessScore}% below 95% threshold`);
  if (!isMatch) flagged.push(`NIST 1:1 Vector similarity score ${matchScore}% below 85% threshold`);

  const icaoMetrics: IcaoPhotoMetrics = {
    backgroundPurityScore: bgPurity,
    dimensionCheckPassed: true,
    faceCoveragePercentage: faceCoverage,
    headPose: { yaw, pitch, roll, isFrontal },
    eyesOpen: true,
    neutralExpression: true,
    glareDetected: false,
    allConstraintsMet: flagged.length === 0
  };

  const reqPayload = {
    yaw_angle_degrees: yaw,
    pitch_angle_degrees: pitch,
    roll_angle_degrees: roll,
    background_purity_score: bgPurity,
    face_coverage_pct: faceCoverage,
    nist_vector_match_score: matchScore,
    liveness_pad_score: livenessScore
  };

  const resPayload = {
    facial_match_score: matchScore,
    is_match: isMatch,
    match_threshold: 85.0,
    liveness_pad_score: livenessScore,
    liveness_passed: livenessPassed,
    icao_constraints: icaoMetrics,
    flagged_reasons: flagged
  };

  return {
    facialMatchScore: matchScore,
    isMatch,
    livenessPadScore: livenessScore,
    livenessPassed,
    icaoMetrics,
    flaggedReasons: flagged,
    apiPayload: {
      endpoint: '/api/v1/cv/biometric-verify',
      method: 'POST',
      requestPayload: reqPayload,
      responsePayload: resPayload,
      statusCode: 200,
      latencyMs: Math.round(performance.now() - startTime + 68)
    }
  };
}

/**
 * 4. Forgery & Tamper Detection (ELA) Service
 */
export function runTamperAndElaDetection(
  simulateTampered: boolean = true
): {
  tamperResult: TamperDetectionResult;
  apiPayload: MicroserviceApiPayload;
} {
  const startTime = performance.now();

  const anomalies: TamperAnomalyRecord[] = simulateTampered ? [
    {
      anomalyId: 'ELA-TAMPER-01',
      anomalyType: 'ELA_COMPRESSION_SPIKE',
      confidence: 0.96,
      description: 'High-frequency compression delta spike in bank closing balance text. Indicates pixel splicing over original digital canvas.',
      boundingBox: {
        x: 54,
        y: 84,
        w: 42,
        h: 12,
        label: 'Altered Numeric Balance Region (€94,850.00)',
        isTampered: true,
        borderColor: '#EF4444'
      },
      severity: 'CRITICAL'
    },
    {
      anomalyId: 'FONT-MISMATCH-02',
      anomalyType: 'FONT_METRIC_INCONSISTENCY',
      confidence: 0.91,
      description: 'Font glyph kerning & stroke width anomaly: Digit "9" rendered in ArialMT 10.2pt within a Helvetica-Bold 10.0pt table stream.',
      boundingBox: {
        x: 58,
        y: 85,
        w: 18,
        h: 8,
        label: 'Font Mismatch Detected (Glyph "9")',
        isTampered: true,
        borderColor: '#FF9900'
      },
      severity: 'HIGH'
    }
  ] : [];

  const tamperResult: TamperDetectionResult = {
    tamperDetected: simulateTampered,
    overallIntegrityScore: simulateTampered ? 42.5 : 99.1,
    elaMaxDifferenceRatio: simulateTampered ? 0.88 : 0.08,
    fontInconsistencyScore: simulateTampered ? 0.92 : 0.04,
    metadataAlterationDetected: simulateTampered,
    anomalies,
    elaHeatmapAvailable: true
  };

  const reqPayload = {
    document_type: 'BANK_STATEMENT_3M',
    ela_quality_factor: 95,
    font_metric_tolerance: 0.05,
    simulate_altered: simulateTampered
  };

  const resPayload = {
    tamper_detected: simulateTampered,
    overall_integrity_score: tamperResult.overallIntegrityScore,
    ela_max_difference_ratio: tamperResult.elaMaxDifferenceRatio,
    font_inconsistency_score: tamperResult.fontInconsistencyScore,
    metadata_alteration_detected: tamperResult.metadataAlterationDetected,
    anomalies: tamperResult.anomalies,
    ela_heatmap_available: true
  };

  return {
    tamperResult,
    apiPayload: {
      endpoint: '/api/v1/cv/forgery-ela-check',
      method: 'POST',
      requestPayload: reqPayload,
      responsePayload: resPayload,
      statusCode: 200,
      latencyMs: Math.round(performance.now() - startTime + 54)
    }
  };
}
