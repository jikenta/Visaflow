import { VfsCenter, VisaCategory, VisaApplicationRecord, BotThreatEvent, MicroserviceBlueprint, DocumentChecklistItem } from '../types';

export const VFS_CENTERS: VfsCenter[] = [
  {
    id: 'lon-01',
    name: 'London Victoria Visa Application Centre',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    address: '66 Wilson Street, London EC2A 2BT',
    nextAvailableDate: '2026-08-22',
    slotsAvailable: 14,
    operatingHours: '08:30 - 16:30 GMT',
  },
  {
    id: 'dxb-01',
    name: 'Dubai Wafi Mall Premium Application Centre',
    city: 'Dubai',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    address: 'Level 3, Wafi Mall, Umm Hurair 2, Dubai',
    nextAvailableDate: '2026-08-21',
    slotsAvailable: 38,
    operatingHours: '08:00 - 17:00 GST',
  },
  {
    id: 'del-01',
    name: 'New Delhi Shivaji Stadium VFS Hub',
    city: 'New Delhi',
    country: 'India',
    flag: '🇮🇳',
    address: 'Mezzanine Floor, Baba Kharak Singh Marg, Connaught Place, New Delhi',
    nextAvailableDate: '2026-08-24',
    slotsAvailable: 5,
    operatingHours: '08:00 - 16:00 IST',
  },
  {
    id: 'sin-01',
    name: 'Singapore Anson Road Visa Centre',
    city: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    address: '79 Anson Road, #15-02, Singapore 079906',
    nextAvailableDate: '2026-08-21',
    slotsAvailable: 22,
    operatingHours: '08:30 - 15:30 SGT',
  },
  {
    id: 'nyc-01',
    name: 'New York Manhattan Consular Centre',
    city: 'New York',
    country: 'United States',
    flag: '🇺🇸',
    address: '145 West 45th Street, 4th Floor, New York, NY 10036',
    nextAvailableDate: '2026-08-25',
    slotsAvailable: 18,
    operatingHours: '09:00 - 16:00 EST',
  },
  {
    id: 'fra-01',
    name: 'Frankfurt Main Visa Operations Centre',
    city: 'Frankfurt',
    country: 'Germany',
    flag: '🇩🇪',
    address: 'Mainzer Landstraße 180, 60327 Frankfurt am Main',
    nextAvailableDate: '2026-08-23',
    slotsAvailable: 29,
    operatingHours: '08:30 - 16:00 CET',
  }
];

export const VISA_CATEGORIES: VisaCategory[] = [
  {
    id: 'sch-tourist-c',
    code: 'SCH-C-TOUR',
    name: 'Schengen Short-Stay Tourist Visa (Type C)',
    destination: 'France / Schengen Area',
    duration: 'Up to 90 Days',
    fee: 90,
    processingTime: '5-15 Working Days',
    requiredDocsCount: 6,
  },
  {
    id: 'uk-standard-visit',
    code: 'UK-STD-VIS',
    name: 'UK Standard Visitor Visa (6 Months)',
    destination: 'United Kingdom',
    duration: '6 Months Multi-Entry',
    fee: 140,
    processingTime: '15 Working Days (3-Day Priority Available)',
    requiredDocsCount: 5,
  },
  {
    id: 'us-b1-b2',
    code: 'US-B1B2-NONIMM',
    name: 'US Business & Tourism Non-Immigrant (B1/B2)',
    destination: 'United States',
    duration: '10 Years Multi-Entry',
    fee: 185,
    processingTime: '10 Working Days',
    requiredDocsCount: 5,
  },
  {
    id: 'fra-talent-passport',
    code: 'FRA-D-TALENT',
    name: 'France Long-Stay Talent Passport',
    destination: 'France',
    duration: '1-4 Years Residence',
    fee: 225,
    processingTime: '15-20 Working Days',
    requiredDocsCount: 7,
  },
  {
    id: 'jpn-tourist-evisa',
    code: 'JPN-E-TOUR',
    name: 'Japan Short-Term e-Visa',
    destination: 'Japan',
    duration: '90 Days Single/Double',
    fee: 50,
    processingTime: '5 Working Days',
    requiredDocsCount: 4,
  }
];

export const DEFAULT_DOCUMENT_CHECKLIST: DocumentChecklistItem[] = [
  {
    id: 'doc-pass',
    title: 'International Biometric Passport (Bio-data Page)',
    category: 'identity',
    description: 'Must have at least 6 months remaining validity from intended departure date and at least 2 blank pages.',
    isRequired: true,
    status: 'compliant',
    fileName: 'passport_scan_verified.jpg',
    fileSize: '2.4 MB',
    fileType: 'image/jpeg',
    uploadDate: 'Today, 10:14 AM',
    ocrConfidence: 99.4,
    complianceChecks: {
      resolutionCheck: true,
      validityDateCheck: true,
      tamperCheck: true,
      nameMatchCheck: true,
    }
  },
  {
    id: 'doc-bank',
    title: 'Certified Bank Statements (Last 3 Months)',
    category: 'financial',
    description: 'Official stamped bank statement showing sufficient funds (min. €65/day of stay) with clear account holder name.',
    isRequired: true,
    status: 'compliant',
    fileName: 'bank_statement_q2_2026.pdf',
    fileSize: '4.8 MB',
    fileType: 'application/pdf',
    uploadDate: 'Today, 10:18 AM',
    ocrConfidence: 96.8,
    complianceChecks: {
      resolutionCheck: true,
      validityDateCheck: true,
      tamperCheck: true,
      nameMatchCheck: true,
    }
  },
  {
    id: 'doc-flight',
    title: 'Round-Trip Flight Reservation / Itinerary',
    category: 'travel',
    description: 'Confirmed round-trip ticket reservation showing entry and exit ports within the destination territory.',
    isRequired: true,
    status: 'compliant',
    fileName: 'flight_itinerary_cdg_lon.pdf',
    fileSize: '1.1 MB',
    fileType: 'application/pdf',
    uploadDate: 'Today, 10:22 AM',
    ocrConfidence: 98.2,
    complianceChecks: {
      resolutionCheck: true,
      validityDateCheck: true,
      tamperCheck: true,
      nameMatchCheck: true,
    }
  },
  {
    id: 'doc-hotel',
    title: 'Proof of Accommodation / Hotel Booking',
    category: 'accommodation',
    description: 'Valid hotel voucher covering the full length of the intended stay with matched applicant names.',
    isRequired: true,
    status: 'pending',
    complianceChecks: {
      resolutionCheck: false,
      validityDateCheck: false,
      tamperCheck: false,
      nameMatchCheck: false,
    }
  },
  {
    id: 'doc-ins',
    title: 'Schengen Travel & Medical Insurance Policy',
    category: 'travel',
    description: 'Minimum coverage of €30,000 covering emergency hospital treatment, repatriation, valid in all member states.',
    isRequired: true,
    status: 'pending',
    complianceChecks: {
      resolutionCheck: false,
      validityDateCheck: false,
      tamperCheck: false,
      nameMatchCheck: false,
    }
  },
  {
    id: 'doc-emp',
    title: 'Employer No-Objection Certificate (NOC) / Pay Slips',
    category: 'employment',
    description: 'Official employment verification letter confirming role, salary, leave approval, and company contact details.',
    isRequired: false,
    status: 'pending',
    complianceChecks: {
      resolutionCheck: false,
      validityDateCheck: false,
      tamperCheck: false,
      nameMatchCheck: false,
    }
  }
];

export const INITIAL_APPLICATION_QUEUE: VisaApplicationRecord[] = [
  {
    id: 'app-9824',
    refNumber: 'VFS-2026-LON-9824',
    applicantName: 'Elena Rostova',
    applicantEmail: 'elena.rostova@globalmail.com',
    applicantPhone: '+44 7911 123456',
    passportNumber: 'GB89201476',
    nationality: 'United Kingdom',
    destinationCountry: 'France (Schengen)',
    visaType: 'Schengen Short-Stay Tourist (C)',
    appointmentDate: '2026-08-22',
    appointmentTime: '09:30 AM',
    centerName: 'London Victoria Visa Centre',
    submissionDate: '2026-08-19 14:15 UTC',
    riskScore: 94,
    status: 'Flagged',
    biometricScore: 98.4,
    documentComplianceScore: 68.0,
    assignedOfficer: 'Agent K. Davies (ID #402)',
    flags: [
      {
        id: 'flg-01',
        severity: 'critical',
        title: 'MRZ Checksum Digit Mismatch',
        description: 'Digit 10 of Line 2 does not match the modulo-7 checksum algorithm calculated from Date of Birth.',
        ruleId: 'ICAO-DOC-9303-CHK-FAIL'
      },
      {
        id: 'flg-02',
        severity: 'high',
        title: 'Document Expiration Alert',
        description: 'Bank statement issued 102 days ago (policy requires statement issued within 90 days).',
        ruleId: 'FIN-VALIDITY-MAX-90D'
      }
    ],
    passportData: {
      documentType: 'P',
      issuingCountry: 'GBR',
      surname: 'ROSTOVA',
      givenNames: 'ELENA',
      passportNumber: 'GB89201476',
      nationality: 'GBR',
      dateOfBirth: '1992-04-14',
      gender: 'F',
      dateOfExpiry: '2031-10-18',
      personalNumber: '920414-7890',
      mrzLine1: 'P<GBRROSTOVA<<ELENA<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'GB89201476GBR9204144F3110189<<<<<<<<<<<<<<08',
      checksumValid: false,
      confidenceScore: 84.2,
      imageUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      boundingBoxes: {
        photo: { x: 8, y: 15, w: 28, h: 48, label: 'Biometric Face Tile' },
        mrz: { x: 5, y: 78, w: 90, h: 18, label: 'ICAO MRZ Zone (Fail Checksum)' },
        personalData: { x: 40, y: 15, w: 55, h: 58, label: 'Identity Text Block' },
        securityEmboss: { x: 32, y: 55, w: 18, h: 20, label: 'Holographic Seal' }
      }
    },
    documents: [
      {
        ...DEFAULT_DOCUMENT_CHECKLIST[0],
        status: 'compliant'
      },
      {
        ...DEFAULT_DOCUMENT_CHECKLIST[1],
        status: 'flagged',
        flagReason: 'Statement issued > 90 days prior to submission.'
      },
      {
        ...DEFAULT_DOCUMENT_CHECKLIST[2],
        status: 'compliant'
      }
    ],
    biometricImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    auditTrail: [
      { timestamp: '14:15:02 UTC', actor: 'Client Portal Ingestion', action: 'Payload received from IP 185.220.101.5' },
      { timestamp: '14:15:05 UTC', actor: 'Automated OCR Pipeline', action: 'Flagged: ICAO MRZ Checksum check failed' },
      { timestamp: '14:15:08 UTC', actor: 'Compliance AI Engine', action: 'Flagged: Bank statement age exceeds threshold' }
    ]
  },
  {
    id: 'app-9825',
    refNumber: 'VFS-2026-DXB-9825',
    applicantName: 'Tariq Al-Mansoor',
    applicantEmail: 'tariq.mansoor@emiratesgroup.ae',
    applicantPhone: '+971 50 889 4412',
    passportNumber: 'AE55019284',
    nationality: 'United Arab Emirates',
    destinationCountry: 'United Kingdom',
    visaType: 'UK Standard Visitor (6 Months)',
    appointmentDate: '2026-08-21',
    appointmentTime: '10:00 AM',
    centerName: 'Dubai Wafi Mall Premium Lounge',
    submissionDate: '2026-08-19 14:02 UTC',
    riskScore: 12,
    status: 'Ready for Review',
    biometricScore: 99.8,
    documentComplianceScore: 100.0,
    assignedOfficer: 'Agent M. Patel (ID #119)',
    flags: [],
    passportData: {
      documentType: 'P',
      issuingCountry: 'ARE',
      surname: 'AL-MANSOOR',
      givenNames: 'TARIQ',
      passportNumber: 'AE55019284',
      nationality: 'ARE',
      dateOfBirth: '1986-11-23',
      gender: 'M',
      dateOfExpiry: '2034-05-12',
      personalNumber: '784-1986-1234567-1',
      mrzLine1: 'P<AREAL<MANSOOR<<TARIQ<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'AE55019284ARE8611232M3405128<<<<<<<<<<<<<<02',
      checksumValid: true,
      confidenceScore: 99.7,
      imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      boundingBoxes: {
        photo: { x: 8, y: 15, w: 28, h: 48, label: 'Biometric Face Tile' },
        mrz: { x: 5, y: 78, w: 90, h: 18, label: 'ICAO MRZ Zone (Valid)' },
        personalData: { x: 40, y: 15, w: 55, h: 58, label: 'Identity Text Block' },
        securityEmboss: { x: 32, y: 55, w: 18, h: 20, label: 'Holographic Seal' }
      }
    },
    documents: DEFAULT_DOCUMENT_CHECKLIST.map(d => ({ ...d, status: 'compliant' as const })),
    biometricImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    signatureHash: 'a7c8b9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    auditTrail: [
      { timestamp: '14:02:10 UTC', actor: 'Client Portal Ingestion', action: 'Payload received from IP 94.200.12.88' },
      { timestamp: '14:02:12 UTC', actor: 'Automated OCR Pipeline', action: 'MRZ Checksums 100% verified' },
      { timestamp: '14:02:14 UTC', actor: 'Biometric Engine', action: 'Face Match 99.8% (ICAO Compliant)' }
    ]
  },
  {
    id: 'app-9826',
    refNumber: 'VFS-2026-DEL-9826',
    applicantName: 'Priya Sharma',
    applicantEmail: 'priya.sharma@techcorp.in',
    applicantPhone: '+91 98101 23456',
    passportNumber: 'IN88129031',
    nationality: 'India',
    destinationCountry: 'United States',
    visaType: 'US Business & Tourism (B1/B2)',
    appointmentDate: '2026-08-24',
    appointmentTime: '11:15 AM',
    centerName: 'New Delhi Shivaji Stadium VFS Hub',
    submissionDate: '2026-08-19 13:45 UTC',
    riskScore: 28,
    status: 'Ready for Review',
    biometricScore: 97.2,
    documentComplianceScore: 94.0,
    assignedOfficer: 'Agent K. Davies (ID #402)',
    flags: [],
    passportData: {
      documentType: 'P',
      issuingCountry: 'IND',
      surname: 'SHARMA',
      givenNames: 'PRIYA',
      passportNumber: 'IN88129031',
      nationality: 'IND',
      dateOfBirth: '1995-07-19',
      gender: 'F',
      dateOfExpiry: '2033-08-11',
      personalNumber: 'Z88129031',
      mrzLine1: 'P<INDSHARMA<<PRIYA<<<<<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'IN88129031IND9507198F3308112<<<<<<<<<<<<<<04',
      checksumValid: true,
      confidenceScore: 98.9,
      imageUri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      boundingBoxes: {
        photo: { x: 8, y: 15, w: 28, h: 48, label: 'Biometric Face Tile' },
        mrz: { x: 5, y: 78, w: 90, h: 18, label: 'ICAO MRZ Zone (Valid)' },
        personalData: { x: 40, y: 15, w: 55, h: 58, label: 'Identity Text Block' },
        securityEmboss: { x: 32, y: 55, w: 18, h: 20, label: 'Holographic Seal' }
      }
    },
    documents: DEFAULT_DOCUMENT_CHECKLIST.slice(0, 4).map(d => ({ ...d, status: 'compliant' as const })),
    biometricImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    signatureHash: 'f45a67b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    auditTrail: [
      { timestamp: '13:45:00 UTC', actor: 'Client Portal Ingestion', action: 'Payload received from IP 103.21.124.9' },
      { timestamp: '13:45:04 UTC', actor: 'Automated OCR Pipeline', action: 'OCR Confidence 98.9%' }
    ]
  },
  {
    id: 'app-9827',
    refNumber: 'VFS-2026-SIN-9827',
    applicantName: 'Marcus Wei Chen',
    applicantEmail: 'marcus.chen@singfin.sg',
    applicantPhone: '+65 9123 4567',
    passportNumber: 'SG44901822',
    nationality: 'Singapore',
    destinationCountry: 'France (Schengen)',
    visaType: 'France Long-Stay Talent Passport',
    appointmentDate: '2026-08-21',
    appointmentTime: '14:00 PM',
    centerName: 'Singapore Anson Road Visa Centre',
    submissionDate: '2026-08-19 13:10 UTC',
    riskScore: 78,
    status: 'Flagged',
    biometricScore: 95.0,
    documentComplianceScore: 72.0,
    assignedOfficer: 'Supervisor L. Dupont (ID #008)',
    flags: [
      {
        id: 'flg-03',
        severity: 'high',
        title: 'Discrepancy in Name Spelling across Documents',
        description: 'Passport surname is "CHEN", but Flight Booking Passenger name reads "WEI-CHEN, MARCUS".',
        ruleId: 'DOC-CROSSMATCH-NAME-MISMATCH'
      }
    ],
    passportData: {
      documentType: 'P',
      issuingCountry: 'SGP',
      surname: 'CHEN',
      givenNames: 'MARCUS WEI',
      passportNumber: 'SG44901822',
      nationality: 'SGP',
      dateOfBirth: '1990-12-05',
      gender: 'M',
      dateOfExpiry: '2032-03-29',
      personalNumber: 'S9012345A',
      mrzLine1: 'P<SGPCHEN<<MARCUS<WEI<<<<<<<<<<<<<<<<<<<<<<',
      mrzLine2: 'SG44901822SGP9012051M3203294<<<<<<<<<<<<<<06',
      checksumValid: true,
      confidenceScore: 96.5,
      imageUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      boundingBoxes: {
        photo: { x: 8, y: 15, w: 28, h: 48, label: 'Biometric Face Tile' },
        mrz: { x: 5, y: 78, w: 90, h: 18, label: 'ICAO MRZ Zone' },
        personalData: { x: 40, y: 15, w: 55, h: 58, label: 'Identity Text Block' },
        securityEmboss: { x: 32, y: 55, w: 18, h: 20, label: 'Holographic Seal' }
      }
    },
    documents: [
      { ...DEFAULT_DOCUMENT_CHECKLIST[0], status: 'compliant' },
      { ...DEFAULT_DOCUMENT_CHECKLIST[1], status: 'compliant' },
      { ...DEFAULT_DOCUMENT_CHECKLIST[2], status: 'flagged', flagReason: 'Name mismatch with Passport bio-data' }
    ],
    biometricImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    signatureHash: 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    auditTrail: [
      { timestamp: '13:10:04 UTC', actor: 'Client Portal Ingestion', action: 'Payload received from IP 118.200.44.12' },
      { timestamp: '13:10:09 UTC', actor: 'Entity Resolution Engine', action: 'Triggered Name Variance Warning' }
    ]
  }
];

export const BOT_THREAT_FEED: BotThreatEvent[] = [
  {
    id: 'thr-891',
    timestamp: '15:24:12 UTC',
    threatType: 'Slot Hoarding / Bot Rapid Fire',
    attackerIp: '185.193.88.24',
    geoLocation: 'Moscow, Russia (AS48208)',
    asnName: 'Hosting-Provider-NL',
    requestsPerSec: 1420,
    severity: 'critical',
    mitigationAction: 'Auto-Banned IP',
    status: 'Mitigated'
  },
  {
    id: 'thr-892',
    timestamp: '15:22:45 UTC',
    threatType: 'Headless Browser Signature',
    attackerIp: '104.28.192.11',
    geoLocation: 'Frankfurt, Germany (AS13335)',
    asnName: 'Cloudflare WARP Egress',
    requestsPerSec: 480,
    severity: 'high',
    mitigationAction: 'Biometric CAPTCHA Challenged',
    status: 'Mitigated'
  },
  {
    id: 'thr-893',
    timestamp: '15:19:08 UTC',
    threatType: 'Residential Proxy Pool',
    attackerIp: '72.251.18.99',
    geoLocation: 'Dallas, US (AS7018)',
    asnName: 'AT&T Mobility Pool (Rotating)',
    requestsPerSec: 890,
    severity: 'critical',
    mitigationAction: 'Fingerprint Blacklisted',
    status: 'Mitigated'
  },
  {
    id: 'thr-894',
    timestamp: '15:15:33 UTC',
    threatType: 'CAPTCHA Bypass Velocity',
    attackerIp: '202.67.40.15',
    geoLocation: 'Jakarta, Indonesia (AS7713)',
    asnName: 'Telkom Indonesia ASN',
    requestsPerSec: 320,
    severity: 'medium',
    mitigationAction: 'Rate-Limited (429)',
    status: 'Mitigated'
  },
  {
    id: 'thr-895',
    timestamp: '15:10:02 UTC',
    threatType: 'Slot Hoarding / Bot Rapid Fire',
    attackerIp: '45.154.255.8',
    geoLocation: 'Amsterdam, Netherlands (AS204957)',
    asnName: 'GreenFloid Servers',
    requestsPerSec: 2100,
    severity: 'critical',
    mitigationAction: 'Auto-Banned IP',
    status: 'Mitigated'
  }
];

export const MICROSERVICE_BLUEPRINT: MicroserviceBlueprint[] = [
  {
    id: 'srv-iam',
    name: 'Identity & Access Management (IAM)',
    shortCode: 'AUTH-SRV',
    domain: 'Security & Access',
    description: 'Centralized OAuth2/OIDC provider with hardware MFA, role-based RBAC (Applicants, VFS Officers, Consular Supervisors), session token vault, and biometric authentication binding.',
    technologies: ['Go 1.23', 'Keycloak / Ory Kratos', 'Redis Cluster', 'PKCE mTLS'],
    protocol: 'gRPC',
    throughputSla: '45,000 req/sec | < 12ms p99',
    dataClassification: 'GDPR PII',
    keyEndpoints: [
      { method: 'POST', path: '/v1/auth/applicant/mfa-challenge', purpose: 'Issue zero-knowledge biometric challenge token' },
      { method: 'POST', path: '/v1/auth/token/exchange', purpose: 'Mint scoped short-lived JWT for VFS Portal' },
      { method: 'GET', path: '/v1/auth/roles/permissions', purpose: 'Enforce ABAC policy for queue triage' }
    ]
  },
  {
    id: 'srv-appointment',
    name: 'Appointment & Capacity Allocation Engine',
    shortCode: 'SLOT-SRV',
    domain: 'Operations & Scheduling',
    description: 'High-concurrency distributed lock & booking engine that prevents double-booking, manages queue quotas across 140+ global centers, and integrates slot anti-hoarding barriers.',
    technologies: ['Rust', 'PostgreSQL (Distributed Shards)', 'DragonflyDB', 'Redlock Algorithm'],
    protocol: 'gRPC',
    throughputSla: '30,000 req/sec | < 8ms p99',
    dataClassification: 'Consular Restricted',
    keyEndpoints: [
      { method: 'GET', path: '/v1/centers/{id}/realtime-matrix', purpose: 'Stream slot availability grid with sub-second cache' },
      { method: 'POST', path: '/v1/appointments/atomic-reserve', purpose: 'Acquire 10-minute pessimistic hold lock with HMAC token' },
      { method: 'POST', path: '/v1/appointments/confirm', purpose: 'Commit reservation and publish Kafka SlotBookedEvent' }
    ]
  },
  {
    id: 'srv-ocr',
    name: 'Document Ingestion & MRZ OCR Pipeline',
    shortCode: 'OCR-SRV',
    domain: 'Document AI & Verification',
    description: 'Deep learning computer vision engine for ICAO Doc 9303 MRZ parsing, holographic watermark detection, resolution & glare validation, and entity cross-checking.',
    technologies: ['Python FastAPI', 'ONNX Runtime', 'Tesseract 5', 'OpenCV / PyTorch'],
    protocol: 'REST/HTTPS',
    throughputSla: '3,500 docs/min | < 350ms p95',
    dataClassification: 'ICAO 9303',
    keyEndpoints: [
      { method: 'POST', path: '/v1/ocr/passport/parse-mrz', purpose: 'Extract 2-line/3-line MRZ & verify check digits' },
      { method: 'POST', path: '/v1/compliance/evaluate-bundle', purpose: 'Run real-time compliance matrix on uploaded docs' },
      { method: 'POST', path: '/v1/vision/detect-tampering', purpose: 'Check forensic compression artifacts & font edits' }
    ]
  },
  {
    id: 'srv-bio',
    name: 'Biometric Match & Liveness Service',
    shortCode: 'BIO-SRV',
    domain: 'Biometric Security',
    description: 'NIST FRVT top-tier 1:1 facial recognition engine with 3D passive + active liveness detection, optical glint tracking, anti-deepfake neural classifier, and ISO/IEC 30107-3 compliance.',
    technologies: ['C++20 / CUDA', 'TensorRT', 'InsightFace', 'gRPC Stream'],
    protocol: 'gRPC',
    throughputSla: '8,000 matches/sec | < 65ms p99',
    dataClassification: 'ICAO 9303',
    keyEndpoints: [
      { method: 'STREAM', path: '/v1/biometrics/liveness-session', purpose: 'Bi-directional WebRTC stream for interactive head turn/blink' },
      { method: 'POST', path: '/v1/biometrics/1to1-verify', purpose: 'Compare live face capture against passport chip/photo' },
      { method: 'GET', path: '/v1/biometrics/icao-quality', purpose: 'Evaluate background lighting, tilt, contrast, eyes open' }
    ]
  },
  {
    id: 'srv-fraud',
    name: 'Fraud & Bot Threat Telemetry Engine',
    shortCode: 'WAF-AI',
    domain: 'Cybersecurity & Anti-Bot',
    description: 'Behavioral telemetry collector analyzing browser TLS fingerprints (JA4/JA3), mouse jitter heuristics, residential proxy detection, and automated bot assault mitigation.',
    technologies: ['Elixir / OTP', 'ClickHouse', 'eBPF / XDP Filters', 'Kafka Streams'],
    protocol: 'WebSockets',
    throughputSla: '250,000 events/sec | < 2ms latency',
    dataClassification: 'Consular Restricted',
    keyEndpoints: [
      { method: 'POST', path: '/v1/telemetry/collect-beacon', purpose: 'Ingest client device entropy, canvas & audio hashes' },
      { method: 'GET', path: '/v1/telemetry/threat-stream', purpose: 'Live WebSocket feed for VFS Operations SOC dashboard' },
      { method: 'POST', path: '/v1/waf/dynamic-blocklist', purpose: 'Push BGP routing drops and eBPF kernel drops for offending ASNs' }
    ]
  },
  {
    id: 'srv-consular',
    name: 'Consular Integration & Audit Event Bus',
    shortCode: 'EMBASSY-GW',
    domain: 'Consular Data Exchange',
    description: 'Secure, air-gapped diplomatic channel transmitting compliant visa application dossiers directly to Ministry of Foreign Affairs (MFA) embassies with SHA-256 integrity chains.',
    technologies: ['Java 21 / Quarkus', 'Apache Kafka', 'Hardware Security Module (HSM)', 'OpenPGP'],
    protocol: 'REST/HTTPS',
    throughputSla: '10,000 dossiers/hour | 99.999% Durability',
    dataClassification: 'Consular Restricted',
    keyEndpoints: [
      { method: 'POST', path: '/v1/consulate/dispatch-dossier', purpose: 'Seal application bundle with HSM private key & transmit' },
      { method: 'GET', path: '/v1/consulate/decision-webhook', purpose: 'Receive diplomatic visa issuance / refusal codes' },
      { method: 'GET', path: '/v1/audit/immutable-trail', purpose: 'Cryptographic ledger verification of chain of custody' }
    ]
  }
];
