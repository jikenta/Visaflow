import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, UserCheck, LayoutDashboard, FileCode2, Globe2, Bell, Cpu, Lock } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeCenterName?: string;
  flaggedCount?: number;
  threatLevel?: 'NORMAL' | 'ELEVATED' | 'HIGH';
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeCenterName = 'London Victoria Hub',
  flaggedCount = 2,
  threatLevel = 'ELEVATED'
}) => {
  return (
    <header className="bg-[#0A192F] text-white border-b border-[#0A192F]/40 sticky top-0 z-50 shadow-md">
      {/* Top Security & System Bar */}
      <div className="bg-[#071324] text-xs text-[#8892B0] px-4 py-1.5 border-b border-[#0A192F] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SYSTEM OPERATIONAL
          </span>
          <span className="text-[#8892B0] hidden sm:inline">|</span>
          <span className="flex items-center gap-1 hidden sm:inline-flex text-xs font-mono">
            <Lock className="w-3 h-3 text-[#0066FF]" /> TLS 1.3 · ICAO 9303 · FIPS 140-2
          </span>
          <span className="text-[#8892B0] hidden md:inline">|</span>
          <span className="text-xs text-[#8892B0] hidden md:inline">
            Active Centre: <strong className="text-white font-medium">{activeCenterName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8892B0]">Threat Telemetry:</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              threatLevel === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-300' :
              threatLevel === 'ELEVATED' ? 'bg-[#FF9900]/20 text-[#FF9900]' :
              'bg-rose-500/20 text-rose-300'
            }`}>
              {threatLevel}
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]"></span>
            <span>Latency: 14ms</span>
          </div>
        </div>
      </div>

      {/* Main Navigation & Role Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#0A192F] flex items-center justify-center border border-[#0066FF]/40 shadow-sm">
              <Globe2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  VFS<span className="text-[#0066FF]">.GLOBAL</span>
                </span>
                <span className="bg-[#0066FF]/20 border border-[#0066FF]/40 text-[#0066FF] text-[11px] px-2 py-0.5 rounded-full font-mono font-medium">
                  ENTERPRISE v4.8
                </span>
              </div>
              <p className="text-xs text-[#8892B0] font-sans">
                Global Visa Processing & Biometric Ingestion Gateway
              </p>
            </div>
          </div>
        </div>

        {/* Triple Role / View Switcher */}
        <nav aria-label="Portal Navigation" className="flex items-center bg-[#071324] p-1.5 rounded-xl border border-[#8892B0]/20 shadow-inner w-full md:w-auto justify-center">
          <button
            id="nav-role-client"
            onClick={() => onRoleChange('client')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'client'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'text-[#8892B0] hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Applicant Portal</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              Client
            </span>
          </button>

          <button
            id="nav-role-admin"
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
              currentRole === 'admin'
                ? 'bg-[#0066FF] text-white shadow-md'
                : 'text-[#8892B0] hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Operations Dashboard</span>
            {flaggedCount > 0 && (
              <span className="bg-[#FF9900] text-[#0A192F] text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {flaggedCount}
              </span>
            )}
          </button>

          <button
            id="nav-role-blueprint"
            onClick={() => onRoleChange('blueprint')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'blueprint'
                ? 'bg-[#FF9900] text-[#0A192F] font-bold shadow-md'
                : 'text-[#8892B0] hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>System Blueprint & Architecture</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
