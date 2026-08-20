import React, { useState, useEffect } from 'react';
import { 
  realtimeSyncBus, 
  ApplicantChatContextEvent 
} from '../../services/realtimeSyncService';
import { 
  Radio, MessageSquare, CheckCircle2, AlertTriangle, 
  Sparkles, Bot, Clock, Filter, ArrowRight, UserCheck, ShieldAlert
} from 'lucide-react';

interface LiveAiChatbotTelemetryFeedProps {
  selectedAppRef?: string;
  onSelectApplicant?: (ref: string) => void;
}

export const LiveAiChatbotTelemetryFeed: React.FC<LiveAiChatbotTelemetryFeedProps> = ({
  selectedAppRef,
  onSelectApplicant
}) => {
  const [events, setEvents] = useState<ApplicantChatContextEvent[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'selected' | 'discrepancies'>('all');
  const [liveSseConnected, setLiveSseConnected] = useState<boolean>(true);

  useEffect(() => {
    // Initial fetch from sync bus
    setEvents(realtimeSyncBus.getHistory());

    // Subscribe to SSE / WebSocket push events
    const unsubscribe = realtimeSyncBus.subscribe((newEvent) => {
      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const displayedEvents = events.filter((ev) => {
    if (filterMode === 'selected' && selectedAppRef) {
      return ev.applicantRef === selectedAppRef;
    }
    if (filterMode === 'discrepancies') {
      return ev.eventType === 'auto_resolved_error' || ev.eventType === 'proactive_idp_alert' || ev.eventType === 'escalation_requested';
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
      {/* Header: Dark Navy (#0A192F) with SSE Stream Status */}
      <div className="bg-[#0A192F] text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white shadow-xs">
            <Radio className="w-4 h-4 text-[#FF9900] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-tight uppercase font-mono">
                Live AI Assistant & Applicant Assistance Stream
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SSE ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-[#8892B0] font-sans">
              Real-time pre-submission queries & auto-resolved document errors streamed to consular queue.
            </p>
          </div>
        </div>

        {/* Filter Pill Controls */}
        <div className="flex items-center gap-1.5 bg-[#071324] p-1 rounded-lg border border-white/10 text-[11px] font-semibold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              filterMode === 'all'
                ? 'bg-[#0066FF] text-white shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            All Stream ({events.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('discrepancies')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              filterMode === 'discrepancies'
                ? 'bg-[#FF9900] text-[#0A192F] font-bold shadow-xs'
                : 'text-[#8892B0] hover:text-white'
            }`}
          >
            <span>Auto-Resolved</span>
          </button>

          {selectedAppRef && (
            <button
              type="button"
              onClick={() => setFilterMode('selected')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterMode === 'selected'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[#8892B0] hover:text-white'
              }`}
            >
              Current Dossier
            </button>
          )}
        </div>
      </div>

      {/* Stream List / Timeline in Neutral Grey (#F4F6F8) */}
      <div className="p-4 bg-[#F4F6F8]/60 space-y-2.5 max-h-64 overflow-y-auto">
        {displayedEvents.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#8892B0]">
            <Bot className="w-6 h-6 mx-auto text-[#8892B0] mb-2 opacity-50" />
            <span>Awaiting real-time applicant chatbot interactions on active visa portals...</span>
          </div>
        ) : (
          displayedEvents.map((event) => {
            const isAutoResolved = event.eventType === 'auto_resolved_error';
            const isProactiveAlert = event.eventType === 'proactive_idp_alert';
            const isMatch = selectedAppRef && event.applicantRef === selectedAppRef;

            return (
              <div
                key={event.id}
                id={`sse-event-${event.id}`}
                className={`p-3 rounded-xl border transition-all text-xs flex flex-col sm:flex-row items-start justify-between gap-3 ${
                  isMatch
                    ? 'bg-blue-50/80 border-[#0066FF] shadow-xs'
                    : isAutoResolved
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isProactiveAlert
                    ? 'bg-[#FFF7ED] border-[#FFD699]'
                    : 'bg-white border-[#E2E8F0] hover:border-[#8892B0]/40'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isAutoResolved
                      ? 'bg-emerald-100 text-emerald-700'
                      : isProactiveAlert
                      ? 'bg-[#FF9900]/20 text-[#FF9900]'
                      : 'bg-[#0066FF]/10 text-[#0066FF]'
                  }`}>
                    {isAutoResolved ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isProactiveAlert ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0A192F]">
                        {event.applicantName}
                      </span>
                      <span className="font-mono text-[10px] text-[#0066FF] font-semibold">
                        {event.applicantRef}
                      </span>
                      <span className="text-[10px] font-mono text-[#8892B0]">
                        ({event.destinationCountry})
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isAutoResolved 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isProactiveAlert 
                          ? 'bg-[#FF9900] text-[#0A192F]'
                          : 'bg-[#F4F6F8] text-[#8892B0] border border-[#E2E8F0]'
                      }`}>
                        {isAutoResolved ? '✓ ERROR RESOLVED' : isProactiveAlert ? '⚠ IDP INTERVENTION' : 'CHAT QUERY'}
                      </span>
                    </div>

                    <p className="text-xs text-[#0A192F] leading-snug">
                      {event.summary}
                    </p>

                    {event.resolvedDiscrepancy && (
                      <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded flex items-center gap-1.5 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Staff Context: {event.resolvedDiscrepancy}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[10px] font-mono text-[#8892B0] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.timestamp}
                  </span>

                  {onSelectApplicant && (
                    <button
                      type="button"
                      onClick={() => onSelectApplicant(event.applicantRef)}
                      className="px-2 py-1 rounded bg-white hover:bg-[#0066FF] text-[#0066FF] hover:text-white border border-[#0066FF]/30 text-[10px] font-bold font-mono transition-all flex items-center gap-1"
                    >
                      <span>Inspect Dossier</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
