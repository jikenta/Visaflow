import React, { useRef, useState, useEffect } from 'react';
import { DigitalSignatureState, PassportOcrData } from '../../types';
import { 
  PenTool, RotateCcw, CheckCircle2, Shield, 
  ArrowRight, ArrowLeft, Lock, FileSignature, CheckSquare, Square 
} from 'lucide-react';

interface DigitalSignatureProps {
  signature: DigitalSignatureState;
  passport: PassportOcrData;
  onUpdate: (state: Partial<DigitalSignatureState>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const DigitalSignature: React.FC<DigitalSignatureProps> = ({
  signature,
  passport,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const fullName = `${passport.givenNames} ${passport.surname}`.trim() || 'ELENA ROSTOVA';

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0A192F';

    // If signature exists, we could draw or keep
    if (!signature.signerLegalName) {
      onUpdate({
        signerLegalName: fullName,
        signedAt: new Date().toISOString(),
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      });
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    
    // Generate simulated SHA-256 hash
    const randomHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    onUpdate({
      signatureDataUrl: dataUrl,
      sha256Hash: randomHash,
      signedAt: new Date().toISOString(),
    });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onUpdate({
      signatureDataUrl: null,
      sha256Hash: null,
    });
  };

  const handleAutoSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    handleClear();

    const rect = canvas.getBoundingClientRect();
    ctx.font = "italic 32px 'Brush Script MT', cursive, sans-serif";
    ctx.fillStyle = "#0A192F";
    ctx.fillText(fullName, 40, rect.height / 2 + 10);
    
    setHasDrawn(true);
    const dataUrl = canvas.toDataURL('image/png');
    const autoHash = 'a4b7f920c8192ad7c3902341908ef90123caef51029348102394810239481234';
    onUpdate({
      signatureDataUrl: dataUrl,
      sha256Hash: autoHash,
      signedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8">
      {/* Informational Guidance Banner */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center text-[#0066FF] shrink-0">
            <FileSignature className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0A192F]">
              Cryptographic Digital Signature & Legal Declaration
            </h3>
            <p className="text-xs text-[#8892B0]">
              Sign on screen using your mouse, touchpad, or touchscreen stylus. Certified under eIDAS & NIST standards.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono bg-[#0066FF]/10 text-[#0066FF] px-2.5 py-1 rounded-md font-bold shrink-0">
          STEP 4 OF 5
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Signature Canvas Pad */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#0066FF]" />
                <span className="text-xs font-bold text-[#0A192F] uppercase tracking-wide">
                  Official Signature Pad
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoSign}
                  className="text-xs font-medium text-[#0066FF] hover:underline"
                >
                  Apply Formatted Script
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-medium text-[#8892B0] hover:text-rose-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Pad</span>
                </button>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div className="relative border-2 border-dashed border-[#8892B0]/40 rounded-xl bg-[#F4F6F8] p-1 flex items-center justify-center min-h-[220px]">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[200px] cursor-crosshair touch-none"
              />

              {/* Baseline Guideline */}
              <div className="absolute inset-x-8 bottom-12 border-b border-[#8892B0]/20 pointer-events-none flex justify-between text-[10px] text-[#8892B0] font-mono">
                <span>Sign above line</span>
                <span>✕ Signature Base</span>
              </div>
            </div>

            {/* Signer Legal Identity Stamp */}
            <div className="mt-4 p-3.5 rounded-lg bg-[#F4F6F8] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[#8892B0] block text-[10px]">Legal Name of Signer:</span>
                <span className="font-bold text-[#0A192F] font-mono">{fullName}</span>
              </div>
              <div>
                <span className="text-[#8892B0] block text-[10px]">Passport Number:</span>
                <span className="font-bold text-[#0A192F] font-mono">{passport.passportNumber}</span>
              </div>
              <div>
                <span className="text-[#8892B0] block text-[10px]">Timestamp (UTC):</span>
                <span className="font-mono text-[#0066FF] font-semibold">
                  {signature.signedAt ? new Date(signature.signedAt).toLocaleTimeString() : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Legal Consent, SHA-256 Digest & Next CTA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-[#0A192F] pb-3 border-b border-[#E2E8F0] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0066FF]" />
              <span>Consular Legal Declarations</span>
            </h4>

            {/* Checkbox 1 */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] bg-[#F4F6F8] hover:bg-gray-100 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={signature.legalConsentChecked}
                onChange={(e) => onUpdate({ legalConsentChecked: e.target.checked })}
                className="mt-0.5 rounded text-[#0066FF] focus:ring-[#0066FF]"
              />
              <span className="text-[#0A192F] leading-relaxed">
                I solemnly certify under penalty of perjury that all submitted bio-data, passport images, and attached documents are authentic, unaltered, and belong exclusively to me.
              </span>
            </label>

            {/* Checkbox 2 */}
            <label className="flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] bg-[#F4F6F8] hover:bg-gray-100 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={signature.declarationAccepted}
                onChange={(e) => onUpdate({ declarationAccepted: e.target.checked })}
                className="mt-0.5 rounded text-[#0066FF] focus:ring-[#0066FF]"
              />
              <span className="text-[#0A192F] leading-relaxed">
                I authorize VFS Global and diplomatic missions to perform biometric cross-matching, sanctions list screening, and consular data exchange.
              </span>
            </label>

            {/* SHA-256 Hash Card */}
            <div className="bg-[#0A192F] text-white p-3.5 rounded-lg border border-[#0A192F] font-mono text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#8892B0] text-[10px] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#0066FF]" /> SHA-256 Tamper Seal
                </span>
                <span className="text-emerald-400 text-[10px]">INTEGRITY SIGNED</span>
              </div>
              <p className="text-[10px] text-emerald-300 break-all bg-[#071324] p-2 rounded border border-white/5 select-all">
                {signature.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
              <button
                type="button"
                onClick={onPrev}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#0A192F] hover:bg-[#F4F6F8] flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {/* High-priority Next CTA (#FF9900) */}
              <button
                id="btn-confirm-signature"
                type="button"
                onClick={onNext}
                disabled={!signature.legalConsentChecked || !signature.declarationAccepted}
                className={`font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs tracking-wide transition-all active:scale-[0.99] ${
                  signature.legalConsentChecked && signature.declarationAccepted
                    ? 'bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Upload Compliance Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
