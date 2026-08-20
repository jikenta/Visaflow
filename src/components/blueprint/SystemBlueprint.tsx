import React, { useState } from 'react';
import { MICROSERVICE_BLUEPRINT } from '../../data/mockData';
import { MicroserviceBlueprint } from '../../types';
import { 
  FileCode2, Copy, Check, Server, Shield, 
  Layers, Database, Cpu, Network, Lock, Globe, Terminal, ArrowRight, Sparkles, ShieldAlert, Camera 
} from 'lucide-react';
import { EnterpriseDeploymentSpec } from './EnterpriseDeploymentSpec';

export const SystemBlueprint: React.FC = () => {
  const [copiedCss, setCopiedCss] = useState(false);
  const [selectedService, setSelectedService] = useState<MicroserviceBlueprint>(MICROSERVICE_BLUEPRINT[0]);

  const CSS_VARIABLES_BLOCK = `:root {
  /* ==========================================================================
     VFS GLOBAL VISA PROCESSING PLATFORM - DESIGN SYSTEM TOKENS
     ========================================================================== */
  
  /* 1. Brand & Structural Core Palette */
  --vfs-navy-primary: #0A192F;         /* Main headers, primary nav, footers, primary typography */
  --vfs-surface-white: #FFFFFF;        /* Main background cards, high-readability data zones */
  --vfs-neutral-light: #F4F6F8;        /* Subtle section backgrounds, alternating queue rows */
  --vfs-neutral-muted: #8892B0;        /* Card borders, secondary metadata text, placeholders */
  --vfs-neutral-border: #E2E8F0;       /* Fine structural dividers & card boundaries */
  
  /* 2. Interactive & State Accents */
  --vfs-bright-blue: #0066FF;          /* Interactive links, active tab highlights, focus rings */
  --vfs-bright-blue-hover: #0052CC;    /* Interactive hover states */
  --vfs-bright-blue-subtle: #EBF3FF;   /* Active selection backgrounds */
  
  /* 3. High-Priority Triggers & Critical Alerts */
  --vfs-orange-gold: #FF9900;          /* High-priority CTA buttons, booking triggers, critical alert banners */
  --vfs-orange-gold-hover: #E68A00;    /* CTA active press & hover states */
  --vfs-orange-subtle: #FFF7ED;        /* Urgent banner containers & flagged card tints */
  --vfs-orange-border: #FFD699;        /* Flagged item border accents */

  /* 4. Security & Compliance Semantics */
  --vfs-success: #10B981;              /* Verified OCR checksums, 1:1 face match passed */
  --vfs-warning: #F59E0B;              /* Document age review, non-critical variance */
  --vfs-danger: #EF4444;               /* Modulo-7 checksum fail, bot velocity spike */
  
  /* 5. Typography & Grid Rhythms */
  --vfs-font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --vfs-font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace; /* MRZ & Cryptographic hashes */
  
  /* 6. Elevation & Shadows */
  --vfs-shadow-card: 0 4px 6px -1px rgba(10, 25, 47, 0.07), 0 2px 4px -2px rgba(10, 25, 47, 0.05);
  --vfs-shadow-elevated: 0 12px 24px -4px rgba(10, 25, 47, 0.12), 0 4px 6px -2px rgba(10, 25, 47, 0.04);
  --vfs-shadow-glow-blue: 0 0 0 3px rgba(0, 102, 255, 0.25);
  --vfs-shadow-glow-orange: 0 0 0 3px rgba(255, 153, 0, 0.3);
}`;

  const handleCopyCss = () => {
    navigator.clipboard.writeText(CSS_VARIABLES_BLOCK);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Lead Architect Blueprint Header */}
      <div className="bg-[#0A192F] rounded-2xl p-6 sm:p-8 text-white border border-[#0A192F] shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/20 border border-[#0066FF]/40 text-[#0066FF] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            ENTERPRISE SYSTEM BLUEPRINT & ARCHITECTURE SPECIFICATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Global Visa Processing & Biometric Ingestion Architecture
          </h2>
          <p className="text-sm text-[#8892B0] leading-relaxed">
            Lead Systems Architect & Senior UI/UX specification blueprint for high-throughput, mission-critical visa administration. Features distributed microservices, ICAO Doc 9303 OCR pipelines, NIST FRVT 1:1 biometric matching, and automated bot threat mitigation.
          </p>
        </div>

        {/* Background Grid Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#0066FF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Section 1: Exact Color Palette Tokens & CSS Variables Block */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0066FF]" />
              Design System Palette & CSS Variables Block
            </h3>
            <p className="text-xs text-[#8892B0]">
              Strictly matched enterprise color tokens with 100% WCAG AA contrast compliance.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyCss}
            className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold font-mono flex items-center gap-2 shadow-sm transition-all"
          >
            {copiedCss ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCss ? 'Copied to Clipboard!' : 'Copy CSS Variables (:root)'}</span>
          </button>
        </div>

        {/* Color Palette Visual Swatches */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Swatch 1 */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#0A192F] text-white space-y-2">
            <span className="text-[11px] font-mono text-[#8892B0] block">#0A192F</span>
            <p className="text-xs font-bold">Primary Dark Navy</p>
            <p className="text-[10px] text-[#8892B0] leading-tight">Main headers, primary nav, footers, typography</p>
          </div>

          {/* Swatch 2 */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white text-[#0A192F] space-y-2 shadow-xs">
            <span className="text-[11px] font-mono text-[#8892B0] block">#FFFFFF</span>
            <p className="text-xs font-bold">Surface White</p>
            <p className="text-[10px] text-[#8892B0] leading-tight">Main background cards & high-readability zones</p>
          </div>

          {/* Swatch 3 */}
          <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F4F6F8] text-[#0A192F] space-y-2">
            <span className="text-[11px] font-mono text-[#8892B0] block">#F4F6F8 / #8892B0</span>
            <p className="text-xs font-bold">Neutral Grey</p>
            <p className="text-[10px] text-[#8892B0] leading-tight">Card borders, section backgrounds, metadata text</p>
          </div>

          {/* Swatch 4 */}
          <div className="p-4 rounded-xl border border-[#0066FF]/30 bg-[#0066FF] text-white space-y-2">
            <span className="text-[11px] font-mono text-blue-200 block">#0066FF</span>
            <p className="text-xs font-bold">Bright Blue</p>
            <p className="text-[10px] text-blue-100 leading-tight">Interactive links, active tab highlights, focus rings</p>
          </div>

          {/* Swatch 5 */}
          <div className="p-4 rounded-xl border border-[#FF9900]/40 bg-[#FF9900] text-[#0A192F] space-y-2">
            <span className="text-[11px] font-mono text-amber-950 block">#FF9900</span>
            <p className="text-xs font-bold">Orange / Gold</p>
            <p className="text-[10px] text-amber-950/80 leading-tight">High-priority CTA buttons, booking triggers, alert banners</p>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="bg-[#071324] p-4 rounded-xl border border-[#0A192F] font-mono text-xs text-emerald-400 overflow-x-auto select-all max-h-[280px]">
          <pre>{CSS_VARIABLES_BLOCK}</pre>
        </div>
      </div>

      {/* Section 2: Modular Microservices System Architecture */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
            <Server className="w-5 h-5 text-[#0066FF]" />
            Modular Microservices Architecture Topology
          </h3>
          <p className="text-xs text-[#8892B0]">
            Autonomous domain services interconnected via gRPC, mTLS, and Kafka event streaming.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Microservices Selector Column */}
          <div className="lg:col-span-5 space-y-2.5">
            {MICROSERVICE_BLUEPRINT.map((service) => {
              const isSelected = selectedService.id === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-[#0066FF] bg-[#0066FF]/5 ring-2 ring-[#0066FF]/20 shadow-xs'
                      : 'border-[#E2E8F0] hover:bg-[#F4F6F8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] bg-[#0A192F] text-white px-2 py-0.5 rounded font-bold">
                      {service.shortCode}
                    </span>
                    <span className="font-mono text-[11px] text-[#0066FF] font-semibold">
                      {service.protocol}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0A192F] mt-1.5">{service.name}</h4>
                  <p className="text-[11px] text-[#8892B0] truncate mt-0.5">{service.domain}</p>
                </button>
              );
            })}
          </div>

          {/* Microservice Deep Spec Panel */}
          <div className="lg:col-span-7 bg-[#F4F6F8] rounded-xl p-6 border border-[#E2E8F0] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold bg-[#0066FF]/10 text-[#0066FF] px-2 py-0.5 rounded">
                  DOMAIN: {selectedService.domain.toUpperCase()}
                </span>
                <h4 className="text-base font-bold text-[#0A192F] mt-1">
                  {selectedService.name}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-lg text-[#0A192F]">
                {selectedService.throughputSla}
              </span>
            </div>

            <p className="text-xs text-[#0A192F] leading-relaxed">
              {selectedService.description}
            </p>

            {/* Tech Stack Chips */}
            <div>
              <span className="text-[11px] font-bold text-[#8892B0] block mb-1.5 uppercase font-mono">
                Technology Stack:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedService.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0] text-[#0A192F] font-semibold shadow-2xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Service Endpoints */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#8892B0] block uppercase font-mono">
                Core API Contracts & Endpoints:
              </span>
              <div className="space-y-1.5">
                {selectedService.keyEndpoints.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white rounded-lg border border-[#E2E8F0] text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        ep.method === 'POST' ? 'bg-[#0066FF] text-white' :
                        ep.method === 'GET' ? 'bg-emerald-600 text-white' :
                        ep.method === 'STREAM' ? 'bg-[#FF9900] text-[#0A192F]' :
                        'bg-gray-700 text-white'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-bold text-[#0A192F]">{ep.path}</span>
                    </div>
                    <span className="text-[11px] text-[#8892B0] font-sans">{ep.purpose}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Dual-Role UX Flowchart & Component Architecture */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
            <Network className="w-5 h-5 text-[#0066FF]" />
            Dual-Role Component Architecture & UX Hierarchy
          </h3>
          <p className="text-xs text-[#8892B0]">
            Seamless separation of concern between Applicant Self-Service and Consular Operations Staff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Portal Architecture Card */}
          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F4F6F8]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold bg-[#0066FF] text-white px-2 py-0.5 rounded">
                CLIENT PORTAL (APPLICANTS)
              </span>
              <span className="text-xs text-[#8892B0] font-mono">Mobile-First SPA</span>
            </div>
            <ul className="space-y-2 text-xs text-[#0A192F]">
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] font-bold">1.</span>
                <span><strong>Appointment Matrix:</strong> Dynamic VAC center selection with 15-minute distributed hold locks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] font-bold">2.</span>
                <span><strong>Passport OCR Scanner:</strong> Live camera / upload with ICAO 9303 Modulo-7 check digit validator.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] font-bold">3.</span>
                <span><strong>3D Biometric Liveness:</strong> ISO/IEC 30107-3 presentation attack detection (PAD) and 1:1 facial match.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] font-bold">4.</span>
                <span><strong>Digital Signature:</strong> HTML5 canvas with SHA-256 integrity digest binding legal declaration.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] font-bold">5.</span>
                <span><strong>Compliance Checklist:</strong> Real-time automated document validation engine with name cross-matching.</span>
              </li>
            </ul>
          </div>

          {/* Admin Dashboard Architecture Card */}
          <div className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F4F6F8]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold bg-[#0A192F] text-white px-2 py-0.5 rounded">
                OPERATIONS DASHBOARD (VFS STAFF)
              </span>
              <span className="text-xs text-[#8892B0] font-mono">High-Throughput SOC</span>
            </div>
            <ul className="space-y-2 text-xs text-[#0A192F]">
              <li className="flex items-start gap-2">
                <span className="text-[#FF9900] font-bold">1.</span>
                <span><strong>Triage Queue:</strong> High-throughput decision pipeline with risk score gauges and bulk fast-clear actions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF9900] font-bold">2.</span>
                <span><strong>Deep Dossier Inspector:</strong> Side-by-side passport MRZ vs live biometric selfie vector comparison.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF9900] font-bold">3.</span>
                <span><strong>Automated Risk Sidebar:</strong> Real-time rule-engine anomaly flags (MRZ fail, name variance, aged docs).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF9900] font-bold">4.</span>
                <span><strong>Bot Threat Telemetry:</strong> Anomaly detection protecting appointment slots from scraping and hoarding bots.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF9900] font-bold">5.</span>
                <span><strong>Consular Gateway:</strong> Hardware Security Module (HSM) sealed transmission to diplomatic embassies.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 4: Problem 1 Resolution - Senior AI & Computer Vision Microservice Engine Workbench */}
      <div className="bg-[#0A192F] text-white rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/20 border border-[#0066FF]/40 text-[#0066FF] text-xs font-mono font-bold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              PROBLEM 1 RESOLUTION · AI & COMPUTER VISION BACKEND
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2 font-sans">
              Python (FastAPI) Computer Vision Microservice Architecture
            </h3>
            <p className="text-xs text-[#8892B0] max-w-2xl mt-1">
              Eliminating manual document checking bottlenecks and error risks through 4 specialized AI/CV processing pipelines with deterministic government rules evaluation and pixel-level ELA tamper forensics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono border border-emerald-500/40 font-bold">
              FastAPI v0.110 · Python 3.11
            </span>
          </div>
        </div>

        {/* 4 Core AI/CV Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1 */}
          <div className="bg-[#071324] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-[#0066FF] text-white px-2 py-0.5 rounded">
                MODULE 1
              </span>
              <span className="text-[10px] font-mono text-emerald-400">99.2% Acc</span>
            </div>
            <h4 className="text-xs font-bold text-white font-sans">Advanced OCR & Layout</h4>
            <p className="text-[11px] text-[#8892B0] leading-relaxed">
              ICAO Doc 9303 MRZ parsing with modulo-7 checksum calculation and LayoutLMv3 document classification.
            </p>
            <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-[#0066FF]">
              POST /api/v1/cv/ocr-layout
            </div>
          </div>

          {/* Module 2 */}
          <div className="bg-[#071324] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-[#0066FF] text-white px-2 py-0.5 rounded">
                MODULE 2
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Statutory</span>
            </div>
            <h4 className="text-xs font-bold text-white font-sans">Government Rules Engine</h4>
            <p className="text-[11px] text-[#8892B0] leading-relaxed">
              Cross-checks 6-month validity, €30k insurance duration, 3-month continuous bank statements, and name matching.
            </p>
            <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-[#0066FF]">
              POST /api/v1/cv/rules-engine
            </div>
          </div>

          {/* Module 3 */}
          <div className="bg-[#071324] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-[#0066FF] text-white px-2 py-0.5 rounded">
                MODULE 3
              </span>
              <span className="text-[10px] font-mono text-emerald-400">NIST FRVT</span>
            </div>
            <h4 className="text-xs font-bold text-white font-sans">Biometric Verification</h4>
            <p className="text-[11px] text-[#8892B0] leading-relaxed">
              1:1 facial cosine vector matching, 3D head pose angle tolerance (±5°), background purity, and 35x45mm sizing.
            </p>
            <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-[#0066FF]">
              POST /api/v1/cv/biometric-verify
            </div>
          </div>

          {/* Module 4 */}
          <div className="bg-[#071324] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold bg-[#FF9900] text-[#0A192F] px-2 py-0.5 rounded">
                MODULE 4
              </span>
              <span className="text-[10px] font-mono text-rose-400">Forensics</span>
            </div>
            <h4 className="text-xs font-bold text-white font-sans">Forgery & ELA Tamper</h4>
            <p className="text-[11px] text-[#8892B0] leading-relaxed">
              Pixel-level Error Level Analysis (ELA) delta matrices, font glyph metric variance, and spliced text boundary detection.
            </p>
            <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-[#FF9900]">
              POST /api/v1/cv/forgery-ela-check
            </div>
          </div>
        </div>

        {/* Code Snippet & UI Mapping Schema Box */}
        <div className="bg-[#071324] rounded-xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2 font-mono">
              <Terminal className="w-4 h-4 text-[#0066FF]" />
              UI Flag Mapping Matrix (Python FastAPI -&gt; React Admin UI)
            </span>
            <span className="text-[11px] font-mono text-[#8892B0]">OpenAPI 3.1 Payload</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#0A192F] rounded-lg border border-white/10 space-y-1">
              <span className="text-[#FF9900] font-bold block">1. Extraction Bounding Box</span>
              <p className="text-[11px] text-[#8892B0] font-sans">
                Normalized coordinates <code className="text-white bg-black/40 px-1 py-0.5 rounded">[x, y, w, h]</code> render directly on the PDF/Image viewer with color-coded risk borders.
              </p>
            </div>

            <div className="p-3 bg-[#0A192F] rounded-lg border border-white/10 space-y-1">
              <span className="text-rose-400 font-bold block">2. Error Level Analysis Heatmap</span>
              <p className="text-[11px] text-[#8892B0] font-sans">
                Delta difference ratio spikes (&gt; 0.80) activate the hot-orange forensic layer highlighting modified financial balances.
              </p>
            </div>

            <div className="p-3 bg-[#0A192F] rounded-lg border border-white/10 space-y-1">
              <span className="text-emerald-400 font-bold block">3. Statutory Error Banners</span>
              <p className="text-[11px] text-[#8892B0] font-sans">
                Failed rules automatically trigger high-priority warning cards specifying exact statutory articles (e.g. Visa Code Art. 12(a)).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Enterprise Conversational AI, RAG Vector Pipeline & PII Masking */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#0066FF] text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                STAGE 5 BLUEPRINT
              </span>
              <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF9900]" />
                Conversational AI, RAG Vector Pipeline & PII Masking Middleware
              </h3>
            </div>
            <p className="text-xs text-[#8892B0] mt-1">
              Full-stack architecture for Applicant Guidance Agent and VFS Operations Staff Copilot with strict PII anonymization and statutory groundings.
            </p>
          </div>
        </div>

        {/* 4 Architecture Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#FF9900] font-bold">1. PII Redaction Layer</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-[#8892B0]">
              Combined Regex + NER heuristics tokenizing passports, bank IBANs, DOBs, emails, and names into <code className="text-white bg-black/40 px-1 py-0.5 rounded text-[10px]">[REDACTED_TOKENS]</code> before reaching LLM endpoints.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#0066FF] font-bold">2. Vector RAG Pipeline</span>
              <Database className="w-4 h-4 text-[#0066FF]" />
            </div>
            <p className="text-[11px] text-[#8892B0]">
              Dense vector embeddings indexing official checklists, financial formulas (€65/day, €30k insurance), and statutory codes (Visa Code Art. 12/14/15) across 71 client missions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold">3. Proactive IDP Integration</span>
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[11px] text-[#8892B0]">
              Automated triggers when document verification fails (e.g. insurance expiry preceding flight return), launching plain-language remediation instructions and re-upload CTAs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">4. Compliance Boundaries</span>
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-[#8892B0]">
              Strict system prompt instructions prohibiting prediction of visa approval outcomes, slot hoarding bypasses, or unauthorized legal immigration representation.
            </p>
          </div>
        </div>

        {/* System Prompt Specs Container */}
        <div className="bg-[#071324] rounded-xl p-5 border border-white/10 space-y-4 text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#0066FF]" />
              Enterprise System Prompt Specification & Compliance Guardrails
            </span>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              WCAG & Sovereign Consular Aligned
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 bg-[#0A192F] rounded-xl border border-white/10 space-y-2">
              <span className="text-[#FF9900] font-bold block">Client Guidance Agent Prompt Guardrail</span>
              <p className="text-[11px] text-[#8892B0] font-sans leading-relaxed">
                "You are strictly prohibited from predicting or guaranteeing visa outcomes, guaranteeing appointment slot availability, or providing legal immigration representation. Ground all answers in statutory articles (Schengen Visa Code, UKVI Appendix V, ICAO Doc 9303)."
              </p>
            </div>

            <div className="p-3.5 bg-[#0A192F] rounded-xl border border-white/10 space-y-2">
              <span className="text-[#0066FF] font-bold block">Staff Copilot Prompt Guardrail</span>
              <p className="text-[11px] text-[#8892B0] font-sans leading-relaxed">
                "Synthesize multi-document application dossiers into high-density operational briefs. Highlight composite risk scores, pixel-level ELA compression anomalies, 1:1 NIST face match indices, and draft standardized 7-day consular remediation notices."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Anti-Scalping, 3D Liveness Detection & Algorithmic Identity Anchoring Blueprint */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FF9900] text-[#0A192F] text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                CYBERSECURITY & ML BLUEPRINT
              </span>
              <h3 className="text-lg font-bold text-[#0A192F] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#FF9900]" />
                Anti-Scalping, 3D Liveness & Algorithmic Identity Anchoring Engine
              </h3>
            </div>
            <p className="text-xs text-[#8892B0] mt-1">
              Engineered defense matrix addressing Problem 2: Black-Market Appointment Scalping, Automated Slot Hoarding & Visa Shopping.
            </p>
          </div>
        </div>

        {/* 3 Core Engineering Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#FF9900] font-bold">1. 3D Liveness PAD Layer</span>
              <Camera className="w-4 h-4 text-[#FF9900]" />
            </div>
            <p className="text-[11px] text-[#8892B0]">
              ISO/IEC 30107-3 Level 2 Presentation Attack Detection. Executes randomized challenge sequences (blinks, head turns), corneal specular glint verification, and 2D OLED screen moiré frequency filtering.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">2. Identity Anchoring Lock</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-[#8892B0]">
              Mints an immutable SHA-256 / Ed25519 tamper-proof anchor binding the live biometric embedding + OCR passport number + VAC slot time. Completely eliminates secondary black-market transfers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0A192F] text-white border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#0066FF] font-bold">3. Behavioral ML Classifier</span>
              <Cpu className="w-4 h-4 text-[#0066FF]" />
            </div>
            <p className="text-[11px] text-[#8892B0]">
              Real-time Isolation Forest + XGBoost ensemble scoring keystroke flight time standard deviations (σ), cursor trajectory curvature entropy, and Chrome DevTools Protocol automation hooks (&lt; 3.2ms latency).
            </p>
          </div>
        </div>

        {/* Technical Code & Telemetry Schema */}
        <div className="bg-[#071324] rounded-xl p-5 border border-white/10 space-y-4 text-white font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Algorithmic Canonical Identity Lock Schema (HSM Signed)
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              NON-TRANSFERABLE
            </span>
          </div>

          <div className="p-3.5 bg-[#0A192F] rounded-lg border border-white/5 text-[11px] space-y-1 text-[#8892B0]">
            <div><span className="text-white font-bold">Canonical Lock Payload:</span> <code className="text-[#0066FF]">PASSPORT:GB89201476 || NAT:GBR || NAME:ELENA ROSTOVA || CENTER:vfs-lon-01 || SLOT:2026-08-22@09:30 || BIO_HASH:512d_emb_e8a93 || TS:2026-08-19T14:15:00Z</code></div>
            <div><span className="text-white font-bold">Cryptographic Digest:</span> <code className="text-emerald-400">SHA-256(canonical_payload) → e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code></div>
            <div><span className="text-white font-bold">HSM Hardware Attestation:</span> <code className="text-[#FF9900]">ECDSA_P256_VERIFIED by Node VFS-HSM-EU-CENTRAL-04 (Pessimistic Hold: 10m TTL)</code></div>
          </div>
        </div>
      </div>

      {/* Section 6: Enterprise Containerized Deployment & Edge AI Infrastructure */}
      <EnterpriseDeploymentSpec />
    </div>
  );
};
