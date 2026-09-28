import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Clock, ArrowRight, RefreshCw, X, AlertCircle } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  phone: string;
  simulatedOtp?: string;
  purpose?: 'signup' | 'forgot_password';
  onVerify: (otp: string) => Promise<{ success: boolean; error?: string }>;
  onResend: () => Promise<{ success: boolean; simulatedOtp?: string; error?: string }>;
  onClose: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  phone,
  simulatedOtp,
  purpose = 'signup',
  onVerify,
  onResend,
  onClose
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [latestSimulatedOtp, setLatestSimulatedOtp] = useState<string>(simulatedOtp || '');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update latest simulated OTP if prop changes
  useEffect(() => {
    if (simulatedOtp) {
      setLatestSimulatedOtp(simulatedOtp);
    }
  }, [simulatedOtp]);

  // 60-second timer countdown
  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(60);
    setDigits(['', '', '', '', '', '']);
    setErrorMessage('');

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-focus first input on open
  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (val && !/^[0-9]$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setErrorMessage('');

    // Advance focus
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    const fullOtp = newDigits.join('');
    if (fullOtp.length === 6) {
      handleVerify(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    if (pasted.length === 6) {
      handleVerify(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleVerify = async (otpToVerify?: string) => {
    const fullOtp = otpToVerify || digits.join('');
    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');
    const res = await onVerify(fullOtp);
    setIsVerifying(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Invalid OTP. Please check and try again.');
    }
  };

  const handleResendClick = async () => {
    if (secondsLeft > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage('');
    const res = await onResend();
    setIsResending(false);

    if (res.success) {
      setSecondsLeft(60);
      setDigits(['', '', '', '', '', '']);
      if (res.simulatedOtp) {
        setLatestSimulatedOtp(res.simulatedOtp);
      }
      inputRefs.current[0]?.focus();
    } else {
      setErrorMessage(res.error || 'Could not resend OTP. Please try again.');
    }
  };

  // Mask phone number for display (+91 98765 XXXXX)
  const maskedPhone = phone.length >= 10
    ? `${phone.slice(0, phone.length - 5)} XXXXX`
    : phone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Verify Your Mobile Number
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Enter the 6-digit OTP sent to <span className="font-semibold text-slate-800">{maskedPhone}</span>
          </p>
        </div>

        {/* Development simulated SMS preview callout */}
        {latestSimulatedOtp && (
          <div className="mt-4 p-3 bg-teal-50/80 border border-teal-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold text-teal-900">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Simulated SMS Provider</span>
              </span>
              <span className="text-[10px] text-teal-700 bg-teal-200/60 px-1.5 py-0.5 rounded font-mono">
                OTP: {latestSimulatedOtp}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              [VM-AARGYA] {latestSimulatedOtp} is your Aarogya Clinic verification OTP. Valid for 10 minutes.
            </p>
            <button
              onClick={() => {
                const otpArr = latestSimulatedOtp.split('');
                setDigits(otpArr);
                handleVerify(latestSimulatedOtp);
              }}
              className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold underline pt-0.5 block"
            >
              Click to Auto-Fill & Verify OTP ({latestSimulatedOtp})
            </button>
          </div>
        )}

        {/* 6 Digit Inputs */}
        <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={el => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleDigitChange(idx, e.target.value)}
              onKeyDown={e => handleKeyDown(idx, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none transition-all tabular-nums text-slate-800"
            />
          ))}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resend OTP Timer & Button */}
        <div className="mt-5 text-center">
          {secondsLeft > 0 ? (
            <p className="text-xs text-slate-500 font-medium">
              Resend OTP in <span className="font-semibold text-slate-800 tabular-nums">{secondsLeft}</span> seconds
            </p>
          ) : (
            <button
              onClick={handleResendClick}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>Resend OTP</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || digits.join('').length !== 6}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Verify & Proceed</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
