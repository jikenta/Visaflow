import React, { useState } from 'react';
import { VisaApplicationRecord } from '../../types';
import { 
  X, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  FileText, User, Fingerprint, Lock, Send, Clock, ArrowRight, Eye, ShieldAlert 
} from 'lucide-react';

interface ApplicationDetailDrawerProps {
  application: VisaApplicationRecord;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestDocs: (id: string) => void;
  onEscalate: (id: string) => void;
}

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  application,
  onClose,
  onApprove,
  onReject,
  onRequestDocs,
  onEscalate,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'mrz' | 'biometrics' | 'documents' | 'audit'>('overview');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#0A192F]/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E2E8F0] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0066FF] flex items-center justify-center font-bold text-white">
              VFS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  {application.applicantName}
                </h3>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  application.status === 'Flagged'
                    ? 'bg-[#FF9900] text-[#0A192F]'
                    : application.status === 'Approved'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#0066FF] text-white'
                }`}>
                  {application.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#8892B0] font-mono">
                REF: {application.refNumber} · Passport: {application.passportNumber} ({application.nationality})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-[#F4F6F8] border-b border-[#E2E8F0] flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Dossier Overview
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
            ICAO MRZ & OCR
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
            1:1 Biometrics
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
            Compliance Docs ({application.documents.length})
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
            Immutable Audit Trail
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Critical Risk Banner if flagged */}
          {application.flags.length > 0 && (
            <div className="bg-[#FFF7ED] border border-[#FFD699] p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#0A192F] font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-[#FF9900]" />
                <span>Automated Flagged Risk Triggers ({application.flags.length})</span>
              </div>
              {application.flags.map(flag => (
                <div key={flag.id} className="bg-white p-3 rounded-lg border border-amber-200 text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#0A192F]">
                    <span>{flag.title}</span>
                    <span className="font-mono text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded font-bold">
                      {flag.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[#8892B0] mt-1 text-[11px]">{flag.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#8892B0] block text-[10px]">Risk Factor</span>
                  <span className={`text-base font-bold font-mono ${
                    application.riskScore > 70 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {application.riskScore}/100
                  </span>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#8892B0] block text-[10px]">Biometric Match</span>
                  <span className="text-base font-bold font-mono text-emerald-600">
                    {application.biometricScore}%
                  </span>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#8892B0] block text-[10px]">Doc Compliance</span>
                  <span className="text-base font-bold font-mono text-[#0066FF]">
                    {application.documentComplianceScore}%
                  </span>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#8892B0] block text-[10px]">Assigned Officer</span>
                  <span className="text-xs font-bold text-[#0A192F] truncate block">
                    {application.assignedOfficer || 'Auto-Queue'}
                  </span>
                </div>
              </div>

              {/* Side-by-side Mini Inspector */}
              <div className="p-4 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0] space-y-4">
                <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wide">
                  Identity Verification Matrix
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 border border-gray-300 mb-1.5">
                      <img
                        src={application.passportData.imageUri || application.biometricImage}
                        alt="Passport Image"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#0A192F]">Passport Bio Photo</span>
                  </div>
                  <div className="text-center">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-200 border border-emerald-400 mb-1.5">
                      <img
                        src={application.biometricImage}
                        alt="Live Biometric Capture"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700">Live 3D Capture (Passed)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: MRZ & OCR */}
          {activeTab === 'mrz' && (
            <div className="space-y-4">
              <div className="bg-[#0A192F] text-white p-4 rounded-xl font-mono text-xs space-y-2">
                <div className="flex justify-between text-[#8892B0] text-[10px]">
                  <span>ICAO 9303 OCR DECODER</span>
                  <span className={application.passportData.checksumValid ? 'text-emerald-400' : 'text-rose-400'}>
                    {application.passportData.checksumValid ? '✓ CHECKSUM PASS' : '✗ CHECKSUM FAIL'}
                  </span>
                </div>
                <div className="bg-[#071324] p-3 rounded text-emerald-400 select-all whitespace-pre overflow-x-auto">
                  {application.passportData.mrzLine1}
                  {'\n'}
                  {application.passportData.mrzLine2}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F4F6F8] rounded-lg">
                  <span className="text-[#8892B0] block text-[10px]">Extracted Surname:</span>
                  <span className="font-bold font-mono text-[#0A192F]">{application.passportData.surname}</span>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-lg">
                  <span className="text-[#8892B0] block text-[10px]">Given Names:</span>
                  <span className="font-bold font-mono text-[#0A192F]">{application.passportData.givenNames}</span>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-lg">
                  <span className="text-[#8892B0] block text-[10px]">Date of Birth:</span>
                  <span className="font-bold font-mono text-[#0A192F]">{application.passportData.dateOfBirth}</span>
                </div>
                <div className="p-3 bg-[#F4F6F8] rounded-lg">
                  <span className="text-[#8892B0] block text-[10px]">Expiry Date:</span>
                  <span className="font-bold font-mono text-[#0A192F]">{application.passportData.dateOfExpiry}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Biometrics */}
          {activeTab === 'biometrics' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#8892B0]">NIST FRVT Topographic Match</span>
                  <span className="font-mono font-bold text-emerald-600">{application.biometricScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8892B0]">ISO/IEC 30107-3 Liveness Score</span>
                  <span className="font-mono font-bold text-emerald-600">99.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8892B0]">Anti-Spoofing & 3D Mask Rejection</span>
                  <span className="font-mono font-bold text-[#0066FF]">99.8%</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              {application.documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0] text-xs flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#0A192F]">{doc.title}</h5>
                    <p className="text-[11px] text-[#8892B0]">{doc.fileName || 'Pending upload'}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    doc.status === 'compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {doc.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: Audit Trail */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              {application.auditTrail.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0] text-xs space-y-1">
                  <div className="flex justify-between font-mono text-[10px] text-[#0066FF]">
                    <span>{item.actor}</span>
                    <span className="text-[#8892B0]">{item.timestamp}</span>
                  </div>
                  <p className="text-[#0A192F] font-medium">{item.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer Decision Action Bar */}
        <div className="p-5 bg-[#F4F6F8] border-t border-[#E2E8F0] space-y-3">
          {showRejectBox ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0A192F]">
                Consular Refusal / Rejection Reason Code:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Specify regulatory refusal criteria (e.g., ICAO 9303 Checksum Fail, Incomplete Itinerary)..."
                className="w-full p-2 text-xs border border-[#E2E8F0] rounded-lg bg-white text-[#0A192F] outline-none focus:ring-2 focus:ring-rose-500"
                rows={2}
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#8892B0]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onReject(application.id, rejectReason || 'Consular Criteria Not Met')}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Confirm Refusal Code
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectBox(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => onRequestDocs(application.id)}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-all"
                >
                  Request Docs
                </button>
                <button
                  type="button"
                  onClick={() => onEscalate(application.id)}
                  className="px-3.5 py-2 rounded-xl bg-[#F4F6F8] hover:bg-gray-200 text-[#0A192F] text-xs font-bold border border-[#E2E8F0] transition-all"
                >
                  Escalate
                </button>
              </div>

              {/* High-priority Approve CTA (#FF9900) */}
              <button
                id="btn-approve-dossier"
                type="button"
                onClick={() => onApprove(application.id)}
                className="bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold px-6 py-2 rounded-xl shadow-md text-xs tracking-wide flex items-center gap-2 transition-all active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Grant Consular Clearance</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
