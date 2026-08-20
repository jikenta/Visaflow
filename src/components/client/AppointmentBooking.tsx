import React, { useState, useEffect, useRef } from 'react';
import { 
  AppointmentState, 
  VfsCenter, 
  VisaCategory,
  IdentityAnchorLock,
  MlBotInferenceResult,
  BehavioralBiometricsTelemetry
} from '../../types';
import { VFS_CENTERS, VISA_CATEGORIES } from '../../data/mockData';
import { 
  Calendar, Clock, MapPin, Sparkles, CheckCircle2, 
  ShieldAlert, ArrowRight, DollarSign, Info, ShieldCheck, 
  Lock, Activity, Cpu, AlertOctagon, RefreshCw, Terminal, Sliders
} from 'lucide-react';
import { 
  BehavioralTelemetryCollector, 
  AntiBotMachineLearningEngine, 
  IdentityAnchoringEngine 
} from '../../services/antiFraudService';
import { AppointmentBiometricGuardModal } from './AppointmentBiometricGuardModal';

interface AppointmentBookingProps {
  appointment: AppointmentState;
  onUpdate: (updated: Partial<AppointmentState>) => void;
  onNext: () => void;
  onThreatDetected?: (threat: {
    mlResult: MlBotInferenceResult;
    telemetry: BehavioralBiometricsTelemetry;
  }) => void;
}

const TIME_SLOTS = [
  { time: '08:30 AM', type: 'standard', available: true },
  { time: '09:15 AM', type: 'standard', available: true },
  { time: '10:00 AM', type: 'standard', available: false },
  { time: '10:45 AM', type: 'premium_lounge', available: true, priceAddon: 45 },
  { time: '11:30 AM', type: 'standard', available: true },
  { time: '01:15 PM', type: 'standard', available: true },
  { time: '02:00 PM', type: 'premium_lounge', available: true, priceAddon: 45 },
  { time: '03:30 PM', type: 'prime_time', available: true, priceAddon: 25 },
];

export const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  appointment,
  onUpdate,
  onNext,
  onThreatDetected,
}) => {
  const selectedCenter = VFS_CENTERS.find(c => c.id === appointment.centerId) || VFS_CENTERS[0];
  const selectedCategory = VISA_CATEGORIES.find(c => c.id === appointment.visaCategoryId) || VISA_CATEGORIES[0];

  // Anti-Fraud States
  const [isGuardModalOpen, setIsGuardModalOpen] = useState<boolean>(false);
  const [activeAnchor, setActiveAnchor] = useState<IdentityAnchorLock | null>(null);
  const [liveThreatScore, setLiveThreatScore] = useState<number>(4);
  const [botModeSimulated, setBotModeSimulated] = useState<boolean>(false);
  const [anomalyType, setAnomalyType] = useState<'none' | 'bot_rapid_fire' | 'synthetic_keystroke' | 'headless_browser'>('none');
  const [liveStatusText, setLiveStatusText] = useState<string>('Normal Human Interaction Profile (Jitter σ: 42ms)');

  const telemetryCollectorRef = useRef<BehavioralTelemetryCollector>(new BehavioralTelemetryCollector());

  // Attach interactive listeners to capture real user dynamics
  const handleUserMouseMove = (e: React.MouseEvent) => {
    telemetryCollectorRef.current.recordMouseMove(e);
  };

  const handleUserKeyDown = (e: React.KeyboardEvent) => {
    telemetryCollectorRef.current.recordKeyDown(e);
  };

  const handleUserClick = (e: React.MouseEvent, label: string) => {
    telemetryCollectorRef.current.recordClick(e, label);
  };

  // Bot simulation toggler
  const toggleBotSimulation = (type: 'none' | 'bot_rapid_fire' | 'synthetic_keystroke' | 'headless_browser') => {
    setAnomalyType(type);
    if (type === 'none') {
      setBotModeSimulated(false);
      telemetryCollectorRef.current.setBotSimulation(false, 'none');
      setLiveThreatScore(4);
      setLiveStatusText('Normal Human Interaction Profile (Jitter σ: 42ms)');
    } else {
      setBotModeSimulated(true);
      telemetryCollectorRef.current.setBotSimulation(true, type);
      const fakeScore = type === 'bot_rapid_fire' ? 96 : type === 'synthetic_keystroke' ? 88 : 78;
      setLiveThreatScore(fakeScore);
      setLiveStatusText(
        type === 'bot_rapid_fire' ? '🚨 CRITICAL: Superhuman Velocity (< 150ms) + 0ms Keystroke Jitter' :
        type === 'synthetic_keystroke' ? '⚠️ HIGH: Programmatic Script Injection & CDP Driver Hook' :
        '⚠️ HIGH: SwiftShader Virtualized GPU & Headless Resolution'
      );
    }
  };

  // Calculate dynamic fees
  const baseFee = selectedCategory.fee;
  const loungeFee = appointment.loungeAccess ? 45 : 0;
  const smsFee = appointment.smsUpdates ? 4 : 0;
  const courierFee = appointment.courierReturn ? 22 : 0;
  const total = baseFee + loungeFee + smsFee + courierFee;

  const handleCenterSelect = (center: VfsCenter, e: React.MouseEvent) => {
    handleUserClick(e, `center_${center.id}`);
    onUpdate({
      centerId: center.id,
      date: center.nextAvailableDate,
    });
  };

  const handleCategorySelect = (category: VisaCategory, e: React.MouseEvent) => {
    handleUserClick(e, `category_${category.id}`);
    onUpdate({
      visaCategoryId: category.id,
      destinationCountry: category.destination,
      totalFee: category.fee,
    });
  };

  const handleSlotSelect = (time: string, type: 'standard' | 'premium_lounge' | 'prime_time', e: React.MouseEvent) => {
    handleUserClick(e, `slot_${time}`);
    onUpdate({
      timeSlot: time,
      slotType: type,
    });
  };

  const handleProceedToBiometricGuard = (e: React.MouseEvent) => {
    handleUserClick(e, 'btn_lock_slot');
    setIsGuardModalOpen(true);
  };

  const handleGuardSuccess = (anchorLock: IdentityAnchorLock, mlResult: MlBotInferenceResult) => {
    setActiveAnchor(anchorLock);
    setIsGuardModalOpen(false);
    onNext();
  };

  const handleGuardBlocked = (mlResult: MlBotInferenceResult, telemetry: BehavioralBiometricsTelemetry) => {
    if (onThreatDetected) {
      onThreatDetected({ mlResult, telemetry });
    }
  };

  return (
    <div 
      className="space-y-8"
      onMouseMove={handleUserMouseMove}
      onKeyDown={handleUserKeyDown}
    >
      {/* High-priority Critical Alert Banner (#FF9900) */}
      <div className="bg-[#FFF7ED] border-l-4 border-[#FF9900] p-4 rounded-r-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#FF9900] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#0A192F]">
            <strong className="font-bold text-[#0A192F]">Problem 2 Anti-Scalping Defense Active:</strong>{' '}
            Appointment slots are cryptographically anchored to applicant biometrics. Black-market transfer is strictly blocked.
          </div>
        </div>

        {/* Real-time Telemetry Status Pill */}
        <div className="flex items-center gap-2 font-mono text-[11px] bg-white px-3 py-1.5 rounded-lg border border-[#FF9900]/30 shadow-xs shrink-0">
          <Activity className={`w-3.5 h-3.5 ${liveThreatScore > 50 ? 'text-rose-600 animate-bounce' : 'text-emerald-600'}`} />
          <span className="text-[#0A192F] font-bold">Bot Threat Index:</span>
          <span className={`font-bold ${liveThreatScore > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {liveThreatScore}/100
          </span>
        </div>
      </div>

      {/* Interactive Anti-Bot Simulation Controller for Testing / Evaluation */}
      <div className="bg-[#0A192F] text-white p-4 rounded-xl border border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-[#FF9900]" />
          <div>
            <span className="text-white font-bold">Behavioral Biometrics Test Rig:</span>
            <span className="text-[#8892B0] text-[11px] block mt-0.5">
              {liveStatusText}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => toggleBotSimulation('none')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              anomalyType === 'none' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-[#8892B0] hover:text-white'
            }`}
          >
            Human User
          </button>
          <button
            type="button"
            onClick={() => toggleBotSimulation('bot_rapid_fire')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              anomalyType === 'bot_rapid_fire' ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/10 text-[#8892B0] hover:text-white'
            }`}
          >
            Bot Scalper (140ms)
          </button>
          <button
            type="button"
            onClick={() => toggleBotSimulation('synthetic_keystroke')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              anomalyType === 'synthetic_keystroke' ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/10 text-[#8892B0] hover:text-white'
            }`}
          >
            Script Injector
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Center, Visa, & Slot Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Application Center */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#0066FF]" />
                  1. Select Official VFS Visa Application Centre (VAC)
                </h3>
                <p className="text-xs text-[#8892B0] mt-0.5">
                  Choose your localized consular submission hub for biometric enrollment.
                </p>
              </div>
              <span className="text-xs font-mono bg-[#F4F6F8] px-2.5 py-1 rounded-md text-[#8892B0] font-semibold border border-[#E2E8F0]">
                {VFS_CENTERS.length} Global Hubs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VFS_CENTERS.map((center) => {
                const isSelected = center.id === appointment.centerId;
                return (
                  <button
                    key={center.id}
                    id={`center-${center.id}`}
                    type="button"
                    onClick={(e) => handleCenterSelect(center, e)}
                    className={`text-left p-3.5 rounded-lg border transition-all relative ${
                      isSelected
                        ? 'border-[#0066FF] bg-[#0066FF]/5 shadow-sm ring-2 ring-[#0066FF]/20'
                        : 'border-[#E2E8F0] hover:border-[#8892B0]/40 hover:bg-[#F4F6F8]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{center.flag}</span>
                        <div>
                          <p className="text-sm font-bold text-[#0A192F] leading-tight">
                            {center.city}
                          </p>
                          <p className="text-xs text-[#8892B0] truncate max-w-[170px]">
                            {center.name}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#0066FF]" />
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[#8892B0] font-mono">
                        Slots: <strong className="text-emerald-700 font-bold">{center.slotsAvailable}</strong>
                      </span>
                      <span className="text-[#0066FF] font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {center.nextAvailableDate}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Visa Category & Purpose Selection */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0066FF]" />
                  2. Select Visa Category & Consular Purpose
                </h3>
                <p className="text-xs text-[#8892B0] mt-0.5">
                  Standardized categories compliant with sovereign mission directives.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {VISA_CATEGORIES.map((category) => {
                const isSelected = category.id === appointment.visaCategoryId;
                return (
                  <div
                    key={category.id}
                    id={`category-${category.id}`}
                    onClick={(e) => handleCategorySelect(category, e)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#0066FF] bg-[#0066FF]/5 ring-2 ring-[#0066FF]/20'
                        : 'border-[#E2E8F0] hover:border-[#8892B0]/40 hover:bg-[#F4F6F8]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-[#0A192F] text-white px-2 py-0.5 rounded">
                          {category.code}
                        </span>
                        <h4 className="text-sm font-bold text-[#0A192F]">
                          {category.name}
                        </h4>
                      </div>
                      <p className="text-xs text-[#8892B0]">
                        Destination: <strong className="text-[#0A192F]">{category.destination}</strong> · Validity: {category.duration} · Processing: {category.processingTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs text-[#8892B0] block">Consular Fee</span>
                        <span className="text-base font-extrabold text-[#0A192F] font-mono">
                          €{category.fee}.00
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#0066FF] bg-[#0066FF] text-white' : 'border-[#CBD5E1]'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Real-Time Appointment Slot Matrix */}
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0066FF]" />
                  3. Select Biometric Enrollment Time Window
                </h3>
                <p className="text-xs text-[#8892B0] mt-0.5">
                  Live synchronized slot allocation with 10-minute optimistic reserve lock.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#8892B0]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Sync
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TIME_SLOTS.map((slot) => {
                const isSelected = appointment.timeSlot === slot.time;
                return (
                  <button
                    key={slot.time}
                    id={`slot-${slot.time.replace(/[: ]/g, '-')}`}
                    type="button"
                    disabled={!slot.available}
                    onClick={(e) => handleSlotSelect(slot.time, slot.type as 'standard' | 'premium_lounge' | 'prime_time', e)}
                    className={`p-3 rounded-lg border text-center transition-all relative ${
                      !slot.available
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-[#0066FF] bg-[#0066FF] text-white shadow-md'
                        : 'border-[#E2E8F0] hover:border-[#0066FF]/60 hover:bg-[#0066FF]/5 text-[#0A192F]'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono block">
                      {slot.time}
                    </span>
                    <span className={`text-[10px] uppercase font-semibold block mt-0.5 ${
                      isSelected ? 'text-blue-100' : 'text-[#8892B0]'
                    }`}>
                      {slot.type === 'premium_lounge' ? 'Lounge' : slot.type === 'prime_time' ? 'Prime' : 'Standard'}
                    </span>
                    {slot.priceAddon && (
                      <span className={`text-[10px] font-mono font-bold block ${
                        isSelected ? 'text-amber-300' : 'text-[#FF9900]'
                      }`}>
                        +€{slot.priceAddon}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Anti-Scalping Cryptographic Lock */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-sm sticky top-6 space-y-5">
            <h3 className="text-base font-bold text-[#0A192F] pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <span>Appointment Dossier Summary</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </h3>

            {/* Selected Breakdown */}
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#8892B0]">Selected Center:</span>
                <span className="text-[#0A192F] font-bold text-right truncate max-w-[150px]">
                  {selectedCenter.city} ({selectedCenter.flag})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8892B0]">Consular Purpose:</span>
                <span className="text-[#0A192F] font-bold text-right truncate max-w-[150px]">
                  {selectedCategory.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8892B0]">Appointment Slot:</span>
                <span className="text-[#0066FF] font-bold">
                  {appointment.date} @ {appointment.timeSlot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8892B0]">Standard Base Fee:</span>
                <span className="text-[#0A192F] font-bold">€{baseFee}.00</span>
              </div>
            </div>

            {/* Premium Addons */}
            <div className="pt-3 border-t border-[#E2E8F0] space-y-2">
              <span className="text-xs font-bold text-[#0A192F] block">
                Value-Added Consular Services:
              </span>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#F4F6F8] hover:bg-gray-100 cursor-pointer text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={appointment.loungeAccess}
                    onChange={(e) => onUpdate({ loungeAccess: e.target.checked })}
                    className="rounded text-[#0066FF] focus:ring-[#0066FF]"
                  />
                  <span className="text-[#0A192F] font-medium">Premium Lounge Service</span>
                </div>
                <span className="font-mono text-[#0A192F] font-bold">+€45.00</span>
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-[#F4F6F8] hover:bg-gray-100 cursor-pointer text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={appointment.courierReturn}
                    onChange={(e) => onUpdate({ courierReturn: e.target.checked })}
                    className="rounded text-[#0066FF] focus:ring-[#0066FF]"
                  />
                  <span className="text-[#0A192F] font-medium">Secure Passport Courier</span>
                </div>
                <span className="font-mono text-[#0A192F] font-bold">+€22.00</span>
              </label>
            </div>

            {/* Total Calculation */}
            <div className="py-3 border-t border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#8892B0] block">Total Estimated Fee</span>
                <span className="text-2xl font-extrabold text-[#0A192F] font-mono">
                  €{total}.00
                </span>
              </div>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-1 rounded">
                Govt Regulated
              </span>
            </div>

            {/* High-Priority CTA with Biometric Guard Trigger */}
            <button
              id="btn-reserve-slot"
              type="button"
              onClick={handleProceedToBiometricGuard}
              className="w-full bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              <Lock className="w-4 h-4" />
              <span>Verify Liveness & Lock Slot</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8892B0]">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Protected by Algorithmic Identity Anchoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Liveness & Anti-Bot Guard Modal */}
      <AppointmentBiometricGuardModal
        isOpen={isGuardModalOpen}
        appointment={appointment}
        selectedCenter={selectedCenter}
        selectedCategory={selectedCategory}
        passportNumber="GB89201476"
        applicantName="ELENA ROSTOVA"
        onSuccess={handleGuardSuccess}
        onBlocked={handleGuardBlocked}
        onCancel={() => setIsGuardModalOpen(false)}
      />
    </div>
  );
};
