import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_STATES, validateIndianPincode, validateIndianMobile } from '../../utils/india';
import { User, Activity, MapPin, Phone, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    pastMedicalHistory: '',
    addressFlat: '',
    addressStreet: '',
    addressArea: '',
    addressLandmark: '',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411004',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || 'Male',
        bloodGroup: profile.bloodGroup || 'B+',
        allergies: profile.allergies || '',
        chronicConditions: profile.chronicConditions || '',
        currentMedications: profile.currentMedications || '',
        pastMedicalHistory: profile.pastMedicalHistory || '',
        addressFlat: profile.addressFlat || '',
        addressStreet: profile.addressStreet || '',
        addressArea: profile.addressArea || '',
        addressLandmark: profile.addressLandmark || '',
        city: profile.city || 'Pune',
        district: profile.district || 'Pune',
        state: profile.state || 'Maharashtra',
        pincode: profile.pincode || '411004',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactPhone: profile.emergencyContactPhone || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.pincode && !validateIndianPincode(formData.pincode)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (formData.emergencyContactPhone && !validateIndianMobile(formData.emergencyContactPhone)) {
      setErrorMsg('Please enter a valid 10-digit emergency contact phone number.');
      return;
    }

    setIsSaving(true);
    const res = await updateProfile(formData as any);
    setIsSaving(false);

    if (res.success) {
      setSuccessMsg('Your profile and medical information have been securely updated.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Patient Account & Records
        </span>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
          My Profile & Medical Information
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Confidential health records protected under India DPDP Act compliance.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Account Card (Read Only identity) */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-[11px] text-slate-400 block">Registered Full Name</span>
          <span className="font-bold text-slate-900 text-sm">{user?.fullName}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Email Address</span>
          <span className="font-semibold text-slate-800">{user?.email}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Verified WhatsApp Mobile</span>
          <span className="font-semibold text-slate-800 tabular-nums">{user?.phone}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Medical Information */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Clinical & Medical Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group *
              </label>
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none bg-white text-slate-800"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none bg-white text-slate-800"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Known Drug / Food Allergies
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Penicillin, Sulfa drugs, Peanuts..."
                value={formData.allergies}
                onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chronic Medical Conditions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Type 2 Diabetes, Hypertension, Thyroid..."
                value={formData.chronicConditions}
                onChange={e => setFormData({ ...formData, chronicConditions: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Medications & Dosages
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Metformin 500mg, Telmisartan 40mg daily..."
                value={formData.currentMedications}
                onChange={e => setFormData({ ...formData, currentMedications: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Past Surgeries / Major Illness History
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Appendectomy in 2018, gallbladder surgery..."
                value={formData.pastMedicalHistory}
                onChange={e => setFormData({ ...formData, pastMedicalHistory: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Indian Address System */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Indian Address & Residence
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                House / Flat / Shop Number
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 402, B-Wing"
                value={formData.addressFlat}
                onChange={e => setFormData({ ...formData, addressFlat: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Building Name / Street
              </label>
              <input
                type="text"
                placeholder="e.g. Mayur Residency, DP Road"
                value={formData.addressStreet}
                onChange={e => setFormData({ ...formData, addressStreet: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
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
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
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
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
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
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State
              </label>
              <select
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none bg-white text-slate-800"
              >
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
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
                value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Phone className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Emergency Contact & Next of Kin
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact Name & Relation
              </label>
              <input
                type="text"
                placeholder="e.g. Kavita Ramanathan (Spouse)"
                value={formData.emergencyContactName}
                onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact Mobile (+91)
              </label>
              <input
                type="tel"
                maxLength={10}
                placeholder="9822099999"
                value={formData.emergencyContactPhone}
                onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800 tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
