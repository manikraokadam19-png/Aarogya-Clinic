import React from 'react';
import { ShieldCheck, FileText, ArrowLeft } from 'lucide-react';

interface LegalPagesProps {
  type: 'privacy' | 'terms';
  onNavigate: (tab: string) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ type, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
        {type === 'privacy' ? (
          <>
            <div className="border-b border-slate-200 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>India DPDP Act (2023) Aligned</span>
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Privacy Policy & Health Data Protection
              </h1>
              <p className="text-slate-500 mt-0.5 text-xs">
                Aarogya Multi-Speciality Clinic · Last Updated: September 2026
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">1. Data Fiduciary & Scope</h3>
              <p>
                Aarogya Multi-Speciality Clinic & Diagnostic Centre operates as the Data Fiduciary in accordance with India Digital Personal Data Protection (DPDP) Act, 2023. This policy governs how patient health information, identification credentials, and consultation records are handled.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">2. Categories of Information Collected</h3>
              <p>
                We only collect digital health information strictly necessary for clinical care:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Personal Identity: Full Name, Date of Birth, Gender, Emergency Contact.</li>
                <li>Contact & Address: Verified +91 Indian Mobile Number, Email, Postal PIN code, and Indian address.</li>
                <li>Medical Information: Symptoms, Chief Complaints, Allergies, Blood Group, Past Medical History, and Consultation Notes.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">3. Purpose of Processing & WhatsApp Communications</h3>
              <p>
                Your phone number is utilized for appointment scheduling, 6-digit OTP verification, automated WhatsApp booking confirmations, reminder notifications, and doctor prescription delivery. We do not sell or monetize patient data to third-party pharmaceutical advertisers.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">4. Data Principal Rights & Erasure</h3>
              <p>
                As a patient, you retain the right to access your stored medical records, request corrections to your profile, and request account deactivation subject to mandatory Indian medical record retention regulations.
              </p>
            </section>
          </>
        ) : (
          <>
            <div className="border-b border-slate-200 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1 mb-1">
                <FileText className="w-4 h-4" />
                <span>Clinical Governance & Terms</span>
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Terms & Conditions of Service
              </h1>
              <p className="text-slate-500 mt-0.5 text-xs">
                Aarogya Multi-Speciality Clinic · Pune, Maharashtra
              </p>
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">1. Appointment Booking & Punctuality</h3>
              <p>
                Appointment slots are allocated in 30-minute intervals in Indian Standard Time (IST). Patients are requested to report to the clinic reception 10 minutes prior to the booked time slot. For online video consultations, ensure a stable internet connection.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">2. Consultation Fees & Payment</h3>
              <p>
                All consultation and diagnostic charges are displayed in Indian Rupees (₹ / INR). Payments may be rendered via UPI, Cards, Net Banking, or at the clinic counter. In the event of emergency doctor leave, 100% refund or priority rescheduling is provided.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">3. Emergency Situations</h3>
              <p>
                Our outpatient online scheduling portal is designed for planned consultations. For acute medical emergencies, chest pain, stroke symptoms, or severe trauma, please immediately call our 24x7 Emergency Helpline (+91 98765 00000) or visit the nearest emergency trauma room.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
