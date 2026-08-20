import React, { useState, useEffect } from 'react';
import { 
  VisaApplicationRecord, StaffCopilotSummary, RagSourceCitation 
} from '../../types';
import { 
  Bot, X, Sparkles, ShieldCheck, AlertTriangle, 
  FileText, Search, Copy, Check, Send, ChevronRight, 
  Terminal, Lock, ArrowRight, BookOpen, UserCheck, Flame
} from 'lucide-react';
import { 
  generateStaffCopilotSummary 
} from '../../services/conversationalAiService';
import { queryRagKnowledgeBase } from '../../services/ragVectorService';
import { sanitizePromptForLlm } from '../../services/piiMaskingService';

interface StaffCopilotDrawerProps {
  application: VisaApplicationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestDocs: (id: string) => void;
}

export const StaffCopilotDrawer: React.FC<StaffCopilotDrawerProps> = ({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onRequestDocs,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'rule_lookup' | 'remediation_draft'>('summary');
  const [summary, setSummary] = useState<StaffCopilotSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<RagSourceCitation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);
  const [customDraftNotice, setCustomDraftNotice] = useState<string>('');

  useEffect(() => {
    if (application) {
      const generated = generateStaffCopilotSummary(application);
      setSummary(generated);

      // Pre-populate standard consular notice draft
      const draft = `OFFICIAL NOTICE: VFS GLOBAL CONSULAR REMEDIATION (REF: ${application.refNumber})
TO: ${application.applicantName}
APPLICATION: ${application.visaType} (${application.destinationCountry})

Pursuant to Schengen Visa Code Regulation (EC) No 810/2009 Article 14(2), your visa application dossier requires supplementary verification before consular submission:

REQUIRED REMEDIATION ITEMS:
1. 3-Month Bank Statement: Please provide continuous bank statements for the 90 days preceding application with official bank stamp or electronic verification barcode.
2. Travel Medical Insurance: Ensure policy covers €30,000 minimum medical repatriation through the final day of scheduled return travel.

Please submit the compliant documentation within 7 calendar days to prevent statutory file closure.`;
      setCustomDraftNotice(draft);
    }
  }, [application?.id]);

  const handleSearchRules = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const sanitized = sanitizePromptForLlm(searchQuery);
    const results = queryRagKnowledgeBase(
      sanitized.sanitizedText, 
      application?.destinationCountry, 
      undefined, 
      4
    );
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(customDraftNotice);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-[#E2E8F0] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Top Header in Dark Navy (#0A192F) */}
      <div className="bg-[#0A192F] text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6 text-[#FF9900]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                VFS Operations Staff Copilot
              </h3>
              <span className="bg-[#FF9900] text-[#0A192F] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                ADMIN AI
              </span>
            </div>
            <p className="text-xs text-[#8892B0] font-mono mt-0.5">
              Target Dossier: <strong className="text-white">{application?.refNumber || 'None Selected'}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Close Staff Copilot"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Copilot Navigation Tabs */}
      <div className="px-5 py-2.5 bg-[#F4F6F8] border-b border-[#E2E8F0] flex items-center justify-between gap-2 text-xs font-semibold shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'summary'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Dossier Briefing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rule_lookup')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rule_lookup'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            On-Demand Rule Search
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('remediation_draft')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'remediation_draft'
                ? 'bg-white text-[#0066FF] shadow-xs font-bold border border-[#E2E8F0]'
                : 'text-[#8892B0] hover:text-[#0A192F]'
            }`}
          >
            Consular Notice Draft
          </button>
        </div>

        <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          ● Copilot Active
        </span>
      </div>

      {/* Main Drawer Scroll Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F4F6F8]/50">
        {/* TAB 1: EXECUTIVE DOSSIER SUMMARY */}
        {activeTab === 'summary' && summary && (
          <div className="space-y-4">
            {/* Executive Risk Box */}
            <div className={`p-4 rounded-xl border shadow-xs ${
              summary.recommendedConsularAction === 'REFUSE_STATUTORY'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : summary.recommendedConsularAction === 'REQUEST_ADDITIONAL_DOCS'
                ? 'bg-[#FFF7ED] border-[#FFD699] text-[#0A192F]'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0066FF]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                    AI Consular Assessment Brief
                  </h4>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white shadow-2xs">
                  Action: {summary.recommendedConsularAction}
                </span>
              </div>
              <p className="text-xs leading-relaxed mt-2 font-medium">
                {summary.executiveSummary}
              </p>
            </div>

            {/* Key Risk Vector Checklist */}
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-2.5">
              <h5 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF9900]" />
                Key Risk Vectors & Anomalies
              </h5>
              <div className="space-y-2">
                {summary.keyRiskFactors.length > 0 ? (
                  summary.keyRiskFactors.map((factor, idx) => (
                    <div key={idx} className="p-2.5 bg-[#F4F6F8] rounded-lg border border-[#E2E8F0] text-xs flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span className="text-[#0A192F]">{factor}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No critical flags detected in this application dossier.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Forensic Microservice Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-1">
                <span className="text-[#8892B0] text-[10px] block">Stage 3 IDP Extraction</span>
                <strong className="text-[#0A192F] block text-xs">{summary.idpComplianceAssessment}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-1">
                <span className="text-[#8892B0] text-[10px] block">Biometrics & 3D PAD</span>
                <strong className="text-emerald-600 block text-xs">{summary.biometricVerificationStatus}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-1">
                <span className="text-[#8892B0] text-[10px] block">Bot Traffic Score</span>
                <strong className="text-[#0066FF] block text-xs">{summary.botAnomaliesScore}</strong>
              </div>
            </div>

            {/* Quick Action Dispatch Buttons */}
            {application && (
              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
                <h5 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider">
                  Execute Consular Decision
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onApprove(application.id)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRequestDocs(application.id)}
                    className="py-2 px-3 rounded-xl bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Request Docs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onReject(application.id, 'Statutory Non-Compliance')}
                    className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Refuse Visa</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ON-DEMAND STATUTORY RULE LOOKUP */}
        {activeTab === 'rule_lookup' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0066FF]" />
                Embassy Guideline & Exemption Clause Search
              </h4>
              <p className="text-[11px] text-[#8892B0]">
                Search rare bilateral agreements, EU Directive 2004/38/EC family member waivers, and emergency expedited criteria.
              </p>

              <form onSubmit={handleSearchRules} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Directive 2004/38/EC spouse fee exemption or emergency medical..."
                  className="flex-1 px-3 py-2 text-xs bg-[#F4F6F8] focus:bg-white text-[#0A192F] border border-[#E2E8F0] focus:border-[#0066FF] rounded-xl outline-none"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim() || isSearching}
                  className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Lookup</span>
                </button>
              </form>

              {/* Sample Quick Lookup Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-mono">
                <span className="text-[#8892B0]">Quick Search:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Directive 2004/38/EC family member fee waiver');
                    const results = queryRagKnowledgeBase('Directive 2004/38/EC family member fee waiver', 'France / Schengen Area');
                    setSearchResults(results);
                  }}
                  className="px-2 py-0.5 bg-[#F4F6F8] hover:bg-gray-200 text-[#0A192F] rounded border border-[#E2E8F0]"
                >
                  EU Family Exemption
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('Emergency medical humanitarian expedited clearance');
                    const results = queryRagKnowledgeBase('Emergency medical humanitarian expedited clearance', 'France / Schengen Area');
                    setSearchResults(results);
                  }}
                  className="px-2 py-0.5 bg-[#F4F6F8] hover:bg-gray-200 text-[#0A192F] rounded border border-[#E2E8F0]"
                >
                  Medical Fast-Track
                </button>
              </div>
            </div>

            {/* Search Results List */}
            <div className="space-y-3">
              {searchResults.map((result) => (
                <div key={result.id} className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold bg-[#0066FF]/10 text-[#0066FF] px-2 py-0.5 rounded">
                      {result.statutoryArticle}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">
                      Relevance: {Math.round(result.relevanceScore * 100)}%
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-[#0A192F]">{result.title}</h5>
                  <p className="text-xs text-[#8892B0] leading-relaxed">{result.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONSULAR REMEDIATION NOTICE DRAFT */}
        {activeTab === 'remediation_draft' && (
          <div className="space-y-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div>
                <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0066FF]" />
                  Standardized Consular Notice Generator
                </h4>
                <p className="text-[11px] text-[#8892B0]">
                  Pre-formatted 7-day supplementary document notice complying with Schengen Visa Code Art. 14(2).
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyDraft}
                className="px-3 py-1.5 bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                {copiedDraft ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDraft ? 'Copied!' : 'Copy Notice'}</span>
              </button>
            </div>

            <textarea
              value={customDraftNotice}
              onChange={(e) => setCustomDraftNotice(e.target.value)}
              rows={12}
              className="w-full p-3 font-mono text-xs text-[#0A192F] bg-[#F4F6F8] rounded-xl border border-[#E2E8F0] focus:border-[#0066FF] outline-none leading-relaxed select-all"
            />

            {application && (
              <button
                type="button"
                onClick={() => onRequestDocs(application.id)}
                className="w-full py-2.5 bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs font-mono cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Transmit Official Notice to Applicant ({application.applicantEmail})</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
