import React, { useState } from 'react';
import { VisaApplicationRecord } from '../../types';
import { ProcessingQueue } from './ProcessingQueue';
import { ConsularInspectionPane } from './ConsularInspectionPane';
import { BotThreatMonitor } from './BotThreatMonitor';
import { StaffCopilotDrawer } from './StaffCopilotDrawer';
import { LiveAiChatbotTelemetryFeed } from './LiveAiChatbotTelemetryFeed';
import { 
  Users, CheckCircle2, ShieldAlert, Cpu, Activity, 
  TrendingUp, Clock, AlertTriangle, Layers, Lock, ShieldCheck, 
  Sparkles, Filter, RefreshCw, Bot, MessageSquare, Radio
} from 'lucide-react';

interface AdminDashboardProps {
  applications: VisaApplicationRecord[];
  onUpdateApplications: (apps: VisaApplicationRecord[]) => void;
  liveTelemetryFeed?: any[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  applications,
  onUpdateApplications,
  liveTelemetryFeed = [],
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  const selectedApp = applications.find(a => a.id === selectedAppId) || applications[0] || null;

  const totalCount = applications.length;
  const flaggedCount = applications.filter(a => a.status === 'Flagged').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;
  const readyCount = applications.filter(a => a.status === 'Ready for Review' || a.status === 'Submitted').length;
  const lowRiskCount = applications.filter(a => (a.status === 'Ready for Review' || a.status === 'Submitted') && a.riskScore <= 30).length;
  const clearanceRate = Math.round((approvedCount / (totalCount || 1)) * 100);

  const handleQuickApprove = (id: string) => {
    const updated = applications.map(a => a.id === id ? {
      ...a,
      status: 'Approved' as const,
      riskScore: Math.min(a.riskScore, 10),
      auditTrail: [
        ...a.auditTrail,
        { timestamp: new Date().toLocaleTimeString() + ' UTC', actor: 'VFS Operations Staff', action: 'Approved: Consular Seal & QR Pass Issued' }
      ]
    } : a);
    onUpdateApplications(updated);
  };

  const handleQuickReject = (id: string, reason: string = 'Regulatory Non-Compliance') => {
    const updated = applications.map(a => a.id === id ? {
      ...a,
      status: 'Rejected' as const,
      auditTrail: [
        ...a.auditTrail,
        { timestamp: new Date().toLocaleTimeString() + ' UTC', actor: 'VFS Operations Staff', action: `Refused: ${reason}` }
      ]
    } : a);
    onUpdateApplications(updated);
  };

  const handleRequestDocs = (id: string) => {
    const updated = applications.map(a => a.id === id ? {
      ...a,
      status: 'Docs Required' as const,
      auditTrail: [
        ...a.auditTrail,
        { timestamp: new Date().toLocaleTimeString() + ' UTC', actor: 'VFS Operations Staff', action: 'Dispatched automated notice for applicant document re-upload' }
      ]
    } : a);
    onUpdateApplications(updated);
  };

  const handleEscalate = (id: string) => {
    const updated = applications.map(a => a.id === id ? {
      ...a,
      status: 'Consular Escalated' as const,
      auditTrail: [
        ...a.auditTrail,
        { timestamp: new Date().toLocaleTimeString() + ' UTC', actor: 'VFS Operations Staff', action: 'Escalated to Ministry of Foreign Affairs (MFA) Consular Supervisor' }
      ]
    } : a);
    onUpdateApplications(updated);
  };

  const handleBatchApproveLowRisk = () => {
    const updated = applications.map(a => {
      if ((a.status === 'Ready for Review' || a.status === 'Submitted') && a.riskScore <= 30) {
        return {
          ...a,
          status: 'Approved' as const,
          auditTrail: [
            ...a.auditTrail,
            { timestamp: new Date().toLocaleTimeString() + ' UTC', actor: 'VFS Fast-Track Engine', action: 'Batch Fast-Clear Clearance Granted' }
          ]
        };
      }
      return a;
    });
    onUpdateApplications(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner using Dark Blue/Navy (#0A192F) housing Quick-Filter Metrics */}
      <div className="bg-[#0A192F] text-white p-6 rounded-2xl shadow-xl border border-white/10 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center font-bold text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  VFS Consular Operations Command Center
                </h2>
                <span className="bg-[#FF9900] text-[#0A192F] text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs text-[#8892B0] mt-0.5">
                Automated biometric cross-matching, optical forgery triage, and high-throughput consular decision matrix.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCopilotOpen(true)}
              className="bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Staff AI Copilot</span>
            </button>

            <button
              type="button"
              onClick={handleBatchApproveLowRisk}
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fast-Clear Low Risk ({lowRiskCount})</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Quick-Filter Metric Cards in Dark Blue Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Metric 1: Total Processed */}
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white/15 border-[#0066FF] ring-2 ring-[#0066FF]/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8892B0] font-mono uppercase">Total Processed</span>
              <Users className="w-4 h-4 text-[#0066FF]" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">
              {totalCount} <span className="text-xs font-sans font-normal text-[#8892B0]">Dossiers</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
              +18% Today · 100% Ingested
            </span>
          </button>

          {/* Metric 2: Flagged Forgeries / Risk Issues */}
          <button
            type="button"
            onClick={() => setStatusFilter('FLAGGED')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'FLAGGED'
                ? 'bg-[#FF9900]/20 border-[#FF9900] ring-2 ring-[#FF9900]/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#FF9900] font-mono uppercase font-bold">Flagged Forgeries</span>
              <ShieldAlert className="w-4 h-4 text-[#FF9900]" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-[#FF9900] mt-1">
              {flaggedCount} <span className="text-xs font-sans font-normal text-[#FF9900]/80">Cases</span>
            </div>
            <span className="text-[11px] text-amber-300 font-mono mt-1 block">
              Requires Officer Forensic Audit
            </span>
          </button>

          {/* Metric 3: Bot Rejections & WAF Threats */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8892B0] font-mono uppercase">Bot Rejections</span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-white mt-1">
              14,289 <span className="text-xs font-sans font-normal text-[#8892B0]">Blocked</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
              0.01% False Positive Rate
            </span>
          </div>

          {/* Metric 4: Consular Clearance Rate */}
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#8892B0] font-mono uppercase">Consular Clearance</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
              {clearanceRate}% <span className="text-xs font-sans font-normal text-[#8892B0]">Cleared</span>
            </div>
            <span className="text-[11px] text-[#8892B0] font-mono mt-1 block">
              {approvedCount} of {totalCount} Decided
            </span>
          </button>
        </div>
      </div>

      {/* Split-Screen Layout: 
          - Left Pane: Queued applicant cases with risk scores & search 
          - Right Pane: Submitted documents alongside system extraction overlays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane (5 of 12 cols): Queued cases with risk scores & Real-time AI stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time SSE / WebSocket Applicant Assistance Stream */}
          <LiveAiChatbotTelemetryFeed 
            selectedAppRef={selectedApp?.refNumber}
            onSelectApplicant={(ref) => {
              const matched = applications.find(a => a.refNumber === ref);
              if (matched) setSelectedAppId(matched.id);
            }}
          />

          <ProcessingQueue
            applications={applications}
            selectedAppId={selectedApp?.id || null}
            onSelectApplication={(app) => setSelectedAppId(app.id)}
            onQuickApprove={handleQuickApprove}
            onQuickReject={handleQuickReject}
            onBatchApproveLowRisk={handleBatchApproveLowRisk}
          />

          {/* Bot Threat Telemetry Radar Component */}
          <BotThreatMonitor liveTelemetryFeed={liveTelemetryFeed} />
        </div>

        {/* Right Pane (7 of 12 cols): Submitted documents alongside system extraction overlays */}
        <div className="lg:col-span-7 sticky top-24">
          <ConsularInspectionPane
            application={selectedApp}
            onApprove={handleQuickApprove}
            onReject={handleQuickReject}
            onRequestDocs={handleRequestDocs}
            onEscalate={handleEscalate}
          />
        </div>
      </div>

      {/* Staff Copilot Right-Side Collapsible Drawer */}
      <StaffCopilotDrawer
        application={selectedApp}
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onApprove={(id) => {
          handleQuickApprove(id);
          setIsCopilotOpen(false);
        }}
        onReject={(id, reason) => {
          handleQuickReject(id, reason);
          setIsCopilotOpen(false);
        }}
        onRequestDocs={(id) => {
          handleRequestDocs(id);
          setIsCopilotOpen(false);
        }}
      />
    </div>
  );
};
