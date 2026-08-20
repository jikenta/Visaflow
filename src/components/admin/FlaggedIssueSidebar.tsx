import React from 'react';
import { VisaApplicationRecord } from '../../types';
import { 
  ShieldAlert, AlertTriangle, Eye, CheckCircle2, 
  ExternalLink, ChevronRight, FileWarning, Sparkles 
} from 'lucide-react';

interface FlaggedIssueSidebarProps {
  applications: VisaApplicationRecord[];
  onSelectApplication: (app: VisaApplicationRecord) => void;
  onResolveFlag: (appId: string, flagId: string) => void;
}

export const FlaggedIssueSidebar: React.FC<FlaggedIssueSidebarProps> = ({
  applications,
  onSelectApplication,
  onResolveFlag,
}) => {
  // Aggregate all flags from applications
  const flaggedItems = applications.flatMap(app => 
    app.flags.map(flag => ({
      app,
      flag,
    }))
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#FF9900]" />
          <div>
            <h4 className="text-sm font-bold text-[#0A192F]">
              Automated Flagged Risk Sidebar
            </h4>
            <p className="text-[11px] text-[#8892B0]">
              Rule engine & AI anomaly detection audit stream
            </p>
          </div>
        </div>
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[#FF9900]/20 text-[#FF9900]">
          {flaggedItems.length} Active
        </span>
      </div>

      {flaggedItems.length === 0 ? (
        <div className="text-center py-8 text-[#8892B0] space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-xs font-semibold text-[#0A192F]">Zero Pending Risk Flags</p>
          <p className="text-[11px]">All queue dossiers conform strictly to consular compliance rules.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {flaggedItems.map(({ app, flag }) => (
            <div
              key={`${app.id}-${flag.id}`}
              className="p-3.5 rounded-xl border border-amber-200 bg-[#FFF7ED]/50 hover:bg-[#FFF7ED] transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    flag.severity === 'critical' ? 'bg-rose-600 text-white' :
                    flag.severity === 'high' ? 'bg-amber-500 text-white' :
                    'bg-yellow-500 text-slate-900'
                  }`}>
                    {flag.severity.toUpperCase()} RISK
                  </span>
                  <h5 className="text-xs font-bold text-[#0A192F] mt-1">
                    {flag.title}
                  </h5>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectApplication(app)}
                  className="text-xs text-[#0066FF] hover:underline font-semibold flex items-center gap-1 shrink-0"
                >
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-[#8892B0] leading-relaxed">
                {flag.description}
              </p>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[10px] font-mono text-[#8892B0]">
                <span>Applicant: <strong className="text-[#0A192F]">{app.applicantName}</strong></span>
                <span>Ref: {app.refNumber}</span>
              </div>

              {/* Quick Human-in-the-Loop Override Button */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onResolveFlag(app.id, flag.id)}
                  className="text-[10px] font-semibold bg-white border border-[#E2E8F0] hover:bg-emerald-50 hover:border-emerald-300 text-[#0A192F] hover:text-emerald-700 px-2 py-1 rounded-md transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Officer Override & Clear</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
