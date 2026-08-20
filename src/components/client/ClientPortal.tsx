import React, { useState } from 'react';
import { 
  ClientStep, AppointmentState, PassportOcrData, 
  BiometricVerificationState, DigitalSignatureState, 
  DocumentChecklistItem, VisaApplicationRecord 
} from '../../types';
import { VFS_CENTERS, VISA_CATEGORIES, DEFAULT_DOCUMENT_CHECKLIST } from '../../data/mockData';
import { AppointmentBooking } from './AppointmentBooking';
import { PassportScanner } from './PassportScanner';
import { BiometricVerification } from './BiometricVerification';
import { DigitalSignature } from './DigitalSignature';
import { DocumentChecklist } from './DocumentChecklist';
import { ApplicationConfirmation } from './ApplicationConfirmation';
import { ClientChatbotWidget } from '../chat/ClientChatbotWidget';
import { Calendar, Scan, Fingerprint, PenTool, FileCheck, CheckCircle2 } from 'lucide-react';

interface ClientPortalProps {
  onApplicationSubmitted: (newApp: VisaApplicationRecord) => void;
  onNavigateToDashboard: () => void;
  onThreatDetected?: (threat: any) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  onApplicationSubmitted,
  onNavigateToDashboard,
  onThreatDetected,
}) => {
  const [currentStep, setCurrentStep] = useState<ClientStep>('appointment');
  const [generatedRef, setGeneratedRef] = useState<string>('VFS-2026-LON-9824');

  // Client State
  const [appointment, setAppointment] = useState<AppointmentState>({
    centerId: VFS_CENTERS[0].id,
    destinationCountry: 'France / Schengen Area',
    visaCategoryId: VISA_CATEGORIES[0].id,
    date: VFS_CENTERS[0].nextAvailableDate,
    timeSlot: '09:15 AM',
    slotType: 'standard',
    applicantCount: 1,
    smsUpdates: true,
    courierReturn: false,
    loungeAccess: false,
    totalFee: 90,
  });

  const [passport, setPassport] = useState<PassportOcrData>({
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
    checksumValid: true,
    confidenceScore: 99.4,
    imageUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    boundingBoxes: {
      photo: { x: 8, y: 18, w: 28, h: 48, label: 'Biometric Face Tile' },
      mrz: { x: 5, y: 78, w: 90, h: 18, label: 'MRZ Data Strip' },
      personalData: { x: 40, y: 18, w: 55, h: 54, label: 'Identity Text Block' },
      securityEmboss: { x: 32, y: 56, w: 18, h: 20, label: 'Holographic Seal' }
    }
  });

  const [biometrics, setBiometrics] = useState<BiometricVerificationState>({
    status: 'idle',
    livenessScore: 99.4,
    antiSpoofingScore: 99.8,
    faceMatchScore: 98.7,
    lightingAdequacy: 96,
    neutralExpression: true,
    eyesOpen: true,
    blinkDetected: true,
    headTurnDetected: true,
    icaoCompliance: true,
    capturedFrame: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  });

  const [signature, setSignature] = useState<DigitalSignatureState>({
    signatureDataUrl: null,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signedAt: new Date().toISOString(),
    signerLegalName: 'ELENA ROSTOVA',
    ipAddress: '185.220.101.5',
    legalConsentChecked: true,
    declarationAccepted: true,
  });

  const [documents, setDocuments] = useState<DocumentChecklistItem[]>(DEFAULT_DOCUMENT_CHECKLIST);

  const handleUpdateAppointment = (updated: Partial<AppointmentState>) => {
    setAppointment(prev => ({ ...prev, ...updated }));
  };

  const handleUpdatePassport = (data: PassportOcrData) => {
    setPassport(data);
    setSignature(prev => ({ ...prev, signerLegalName: `${data.givenNames} ${data.surname}`.trim() }));
  };

  const handleUpdateBiometrics = (updated: Partial<BiometricVerificationState>) => {
    setBiometrics(prev => ({ ...prev, ...updated }));
  };

  const handleUpdateSignature = (updated: Partial<DigitalSignatureState>) => {
    setSignature(prev => ({ ...prev, ...updated }));
  };

  const handleUpdateDocument = (docId: string, updated: Partial<DocumentChecklistItem>) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, ...updated } : d));
  };

  const handleSubmitApplication = () => {
    const center = VFS_CENTERS.find(c => c.id === appointment.centerId) || VFS_CENTERS[0];
    const category = VISA_CATEGORIES.find(c => c.id === appointment.visaCategoryId) || VISA_CATEGORIES[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refCode = `VFS-2026-${center.city.substring(0, 3).toUpperCase()}-${randomSuffix}`;
    setGeneratedRef(refCode);

    const hasFlaggedDocs = documents.some(d => d.status === 'flagged');

    const newRecord: VisaApplicationRecord = {
      id: `app-${randomSuffix}`,
      refNumber: refCode,
      applicantName: `${passport.givenNames} ${passport.surname}`,
      applicantEmail: `${passport.givenNames.toLowerCase()}.${passport.surname.toLowerCase()}@globalmail.com`,
      applicantPhone: '+44 7911 889922',
      passportNumber: passport.passportNumber,
      nationality: passport.nationality,
      destinationCountry: category.destination,
      visaType: category.name,
      appointmentDate: appointment.date,
      appointmentTime: appointment.timeSlot,
      centerName: center.name,
      submissionDate: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      riskScore: hasFlaggedDocs ? 76 : 14,
      status: hasFlaggedDocs ? 'Flagged' : 'Ready for Review',
      biometricScore: 98.7,
      documentComplianceScore: hasFlaggedDocs ? 75.0 : 100.0,
      assignedOfficer: 'Agent K. Davies (ID #402)',
      flags: hasFlaggedDocs ? [
        {
          id: 'flg-user-1',
          severity: 'medium',
          title: 'Document Discrepancy Flag',
          description: 'One or more submitted documents flagged for manual consular review.',
          ruleId: 'DOC-CROSSMATCH-FLAG'
        }
      ] : [],
      passportData: passport,
      documents: documents,
      biometricImage: biometrics.capturedFrame || passport.imageUri || '',
      signatureHash: signature.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      auditTrail: [
        { timestamp: 'Just Now', actor: 'Client Self-Service Portal', action: 'Application Dossier Submitted & Encrypted' },
        { timestamp: 'Just Now', actor: 'Automated OCR Pipeline', action: 'MRZ Checksums 100% Verified' },
      ]
    };

    onApplicationSubmitted(newRecord);
    setCurrentStep('confirmation');
  };

  const handleReset = () => {
    setCurrentStep('appointment');
  };

  const STEPS: { key: ClientStep; title: string; icon: React.ReactNode }[] = [
    { key: 'appointment', title: '1. Appointment', icon: <Calendar className="w-4 h-4" /> },
    { key: 'passport', title: '2. Passport OCR', icon: <Scan className="w-4 h-4" /> },
    { key: 'biometrics', title: '3. Biometrics', icon: <Fingerprint className="w-4 h-4" /> },
    { key: 'signature', title: '4. Digital Sign', icon: <PenTool className="w-4 h-4" /> },
    { key: 'documents', title: '5. Compliance', icon: <FileCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Mobile-First Step Progress Ribbon */}
      {currentStep !== 'confirmation' && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between overflow-x-auto gap-2 sm:gap-4 pb-2 sm:pb-0 scrollbar-none">
            {STEPS.map((step, idx) => {
              const isActive = currentStep === step.key;
              const isPast = STEPS.findIndex(s => s.key === currentStep) > idx;

              return (
                <button
                  key={step.key}
                  id={`step-nav-${step.key}`}
                  type="button"
                  onClick={() => setCurrentStep(step.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#0066FF] text-white shadow-md'
                      : isPast
                      ? 'bg-[#ECFDF5] text-emerald-700 hover:bg-emerald-100'
                      : 'bg-[#F4F6F8] text-[#8892B0] hover:text-[#0A192F]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : isPast ? 'text-emerald-600' : 'text-[#8892B0]'}>
                    {isPast ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : step.icon}
                  </span>
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Step Body Render */}
      <div>
        {currentStep === 'appointment' && (
          <AppointmentBooking
            appointment={appointment}
            onUpdate={handleUpdateAppointment}
            onNext={() => setCurrentStep('passport')}
            onThreatDetected={onThreatDetected}
          />
        )}

        {currentStep === 'passport' && (
          <PassportScanner
            passportData={passport}
            onUpdate={handleUpdatePassport}
            onNext={() => setCurrentStep('biometrics')}
            onPrev={() => setCurrentStep('appointment')}
          />
        )}

        {currentStep === 'biometrics' && (
          <BiometricVerification
            biometrics={biometrics}
            passport={passport}
            onUpdate={handleUpdateBiometrics}
            onNext={() => setCurrentStep('signature')}
            onPrev={() => setCurrentStep('passport')}
          />
        )}

        {currentStep === 'signature' && (
          <DigitalSignature
            signature={signature}
            passport={passport}
            onUpdate={handleUpdateSignature}
            onNext={() => setCurrentStep('documents')}
            onPrev={() => setCurrentStep('biometrics')}
          />
        )}

        {currentStep === 'documents' && (
          <DocumentChecklist
            documents={documents}
            passport={passport}
            onUpdateDocument={handleUpdateDocument}
            onSubmitApplication={handleSubmitApplication}
            onPrev={() => setCurrentStep('signature')}
          />
        )}

        {currentStep === 'confirmation' && (
          <ApplicationConfirmation
            referenceNumber={generatedRef}
            appointment={appointment}
            passport={passport}
            biometrics={biometrics}
            signature={signature}
            onGoToDashboard={onNavigateToDashboard}
            onReset={handleReset}
          />
        )}
      </div>

      {/* RAG-Grounded AI Guidance Chatbot Widget & Proactive IDP Explanations */}
      <ClientChatbotWidget
        destinationCountry={appointment.destinationCountry}
        currentStep={currentStep}
        applicantRef={generatedRef}
        applicantName={`${passport.givenNames} ${passport.surname}`.trim() || 'Elena Rostova'}
        flaggedDocuments={documents.filter(d => d.status === 'error' || d.status === 'flagged')}
        onActionTrigger={(actionType, docId) => {
          if (actionType === 'open_doc_upload') {
            setCurrentStep('documents');
          } else if (actionType === 'recheck_camera') {
            setCurrentStep('biometrics');
          } else if (actionType === 'change_appointment') {
            setCurrentStep('appointment');
          }
        }}
      />
    </div>
  );
};
