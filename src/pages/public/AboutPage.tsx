import React from 'react';
import { ShieldCheck, Heart, Award, Users, CheckCircle2 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { clinicSettings } = useClinic();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Our Heritage & Ethos
        </span>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
          About Aarogya Multi-Speciality Clinic
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Pioneering patient-centric healthcare, evidence-based clinical practices, and accessible specialist consultations in Pune since 2011.
        </p>
      </div>

      {/* Main Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">
            Founded On The Principles of Compassion & Medical Integrity
          </h2>
          <p>
            Aarogya Clinic was established by senior physicians with a single guiding mission: to bring world-class outpatient consultations and diagnostic accuracy into the heart of Pune without the long queues and impersonal feel of giant commercial hospitals.
          </p>
          <p>
            Over the last 14 years, our clinical team has grown to encompass general medicine, interventional cardiology, pediatrics, orthopedics, gynecology, and clinical dermatology. We adhere strictly to National Accreditation Board for Hospitals & Healthcare Providers (NABH) outpatient quality benchmarks.
          </p>
          <div className="pt-2 grid grid-cols-2 gap-3">
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
              <span className="font-bold text-teal-900 text-sm block">100% Ethical</span>
              <span className="text-[11px] text-teal-700">No unnecessary tests or commercial prescription tie-ups.</span>
            </div>
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
              <span className="font-bold text-teal-900 text-sm block">Zero Waiting</span>
              <span className="text-[11px] text-teal-700">Strictly managed 30-min IST slot appointments.</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
          <img
            src="/src/assets/images/clinic_hero_facility_1790564902018.jpg"
            alt="Aarogya Clinic Facility Pune"
            className="w-full h-80 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Leadership & Medical Board */}
      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-bold text-slate-900">
          Medical Governance & Clinical Leadership
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Dr. Suresh Kulkarni</h3>
            <p className="text-xs text-teal-700 font-semibold">Medical Director (MBBS, MD)</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Former Head of Department at B.J. Medical College with 28 years of clinical governance leadership.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Dr. Rahul Sharma</h3>
            <p className="text-xs text-teal-700 font-semibold">Chief of Internal Medicine</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              MCI registered senior physician supervising daily outpatient operations and preventative health screenings.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Dr. Priya Patel</h3>
            <p className="text-xs text-teal-700 font-semibold">Head of Cardiovascular Sciences</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Overseeing non-invasive cardiac testing, digital ECG workflows, and early preventative lipid screening.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-slate-100 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Need to consult with one of our doctors?</h3>
          <p className="text-xs text-slate-600 mt-0.5">Appointments are open for this week in Pune.</p>
        </div>
        <button
          onClick={() => onNavigate('book')}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
        >
          Book Your Appointment
        </button>
      </div>
    </div>
  );
};
