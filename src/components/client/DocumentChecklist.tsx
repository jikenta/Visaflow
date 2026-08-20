import React, { useState } from 'react';
import { DocumentChecklistItem, DocumentStatus, PassportOcrData } from '../../types';
import { 
  FileCheck2, Upload, AlertCircle, CheckCircle2, 
  FileText, ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, XCircle, 
  FileWarning, Sparkles, Loader2, Clock, HelpCircle, Layers 
} from 'lucide-react';

interface DocumentChecklistProps {
  documents: DocumentChecklistItem[];
  passport: PassportOcrData;
  onUpdateDocument: (docId: string, updated: Partial<DocumentChecklistItem>) => void;
  onSubmitApplication: () => void;
  onPrev: () => void;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  documents,
  passport,
  onUpdateDocument,
  onSubmitApplication,
  onPrev,
}) => {
  const [activeProcessingId, setActiveProcessingId] = useState<string | null>(null);

  const validatedCount = documents.filter(d => d.status === 'validated' || d.status === 'compliant').length;
  const requiredCount = documents.filter(d => d.isRequired).length;
  const requiredValidatedCount = documents.filter(d => d.isRequired && (d.status === 'validated' || d.status === 'compliant')).length;
  const compliancePercentage = Math.round((validatedCount / documents.length) * 100);

  // Trigger processing state and then transition to validated
  const triggerValidateProcess = (doc: DocumentChecklistItem) => {
    setActiveProcessingId(doc.id);
    onUpdateDocument(doc.id, { status: 'processing' });

    setTimeout(() => {
      onUpdateDocument(doc.id, {
        status: 'validated',
        fileName: `${doc.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_verified.pdf`,
        fileSize: '2.8 MB',
        fileType: 'application/pdf',
        uploadDate: 'Just now',
        ocrConfidence: 99.1,
        flagReason: undefined,
        extractedData: {
          documentId: `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
          entityName: `${passport.givenNames} ${passport.surname}`,
          issueDate: '2025-11-10',
          expiryDate: '2026-11-10',
          resolutionDpi: 300,
        },
        complianceChecks: {
          resolutionCheck: true,
          validityDateCheck: true,
          tamperCheck: true,
          nameMatchCheck: true,
        },
      });
      setActiveProcessingId(null);
    }, 1200);
  };

  // Trigger processing state and then transition to error
  const triggerErrorProcess = (doc: DocumentChecklistItem) => {
    setActiveProcessingId(doc.id);
    onUpdateDocument(doc.id, { status: 'processing' });

    setTimeout(() => {
      onUpdateDocument(doc.id, {
        status: 'error',
        fileName: `${doc.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_mismatch.pdf`,
        fileSize: '1.2 MB',
        fileType: 'application/pdf',
        uploadDate: 'Just now',
        ocrConfidence: 71.4,
        flagReason: `Name mismatch detected: Found 'A. Rostova' instead of '${passport.givenNames} ${passport.surname}'`,
        extractedData: {
          documentId: `DOC-ERR-${Math.floor(1000 + Math.random() * 9000)}`,
          entityName: 'A. Rostova',
          issueDate: '2023-01-15',
          expiryDate: '2023-07-15',
          resolutionDpi: 150,
        },
        complianceChecks: {
          resolutionCheck: false,
          validityDateCheck: false,
          tamperCheck: true,
          nameMatchCheck: false,
        },
      });
      setActiveProcessingId(null);
    }, 1200);
  };

  // Reset to pending
  const resetToPending = (doc: DocumentChecklistItem) => {
    onUpdateDocument(doc.id, {
      status: 'pending',
      fileName: undefined,
      fileSize: undefined,
      flagReason: undefined,
      ocrConfidence: undefined,
      extractedData: undefined,
      complianceChecks: {
        resolutionCheck: false,
        validityDateCheck: false,
        tamperCheck: false,
        nameMatchCheck: false,
      },
    });
  };

  // Render Status Badge based on the 4 canonical states (Pending, Processing, Validated, Error)
  const renderStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'processing':
      case 'scanning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/30">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0066FF]" />
            <span>PROCESSING</span>
          </span>
        );
      case 'validated':
      case 'compliant':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>VALIDATED</span>
          </span>
        );
      case 'error':
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>ERROR</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-[#F4F6F8] text-[#8892B0] border border-[#E2E8F0]">
            <Clock className="w-3.5 h-3.5 text-[#8892B0]" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center text-[#0066FF] shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0A192F]">
              Interactive Document Upload & Validation Checklist
            </h3>
            <p className="text-xs text-[#8892B0]">
              Automated optical triage categorizes documents into Pending, Processing, Validated, and Error states.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-[#8892B0] block">Overall Readiness</span>
            <span className="text-sm font-bold font-mono text-emerald-600">{compliancePercentage}% Compliant</span>
          </div>
          <span className="text-xs font-mono bg-[#0066FF]/10 text-[#0066FF] px-2.5 py-1 rounded-md font-bold shrink-0">
            STEP 5 OF 5
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Document Upload Checklist Cards */}
        <div className="lg:col-span-8 space-y-4">
          {documents.map((doc) => {
            const isProcessing = doc.status === 'processing' || doc.status === 'scanning' || activeProcessingId === doc.id;
            const isValidated = doc.status === 'validated' || doc.status === 'compliant';
            const isError = doc.status === 'error' || doc.status === 'flagged';
            const isPending = doc.status === 'pending' || (!isValidated && !isError && !isProcessing);

            return (
              <div
                key={doc.id}
                id={`doc-card-${doc.id}`}
                className={`bg-white rounded-xl p-5 border transition-all shadow-sm ${
                  isValidated
                    ? 'border-emerald-200 bg-emerald-50/15'
                    : isError
                    ? 'border-rose-200 bg-rose-50/20'
                    : isProcessing
                    ? 'border-[#0066FF]/40 bg-[#0066FF]/5'
                    : 'border-[#E2E8F0] hover:border-[#8892B0]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isValidated
                        ? 'bg-emerald-100 text-emerald-700'
                        : isError
                        ? 'bg-rose-100 text-rose-700'
                        : isProcessing
                        ? 'bg-[#0066FF]/10 text-[#0066FF]'
                        : 'bg-[#F4F6F8] text-[#8892B0]'
                    }`}>
                      {isValidated ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isError ? (
                        <FileWarning className="w-5 h-5" />
                      ) : isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#0A192F]">{doc.title}</h4>
                        {doc.isRequired ? (
                          <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                            REQUIRED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#8892B0] bg-[#F4F6F8] px-1.5 py-0.2 rounded">
                            OPTIONAL
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#0066FF] bg-[#0066FF]/10 px-1.5 py-0.2 rounded uppercase">
                          {doc.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#8892B0] mt-1 leading-relaxed">{doc.description}</p>

                      {/* File metadata & OCR summary */}
                      {doc.fileName && (
                        <div className="mt-2.5 flex items-center gap-3 text-[11px] font-mono text-[#0A192F] bg-white p-2.5 rounded-lg border border-[#E2E8F0] flex-wrap">
                          <span>📎 {doc.fileName}</span>
                          <span className="text-[#8892B0]">({doc.fileSize})</span>
                          {doc.ocrConfidence && (
                            <span className={isValidated ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                              OCR Confidence: {doc.ocrConfidence}%
                            </span>
                          )}
                          {doc.extractedData?.documentId && (
                            <span className="text-[#0066FF] bg-[#0066FF]/10 px-1.5 py-0.5 rounded">
                              ID: {doc.extractedData.documentId}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Explicit Error Notice */}
                      {isError && doc.flagReason && (
                        <div className="mt-2.5 text-xs text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold">Validation Error:</span>
                            <p className="text-[11px] text-rose-700">{doc.flagReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Badge Section */}
                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-3">
                    {renderStatusBadge(doc.status)}

                    {/* Primary & Demo Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        type="button"
                        id={`btn-upload-${doc.id}`}
                        onClick={() => triggerValidateProcess(doc)}
                        disabled={isProcessing}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{doc.fileName ? 'Re-upload' : 'Upload & Validate'}</span>
                      </button>

                      {/* State simulation test triggers */}
                      <div className="flex items-center gap-1">
                        {!isError && (
                          <button
                            type="button"
                            onClick={() => triggerErrorProcess(doc)}
                            className="text-[10px] text-[#8892B0] hover:text-rose-600 px-1.5 py-1 rounded bg-[#F4F6F8] hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
                            title="Simulate validation error state"
                          >
                            Sim Error
                          </button>
                        )}

                        {!isPending && (
                          <button
                            type="button"
                            onClick={() => resetToPending(doc)}
                            className="text-[10px] text-[#8892B0] hover:text-[#0A192F] px-1.5 py-1 rounded bg-[#F4F6F8] hover:bg-gray-200 transition-all"
                            title="Reset to pending state"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Compliance Forensic Sub-Checks Bar */}
                <div className="mt-4 pt-3 border-t border-[#E2E8F0]/70 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className={doc.complianceChecks.resolutionCheck ? 'text-emerald-600 font-bold' : 'text-[#8892B0]'}>
                      {doc.complianceChecks.resolutionCheck ? '✓' : '○'}
                    </span>
                    <span className="text-[#8892B0]">Resolution 300+ DPI</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={doc.complianceChecks.validityDateCheck ? 'text-emerald-600 font-bold' : 'text-[#8892B0]'}>
                      {doc.complianceChecks.validityDateCheck ? '✓' : '○'}
                    </span>
                    <span className="text-[#8892B0]">Date Validity &lt; 90d</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={doc.complianceChecks.nameMatchCheck ? 'text-emerald-600 font-bold' : 'text-[#8892B0]'}>
                      {doc.complianceChecks.nameMatchCheck ? '✓' : '○'}
                    </span>
                    <span className="text-[#8892B0]">Name Crossmatch</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={doc.complianceChecks.tamperCheck ? 'text-emerald-600 font-bold' : 'text-[#8892B0]'}>
                      {doc.complianceChecks.tamperCheck ? '✓' : '○'}
                    </span>
                    <span className="text-[#8892B0]">Anti-Tamper Clean</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 4 Cols: Compliance Scorecard & Final Submission */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm sticky top-24 space-y-5">
            <h4 className="text-sm font-bold text-[#0A192F] pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <span>Application Dossier Status</span>
              <span className="text-xs font-mono font-bold text-emerald-600">
                {requiredValidatedCount}/{requiredCount} Mandatory
              </span>
            </h4>

            {/* Verification Checklist summary */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#0A192F] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Appointment Slot Reserved
                </span>
                <span className="font-mono text-emerald-600 font-bold">LOCKED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#0A192F] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ICAO Passport Bio-Data
                </span>
                <span className="font-mono text-emerald-600 font-bold">VERIFIED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#0A192F] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Live 3D Biometric Liveness
                </span>
                <span className="font-mono text-emerald-600 font-bold">PASSED (98.7%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#0A192F] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  eIDAS Digital Signature
                </span>
                <span className="font-mono text-emerald-600 font-bold">SIGNED</span>
              </div>
            </div>

            {/* Quick Bulk Action for all docs */}
            <button
              type="button"
              id="btn-validate-all-docs"
              onClick={() => {
                documents.forEach(d => triggerValidateProcess(d));
              }}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#F4F6F8] hover:bg-[#E2E8F0] text-[#0066FF] border border-[#E2E8F0] flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>Validate All Remaining Documents</span>
            </button>

            {/* Final High-Priority Submission CTA (#FF9900) */}
            <div className="pt-3 border-t border-[#E2E8F0]">
              <button
                id="btn-final-submit"
                type="button"
                onClick={onSubmitApplication}
                className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                <span>Submit Dossier to Consular Queue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-[#8892B0] mt-2">
                Generates instant encrypted VFS Application Reference Number & QR pass.
              </p>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={onPrev}
                className="w-full py-2 text-xs font-semibold text-[#8892B0] hover:text-[#0A192F] flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Signature</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
