import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatINR } from '../../utils/india';
import {
  Clock,
  Shield,
  Languages,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Award,
  Stethoscope
} from 'lucide-react';

interface DoctorProfilePageProps {
  doctorId: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const DoctorProfilePage: React.FC<DoctorProfilePageProps> = ({ doctorId, onNavigate }) => {
  const { doctors, clinicSettings } = useClinic();

  const doctor = doctors.find(d => d.id === doctorId) || doctors[0];

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-semibold text-slate-700">Doctor not found.</p>
        <button
          onClick={() => onNavigate('doctors')}
          className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('doctors')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Doctors</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Avatar */}
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
              <img
                src={doctor.avatarUrl}
                alt={doctor.fullName}
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-4 w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Standard Consultation Fee
              </span>
              <p className="text-2xl font-extrabold text-teal-800 tabular-nums">
                {formatINR(doctor.consultationFee)}
              </p>
              <p className="text-[11px] text-slate-500">Per in-clinic or online consultation</p>
            </div>
          </div>

          {/* Core Info */}
          <div className="md:col-span-8 space-y-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-teal-800">Verified Medical Consultant</span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  <span>Reg: {doctor.councilRegNumber}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {doctor.fullName}
              </h1>
              <p className="text-sm font-semibold text-teal-700 mt-1">
                {doctor.qualification}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                {doctor.specialization}
              </p>
            </div>

            {/* Quick Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-slate-100 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Experience</span>
                <span className="font-bold text-slate-900">{doctor.experienceYears} Years</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Languages Spoken</span>
                <span className="font-bold text-slate-900">{doctor.languages.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Chamber</span>
                <span className="font-bold text-slate-900">{doctor.clinicRoom}</span>
              </div>
            </div>

            {/* About */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                About Dr. {doctor.fullName.split(' ')[1] || doctor.fullName}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {doctor.about}
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                onClick={() => onNavigate('book', doctor.id)}
                className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment With {doctor.fullName}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expertise & Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Areas of Expertise */}
        <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Clinical Focus & Expertise</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Specialized in evidence-based protocols, continuous monitoring, and tailored therapeutic outcomes:
          </p>
          <div className="space-y-2.5">
            {doctor.expertise.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule & Availability in IST */}
        <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Weekly Consultation Hours (IST)</h3>
            </div>
            <span className="text-[11px] text-slate-400">Asia/Kolkata</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {doctor.schedule.map((sch, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <span className="font-semibold text-slate-800 w-28">{sch.dayOfWeek}</span>
                {sch.isWorking ? (
                  <span className="text-slate-600 tabular-nums font-medium">
                    {sch.startTime} – {sch.endTime} (Break: {sch.breakStartTime} – {sch.breakEndTime})
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Weekly Off</span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <strong>Location:</strong> {clinicSettings?.name || 'Aarogya Clinic'}, {clinicSettings?.addressStreet || 'FC Road'}, {clinicSettings?.city || 'Pune'}, {clinicSettings?.state || 'Maharashtra'}.
          </div>
        </div>
      </div>
    </div>
  );
};
