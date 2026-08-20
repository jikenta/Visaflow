import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Cpu, Activity, 
  Ban, RefreshCw, Radio, Terminal, AlertOctagon, Check,
  Zap, Lock, Search, Eye, Filter, Sparkles, Layers, Sliders
} from 'lucide-react';
import { BotThreatEvent, MlBotInferenceResult, BehavioralBiometricsTelemetry } from '../../types';
import { BOT_THREAT_FEED } from '../../data/mockData';

interface ThreatMonitorProps {
  liveTelemetryFeed?: Array<{
    id: string;
    timestamp: string;
    applicantName: string;
    passportNumber: string;
    threatResult: MlBotInferenceResult;
    telemetry: BehavioralBiometricsTelemetry;
    status: 'BLOCKED' | 'FLAGGED' | 'CLEARED';
  }>;
  onBlockIp?: (ip: string) => void;
}

export const BotThreatMonitor: React.FC<ThreatMonitorProps> = ({ 
  liveTelemetryFeed = [],
  onBlockIp 
}) => {
  const [threatEvents, setThreatEvents] = useState<BotThreatEvent[]>(BOT_THREAT_FEED);
  const [isWafSyncing, setIsWafSyncing] = useState<boolean>(false);
  const [blockedIpsCount, setBlockedIpsCount] = useState<number>(142);
  const [activeTab, setActiveTab] = useState<'realtime_feed' | 'ml_inspector' | 'identity_anchors' | 'waf_rules'>('realtime_feed');
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

  // Sync external feed events if provided
  useEffect(() => {
    if (liveTelemetryFeed.length > 0) {
      const latest = liveTelemetryFeed[0];
      if (latest && latest.threatResult.classification !== 'LEGITIMATE_HUMAN') {
        const newEvent: BotThreatEvent = {
          id: `thr-${Date.now()}`,
          timestamp: new Date().toISOString().substring(11, 19) + ' UTC',
          threatType: latest.threatResult.classification === 'BOT_SNIPER' ? 'Slot Hoarding / Bot Rapid Fire' : 'Headless Browser Signature',
          attackerIp: '185.220.101.' + Math.floor(10 + Math.random() * 80),
          geoLocation: 'Munich, Germany (AS24940)',
          asnName: 'Hetzner Datacenter Egress',
          requestsPerSec: latest.threatResult.botThreatScore > 75 ? 1850 : 420,
          severity: latest.threatResult.botThreatScore > 75 ? 'critical' : 'high',
          mitigationAction: latest.threatResult.mitigationAction === 'BLOCK_SLOT_LOCK' ? 'Auto-Banned IP' : 'Biometric CAPTCHA Challenged',
          status: 'Mitigated'
        };

        setThreatEvents(prev => [newEvent, ...prev.slice(0, 15)]);
      }
    }
  }, [liveTelemetryFeed]);

  const handleBlockIp = (id: string) => {
    setThreatEvents(prev => prev.map(t => t.id === id ? { ...t, mitigationAction: 'Auto-Banned IP' as const, status: 'Mitigated' as const } : t));
    setBlockedIpsCount(c => c + 1);
  };

  const handleTriggerWafPush = () => {
    setIsWafSyncing(true);
    setTimeout(() => {
      setIsWafSyncing(false);
    }, 1000);
  };

  return (
    <div className="bg-[#0A192F] rounded-2xl p-6 border border-[#0A192F] text-white shadow-xl space-y-6">
      {/* Top Telemetry Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/30 text-[#FF9900] flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-white">
                Anti-Scalping & Bot-Threat ML Operations Monitor
              </h3>
              <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                LIVE SOC DEFENSE
              </span>
            </div>
            <p className="text-xs text-[#8892B0]">
              Real-time Isolation Forest anomaly detection, behavioral keystroke telemetry & immutable cryptographic identity lock stream.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#071324] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab('realtime_feed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'realtime_feed' ? 'bg-[#0066FF] text-white font-bold' : 'text-[#8892B0] hover:text-white'
              }`}
            >
              SOC Feed
            </button>
            <button
              onClick={() => setActiveTab('ml_inspector')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ml_inspector' ? 'bg-[#0066FF] text-white font-bold' : 'text-[#8892B0] hover:text-white'
              }`}
            >
              ML Telemetry
            </button>
            <button
              onClick={() => setActiveTab('identity_anchors')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'identity_anchors' ? 'bg-[#0066FF] text-white font-bold' : 'text-[#8892B0] hover:text-white'
              }`}
            >
              Anchor Ledger
            </button>
          </div>

          <button
            type="button"
            onClick={handleTriggerWafPush}
            disabled={isWafSyncing}
            className="px-3.5 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-md transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isWafSyncing ? 'animate-spin' : ''}`} />
            <span>{isWafSyncing ? 'Pushing eBPF XDP...' : 'Sync WAF Filters'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 bg-[#071324] rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#8892B0] text-[10px]">
            <span>Peak Attack Velocity</span>
            <Activity className="w-3.5 h-3.5 text-[#FF9900]" />
          </div>
          <span className="text-xl font-bold text-[#FF9900]">2,100 req/sec</span>
          <span className="text-[10px] text-[#8892B0] block">Slot sniping burst thwarted</span>
        </div>

        <div className="p-3.5 bg-[#071324] rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#8892B0] text-[10px]">
            <span>Active Blocked IP Pool</span>
            <Ban className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <span className="text-xl font-bold text-rose-400">{blockedIpsCount} CIDRs</span>
          <span className="text-[10px] text-[#8892B0] block">Automated eBPF drops active</span>
        </div>

        <div className="p-3.5 bg-[#071324] rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#8892B0] text-[10px]">
            <span>ML Model Inference SLA</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold text-emerald-400">&lt; 3.2 ms</span>
          <span className="text-[10px] text-[#8892B0] block">Isolation Forest + XGBoost</span>
        </div>

        <div className="p-3.5 bg-[#071324] rounded-xl border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[#8892B0] text-[10px]">
            <span>Anchored Slots Protected</span>
            <Lock className="w-3.5 h-3.5 text-[#0066FF]" />
          </div>
          <span className="text-xl font-bold text-[#0066FF]">100% Immutable</span>
          <span className="text-[10px] text-[#8892B0] block">Zero black-market re-sales</span>
        </div>
      </div>

      {/* Tab Content 1: Real-time SOC Attack Feed */}
      {activeTab === 'realtime_feed' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8892B0] flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>Real-Time Ingested Attack Events & Black-Market Scalping Attempts</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Stream Connected: port 3000/v1/telemetry/threat-stream
            </span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {threatEvents.map((threat) => (
              <div
                key={threat.id}
                onClick={() => setSelectedIncident(threat)}
                className="p-3.5 bg-[#071324] rounded-xl border border-white/5 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      threat.severity === 'critical' ? 'bg-rose-500 text-white' :
                      threat.severity === 'high' ? 'bg-[#FF9900] text-[#0A192F]' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {threat.severity.toUpperCase()}
                    </span>
                    <span className="text-white font-bold">{threat.threatType}</span>
                    <span className="text-[#8892B0] text-[11px]">from {threat.geoLocation}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-[#8892B0]">
                    <span>IP: <code className="text-rose-300">{threat.attackerIp}</code></span>
                    <span>•</span>
                    <span>ASN: {threat.asnName}</span>
                    <span>•</span>
                    <span className="text-[#FF9900] font-bold">{threat.requestsPerSec} req/sec</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${
                    threat.status === 'Mitigated' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {threat.mitigationAction}
                  </span>

                  {threat.status !== 'Mitigated' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlockIp(threat.id);
                      }}
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                      title="Enforce IP Ban"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 2: ML Behavioral Biometrics Inspector */}
      {activeTab === 'ml_inspector' && (
        <div className="bg-[#071324] rounded-xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#FF9900]" />
              <span className="text-xs font-bold text-white font-mono">
                Isolation Forest + XGBoost Feature Decomposition (SHAP Values)
              </span>
            </div>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
              Model: vfs-xgb-antiscalp-v4.2
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Feature 1 */}
            <div className="p-3 bg-[#0A192F] rounded-lg border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-bold">1. Keystroke Flight Time Jitter (σ)</span>
                <span className="text-emerald-400 font-bold">SHAP: +0.38</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[82%]" />
              </div>
              <p className="text-[11px] text-[#8892B0]">
                Measures variance between consecutive keyDown events. Bots exhibit zero millisecond jitter (σ &lt; 2ms). Humans naturally vary between 35ms–95ms.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-3 bg-[#0A192F] rounded-lg border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-bold">2. Mouse Trajectory Curvature Entropy</span>
                <span className="text-[#0066FF] font-bold">SHAP: +0.29</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0066FF] h-full w-[74%]" />
              </div>
              <p className="text-[11px] text-[#8892B0]">
                Evaluates micro-tremor deviations from straight lines. Scripted mouse interpolation yields straight-line ratio &gt; 0.98.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-3 bg-[#0A192F] rounded-lg border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-bold">3. Form Completion Velocity Benchmark</span>
                <span className="text-[#FF9900] font-bold">SHAP: +0.24</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#FF9900] h-full w-[65%]" />
              </div>
              <p className="text-[11px] text-[#8892B0]">
                Superhuman form filling (&lt; 1,200ms across 4 interactive steps) triggers immediate Isolation Forest anomaly isolation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-3 bg-[#0A192F] rounded-lg border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white font-bold">4. Headless GPU & Driver Fingerprint</span>
                <span className="text-rose-400 font-bold">SHAP: +0.42</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full w-[94%]" />
              </div>
              <p className="text-[11px] text-[#8892B0]">
                Probes for Google SwiftShader, llvmpipe virtual rasterizers, and active Chrome DevTools Protocol automation hooks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Immutable Identity Anchor Ledger */}
      {activeTab === 'identity_anchors' && (
        <div className="bg-[#071324] rounded-xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white font-mono">
                Cryptographic Identity Anchor Ledger (Anti-Transferability Engine)
              </span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              Ed25519 / SHA-256 HSM Signed
            </span>
          </div>

          <p className="text-xs text-[#8892B0]">
            Every confirmed appointment slot is irrevocably bound to the applicant's OCR-extracted passport number and 512-dimensional facial embedding. Any secondary transfer or name substitution invalidates the cryptographic signature immediately.
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-[#0A192F] rounded-lg border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">LOCK #89201</span>
                  <span className="text-white font-bold">GB89201476 (Elena Rostova)</span>
                  <span className="text-[#8892B0]">→ London VAC (Aug 22 @ 09:30 AM)</span>
                </div>
                <div className="text-[11px] text-[#8892B0] truncate max-w-xl mt-0.5">
                  Payload Hash: <code className="text-blue-300">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold shrink-0 self-start md:self-auto">
                ANCHOR IMMUTABLE
              </span>
            </div>

            <div className="p-3 bg-[#0A192F] rounded-lg border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">LOCK #89202</span>
                  <span className="text-white font-bold">IN88129031 (Priya Sharma)</span>
                  <span className="text-[#8892B0]">→ Mumbai VAC (Aug 23 @ 11:15 AM)</span>
                </div>
                <div className="text-[11px] text-[#8892B0] truncate max-w-xl mt-0.5">
                  Payload Hash: <code className="text-blue-300">f45a67b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6</code>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold shrink-0 self-start md:self-auto">
                ANCHOR IMMUTABLE
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
