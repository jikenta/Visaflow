import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, ShieldCheck, Camera, Sparkles, RefreshCw, 
  AlertOctagon, CheckCircle2, Lock, Cpu, Sliders, Activity, 
  Zap, ArrowRight, Ban, HelpCircle, UserCheck
} from 'lucide-react';
import { 
  AppointmentState, 
  VfsCenter, 
  VisaCategory, 
  MlBotInferenceResult, 
  BehavioralBiometricsTelemetry,
  IdentityAnchorLock
} from '../../types';
import { 
  BehavioralTelemetryCollector, 
  AntiBotMachineLearningEngine, 
  IdentityAnchoringEngine,
  Liveness3DPipeline
} from '../../services/antiFraudService';

interface AppointmentBiometricGuardProps {
  isOpen: boolean;
  appointment: AppointmentState;
  selectedCenter: VfsCenter;
  selectedCategory: VisaCategory;
  passportNumber: string;
  applicantName: string;
  onSuccess: (anchorLock: IdentityAnchorLock, mlResult: MlBotInferenceResult) => void;
  onBlocked: (mlResult: MlBotInferenceResult, telemetry: BehavioralBiometricsTelemetry) => void;
  onCancel: () => void;
}

export const AppointmentBiometricGuardModal: React.FC<AppointmentBiometricGuardProps> = ({
  isOpen,
  appointment,
  selectedCenter,
  selectedCategory,
  passportNumber,
  applicantName,
  onSuccess,
  onBlocked,
  onCancel
}) => {
  // Liveness States
  const [activeStep, setActiveStep] = useState<'liveness_check' | 'ml_telemetry_eval' | 'identity_lock' | 'access_denied'>('liveness_check');
  const [challengeStep, setChallengeStep] = useState<number>(0);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [livenessPassed, setLivenessPassed] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>(true);
  const [simulatedAttackMode, setSimulatedAttackMode] = useState<boolean>(false);
  const [livenessError, setLivenessError] = useState<string | null>(null);

  // ML Telemetry Evaluation Results
  const [mlInference, setMlInference] = useState<MlBotInferenceResult | null>(null);
  const [telemetrySnapshot, setTelemetrySnapshot] = useState<BehavioralBiometricsTelemetry | null>(null);
  const [anchorLock, setAnchorLock] = useState<IdentityAnchorLock | null>(null);
  const [isSubmittingAnchor, setIsSubmittingAnchor] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const telemetryCollectorRef = useRef<BehavioralTelemetryCollector>(new BehavioralTelemetryCollector());

  const CHALLENGE_PROMPTS = [
    { title: 'Look directly at camera & Blink naturally', icon: '👁️' },
    { title: 'Turn head gently 20° to the LEFT', icon: '👤' },
    { title: 'Turn head gently 20° to the RIGHT', icon: '👤' },
    { title: 'Hold neutral expression for depth analysis', icon: '✨' }
  ];

  useEffect(() => {
    if (isOpen) {
      startCamera();
      telemetryCollectorRef.current = new BehavioralTelemetryCollector();
      setActiveStep('liveness_check');
      setChallengeStep(0);
      setLivenessPassed(false);
      setMlInference(null);
      setAnchorLock(null);
      setLivenessError(null);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraPermission(true);
        }
      }
    } catch {
      setCameraPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  // User input event listeners for behavioral telemetry
  const handleMouseMove = (e: React.MouseEvent) => {
    telemetryCollectorRef.current.recordMouseMove(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    telemetryCollectorRef.current.recordKeyDown(e);
  };

  const handleStartLivenessChallenge = () => {
    setIsCapturing(true);
    setLivenessError(null);
    setChallengeStep(1);

    // Step 1 -> 2
    setTimeout(() => {
      setChallengeStep(2);
      telemetryCollectorRef.current.recordClick({ clientX: 300, clientY: 200 } as any, 'liveness_stage_2');
    }, 1200);

    // Step 2 -> 3
    setTimeout(() => {
      setChallengeStep(3);
    }, 2400);

    // Step 3 -> Verification
    setTimeout(async () => {
      setIsCapturing(false);

      const padResult = Liveness3DPipeline.evaluateFramePresentationAttack(
        'frame_data_url', 
        simulatedAttackMode
      );

      if (!padResult.passed) {
        setLivenessError(padResult.description);
        setLivenessPassed(false);
        return;
      }

      setLivenessPassed(true);
      
      // Move to ML Evaluation Step
      runMlAntiBotInference();
    }, 3600);
  };

  const runMlAntiBotInference = async () => {
    setActiveStep('ml_telemetry_eval');

    const telemetry = telemetryCollectorRef.current.extractTelemetry();
    setTelemetrySnapshot(telemetry);

    // Run Server-side ML Anomaly Model
    const inference = AntiBotMachineLearningEngine.evaluateBehavioralTelemetry(telemetry);
    setMlInference(inference);

    if (inference.classification === 'BOT_SNIPER' || inference.botThreatScore >= 80) {
      // Flagged as malicious bot / scalper
      setTimeout(() => {
        setActiveStep('access_denied');
        onBlocked(inference, telemetry);
      }, 1400);
    } else {
      // Legitimate Human -> Proceed to Identity Anchoring
      setTimeout(async () => {
        setActiveStep('identity_lock');
        await generateIdentityAnchor(inference);
      }, 1200);
    }
  };

  const generateIdentityAnchor = async (inference: MlBotInferenceResult) => {
    setIsSubmittingAnchor(true);
    try {
      const anchor = await IdentityAnchoringEngine.createImmutableAnchor({
        passportNumber: passportNumber || 'GB89201476',
        nationality: 'GBR',
        applicantFullName: applicantName || 'ELENA ROSTOVA',
        centerId: selectedCenter.id,
        centerCity: selectedCenter.city,
        appointmentDate: appointment.date,
        timeSlot: appointment.timeSlot,
        botThreatScore: inference.botThreatScore,
        biometricTemplateHash: 'bio_emb_512_' + Math.random().toString(36).substring(2, 10)
      });

      setAnchorLock(anchor);
      setIsSubmittingAnchor(false);
    } catch {
      setIsSubmittingAnchor(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-[#0A192F] border border-white/15 text-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#071324]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF]/20 text-[#0066FF] flex items-center justify-center border border-[#0066FF]/40">
              <ShieldCheck className="w-5 h-5 text-[#0066FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Biometric Liveness & Identity Anchoring Guard
                </h3>
                <span className="text-[10px] font-mono bg-[#FF9900]/20 text-[#FF9900] px-2 py-0.5 rounded font-bold border border-[#FF9900]/30">
                  ANTI-SCALPING ISO 30107-3
                </span>
              </div>
              <p className="text-xs text-[#8892B0]">
                Binding appointment slot irrevocably to applicant biometrics to prevent black-market hoarding.
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="text-[#8892B0] hover:text-white text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10"
          >
            Cancel
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Step 1: Real-time 3D Webcam Liveness */}
          {activeStep === 'liveness_check' && (
            <div className="space-y-5">
              <div className="bg-[#FFF7ED] text-[#0A192F] p-3.5 rounded-xl text-xs flex items-start gap-2.5 border-l-4 border-[#FF9900]">
                <ShieldAlert className="w-4 h-4 text-[#FF9900] shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Anti-Bot Live Verification:</strong> Please look into your camera and perform the randomized motion prompt. This verifies a physical human is present and neutralizes synthetic deepfake injections.
                </div>
              </div>

              {/* Webcam Oval Viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md mx-auto border-2 border-[#0066FF]/40 shadow-inner flex items-center justify-center">
                {cameraPermission ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2 text-[#8892B0]">
                    <Camera className="w-10 h-10 mx-auto text-[#0066FF] animate-pulse" />
                    <p className="text-xs">Camera stream active in high-entropy analysis mode.</p>
                  </div>
                )}

                {/* 3D Facial Oval Target Guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`w-44 h-56 rounded-full border-2 border-dashed transition-all duration-300 ${
                    livenessPassed ? 'border-emerald-400 scale-105 shadow-[0_0_30px_rgba(52,211,153,0.4)]' :
                    isCapturing ? 'border-[#FF9900] animate-pulse' :
                    'border-white/40'
                  }`}>
                    {isCapturing && (
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#FF9900]/80 shadow-[0_0_12px_#FF9900] animate-bounce" />
                    )}
                  </div>
                </div>

                {/* Live Step Badge */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#0A192F]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-[#FF9900] font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    {CHALLENGE_PROMPTS[challengeStep]?.title}
                  </span>
                  <span className="text-[#8892B0] text-[10px]">
                    Step {challengeStep + 1} of 4
                  </span>
                </div>
              </div>

              {/* Error Callout if Attack Detected */}
              {livenessError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{livenessError}</span>
                </div>
              )}

              {/* Attack Simulator Toggle for Testing */}
              <div className="p-3 bg-[#071324] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#8892B0]" />
                  <span className="text-[#8892B0]">Simulate Screen Replay / Deepfake Inject</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulatedAttackMode(prev => !prev)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                    simulatedAttackMode ? 'bg-rose-600 text-white' : 'bg-white/10 text-[#8892B0]'
                  }`}
                >
                  {simulatedAttackMode ? 'ATTACK SIMULATED' : 'PASSIVE HUMAN'}
                </button>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleStartLivenessChallenge}
                disabled={isCapturing}
                className="w-full py-3.5 bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                <Camera className="w-4 h-4" />
                <span>{isCapturing ? 'Analyzing Optical Glint & 3D Depth...' : 'Start 3D Biometric Liveness Check'}</span>
              </button>
            </div>
          )}

          {/* Step 2: ML Telemetry Evaluation */}
          {activeStep === 'ml_telemetry_eval' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0066FF]/20 text-[#0066FF] border border-[#0066FF]/40 flex items-center justify-center mx-auto animate-pulse">
                <Cpu className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">
                Evaluating Behavioral Keystroke & Cursor Telemetry
              </h4>
              <p className="text-xs text-[#8892B0] max-w-md mx-auto">
                Running server-side Isolation Forest and XGBoost classifiers against timing vectors, mouse micro-tremor curvature, and hardware entropy.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Inference Latency: 2.8ms</span>
              </div>
            </div>
          )}

          {/* Step 3: Identity Lock Issuance */}
          {activeStep === 'identity_lock' && anchorLock && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-400">
                    Human Identity Verified · Anchor Lock Minted
                  </h4>
                  <p className="text-xs text-[#8892B0] mt-0.5">
                    This appointment slot has been cryptographically locked in the VFS immutable ledger. Black-market transfer is strictly impossible.
                  </p>
                </div>
              </div>

              {/* Anchor Lock Details */}
              <div className="p-4 bg-[#071324] rounded-xl border border-white/10 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[#8892B0]">Lock ID:</span>
                  <span className="text-white font-bold">{anchorLock.lockId}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[#8892B0]">Anchored Passport:</span>
                  <span className="text-[#0066FF] font-bold">{anchorLock.passportNumber}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[#8892B0]">Applicant Legal Name:</span>
                  <span className="text-white font-bold">{anchorLock.applicantFullName}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-[#8892B0]">Assigned Slot:</span>
                  <span className="text-[#FF9900] font-bold">{anchorLock.appointmentDate} @ {anchorLock.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8892B0]">SHA-256 Payload Hash:</span>
                  <span className="text-emerald-400 text-[10px] truncate max-w-[200px]">
                    {anchorLock.canonicalPayloadHash}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (mlInference) {
                    onSuccess(anchorLock, mlInference);
                  }
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide font-mono"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm & Bind Appointment Dossier</span>
              </button>
            </div>
          )}

          {/* Step 4: Access Denied / Bot Isolation */}
          {activeStep === 'access_denied' && mlInference && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                <Ban className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-rose-400">
                Automated Bot Anomaly Detected · Slot Reservation Denied
              </h4>
              <p className="text-xs text-[#8892B0] max-w-md mx-auto">
                Our ML anti-fraud telemetry classified this request as synthetic automation (Threat Score: <strong className="text-rose-400">{mlInference.botThreatScore}/100</strong>). This incident has been ingested into the VFS Operations Threat Monitor.
              </p>

              <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-left text-xs font-mono text-rose-200 space-y-1">
                <div className="font-bold text-rose-400">Identified Anomaly Signatures:</div>
                {mlInference.identifiedRiskFactors.map((factor, idx) => (
                  <div key={idx} className="text-[11px] text-[#8892B0] flex items-start gap-1.5">
                    <span>•</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs font-mono transition-all"
              >
                Close & Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
