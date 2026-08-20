import React, { useState, useEffect, useRef } from 'react';
import { BiometricVerificationState, PassportOcrData } from '../../types';
import { 
  Camera, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, 
  ArrowRight, ArrowLeft, Eye, Smile, Sparkles, User, SunMedium, SwitchCamera 
} from 'lucide-react';

interface BiometricVerificationProps {
  biometrics: BiometricVerificationState;
  passport: PassportOcrData;
  onUpdate: (state: Partial<BiometricVerificationState>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const BiometricVerification: React.FC<BiometricVerificationProps> = ({
  biometrics,
  passport,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const [livenessStage, setLivenessStage] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const LIVENESS_STEPS = [
    { title: 'Align Face in Oval Guide', desc: 'Hold device at eye level and look directly at camera.' },
    { title: 'Blink Eyes Twice', desc: 'Detecting natural biological eye movement.' },
    { title: 'Tilt Head Slightly to the Left', desc: 'Evaluating 3D facial depth and contour reflections.' },
    { title: 'Maintain Neutral Expression', desc: 'Ensuring ICAO 9303 international compliance standards.' },
  ];

  // Camera lifecycle
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [cameraFacing]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      }
    } catch (err) {
      console.warn('Front camera not available or permission denied, using simulated stream.', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleStartLiveness = () => {
    setIsProcessing(true);
    setLivenessStage(1);
    onUpdate({ status: 'capturing' });

    // Step progression simulation
    setTimeout(() => {
      setLivenessStage(2);
      onUpdate({ blinkDetected: true });
    }, 1200);

    setTimeout(() => {
      setLivenessStage(3);
      onUpdate({ headTurnDetected: true });
    }, 2400);

    setTimeout(() => {
      setLivenessStage(4);
      
      let capturedSnapshot = passport.imageUri || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80';
      if (cameraActive && videoRef.current) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth || 640;
          canvas.height = videoRef.current.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            capturedSnapshot = canvas.toDataURL('image/jpeg');
          }
        } catch (e) {
          // fallback
        }
      }

      onUpdate({
        status: 'passed',
        livenessScore: 99.4,
        antiSpoofingScore: 99.8,
        faceMatchScore: 98.7,
        lightingAdequacy: 96,
        neutralExpression: true,
        eyesOpen: true,
        icaoCompliance: true,
        capturedFrame: capturedSnapshot,
      });
      setIsProcessing(false);
    }, 3800);
  };

  const isComplete = biometrics.status === 'passed';

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center text-[#0066FF] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0A192F]">
              Real-Time Biometric Liveness & 1:1 Face Matching (ISO/IEC 30107-3)
            </h3>
            <p className="text-xs text-[#8892B0]">
              Presentation attack detection & facial topography alignment against passport photo.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono bg-[#0066FF]/10 text-[#0066FF] px-2.5 py-1 rounded-md font-bold shrink-0">
          STEP 3 OF 5
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Mobile-Optimized Camera Viewport & Facial Alignment Overlay */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0A192F] rounded-2xl p-6 border border-[#0A192F] text-white shadow-xl relative overflow-hidden">
            {/* Viewport Frame */}
            <div className="relative aspect-[4/3] bg-[#071324] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              {/* Active Video Stream if webcam is on */}
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${
                    isProcessing ? 'filter contrast-105' : 'opacity-95'
                  }`}
                />
              ) : (
                <img
                  src={biometrics.capturedFrame || passport.imageUri || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80"}
                  alt="Live Camera Feed"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isProcessing ? 'filter contrast-105' : 'opacity-90'
                  }`}
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Holographic 3D Face Oval Framing Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-52 h-68 sm:w-60 sm:h-76 rounded-[50%] border-2 transition-all duration-500 relative flex items-center justify-center ${
                  isComplete
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_35px_rgba(16,185,129,0.4)]'
                    : isProcessing
                    ? 'border-[#FF9900] animate-pulse shadow-[0_0_30px_rgba(255,153,0,0.5)]'
                    : 'border-[#0066FF] border-dashed shadow-[0_0_20px_rgba(0,102,255,0.3)]'
                }`}>
                  {/* Eye-Level Reference Line */}
                  <div className="w-full h-px bg-white/30 absolute top-[38%] left-0" />
                  <span className="absolute top-[34%] right-2 text-[8px] font-mono text-white/50 bg-[#0A192F]/60 px-1 rounded">
                    EYE AXIS
                  </span>

                  {/* Vertical Symmetry Reference Line */}
                  <div className="h-full w-px bg-white/20 absolute top-0 left-1/2" />

                  {/* Corner Guides */}
                  <div className="w-4 h-0.5 bg-white/60 absolute top-1/2 -left-2" />
                  <div className="w-4 h-0.5 bg-white/60 absolute top-1/2 -right-2" />
                  <div className="h-4 w-0.5 bg-white/60 absolute -top-2 left-1/2" />
                  <div className="h-4 w-0.5 bg-white/60 absolute -bottom-2 left-1/2" />
                </div>
              </div>

              {/* Top Telemetry Overlay */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                <div className="bg-[#0A192F]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/10 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-[#0066FF] animate-ping'}`} />
                  <span>{isComplete ? 'VERIFICATION SECURED' : 'ACTIVE FACIAL TOPOGRAPHY SCAN'}</span>
                </div>

                <div className="bg-[#0A192F]/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/10 text-emerald-400">
                  PAD Anti-Spoof: {biometrics.antiSpoofingScore.toFixed(1)}%
                </div>
              </div>

              {/* Bottom Instruction Toast */}
              <div className="absolute bottom-3 inset-x-3">
                <div className="bg-[#0A192F]/90 backdrop-blur-md p-3 rounded-xl border border-white/15 text-center">
                  <p className="text-xs font-bold text-white tracking-wide">
                    {isComplete
                      ? '✓ Biometric Match Confirmed (98.7% Confidence)'
                      : isProcessing
                      ? `Action Required: ${LIVENESS_STEPS[livenessStage - 1]?.title || 'Analyzing...'}`
                      : 'Position face squarely inside the oval and start liveness test.'}
                  </p>
                  <p className="text-[11px] text-[#8892B0] mt-0.5">
                    {isComplete
                      ? 'ICAO 9303 standard verified. Ready for digital signature.'
                      : isProcessing
                      ? LIVENESS_STEPS[livenessStage - 1]?.desc
                      : 'Ensure good ambient lighting and look straight ahead.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-3 text-xs text-[#8892B0]">
                <div className="flex items-center gap-1.5">
                  <SunMedium className="w-4 h-4 text-amber-400" />
                  <span>Lighting: <strong className="text-white">96% Optimal</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1 transition-all"
                >
                  <SwitchCamera className="w-3 h-3 text-[#0066FF]" />
                  <span>Flip</span>
                </button>
              </div>

              <button
                type="button"
                id="btn-trigger-liveness"
                disabled={isProcessing}
                onClick={handleStartLiveness}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isComplete
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-lg shadow-blue-500/20'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isComplete ? 'Retake Biometrics' : isProcessing ? 'Verifying 3D Contours...' : 'Start Liveness Challenge'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Real-time Compliance Gauges & Side-by-Side Photo Comparison */}
        <div className="lg:col-span-5 space-y-6">
          {/* Side-by-side Biometric Match Card */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm space-y-5">
            <h4 className="text-sm font-bold text-[#0A192F] pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <span>1:1 Facial Topography Comparison</span>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                98.7% MATCH
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Passport Photo */}
              <div className="bg-[#F4F6F8] p-3 rounded-lg border border-[#E2E8F0] text-center">
                <div className="aspect-[3/4] rounded-md overflow-hidden bg-gray-200 mb-2 border border-gray-300">
                  <img
                    src={passport.imageUri || ''}
                    alt="Passport Bio"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-bold text-[#0A192F] block">PASSPORT PHOTO</span>
                <span className="text-[10px] text-[#8892B0] font-mono">Doc: {passport.passportNumber}</span>
              </div>

              {/* Live Selfie Capture */}
              <div className="bg-[#F4F6F8] p-3 rounded-lg border border-[#E2E8F0] text-center relative">
                <div className="aspect-[3/4] rounded-md overflow-hidden bg-gray-200 mb-2 border border-emerald-400">
                  <img
                    src={biometrics.capturedFrame || passport.imageUri || ''}
                    alt="Live Capture"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 block">LIVE CAPTURE</span>
                <span className="text-[10px] text-emerald-600 font-mono">Liveness: 99.4%</span>
              </div>
            </div>

            {/* Metric Meters */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#8892B0]">Facial Feature Vector Similarity</span>
                  <span className="font-mono font-bold text-[#0A192F]">98.7%</span>
                </div>
                <div className="w-full bg-[#F4F6F8] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.7%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#8892B0]">Anti-Spoofing & 3D Mask Rejection</span>
                  <span className="font-mono font-bold text-[#0A192F]">99.8%</span>
                </div>
                <div className="w-full bg-[#F4F6F8] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                  <div className="bg-[#0066FF] h-full rounded-full" style={{ width: '99.8%' }} />
                </div>
              </div>
            </div>

            {/* Checklist Matrix */}
            <div className="bg-[#F4F6F8] p-3.5 rounded-lg border border-[#E2E8F0] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#0A192F] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Neutral Expression & Eyes Open
                </span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">PASS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#0A192F] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  No Glare / Specular Reflections
                </span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">PASS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#0A192F] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ICAO Doc 9303 Resolution Check
                </span>
                <span className="text-emerald-700 font-bold font-mono text-[11px]">PASS</span>
              </div>
            </div>

            {/* Navigation buttons with High-Priority Orange/Gold CTA */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <button
                type="button"
                onClick={onPrev}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#0A192F] hover:bg-[#F4F6F8] flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {/* High-priority Next CTA (#FF9900) */}
              <button
                id="btn-confirm-biometrics"
                type="button"
                onClick={onNext}
                className="bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs tracking-wide transition-all active:scale-[0.99]"
              >
                <span>Proceed to Digital Signature</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
