import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  validateIndianMobile,
  validateIndianPincode,
  checkPasswordStrength,
  INDIAN_STATES
} from '../../utils/india';
import { OtpModal } from '../../components/common/OtpModal';
import { Shield, Check, X, AlertCircle, ArrowRight } from 'lucide-react';

interface SignupPageProps {
  onNavigate: (tab: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signup, verifyOtp, resendOtp } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'Male',
    addressFlat: '',
    addressStreet: '',
    addressArea: '',
    addressLandmark: '',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    termsAccepted: false,
    privacyAccepted: false
  });

  const [error, setError] = useState<string>('');
  const [duplicateUser, setDuplicateUser] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');

  const passwordCheck = checkPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDuplicateUser(false);

    // Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validateIndianMobile(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (+91).');
      return;
    }

    if (!passwordCheck.isValid) {
      setError('Password must contain at least 6 characters, including a letter, number and special character.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.pincode && !validateIndianPincode(formData.pincode)) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!formData.termsAccepted || !formData.privacyAccepted) {
      setError('Please accept both the Terms & Conditions and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    const res = await signup(formData);
    setIsSubmitting(false);

    if (res.userExists) {
      setDuplicateUser(true);
      setError('User already exists. Please login.');
      return;
    }

    if (!res.success) {
      setError(res.error || 'Registration failed. Please check your details.');
      return;
    }

    // Success -> Trigger OTP verification modal
    setPendingPhone(res.phone || formData.phone);
    setSimulatedOtp(res.simulatedOtp || '');
    setShowOtpModal(true);
  };

  const handleOtpVerify = async (otp: string) => {
    const res = await verifyOtp(pendingPhone, otp);
    if (res.success) {
      setShowOtpModal(false);
      onNavigate('patient-dashboard');
    }
    return res;
  };

  const handleOtpResend = async () => {
    return await resendOtp(pendingPhone);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Title */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-teal-50 border border-teal-200 rounded-xl text-teal-700 flex items-center justify-center mx-auto mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Patient Account
          </h1>
          <p className="text-xs text-slate-500">
            Sign up for instant appointment booking, WhatsApp reminders, and secure digital health records.
          </p>
        </div>

        {/* Duplicate User Callout */}
        {duplicateUser && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold">User already exists. Please login.</span>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
            >
              Login Now
            </button>
          </div>
        )}

        {/* General Error Banner */}
        {error && !duplicateUser && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Account & Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b border-slate-100 pb-2">
              1. Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Ramanathan"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Indian Mobile Number *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-2.5 text-xs text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-xs rounded-r-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none bg-white text-slate-800"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Password Security */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b border-slate-100 pb-2">
              2. Password & Security
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="e.g. Abc@12"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>
            </div>

            {/* Live Password Requirements Checklist */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Password Requirements
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={`flex items-center gap-1.5 ${passwordCheck.hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {passwordCheck.hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 text-center leading-none text-slate-400">·</span>}
                  <span>Minimum 6 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCheck.hasLetter ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {passwordCheck.hasLetter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 text-center leading-none text-slate-400">·</span>}
                  <span>Contains a letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCheck.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {passwordCheck.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 text-center leading-none text-slate-400">·</span>}
                  <span>Contains a number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordCheck.hasSpecialChar ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  {passwordCheck.hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="w-3.5 h-3.5 text-center leading-none text-slate-400">·</span>}
                  <span>Contains a special character</span>
                </div>
              </div>

              {formData.confirmPassword && (
                <div className="pt-1 text-[11px]">
                  {passwordsMatch ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <X className="w-3.5 h-3.5" /> Passwords do not match.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section: Indian Address System */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b border-slate-100 pb-2">
              3. Indian Address System
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  House / Flat Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, B-Wing"
                  value={formData.addressFlat}
                  onChange={e => setFormData({ ...formData, addressFlat: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Building / Street Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mayur Residency, DP Road"
                  value={formData.addressStreet}
                  onChange={e => setFormData({ ...formData, addressStreet: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kothrud"
                  value={formData.addressArea}
                  onChange={e => setFormData({ ...formData, addressArea: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near City Pride Theatre"
                  value={formData.addressLandmark}
                  onChange={e => setFormData({ ...formData, addressLandmark: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none bg-white text-slate-800"
                >
                  {INDIAN_STATES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PIN Code (6 Digits)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="411038"
                  value={formData.pincode}
                  onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Section: Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 border-b border-slate-100 pb-2">
              4. Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kavita Ramanathan (Spouse)"
                  value={formData.emergencyContactName}
                  onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Phone (+91)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9822099999"
                  value={formData.emergencyContactPhone}
                  onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Legal Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.termsAccepted}
                onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <span>
                I agree to the <button type="button" onClick={() => onNavigate('terms')} className="text-teal-700 underline font-medium">Terms & Conditions</button> of Aarogya Clinic.
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.privacyAccepted}
                onChange={e => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
              />
              <span>
                I consent to digital healthcare communication and record management under the <button type="button" onClick={() => onNavigate('privacy')} className="text-teal-700 underline font-medium">Privacy Policy (India DPDP Act)</button>.
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Validating...' : 'Verify Mobile & Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-teal-700 font-semibold hover:underline"
            >
              Login here
            </button>
          </div>
        </form>
      </div>

      {/* OTP Verification Modal */}
      <OtpModal
        isOpen={showOtpModal}
        phone={pendingPhone}
        simulatedOtp={simulatedOtp}
        purpose="signup"
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        onClose={() => setShowOtpModal(false)}
      />
    </div>
  );
};
