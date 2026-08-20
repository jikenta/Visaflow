import React, { useState } from 'react';
import { VisaApplicationRecord } from '../../types';
import { 
  Search, Filter, CheckCircle2, AlertTriangle, XCircle, 
  Eye, Check, X, ShieldAlert, ArrowUpDown, ChevronRight, Sparkles 
} from 'lucide-react';

interface ProcessingQueueProps {
  applications: VisaApplicationRecord[];
  selectedAppId: string | null;
  onSelectApplication: (app: VisaApplicationRecord) => void;
  onQuickApprove: (id: string) => void;
  onQuickReject: (id: string) => void;
  onBatchApproveLowRisk: () => void;
}

export const ProcessingQueue: React.FC<ProcessingQueueProps> = ({
  applications,
  selectedAppId,
  onSelectApplication,
  onQuickApprove,
  onQuickReject,
  onBatchApproveLowRisk,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.passportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.nationality.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'FLAGGED' && app.status === 'Flagged') ||
      (statusFilter === 'READY' && app.status === 'Ready for Review') ||
      (statusFilter === 'APPROVED' && app.status === 'Approved') ||
      (statusFilter === 'REJECTED' && app.status === 'Rejected');

    return matchesSearch && matchesStatus;
  });

  const flaggedCount = applications.filter(a => a.status === 'Flagged').length;
  const readyCount = applications.filter(a => a.status === 'Ready for Review').length;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-[#E2E8F0] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#F4F6F8]/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center font-bold text-sm">
            {applications.length}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0A192F]">
              High-Throughput Consular Processing Queue
            </h3>
            <p className="text-xs text-[#8892B0]">
              Triage, biometric cross-reference, and diplomatic dossier clearance.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#8892B0] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Name, Passport, Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-xl text-[#0A192F] focus:ring-2 focus:ring-[#0066FF] outline-none"
            />
          </div>

          {/* Quick Batch Action for Low Risk */}
          <button
            type="button"
            onClick={onBatchApproveLowRisk}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast-Clear Low Risk ({readyCount})</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-2.5 border-b border-[#E2E8F0] flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1 rounded-lg transition-all ${
            statusFilter === 'ALL'
              ? 'bg-[#0A192F] text-white'
              : 'text-[#8892B0] hover:text-[#0A192F] hover:bg-[#F4F6F8]'
          }`}
        >
          All Applications ({applications.length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('FLAGGED')}
          className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
            statusFilter === 'FLAGGED'
              ? 'bg-[#FF9900] text-[#0A192F] font-bold'
              : 'text-[#8892B0] hover:text-[#0A192F] hover:bg-[#F4F6F8]'
          }`}
        >
          <span>Flagged Risk</span>
          <span className="bg-[#0A192F] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
            {flaggedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('READY')}
          className={`px-3 py-1 rounded-lg transition-all ${
            statusFilter === 'READY'
              ? 'bg-[#0066FF] text-white'
              : 'text-[#8892B0] hover:text-[#0A192F] hover:bg-[#F4F6F8]'
          }`}
        >
          Ready for Review ({readyCount})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-3 py-1 rounded-lg transition-all ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-600 text-white'
              : 'text-[#8892B0] hover:text-[#0A192F] hover:bg-[#F4F6F8]'
          }`}
        >
          Approved
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('REJECTED')}
          className={`px-3 py-1 rounded-lg transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-600 text-white'
              : 'text-[#8892B0] hover:text-[#0A192F] hover:bg-[#F4F6F8]'
          }`}
        >
          Rejected
        </button>
      </div>

      {/* High-Throughput Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F4F6F8] text-[#8892B0] font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 font-bold">Ref / Applicant</th>
              <th className="py-3 px-4 font-bold">Passport & Origin</th>
              <th className="py-3 px-4 font-bold">Visa & Destination</th>
              <th className="py-3 px-4 font-bold text-center">Biometrics</th>
              <th className="py-3 px-4 font-bold text-center">Risk Score</th>
              <th className="py-3 px-4 font-bold">Status</th>
              <th className="py-3 px-4 font-bold text-right">Triage Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filteredApps.map((app) => {
              const isSelected = selectedAppId === app.id;
              const isFlagged = app.status === 'Flagged';
              const isApproved = app.status === 'Approved';
              const isRejected = app.status === 'Rejected';

              return (
                <tr
                  key={app.id}
                  id={`queue-row-${app.id}`}
                  onClick={() => onSelectApplication(app)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#0066FF]/10'
                      : isFlagged
                      ? 'bg-amber-50/40 hover:bg-amber-50/80'
                      : 'hover:bg-[#F4F6F8]'
                  }`}
                >
                  {/* Ref & Applicant Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
                        <img
                          src={app.biometricImage}
                          alt={app.applicantName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-[#0A192F] block leading-tight">
                          {app.applicantName}
                        </span>
                        <span className="font-mono text-[10px] text-[#0066FF]">
                          {app.refNumber}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Passport & Origin */}
                  <td className="py-3 px-4 font-mono">
                    <span className="font-semibold text-[#0A192F] block">{app.passportNumber}</span>
                    <span className="text-[#8892B0] text-[10px]">{app.nationality}</span>
                  </td>

                  {/* Visa & Destination */}
                  <td className="py-3 px-4">
                    <span className="text-[#0A192F] font-medium block truncate max-w-[170px]">
                      {app.visaType}
                    </span>
                    <span className="text-[#8892B0] text-[10px]">
                      Slot: {app.appointmentDate} @ {app.appointmentTime}
                    </span>
                  </td>

                  {/* Biometric Score */}
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${
                      app.biometricScore >= 97 ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'
                    }`}>
                      {app.biometricScore}%
                    </span>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3 px-4 text-center font-mono">
                    <div className="inline-flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${
                        app.riskScore > 70 ? 'bg-rose-500' : app.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <span className={`font-bold ${
                        app.riskScore > 70 ? 'text-rose-600' : app.riskScore > 30 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {app.riskScore}/100
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      isFlagged
                        ? 'bg-[#FF9900] text-[#0A192F]'
                        : isApproved
                        ? 'bg-emerald-100 text-emerald-800'
                        : isRejected
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-[#0066FF]/10 text-[#0066FF]'
                    }`}>
                      {isFlagged ? '⚠ FLAGGED' : app.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Quick Triage Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onQuickApprove(app.id)}
                        title="Instant Consular Clearance"
                        className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 flex items-center justify-center transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickReject(app.id)}
                        title="Flag / Reject"
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 flex items-center justify-center transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectApplication(app)}
                        title="Deep Forensic Inspection"
                        className="w-7 h-7 rounded-lg bg-[#F4F6F8] hover:bg-[#0066FF] text-[#8892B0] hover:text-white border border-[#E2E8F0] flex items-center justify-center transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
