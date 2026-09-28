import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkPasswordStrength } from '../../utils/india';
import { OtpModal } from '../../components/common/OtpModal';
import { KeyRound, ArrowRight, CheckCircle2, AlertCircle, Check, X } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigate: (tab: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { forgotPasswordRequest, forgotPasswordReset, verifyOtp, resendOtp } = useAuth();

  const [step, setStep] = useState<'request' | 'otp' | 'new_password' | 'success'>('request');
  const [identifier, setIdentifier] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const pwdCheck = checkPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or +91 mobile number.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const res = await forgotPasswordRequest(identifier);
    setIsSubmitting(false);

    if (res.success) {
      setTargetPhone(res.phone || identifier);
      setSimulatedOtp(res.simulatedOtp || '');
      setShowOtpModal(true);
    } else {
      setError(res.error || 'Failed to request OTP. Please check your credentials.');
    }
  };

  const handleOtpVerify = async (otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: targetPhone, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid OTP' };
      }
      setResetToken(data.resetToken);
      setShowOtpModal(false);
      setStep('new_password');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const handleOtpResend = async () => {
    return await resendOtp(targetPhone);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdCheck.isValid) {
      setError('Password must contain at least 6 characters, including a letter, number and special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    const res = await forgotPasswordReset(targetPhone, resetToken, newPassword, confirmPassword);
    setIsSubmitting(false);

    if (res.success) {
      setStep('success');
    } else {
      setError(res.error || 'Could not reset password.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-teal-50 border border-teal-200 rounded-xl text-teal-700 flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Securely recover your Aarogya Clinic account
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registered Email ID or +91 Mobile
              </label>
              <input
                type="text"
                required
                placeholder="e.g. rajesh.raman@gmail.com or 9822012345"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                We will send a 6-digit verification code to your registered Indian mobile number.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending OTP...' : 'Send 6-Digit OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 'new_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                placeholder="e.g. NewPass@99"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
              />
            </div>

            {/* Checklist */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Password Requirements
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className={`flex items-center gap-1 ${pwdCheck.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {pwdCheck.hasMinLength ? <Check className="w-3 h-3 text-emerald-600" /> : '·'} Min 6 chars
                </div>
                <div className={`flex items-center gap-1 ${pwdCheck.hasLetter ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {pwdCheck.hasLetter ? <Check className="w-3 h-3 text-emerald-600" /> : '·'} Contains letter
                </div>
                <div className={`flex items-center gap-1 ${pwdCheck.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {pwdCheck.hasNumber ? <Check className="w-3 h-3 text-emerald-600" /> : '·'} Contains number
                </div>
                <div className={`flex items-center gap-1 ${pwdCheck.hasSpecialChar ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {pwdCheck.hasSpecialChar ? <Check className="w-3 h-3 text-emerald-600" /> : '·'} Special character
                </div>
              </div>

              {confirmPassword && (
                <div className="pt-1 text-[11px]">
                  {passwordsMatch ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <X className="w-3 h-3" /> Passwords do not match.
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Password changed successfully. Please login.
              </h3>
              <p className="text-xs text-slate-500">
                Your account password has been updated. You can now login with your new credentials.
              </p>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              Login Now
            </button>
          </div>
        )}

        <div className="pt-2 text-center text-xs text-slate-500">
          <button
            onClick={() => onNavigate('login')}
            className="text-teal-700 hover:underline font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>

      <OtpModal
        isOpen={showOtpModal}
        phone={targetPhone}
        simulatedOtp={simulatedOtp}
        purpose="forgot_password"
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        onClose={() => setShowOtpModal(false)}
      />
    </div>
  );
};
