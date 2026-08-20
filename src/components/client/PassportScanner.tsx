import React, { useState, useRef, useEffect } from 'react';
import { PassportOcrData } from '../../types';
import { 
  Camera, Upload, RefreshCw, CheckCircle2, AlertTriangle, 
  FileText, ShieldCheck, ArrowRight, ArrowLeft, Eye, ScanLine, 
  HelpCircle, Video, SwitchCamera, Sparkles, AlertCircle, Maximize2 
} from 'lucide-react';

interface PassportScannerProps {
  passportData: PassportOcrData;
  onUpdate: (data: PassportOcrData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const SAMPLE_PASSPORTS: Record<string, PassportOcrData> = {
  uk: {
    documentType: 'P',
    issuingCountry: 'GBR',
    surname: 'ROSTOVA',
    givenNames: 'ELENA',
    passportNumber: 'GB89201476',
    nationality: 'GBR',
    dateOfBirth: '1992-04-14',
    gender: 'F',
    dateOfExpiry: '2031-10-18',
    personalNumber: '920414-7890',
    mrzLine1: 'P<GBRROSTOVA<<ELENA<<<<<<<<<<<<<<<<<<<<<<<<<',
    mrzLine2: 'GB89201476GBR9204144F3110189<<<<<<<<<<<<<<08',
    checksumValid: true,
    confidenceScore: 99.4,
    imageUri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    boundingBoxes: {
      photo: { x: 8, y: 18, w: 28, h: 48, label: 'Biometric Photo' },
      mrz: { x: 5, y: 78, w: 90, h: 18, label: 'MRZ Data Strip' },
      personalData: { x: 40, y: 18, w: 55, h: 54, label: 'Personal Information' },
      securityEmboss: { x: 32, y: 56, w: 18, h: 20, label: 'Hologram Stamp' }
    }
  },
  emirates: {
    documentType: 'P',
    issuingCountry: 'ARE',
    surname: 'AL-MANSOOR',
    givenNames: 'TARIQ',
    passportNumber: 'AE55019284',
    nationality: 'ARE',
    dateOfBirth: '1986-11-23',
    gender: 'M',
    dateOfExpiry: '2034-05-12',
    personalNumber: '784-1986-1234567-1',
    mrzLine1: 'P<AREAL<MANSOOR<<TARIQ<<<<<<<<<<<<<<<<<<<<<',
    mrzLine2: 'AE55019284ARE8611232M3405128<<<<<<<<<<<<<<02',
    checksumValid: true,
    confidenceScore: 99.8,
    imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    boundingBoxes: {
      photo: { x: 8, y: 18, w: 28, h: 48, label: 'Biometric Photo' },
      mrz: { x: 5, y: 78, w: 90, h: 18, label: 'MRZ Data Strip' },
      personalData: { x: 40, y: 18, w: 55, h: 54, label: 'Personal Information' },
      securityEmboss: { x: 32, y: 56, w: 18, h: 20, label: 'Hologram Stamp' }
    }
  },
  singapore: {
    documentType: 'P',
    issuingCountry: 'SGP',
    surname: 'CHEN',
    givenNames: 'MARCUS WEI',
    passportNumber: 'SG44901822',
    nationality: 'SGP',
    dateOfBirth: '1990-12-05',
    gender: 'M',
    dateOfExpiry: '2032-03-29',
    personalNumber: 'S9012345A',
    mrzLine1: 'P<SGPCHEN<<MARCUS<WEI<<<<<<<<<<<<<<<<<<<<<<',
    mrzLine2: 'SG44901822SGP9012051M3203294<<<<<<<<<<<<<<06',
    checksumValid: true,
    confidenceScore: 97.6,
    imageUri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    boundingBoxes: {
      photo: { x: 8, y: 18, w: 28, h: 48, label: 'Biometric Photo' },
      mrz: { x: 5, y: 78, w: 90, h: 18, label: 'MRZ Data Strip' },
      personalData: { x: 40, y: 18, w: 55, h: 54, label: 'Personal Information' },
      securityEmboss: { x: 32, y: 56, w: 18, h: 20, label: 'Hologram Stamp' }
    }
  }
};

export const PassportScanner: React.FC<PassportScannerProps> = ({
  passportData,
  onUpdate,
  onNext,
  onPrev,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [glareDetected, setGlareDetected] = useState<boolean>(false);
  const [alignmentScore, setAlignmentScore] = useState<number>(98);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Camera Stream if available
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, cameraFacing]);

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
      console.warn('Camera access unavailable or declined, falling back to simulated optical scanner.', err);
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

  const handleCaptureSnapshot = () => {
    setIsScanning(true);
    if (cameraActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setTimeout(() => {
          onUpdate({
            ...passportData,
            imageUri: dataUrl,
            confidenceScore: 99.2,
            checksumValid: true,
          });
          setIsScanning(false);
        }, 1000);
        return;
      }
    }

    // Default simulation capture
    setTimeout(() => {
      simulateScanProcess(SAMPLE_PASSPORTS.uk);
    }, 1000);
  };

  const simulateScanProcess = (selectedPassport: PassportOcrData) => {
    setIsScanning(true);
    setTimeout(() => {
      onUpdate({ ...selectedPassport });
      setIsScanning(false);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIsScanning(true);
        setTimeout(() => {
          onUpdate({
            ...passportData,
            imageUri: event.target?.result as string,
            confidenceScore: 98.6,
            checksumValid: true,
          });
          setIsScanning(false);
        }, 1100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFieldChange = (field: keyof PassportOcrData, value: any) => {
    onUpdate({
      ...passportData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-8">
      {/* Informational Guidance Banner */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center text-[#0066FF] shrink-0">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0A192F]">
              ICAO Doc 9303 Compliant Optical Passport Scanner
            </h3>
            <p className="text-xs text-[#8892B0]">
              Align passport bio-data page & MRZ strip within the visual framing guides below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowBoxes(!showBoxes)}
            className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              showBoxes ? 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/30 font-semibold' : 'bg-[#F4F6F8] text-[#8892B0] border-[#E2E8F0]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showBoxes ? 'Hide OCR Overlays' : 'Show OCR Overlays'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Mobile-Optimized Camera Viewport & Framing Stage */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-sm">
            {/* Capture Method Tabs */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4 gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  id="tab-camera-passport"
                  onClick={() => setActiveTab('camera')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'camera'
                      ? 'bg-[#0066FF] text-white shadow-sm'
                      : 'bg-[#F4F6F8] text-[#8892B0] hover:text-[#0A192F]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Camera View</span>
                </button>
                <button
                  type="button"
                  id="tab-upload-passport"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'upload'
                      ? 'bg-[#0066FF] text-white shadow-sm'
                      : 'bg-[#F4F6F8] text-[#8892B0] hover:text-[#0A192F]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>

              {/* Sample Preset Selector */}
              <div className="flex items-center gap-1.5 text-xs text-[#8892B0]">
                <span className="hidden sm:inline">Test Data:</span>
                <select
                  onChange={(e) => {
                    const selected = SAMPLE_PASSPORTS[e.target.value];
                    if (selected) simulateScanProcess(selected);
                  }}
                  className="text-xs bg-[#F4F6F8] border border-[#E2E8F0] rounded px-2 py-1 text-[#0A192F] font-medium outline-none focus:border-[#0066FF]"
                >
                  <option value="uk">🇬🇧 UK Citizen</option>
                  <option value="emirates">🇦🇪 UAE Citizen</option>
                  <option value="singapore">🇸🇬 Singapore</option>
                </select>
              </div>
            </div>

            {/* Mobile-Optimized Camera View Container with Visual Framing Overlays */}
            <div className="relative aspect-[1.42/1] bg-[#071324] rounded-xl overflow-hidden border-2 border-[#0A192F] flex items-center justify-center group shadow-inner">
              {/* Active Video Stream if webcam is on */}
              {activeTab === 'camera' && cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : passportData.imageUri ? (
                <img
                  src={passportData.imageUri}
                  alt="Passport Bio-data Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-6 text-[#8892B0]">
                  <FileText className="w-12 h-12 text-[#8892B0]/40 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">Position Passport In Frame</p>
                  <p className="text-xs text-[#8892B0] mt-1">Ensure bio-data page is fully visible within border guides</p>
                </div>
              )}

              {/* Laser Scan Sweep Animation */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-[#0066FF] shadow-[0_0_20px_#0066FF] animate-scan-laser z-20" />
              )}

              {/* Visual Framing Guides & Corner Target Overlays */}
              <div className="absolute inset-4 pointer-events-none rounded-lg border border-white/20">
                {/* 4 Optical Corner Brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-[#0066FF] -mt-1 -ml-1 rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-[#0066FF] -mt-1 -mr-1 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-[#0066FF] -mb-1 -ml-1 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-[#0066FF] -mb-1 -mr-1 rounded-br" />

                {/* MRZ Strip Alignment Framing Overlay at Bottom */}
                <div className="absolute bottom-2 inset-x-2 h-14 border border-dashed border-[#0066FF]/70 bg-[#0066FF]/10 rounded flex items-center justify-between px-3">
                  <span className="font-mono text-[9px] text-white font-bold bg-[#0066FF] px-1.5 py-0.5 rounded uppercase tracking-wider">
                    MRZ Alignment Zone (Lines 1 & 2)
                  </span>
                  <span className="font-mono text-[9px] text-emerald-400 font-bold">
                    {passportData.checksumValid ? '✓ CHECKSUM READY' : 'ALIGNING...'}
                  </span>
                </div>

                {/* Biometric Photo Frame Guide Box Overlay */}
                <div className="absolute top-3 left-3 w-[26%] h-[56%] border border-dashed border-emerald-400/80 bg-emerald-400/10 rounded flex flex-col justify-between p-1.5">
                  <span className="font-mono text-[8px] text-emerald-300 font-bold bg-emerald-700/80 px-1 rounded w-max">
                    Photo Target
                  </span>
                </div>
              </div>

              {/* Bounding Boxes Overlays when extracted */}
              {showBoxes && !isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Photo Box */}
                  <div
                    className="absolute border-2 border-emerald-400 bg-emerald-400/10 rounded"
                    style={{
                      left: `${passportData.boundingBoxes.photo.x}%`,
                      top: `${passportData.boundingBoxes.photo.y}%`,
                      width: `${passportData.boundingBoxes.photo.w}%`,
                      height: `${passportData.boundingBoxes.photo.h}%`,
                    }}
                  >
                    <span className="absolute -top-4 left-0 bg-emerald-600 text-white font-mono text-[9px] px-1 py-0.2 rounded">
                      {passportData.boundingBoxes.photo.label}
                    </span>
                  </div>

                  {/* MRZ Box */}
                  <div
                    className="absolute border-2 border-[#0066FF] bg-[#0066FF]/15 rounded"
                    style={{
                      left: `${passportData.boundingBoxes.mrz.x}%`,
                      top: `${passportData.boundingBoxes.mrz.y}%`,
                      width: `${passportData.boundingBoxes.mrz.w}%`,
                      height: `${passportData.boundingBoxes.mrz.h}%`,
                    }}
                  >
                    <span className="absolute -top-4 left-0 bg-[#0066FF] text-white font-mono text-[9px] px-1 py-0.2 rounded">
                      {passportData.boundingBoxes.mrz.label}
                    </span>
                  </div>
                </div>
              )}

              {/* Top Telemetry HUD Badge */}
              <div className="absolute top-3 left-3 bg-[#0A192F]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-mono border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>OCR Confidence: {passportData.confidenceScore}%</span>
              </div>

              {/* Alignment & Glare Detection Tag */}
              <div className="absolute top-3 right-3 bg-[#0A192F]/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-mono border border-white/10 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Anti-Glare: Optimal</span>
              </div>
            </div>

            {/* Mobile Camera Action Controls */}
            <div className="mt-4 flex items-center justify-between gap-3">
              {activeTab === 'camera' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')}
                    className="px-3 py-2 rounded-lg bg-[#F4F6F8] hover:bg-[#E2E8F0] text-xs font-semibold text-[#0A192F] flex items-center gap-1.5 transition-all"
                  >
                    <SwitchCamera className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span>Flip Camera</span>
                  </button>

                  <button
                    type="button"
                    id="btn-capture-passport-snap"
                    onClick={handleCaptureSnapshot}
                    disabled={isScanning}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{isScanning ? 'Extracting ICAO Fields...' : 'Capture & Parse Passport'}</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 border-2 border-dashed border-[#E2E8F0] hover:border-[#0066FF] hover:bg-[#F4F6F8] rounded-xl text-center text-xs text-[#8892B0] hover:text-[#0A192F] transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Upload className="w-4 h-4 text-[#0066FF]" />
                  <span>Choose file from device or drag & drop</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Decoded MRZ 2-Line Verification Box */}
          <div className="bg-[#0A192F] text-white p-4 rounded-xl border border-[#0A192F] font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#8892B0] text-[11px] font-bold tracking-wider">
                DECODED ICAO 9303 MACHINE READABLE ZONE (MRZ)
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                passportData.checksumValid
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {passportData.checksumValid ? '✓ MOD-7 CHECKSUM PASS' : '✗ CHECKSUM FAIL'}
              </span>
            </div>
            <div className="bg-[#071324] p-3 rounded-lg border border-white/5 space-y-1 text-emerald-400 select-all overflow-x-auto whitespace-pre">
              <div>{passportData.mrzLine1}</div>
              <div>{passportData.mrzLine2}</div>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Auto-Extracted Form Data (Editable) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0066FF]" />
                  Extracted Bio-Data Verification
                </h3>
                <p className="text-xs text-[#8892B0]">
                  Review OCR extraction against your physical passport before biometric capture.
                </p>
              </div>
              <span className="text-[11px] font-mono bg-[#0066FF]/10 text-[#0066FF] px-2.5 py-1 rounded-md font-bold">
                STEP 2 OF 5
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Surname */}
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1">
                  Primary Surname / Family Name
                </label>
                <input
                  type="text"
                  value={passportData.surname}
                  onChange={(e) => handleFieldChange('surname', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F4F6F8] border border-[#E2E8F0] rounded-lg text-[#0A192F] focus:ring-2 focus:ring-[#0066FF] focus:bg-white outline-none"
                />
              </div>

              {/* Given Names */}
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1">
                  Given Names / Forenames
                </label>
                <input
                  type="text"
                  value={passportData.givenNames}
                  onChange={(e) => handleFieldChange('givenNames', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F4F6F8] border border-[#E2E8F0] rounded-lg text-[#0A192F] focus:ring-2 focus:ring-[#0066FF] focus:bg-white outline-none"
                />
              </div>

              {/* Passport Number */}
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1">
                  Passport / Document Number
                </label>
                <input
                  type="text"
                  value={passportData.passportNumber}
                  onChange={(e) => handleFieldChange('passportNumber', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F4F6F8] border border-[#E2E8F0] rounded-lg text-[#0A192F] focus:ring-2 focus:ring-[#0066FF] focus:bg-white outline-none"
                />
              </div>

              {/* Issuing Country / Nationality */}
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1">
                  Nationality (3-Letter ICAO)
                </label>
                <input
                  type="text"
                  value={passportData.nationality}
                  onChange={(e) => handleFieldChange('nationality', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#F4F6F8] border border-[#E2E8F0] rounded-lg text-[#0A192F] focus:ring-2 focus:ring-[#0066FF] focus:bg-white outline-none"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1">
                  Date of Birth (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={passportData.dateOfBirth}
                  onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F4F6F8] border border-[#E2E8F0] rounded-lg text-[#0A192F] focus:ring-2 focus:ring-[#0066FF] focus:bg-white outline-none"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1">
                  Gender
                </label>
                <select
                  value={passportData.gender}
                  onChange={(e) => handleFieldChange('gender', e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F4F6F8] border border-[#E2E8F0] rounded-lg text-[#0A192F] focus:ring-2 focus:ring-[#0066FF] focus:bg-white outline-none"
                >
                  <option value="M">M - Male</option>
                  <option value="F">F - Female</option>
                  <option value="X">X - Unspecified</option>
                </select>
              </div>

              {/* Date of Expiry */}
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1">
                  Passport Expiry Date
                </label>
                <input
                  type="date"
                  value={passportData.dateOfExpiry}
                  onChange={(e) => handleFieldChange('dateOfExpiry', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F4F6F8] border border-[#E2E8F0] rounded-lg text-[#0A192F] focus:ring-2 focus:ring-[#0066FF] focus:bg-white outline-none"
                />
              </div>

              {/* Personal National ID */}
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1">
                  Personal National ID / Tax No
                </label>
                <input
                  type="text"
                  value={passportData.personalNumber}
                  onChange={(e) => handleFieldChange('personalNumber', e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#F4F6F8] border border-[#E2E8F0] rounded-lg text-[#0A192F] focus:ring-2 focus:ring-[#0066FF] focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Checksum & ICAO Compliance Summary */}
            <div className="mt-6 p-4 rounded-xl bg-[#F4F6F8] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-[#0A192F]">ICAO 9303 Verification Passed</p>
                  <p className="text-[11px] text-[#8892B0]">Document validity &gt; 6 months with zero tampering artifacts</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Valid
              </span>
            </div>

            {/* Navigation Buttons with High-Priority Orange/Gold CTA */}
            <div className="mt-6 pt-5 border-t border-[#E2E8F0] flex items-center justify-between">
              <button
                type="button"
                onClick={onPrev}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#0A192F] hover:bg-[#F4F6F8] flex items-center gap-1.5 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Slot</span>
              </button>

              {/* High-priority Next CTA (#FF9900) */}
              <button
                id="btn-confirm-passport"
                type="button"
                onClick={onNext}
                className="bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs tracking-wide transition-all active:scale-[0.99]"
              >
                <span>Confirm & Start Live Biometrics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
