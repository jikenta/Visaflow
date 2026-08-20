import React, { useState, useEffect } from 'react';
import { VisaApplicationRecord, DocumentStatus, RuleCheckResult, TamperDetectionResult } from '../../types';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  FileText, User, Fingerprint, Lock, Send, Clock, ArrowRight, 
  Eye, ShieldAlert, Scan, FileCheck, Check, X, Sparkles, 
  FileWarning, Layers, Download, ExternalLink, HelpCircle, Loader2,
  Terminal, Code2, Copy, Cpu, Flame, Sliders, RefreshCw, ZoomIn
} from 'lucide-react';
import { 
  runOcrLayoutAnalysis, 
  runGovernmentRulesEngine, 
  runBiometricVerification, 
  runTamperAndElaDetection 
} from '../../services/aiCvMicroservice';

interface ConsularInspectionPaneProps {
  application: VisaApplicationRecord | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestDocs: (id: string) => void;
  onEscalate: (id: string) => void;
}

export const ConsularInspectionPane: React.FC<ConsularInspectionPaneProps> = ({
  application,
  onApprove,
  onReject,
  onRequestDocs,
  onEscalate,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mrz' | 'biometrics' | 'documents' | 'rules' | 'ela' | 'api' | 'audit'>('all');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showElaHeatmap, setShowElaHeatmap] = useState<boolean>(true);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<string | null>(null);
  const [selectedApiEndpoint, setSelectedApiEndpoint] = useState<'ocr' | 'rules' | 'biometric' | 'ela' | 'full'>('full');

  // Interactive microservice simulation state
  const [rulesEngineData, setRulesEngineData] = useState<any>(null);
  const [biometricData, setBiometricData] = useState<any>(null);
  const [tamperData, setTamperData] = useState<any>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  useEffect(() => {
    if (application) {
      evaluateAllMicroservices();
    }
  }, [application?.id]);

  const evaluateAllMicroservices = async () => {
    setIsEvaluating(true);
    const isTamperedDossier = application?.status === 'Flagged';

    // 1. Rules Engine
    const rulesRes = runGovernmentRulesEngine(
      application?.destinationCountry || 'France (Schengen)',
      '2026-09-01',
      '2026-09-15',
      application?.passportData.dateOfExpiry || '2031-10-18',
      application?.passportData.checksumValid ?? false,
      '2026-09-30',
      50000,
      isTamperedDossier ? 102 : 18
    );
    setRulesEngineData(rulesRes);

    // 2. Biometric Verification
    const bioRes = runBiometricVerification(
      1.2, 0.8, -0.4, 98.6, 76.5,
      application?.biometricScore || 98.4,
      99.4
    );
    setBiometricData(bioRes);

    // 3. Forgery & ELA Tamper Detection
    const tamperRes = runTamperAndElaDetection(isTamperedDossier);
    setTamperData(tamperRes);

    // 4. OCR Layout Analysis
    const ocrRes = await runOcrLayoutAnalysis(
      'PASSPORT',
      'passport_scan.jpg'
    );
    setOcrData(ocrRes);

    setIsEvaluating(false);
  };

  const handleCopyPayload = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(label);
    setTimeout(() => setCopiedPayload(null), 2000);
  };

  if (!application) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-12 text-center h-full flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 rounded-2xl bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center mb-4">
          <Scan className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-[#0A192F]">No Applicant Dossier Selected</h3>
        <p className="text-xs text-[#8892B0] max-w-sm mt-1">
          Select an application case from the queue on the left to inspect submitted documents, biometric vector matches, and OCR extraction overlays.
        </p>
      </div>
    );
  }

  const isFlagged = application.status === 'Flagged';
  const isApproved = application.status === 'Approved';
  const isRejected = application.status === 'Rejected';

  const renderDocBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'processing':
      case 'scanning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/30">
            <Loader2 className="w-3 h-3 animate-spin text-[#0066FF]" />
            <span>PROCESSING</span>
          </span>
        );
      case 'validated':
      case 'compliant':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>VALIDATED</span>
          </span>
        );
      case 'error':
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>ERROR</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F4F6F8] text-[#8892B0] border border-[#E2E8F0]">
            <Clock className="w-3 h-3 text-[#8892B0]" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col h-full overflow-hidden">
      {/* Top Header of Right Pane */}
      <div className="p-5 bg-[#0A192F] text-white border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gray-200 border-2 border-white/20 overflow-hidden shrink-0">
            <img
              src={application.biometricImage || application.passportData.imageUri || undefined}
              alt={application.applicantName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold tracking-tight text-white font-sans">
                {application.applicantName}
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isFlagged
                  ? 'bg-[#FF9900] text-[#0A192F]'
                  : isApproved
                  ? 'bg-emerald-500 text-white'
                  : isRejected
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#0066FF] text-white'
              }`}>
                {application.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[#8892B0] font-mono mt-0.5">
              Ref: <strong className="text-white">{application.refNumber}</strong> · Passport: <strong className="text-white">{application.passportNumber}</strong> ({application.nationality})
            </p>
          </div>
        </div>

        {/* Microservice Health & Re-Run Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={evaluateAllMicroservices}
            disabled={isEvaluating}
            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono flex items-center gap-1.5 transition-all border border-white/10"
            title="Re-run all 4 Computer Vision microservices"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin text-[#FF9900]' : 'text-[#0066FF]'}`} />
            <span>{isEvaluating ? 'Executing CV...' : 'Run CV Pipeline'}</span>
          </button>

          {/* Risk Gauge Header Widget */}
          <div className="flex items-center gap-3 bg-[#071324] px-3.5 py-2 rounded-xl border border-white/10 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-[#8892B0] block uppercase font-mono">Consular Risk</span>
              <span className={`text-base font-extrabold font-mono leading-none ${
                application.riskScore > 70 ? 'text-rose-400' : application.riskScore > 30 ? 'text-[#FF9900]' : 'text-emerald-400'
              }`}>
                {application.riskScore}/100
              </span>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              application.riskScore > 70 ? 'bg-rose-500 animate-pulse' : application.riskScore > 30 ? 'bg-[#FF9900]' : 'bg-emerald-400'
            }`} />
          </div>
        </div>
      </div>

      {/* Forensic Tabs Strip */}
      <div className="px-5 py-2 bg-[#F4F6F8] border-b border-[#E2E8F0] flex items-center justify-between gap-2 overflow-x-auto text-xs font-semibold">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Unified Dossier
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mrz')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'mrz'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Passport OCR
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-all relative ${
              activeTab === 'rules'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            <span>Rules Engine</span>
            {rulesEngineData && rulesEngineData.failedCount > 0 && (
              <span className="ml-1.5 bg-rose-500 text-white font-mono text-[9px] px-1 py-0.2 rounded-full">
                {rulesEngineData.failedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('biometrics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'biometrics'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            1:1 Biometrics & ICAO
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ela')}
            className={`px-3 py-1.5 rounded-lg transition-all relative ${
              activeTab === 'ela'
                ? 'bg-[#0A192F] text-[#FF9900] shadow-xs font-bold'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>ELA Tamper Layer</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'documents'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Submitted Docs ({application.documents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'api'
                ? 'bg-[#0066FF] text-white shadow-xs font-bold'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            <span className="flex items-center gap-1 font-mono">
              <Code2 className="w-3.5 h-3.5" />
              <span>FastAPI JSON</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'audit'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Audit Log
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`text-[11px] px-2.5 py-1 rounded-md border transition-all shrink-0 ${
              showBoundingBoxes ? 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/30 font-bold' : 'bg-white text-[#8892B0] border-[#E2E8F0]'
            }`}
          >
            {showBoundingBoxes ? 'Hide Overlays' : 'Show Overlays'}
          </button>
        </div>
      </div>

      {/* Main Inspection Scroll Area */}
      <div className="p-5 overflow-y-auto flex-1 space-y-6">
        {/* Critical Flag Alert Banner */}
        {application.flags.length > 0 && (
          <div className="bg-[#FFF7ED] border border-[#FFD699] p-4 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-[#0A192F] font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-[#FF9900]" />
              <span>Critical Consular Risk Flags Detected ({application.flags.length})</span>
            </div>
            {application.flags.map((flag) => (
              <div key={flag.id} className="bg-white p-3 rounded-lg border border-amber-200 text-xs flex items-start justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0A192F]">{flag.title}</span>
                    <span className="font-mono text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold uppercase">
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-[#8892B0] text-[11px] mt-0.5">{flag.description}</p>
                  <span className="font-mono text-[10px] text-[#0066FF] mt-1 inline-block">Rule: {flag.ruleId}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('rules')}
                  className="px-2.5 py-1 bg-[#F4F6F8] hover:bg-gray-200 text-[#0A192F] text-[10px] font-mono rounded border border-[#E2E8F0] shrink-0"
                >
                  View Rule Rule
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 1: ELA TAMPER & FORENSICS HEATMAP LAYER */}
        {(activeTab === 'all' || activeTab === 'ela') && (
          <div className="space-y-4 bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div>
                <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#FF9900]" />
                  Pixel-Level Error Level Analysis (ELA) & Font Tamper Detection
                </h4>
                <p className="text-[11px] text-[#8892B0]">
                  Evaluates high-frequency JPEG/PNG compression artifacts and font metrics to detect modified financial balances.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowElaHeatmap(!showElaHeatmap)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    showElaHeatmap
                      ? 'bg-[#FF9900] text-[#0A192F] shadow-xs'
                      : 'bg-[#F4F6F8] text-[#8892B0] border border-[#E2E8F0]'
                  }`}
                >
                  {showElaHeatmap ? '🔥 ELA Heatmap: ON' : 'ELA Heatmap: OFF'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Visual Document Canvas with ELA Layer */}
              <div className="md:col-span-7">
                <div className="relative aspect-[1.3/1] bg-[#071324] rounded-xl overflow-hidden border border-[#0A192F]">
                  {/* Base Document Rendering (Bank Statement Sample) */}
                  <div className="w-full h-full bg-[#FFFFFF] p-4 font-sans text-[10px] text-[#0A192F] select-none flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between border-b pb-2 border-gray-200">
                        <div>
                          <div className="font-extrabold text-sm text-[#0A192F]">HSBC UK INTERNATIONAL</div>
                          <div className="text-[#8892B0] text-[9px]">OFFICIAL ACCOUNT STATEMENT · 3-MONTH LEDGER</div>
                        </div>
                        <div className="text-right text-[9px] font-mono">
                          <div>Account Holder: <strong>ELENA ROSTOVA</strong></div>
                          <div>Period: 2026-05-01 to 2026-08-01</div>
                        </div>
                      </div>

                      <table className="w-full mt-3 text-[9px] font-mono border-collapse">
                        <thead>
                          <tr className="border-b border-gray-300 text-gray-500 text-left">
                            <th className="py-1">Date</th>
                            <th>Description</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th className="text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-100">
                            <td className="py-1">01/05/2026</td>
                            <td>Opening Ledger Balance</td>
                            <td>-</td>
                            <td>-</td>
                            <td className="text-right font-bold">€12,400.00</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1">28/05/2026</td>
                            <td>Salary Credit (Global Corp)</td>
                            <td>-</td>
                            <td>€4,250.00</td>
                            <td className="text-right font-bold">€16,650.00</td>
                          </tr>
                          <tr className="border-b border-gray-100">
                            <td className="py-1">15/06/2026</td>
                            <td>Rent & Utilities Transfer</td>
                            <td>€1,800.00</td>
                            <td>-</td>
                            <td className="text-right font-bold">€14,850.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="border-t border-gray-300 pt-2 flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="font-bold text-gray-700">CERTIFIED CLOSING BALANCE:</span>
                      <span className="font-mono font-extrabold text-sm text-[#0A192F]">
                        {isFlagged ? '€94,850.00' : '€14,850.00'}
                      </span>
                    </div>
                  </div>

                  {/* ELA Heatmap Overlay Layer */}
                  {showElaHeatmap && (
                    <div className="absolute inset-0 pointer-events-none mix-blend-screen bg-black/40">
                      {isFlagged ? (
                        <>
                          {/* Ambient background noise */}
                          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0066FF_1px,transparent_1px)] [background-size:8px_8px]" />
                          
                          {/* Spliced balance artifact glowing hot red/orange */}
                          <div 
                            className="absolute border-2 border-[#EF4444] bg-gradient-to-r from-red-600/60 to-orange-500/60 rounded animate-pulse"
                            style={{ left: '54%', top: '82%', width: '43%', height: '14%' }}
                          >
                            <span className="absolute -top-5 right-0 bg-rose-600 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                              🚨 ELA DELTA SPIKE (0.88)
                            </span>
                          </div>

                          {/* Font kerning anomaly highlight */}
                          <div 
                            className="absolute border border-yellow-400 bg-yellow-400/30 rounded"
                            style={{ left: '72%', top: '83%', width: '12%', height: '12%' }}
                          >
                            <span className="absolute -bottom-4 right-0 bg-yellow-600 text-white font-mono text-[7px] font-bold px-1 py-0.2 rounded">
                              ArialMT Mismatch
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/20">
                          <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full shadow">
                            ✓ ELA FORENSIC INTEGRITY PASSED (NO SPLICING DETECTED)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tamper Bounding Boxes */}
                  {showBoundingBoxes && isFlagged && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div 
                        className="absolute border-2 border-rose-500 bg-rose-500/10 rounded"
                        style={{ left: '50%', top: '5%', width: '48%', height: '18%' }}
                      >
                        <span className="absolute -top-4 right-0 bg-rose-700 text-white font-mono text-[8px] px-1 py-0.2 rounded font-bold">
                          Statement &gt; 90 Days Old
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: ELA Telemetry Metrics */}
              <div className="md:col-span-5 space-y-3">
                <div className="bg-[#071324] text-white p-3.5 rounded-xl font-mono text-xs space-y-2 border border-white/10">
                  <div className="flex justify-between items-center text-[10px] text-[#8892B0]">
                    <span className="font-bold uppercase tracking-wider">Forensic ELA Analysis</span>
                    <span className={isFlagged ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {isFlagged ? '🚨 TAMPER DETECTED' : '✓ INTEGRITY VERIFIED'}
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#8892B0]">Compression Delta Ratio:</span>
                        <span className={isFlagged ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {isFlagged ? '0.88 (Critical Spike)' : '0.08 (Uniform)'}
                        </span>
                      </div>
                      <div className="w-full bg-[#0A192F] h-1.5 rounded-full overflow-hidden border border-white/10">
                        <div 
                          className={`h-full rounded-full ${isFlagged ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: isFlagged ? '88%' : '8%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#8892B0]">Font Metric Inconsistency:</span>
                        <span className={isFlagged ? 'text-[#FF9900] font-bold' : 'text-emerald-400'}>
                          {isFlagged ? '0.92 (Font Spliced)' : '0.04 (Consistent)'}
                        </span>
                      </div>
                      <div className="w-full bg-[#0A192F] h-1.5 rounded-full overflow-hidden border border-white/10">
                        <div 
                          className={`h-full rounded-full ${isFlagged ? 'bg-[#FF9900]' : 'bg-emerald-500'}`}
                          style={{ width: isFlagged ? '92%' : '4%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {isFlagged && (
                    <div className="mt-2 bg-rose-500/20 border border-rose-500/40 p-2 rounded text-[10px] text-rose-200 leading-snug">
                      <strong>Forensic Flag:</strong> Digit '9' in closing balance was rendered with ArialMT font kerning, contrasting with the source document's Helvetica-Bold font stream.
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0] space-y-1.5 text-xs">
                  <div className="font-bold text-[#0A192F] flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span>Microservice Mapping:</span>
                  </div>
                  <p className="text-[11px] text-[#8892B0]">
                    FastAPI endpoint <code className="text-[#0066FF] font-mono">/api/v1/cv/forgery-ela-check</code> outputs normalized bounding box <code className="font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-[#E2E8F0]">[x:54, y:84, w:42, h:12]</code> which directly generates the red highlight box above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOVERNMENT RULES ENGINE REPORT */}
        {(activeTab === 'all' || activeTab === 'rules') && (
          <div className="space-y-4 bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div>
                <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0066FF]" />
                  Government Immigration Rules Engine Evaluation
                </h4>
                <p className="text-[11px] text-[#8892B0]">
                  Automated cross-check of passport validity, travel insurance periods, 3-month continuous bank records, and name entity alignment.
                </p>
              </div>

              {rulesEngineData && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-bold">
                    ✓ {rulesEngineData.passedCount} Passed
                  </span>
                  {rulesEngineData.failedCount > 0 && (
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200 font-bold">
                      ✗ {rulesEngineData.failedCount} Failed
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {rulesEngineData?.ruleResults.map((rule: RuleCheckResult) => (
                <div 
                  key={rule.ruleId}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    rule.passed 
                      ? 'border-emerald-200 bg-emerald-50/15' 
                      : 'border-rose-200 bg-rose-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`w-2 h-2 rounded-full ${rule.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <h5 className="font-bold text-[#0A192F]">{rule.title}</h5>
                        <span className="font-mono text-[9px] bg-[#0066FF]/10 text-[#0066FF] px-1.5 py-0.2 rounded font-medium">
                          {rule.statutoryCode}
                        </span>
                      </div>

                      <p className="text-[#8892B0] text-[11px]">{rule.description}</p>

                      <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-[#8892B0]">Observed: </span>
                          <span className={rule.passed ? 'text-[#0A192F] font-semibold' : 'text-rose-700 font-bold'}>
                            {rule.observedValue}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#8892B0]">Threshold: </span>
                          <span className="text-[#0A192F] font-medium">{rule.expectedThreshold}</span>
                        </div>
                      </div>

                      {!rule.passed && rule.remediationAction && (
                        <div className="mt-2 text-rose-800 bg-rose-100/80 p-2 rounded text-[11px] flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span><strong>Required Remediation:</strong> {rule.remediationAction}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right font-mono">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rule.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rule.passed ? 'PASSED' : 'VIOLATION'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PASSPORT OCR & MRZ */}
        {(activeTab === 'all' || activeTab === 'mrz') && (
          <div className="space-y-4 bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0066FF]" />
                Passport Document & System Extraction Overlay
              </h4>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                Confidence: {application.passportData.confidenceScore}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Image with Bounding Box Overlays */}
              <div className="md:col-span-6">
                <div className="relative aspect-[1.42/1] bg-[#071324] rounded-xl overflow-hidden border border-[#0A192F] group">
                  <img
                    src={application.passportData.imageUri || application.biometricImage || undefined}
                    alt="Scanned Passport"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Visual Bounding Box System Extraction Overlays */}
                  {showBoundingBoxes && application.passportData.boundingBoxes && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Photo Box */}
                      <div
                        className="absolute border-2 border-emerald-400 bg-emerald-400/10 rounded"
                        style={{
                          left: `${application.passportData.boundingBoxes.photo.x}%`,
                          top: `${application.passportData.boundingBoxes.photo.y}%`,
                          width: `${application.passportData.boundingBoxes.photo.w}%`,
                          height: `${application.passportData.boundingBoxes.photo.h}%`,
                        }}
                      >
                        <span className="absolute -top-4 left-0 bg-emerald-600 text-white font-mono text-[8px] px-1 py-0.2 rounded font-bold">
                          {application.passportData.boundingBoxes.photo.label}
                        </span>
                      </div>

                      {/* MRZ Box */}
                      <div
                        className={`absolute border-2 rounded ${
                          application.passportData.checksumValid 
                            ? 'border-[#0066FF] bg-[#0066FF]/20' 
                            : 'border-rose-500 bg-rose-500/20'
                        }`}
                        style={{
                          left: `${application.passportData.boundingBoxes.mrz.x}%`,
                          top: `${application.passportData.boundingBoxes.mrz.y}%`,
                          width: `${application.passportData.boundingBoxes.mrz.w}%`,
                          height: `${application.passportData.boundingBoxes.mrz.h}%`,
                        }}
                      >
                        <span className={`absolute -top-4 left-0 text-white font-mono text-[8px] px-1 py-0.2 rounded font-bold ${
                          application.passportData.checksumValid ? 'bg-[#0066FF]' : 'bg-rose-600'
                        }`}>
                          {application.passportData.boundingBoxes.mrz.label}
                        </span>
                      </div>

                      {/* Personal Info Box */}
                      <div
                        className="absolute border border-amber-400/80 bg-amber-400/10 rounded"
                        style={{
                          left: `${application.passportData.boundingBoxes.personalData.x}%`,
                          top: `${application.passportData.boundingBoxes.personalData.y}%`,
                          width: `${application.passportData.boundingBoxes.personalData.w}%`,
                          height: `${application.passportData.boundingBoxes.personalData.h}%`,
                        }}
                      />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 bg-[#0A192F]/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
                    ICAO Doc 9303 Compliant
                  </div>
                </div>
              </div>

              {/* Right Column: Decoded OCR Fields */}
              <div className="md:col-span-6 space-y-3">
                <div className="bg-[#0A192F] text-white p-3.5 rounded-xl font-mono text-xs space-y-1.5">
                  <div className="flex justify-between text-[#8892B0] text-[10px]">
                    <span className="font-bold tracking-wider">ICAO MRZ 2-LINE STRIP</span>
                    <span className={application.passportData.checksumValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {application.passportData.checksumValid ? '✓ MOD-7 PASS' : '✗ CHECKSUM FAIL'}
                    </span>
                  </div>
                  <div className="bg-[#071324] p-2 rounded text-emerald-400 select-all whitespace-pre overflow-x-auto text-[11px]">
                    <div>{application.passportData.mrzLine1}</div>
                    <div>{application.passportData.mrzLine2}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#F4F6F8] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[#8892B0] text-[10px] block">Full Legal Name:</span>
                    <span className="font-bold text-[#0A192F] block truncate">
                      {application.passportData.surname}, {application.passportData.givenNames}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#F4F6F8] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[#8892B0] text-[10px] block">Document ID:</span>
                    <span className="font-bold font-mono text-[#0A192F] block">
                      {application.passportData.passportNumber}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#F4F6F8] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[#8892B0] text-[10px] block">Nationality:</span>
                    <span className="font-bold text-[#0A192F] block">
                      {application.passportData.nationality} ({application.passportData.issuingCountry})
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#F4F6F8] rounded-lg border border-[#E2E8F0]">
                    <span className="text-[#8892B0] text-[10px] block">Expiry Date:</span>
                    <span className="font-bold font-mono text-[#0A192F] block">
                      {application.passportData.dateOfExpiry}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 1:1 BIOMETRIC COMPARISON & ICAO CONSTRAINTS */}
        {(activeTab === 'all' || activeTab === 'biometrics') && (
          <div className="space-y-4 bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#0066FF]" />
                1:1 Facial Topography, ICAO Head Pose & Purity
              </h4>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                Match: {application.biometricScore}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Side-by-side photo comparison */}
              <div className="md:col-span-5 grid grid-cols-2 gap-2.5 text-center">
                <div className="bg-[#F4F6F8] p-2.5 rounded-xl border border-[#E2E8F0]">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 mb-1.5 border border-gray-300 relative">
                    <img
                      src={application.passportData.imageUri || application.biometricImage || undefined}
                      alt="Passport Bio"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-2 bottom-2 bg-black/60 backdrop-blur-xs text-white text-[8px] font-mono py-0.5 rounded">
                      35x45mm Frame
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#0A192F] block">PASSPORT PHOTO</span>
                  <span className="text-[9px] text-[#8892B0] font-mono">ICAO Chip Extract</span>
                </div>

                <div className="bg-[#F4F6F8] p-2.5 rounded-xl border border-emerald-200 relative">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 mb-1.5 border border-emerald-400 relative">
                    <img
                      src={application.biometricImage}
                      alt="Live Capture"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 border border-dashed border-emerald-400 rounded-lg pointer-events-none" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 block">LIVE 3D CAPTURE</span>
                  <span className="text-[9px] text-emerald-600 font-mono">PAD Liveness: 99.4%</span>
                </div>
              </div>

              {/* Vector Meters, 3D Pose Angles & NIST Scores */}
              <div className="md:col-span-7 space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-[#8892B0]">NIST FRVT Facial Vector Similarity</span>
                      <span className="font-mono font-bold text-emerald-600">{application.biometricScore}%</span>
                    </div>
                    <div className="w-full bg-[#F4F6F8] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${application.biometricScore}%` }} />
                    </div>
                  </div>

                  {/* 3D Head Pose Angle Indicators */}
                  <div className="pt-2 border-t border-[#E2E8F0]">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-[#0A192F]">3D Head Pose Angles (Max ±5.0°):</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">✓ Frontal Compliant</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
                      <div className="p-1.5 bg-[#F4F6F8] rounded border border-[#E2E8F0]">
                        <span className="text-[#8892B0] block text-[9px]">Yaw</span>
                        <strong className="text-[#0A192F]">1.2°</strong>
                      </div>
                      <div className="p-1.5 bg-[#F4F6F8] rounded border border-[#E2E8F0]">
                        <span className="text-[#8892B0] block text-[9px]">Pitch</span>
                        <strong className="text-[#0A192F]">0.8°</strong>
                      </div>
                      <div className="p-1.5 bg-[#F4F6F8] rounded border border-[#E2E8F0]">
                        <span className="text-[#8892B0] block text-[9px]">Roll</span>
                        <strong className="text-[#0A192F]">-0.4°</strong>
                      </div>
                    </div>
                  </div>

                  {/* Background Purity & Dimension Metrics */}
                  <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Background Purity: 98.6%</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Face Proportion: 76.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE FASTAPI MICROSERVICE PAYLOAD INSPECTOR */}
        {(activeTab === 'all' || activeTab === 'api') && (
          <div className="space-y-4 bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div>
                <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#0066FF]" />
                  Python (FastAPI) Microservice Contracts & Payload Inspector
                </h4>
                <p className="text-[11px] text-[#8892B0]">
                  Inspect live JSON payloads transmitted across the four AI/CV microservices and observe how flags map to UI highlight boxes.
                </p>
              </div>

              {/* Endpoint Selector Tabs */}
              <div className="flex items-center gap-1 bg-[#F4F6F8] p-1 rounded-lg border border-[#E2E8F0] overflow-x-auto text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedApiEndpoint('full')}
                  className={`px-2 py-1 rounded ${selectedApiEndpoint === 'full' ? 'bg-[#0066FF] text-white font-bold' : 'text-[#8892B0]'}`}
                >
                  /process-full-dossier
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApiEndpoint('rules')}
                  className={`px-2 py-1 rounded ${selectedApiEndpoint === 'rules' ? 'bg-[#0066FF] text-white font-bold' : 'text-[#8892B0]'}`}
                >
                  /rules-engine
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApiEndpoint('ela')}
                  className={`px-2 py-1 rounded ${selectedApiEndpoint === 'ela' ? 'bg-[#0066FF] text-white font-bold' : 'text-[#8892B0]'}`}
                >
                  /forgery-ela-check
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedApiEndpoint('biometric')}
                  className={`px-2 py-1 rounded ${selectedApiEndpoint === 'biometric' ? 'bg-[#0066FF] text-white font-bold' : 'text-[#8892B0]'}`}
                >
                  /biometric-verify
                </button>
              </div>
            </div>

            {/* JSON Payload Display */}
            <div className="space-y-3">
              <div className="bg-[#071324] rounded-xl p-4 border border-white/10 font-mono text-xs text-white">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#0066FF] text-white font-bold text-[10px] rounded">POST</span>
                    <span className="text-emerald-400">
                      {selectedApiEndpoint === 'full' ? '/api/v1/cv/process-full-dossier' :
                       selectedApiEndpoint === 'rules' ? '/api/v1/cv/rules-engine' :
                       selectedApiEndpoint === 'ela' ? '/api/v1/cv/forgery-ela-check' :
                       '/api/v1/cv/biometric-verify'}
                    </span>
                    <span className="text-[#8892B0] text-[10px]">· HTTP 200 OK · 48ms</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const payloadStr = JSON.stringify(
                        selectedApiEndpoint === 'rules' ? rulesEngineData?.apiPayload?.responsePayload :
                        selectedApiEndpoint === 'ela' ? tamperData?.apiPayload?.responsePayload :
                        selectedApiEndpoint === 'biometric' ? biometricData?.apiPayload?.responsePayload :
                        {
                          dossier_reference: application.refNumber,
                          overall_risk_score: application.riskScore,
                          status: application.status,
                          rules_engine: rulesEngineData?.apiPayload?.responsePayload,
                          tamper_detection: tamperData?.apiPayload?.responsePayload,
                          biometrics: biometricData?.apiPayload?.responsePayload
                        },
                        null,
                        2
                      );
                      handleCopyPayload(payloadStr, 'json');
                    }}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] flex items-center gap-1 transition-all"
                  >
                    {copiedPayload === 'json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPayload === 'json' ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>

                <pre className="max-h-64 overflow-y-auto text-[11px] text-[#A6ACCD] leading-relaxed p-2 bg-[#0A192F]/60 rounded-lg">
                  {JSON.stringify(
                    selectedApiEndpoint === 'rules' ? rulesEngineData?.apiPayload?.responsePayload :
                    selectedApiEndpoint === 'ela' ? tamperData?.apiPayload?.responsePayload :
                    selectedApiEndpoint === 'biometric' ? biometricData?.apiPayload?.responsePayload :
                    {
                      dossier_reference: application.refNumber,
                      overall_risk_score: application.riskScore,
                      recommendation: isFlagged ? 'REFUSE_STATUTORY' : 'APPROVE_FAST_TRACK',
                      ui_error_banners: application.flags.map(f => ({
                        banner_id: `BANNER-${f.ruleId}`,
                        severity: f.severity,
                        title: f.title,
                        message: f.description
                      })),
                      ui_highlight_boxes: isFlagged ? [
                        {
                          id: "BOX-TAMPER-01",
                          document: "BANK_STATEMENT",
                          coordinates: { x: 54, y: 84, w: 42, h: 12 },
                          border_color: "#EF4444",
                          highlight_label: "🚨 Altered Numeric Balance Region (€94,850.00)"
                        },
                        {
                          id: "BOX-MRZ-CHK",
                          document: "PASSPORT",
                          coordinates: { x: 5, y: 78, w: 90, h: 18 },
                          border_color: "#EF4444",
                          highlight_label: "⚠ Modulo-7 Check Digit Mismatch"
                        }
                      ] : []
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SUBMITTED DOCUMENTS */}
        {(activeTab === 'all' || activeTab === 'documents') && (
          <div className="space-y-4 bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#0066FF]" />
                Submitted Documents & Extraction Analysis
              </h4>
              <span className="text-[11px] font-mono text-[#0066FF] bg-[#0066FF]/10 px-2 py-0.5 rounded font-bold">
                Compliance: {application.documentComplianceScore}%
              </span>
            </div>

            <div className="space-y-3">
              {application.documents.map((doc) => {
                const isValidated = doc.status === 'validated' || doc.status === 'compliant';
                const isError = doc.status === 'error' || doc.status === 'flagged';
                const isProcessing = doc.status === 'processing' || doc.status === 'scanning';

                return (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      isValidated
                        ? 'border-emerald-200 bg-emerald-50/15'
                        : isError
                        ? 'border-rose-200 bg-rose-50/20'
                        : isProcessing
                        ? 'border-[#0066FF]/30 bg-[#0066FF]/5'
                        : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-bold text-[#0A192F]">{doc.title}</h5>
                          {doc.isRequired && (
                            <span className="text-[9px] font-mono font-bold bg-rose-100 text-rose-700 px-1 py-0.2 rounded">
                              REQ
                            </span>
                          )}
                          <span className="text-[9px] font-mono text-[#0066FF] bg-[#0066FF]/10 px-1.5 py-0.2 rounded uppercase">
                            {doc.category}
                          </span>
                        </div>

                        {doc.fileName ? (
                          <div className="mt-1.5 flex items-center gap-3 font-mono text-[11px] text-[#0A192F] flex-wrap">
                            <span>📎 {doc.fileName}</span>
                            <span className="text-[#8892B0]">({doc.fileSize || '2.4 MB'})</span>
                            {doc.ocrConfidence && (
                              <span className={isValidated ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                OCR Confidence: {doc.ocrConfidence}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-[#8892B0] mt-0.5">No file document received yet.</p>
                        )}

                        {isError && doc.flagReason && (
                          <div className="mt-2 text-rose-700 bg-rose-100 p-2 rounded text-[11px] flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{doc.flagReason}</span>
                          </div>
                        )}
                      </div>

                      {renderDocBadge(doc.status)}
                    </div>

                    {/* Forensic Verification Sub-checks */}
                    <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                      <div className="flex items-center gap-1">
                        <span className={doc.complianceChecks?.resolutionCheck ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                          {doc.complianceChecks?.resolutionCheck ? '✓' : '○'}
                        </span>
                        <span className="text-[#8892B0]">300+ DPI</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={doc.complianceChecks?.validityDateCheck ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                          {doc.complianceChecks?.validityDateCheck ? '✓' : '○'}
                        </span>
                        <span className="text-[#8892B0]">Date &lt; 90d</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={doc.complianceChecks?.nameMatchCheck ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                          {doc.complianceChecks?.nameMatchCheck ? '✓' : '○'}
                        </span>
                        <span className="text-[#8892B0]">Name Match</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={doc.complianceChecks?.tamperCheck ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                          {doc.complianceChecks?.tamperCheck ? '✓' : '○'}
                        </span>
                        <span className="text-[#8892B0]">Tamper Clean</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 7: AUDIT LOG */}
        {(activeTab === 'all' || activeTab === 'audit') && (
          <div className="space-y-3 bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0066FF]" />
                Cryptographic Audit Log & SHA-256 Signature
              </h4>
              <span className="text-[10px] font-mono text-[#8892B0] truncate max-w-[200px]">
                Hash: {application.signatureHash.substring(0, 16)}...
              </span>
            </div>

            <div className="space-y-2">
              {application.auditTrail.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0] text-xs flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#0A192F]">{item.action}</span>
                    <span className="text-[#8892B0] text-[11px] block">{item.actor}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#0066FF] shrink-0">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Consular Decision Action Bar with High-Priority Orange/Gold CTA */}
      <div className="p-4 bg-[#F4F6F8] border-t border-[#E2E8F0] space-y-3">
        {showRejectForm ? (
          <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-rose-200">
            <label className="block text-xs font-bold text-[#0A192F]">
              Specify Consular Refusal Criteria / Statutory Code:
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Failure to submit required proof of funds, ICAO checksum violation..."
              className="w-full p-2 text-xs border border-[#E2E8F0] rounded-lg bg-[#F4F6F8] text-[#0A192F] outline-none focus:ring-2 focus:ring-rose-500"
              rows={2}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#8892B0] hover:text-[#0A192F]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onReject(application.id, rejectReason || 'Consular Criteria Not Met');
                  setShowRejectForm(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Statutory Refusal
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-inspector-reject"
                onClick={() => setShowRejectForm(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all"
              >
                Refuse Application
              </button>
              <button
                type="button"
                id="btn-inspector-req-docs"
                onClick={() => onRequestDocs(application.id)}
                className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-all"
              >
                Request Additional Docs
              </button>
              <button
                type="button"
                id="btn-inspector-escalate"
                onClick={() => onEscalate(application.id)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#0A192F] text-xs font-bold border border-[#E2E8F0] transition-all"
              >
                Escalate to MFA
              </button>
            </div>

            {/* High-priority Orange/Gold Call-to-Action CTA (#FF9900) */}
            <button
              id="btn-inspector-approve"
              type="button"
              onClick={() => onApprove(application.id)}
              className="bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold px-6 py-2.5 rounded-xl shadow-md text-xs tracking-wide flex items-center gap-2 transition-all active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Grant Consular Clearance</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
