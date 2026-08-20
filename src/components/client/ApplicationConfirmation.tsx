import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AppointmentState, PassportOcrData, BiometricVerificationState, DigitalSignatureState } from '../../types';
import { VFS_CENTERS, VISA_CATEGORIES } from '../../data/mockData';
import { 
  CheckCircle2, Download, Printer, QrCode, 
  MapPin, Calendar, Clock, ShieldCheck, ArrowRight, RotateCcw, ExternalLink 
} from 'lucide-react';

interface ApplicationConfirmationProps {
  referenceNumber: string;
  appointment: AppointmentState;
  passport: PassportOcrData;
  biometrics: BiometricVerificationState;
  signature: DigitalSignatureState;
  onGoToDashboard: () => void;
  onReset: () => void;
}

export const ApplicationConfirmation: React.FC<ApplicationConfirmationProps> = ({
  referenceNumber,
  appointment,
  passport,
  biometrics,
  signature,
  onGoToDashboard,
  onReset,
}) => {
  const center = VFS_CENTERS.find(c => c.id === appointment.centerId) || VFS_CENTERS[0];
  const category = VISA_CATEGORIES.find(c => c.id === appointment.visaCategoryId) || VISA_CATEGORIES[0];

  useEffect(() => {
    // Fire subtle celebration confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0066FF', '#FF9900', '#0A192F', '#10B981']
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Success Banner */}
      <div className="bg-[#ECFDF5] border border-emerald-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A192F]">
          Visa Application & Biometric Enrollment Confirmed!
        </h2>
        <p className="text-sm text-emerald-800 mt-1 max-w-xl mx-auto">
          Your application dossier and encrypted biometric package have been ingested into the VFS Operations Dispatch Queue.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-[#8892B0] font-medium">Application Reference Number:</span>
          <span className="text-base font-bold font-mono text-[#0A192F] tracking-wide">
            {referenceNumber}
          </span>
        </div>
      </div>

      {/* Official Printable Consular Appointment Pass Card */}
      <div className="bg-white rounded-2xl border-2 border-[#0A192F] shadow-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-[#0A192F] text-white p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0066FF] flex items-center justify-center font-bold text-lg font-mono">
              VFS
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                OFFICIAL BIOMETRIC APPOINTMENT PASS
              </h3>
              <p className="text-xs text-[#8892B0]">
                VFS Global Consular Services · ICAO Doc 9303 Verified
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-emerald-400 font-bold block">● STATUS: CONFIRMED</span>
            <span className="text-[#8892B0]">REF: {referenceNumber}</span>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Details */}
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#8892B0] block text-[11px]">Applicant Name:</span>
                <span className="font-bold text-[#0A192F] text-sm">
                  {passport.givenNames} {passport.surname}
                </span>
              </div>

              <div>
                <span className="text-[#8892B0] block text-[11px]">Passport Number:</span>
                <span className="font-bold text-[#0A192F] font-mono text-sm">
                  {passport.passportNumber} ({passport.nationality})
                </span>
              </div>

              <div>
                <span className="text-[#8892B0] block text-[11px]">Visa Category:</span>
                <span className="font-bold text-[#0066FF] truncate block">
                  {category.name}
                </span>
              </div>

              <div>
                <span className="text-[#8892B0] block text-[11px]">Appointment Date:</span>
                <span className="font-bold text-[#0A192F] font-mono">
                  {appointment.date}
                </span>
              </div>

              <div>
                <span className="text-[#8892B0] block text-[11px]">Time Slot:</span>
                <span className="font-bold text-[#0A192F] font-mono">
                  {appointment.timeSlot} ({appointment.slotType.toUpperCase()})
                </span>
              </div>

              <div>
                <span className="text-[#8892B0] block text-[11px]">Biometric Match:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  98.7% (ICAO Pass)
                </span>
              </div>
            </div>

            {/* Center Location Box */}
            <div className="p-4 rounded-xl bg-[#F4F6F8] border border-[#E2E8F0] flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#0066FF] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#0A192F]">{center.name}</p>
                <p className="text-xs text-[#8892B0] mt-0.5">{center.address}</p>
                <p className="text-[11px] text-[#0066FF] font-semibold mt-1">
                  Operating Hours: {center.operatingHours} · Please arrive 15 minutes before slot
                </p>
              </div>
            </div>
          </div>

          {/* Right QR Code & Security Stamp */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#F4F6F8] rounded-xl border border-[#E2E8F0] text-center">
            {/* SVG QR Code Simulation */}
            <div className="w-28 h-28 bg-white p-2 rounded-lg border border-gray-300 shadow-inner flex items-center justify-center mb-2">
              <QrCode className="w-24 h-24 text-[#0A192F]" />
            </div>
            <span className="text-[10px] font-mono text-[#8892B0]">
              Turnstile Gate Access Token
            </span>
            <span className="text-[10px] font-mono font-bold text-[#0A192F] mt-0.5">
              {referenceNumber}
            </span>
          </div>
        </div>

        {/* Footer Security Strip */}
        <div className="bg-[#F4F6F8] px-6 py-3 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-[11px] text-[#8892B0] font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SHA-256 Digest: {signature.sha256Hash?.substring(0, 24)}...</span>
          </div>
          <span>Encrypted via VFS Consular Diplomatic Bus</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[#8892B0] hover:text-[#0A192F] flex items-center gap-1.5 order-2 sm:order-1"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Book Another Visa Application</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold text-[#0A192F] hover:bg-[#F4F6F8] flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Appointment Pass</span>
          </button>

          {/* High-priority CTA (#FF9900) */}
          <button
            id="btn-inspect-in-dashboard"
            type="button"
            onClick={onGoToDashboard}
            className="bg-[#FF9900] hover:bg-[#E68A00] text-[#0A192F] font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs tracking-wide transition-all"
          >
            <span>View in VFS Operations Cockpit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
