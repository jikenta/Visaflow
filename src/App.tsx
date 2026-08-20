import React, { useState } from 'react';
import { UserRole, VisaApplicationRecord } from './types';
import { INITIAL_APPLICATION_QUEUE } from './data/mockData';
import { Header } from './components/Header';
import { ClientPortal } from './components/client/ClientPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SystemBlueprint } from './components/blueprint/SystemBlueprint';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('client');
  const [applications, setApplications] = useState<VisaApplicationRecord[]>(INITIAL_APPLICATION_QUEUE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [threatEventsFeed, setThreatEventsFeed] = useState<any[]>([]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleThreatDetected = (threat: any) => {
    const newThreatEntry = {
      id: `threat-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString() + ' UTC',
      applicantName: 'Anonymous Browser / Bot Candidate',
      passportNumber: 'GB89201476',
      threatResult: threat.mlResult,
      telemetry: threat.telemetry,
      status: 'BLOCKED' as const
    };
    setThreatEventsFeed(prev => [newThreatEntry, ...prev]);
    showToast(`🚨 High Bot Threat Detected (Score: ${threat.mlResult.botThreatScore}/100) — Ingested into SOC Monitor.`);
  };

  const handleApplicationSubmitted = (newApp: VisaApplicationRecord) => {
    setApplications(prev => [newApp, ...prev]);
    showToast(`Dossier ${newApp.refNumber} submitted and routed to VFS Operations Queue.`);
  };

  const flaggedCount = applications.filter(a => a.status === 'Flagged').length;

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#0A192F] flex flex-col font-sans">
      {/* Global Brand Header & Role Switcher */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        activeCenterName="London Victoria Visa Centre"
        flaggedCount={flaggedCount}
        threatLevel={threatEventsFeed.length > 0 ? 'CRITICAL' : 'ELEVATED'}
      />

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-white px-4 py-3 rounded-xl shadow-2xl border border-white/15 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Role Content View */}
      <main className="flex-1">
        {currentRole === 'client' && (
          <ClientPortal
            onApplicationSubmitted={handleApplicationSubmitted}
            onNavigateToDashboard={() => setCurrentRole('admin')}
            onThreatDetected={handleThreatDetected}
          />
        )}

        {currentRole === 'admin' && (
          <AdminDashboard
            applications={applications}
            onUpdateApplications={(updated) => setApplications(updated)}
            liveTelemetryFeed={threatEventsFeed}
          />
        )}

        {currentRole === 'blueprint' && (
          <SystemBlueprint />
        )}
      </main>

      {/* Enterprise Global Footer in Dark Navy (#0A192F) */}
      <footer className="bg-[#0A192F] text-[#8892B0] border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8 mt-auto text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-sans text-sm">
              VFS<span className="text-[#0066FF]">.GLOBAL</span>
            </span>
            <span>· Global Visa Processing Platform & Security Ingestion Gateway</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>ICAO 9303 Compliant</span>
            <span>•</span>
            <span>ISO/IEC 30107-3 Biometrics</span>
            <span>•</span>
            <span>eIDAS Digital Signatures</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
