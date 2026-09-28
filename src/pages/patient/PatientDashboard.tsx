import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import {
  formatDateDDMMYYYY,
  formatINR,
  generateWhatsAppLink,
  generateWhatsAppMessage
} from '../../utils/india';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  Activity,
  FileText,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';

interface PatientDashboardProps {
  onNavigate: (tab: string, param?: string) => void;
  onOpenReschedule: (appointment: Appointment) => void;
  onOpenCancel: (appointment: Appointment) => void;
  onOpenDetails: (appointment: Appointment) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigate,
  onOpenReschedule,
  onOpenCancel,
  onOpenDetails
}) => {
  const { user, profile } = useAuth();
  const { myAppointments, clinicSettings } = useClinic();

  const patientName = user?.fullName || 'Patient';

  const upcomingList = myAppointments.filter(
    a => a.status === 'confirmed' || a.status === 'rescheduled'
  );
  const completedList = myAppointments.filter(a => a.status === 'completed');
  const cancelledList = myAppointments.filter(a => a.status === 'cancelled');

  const nextUpcoming = upcomingList[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
            Patient Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {patientName}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Manage your consultations, access clinical prescriptions, update your medical history, and receive WhatsApp notifications.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('book')}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Upcoming Appointments
          </span>
          <p className="text-2xl font-bold text-teal-700 tabular-nums">
            {upcomingList.length}
          </p>
          <span className="text-[11px] text-slate-400">Scheduled consultations</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Completed Appointments
          </span>
          <p className="text-2xl font-bold text-emerald-700 tabular-nums">
            {completedList.length}
          </p>
          <span className="text-[11px] text-slate-400">Past doctor visits</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Cancelled Appointments
          </span>
          <p className="text-2xl font-bold text-slate-600 tabular-nums">
            {cancelledList.length}
          </p>
          <span className="text-[11px] text-slate-400">Rescheduled or voided</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Appointments
          </span>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">
            {myAppointments.length}
          </p>
          <span className="text-[11px] text-slate-400">Lifetime clinic visits</span>
        </div>
      </div>

      {/* Next Upcoming Appointment Highlight Card */}
      {nextUpcoming ? (
        <div className="bg-white rounded-2xl border border-teal-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 block">
                Next Scheduled Consultation
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                Dr. {nextUpcoming.doctorName}
              </h3>
              <p className="text-xs text-slate-500">{nextUpcoming.doctorSpecialization}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-lg text-xs font-semibold">
                Status: {nextUpcoming.status === 'rescheduled' ? 'Rescheduled' : 'Confirmed'}
              </span>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-mono">
                {nextUpcoming.appointmentNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Appointment Date</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>{formatDateDDMMYYYY(nextUpcoming.appointmentDate)}</span>
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Time Slot (IST)</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span className="tabular-nums">{nextUpcoming.appointmentTime}</span>
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Consultation Type</span>
              <span className="font-bold text-slate-900 mt-0.5 capitalize">
                {nextUpcoming.consultationType === 'online' ? 'Online Video' : 'In-Clinic'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Consultation Fee</span>
              <span className="font-bold text-slate-900 mt-0.5 tabular-nums">
                {formatINR(nextUpcoming.consultationFee)} ({nextUpcoming.paymentStatus})
              </span>
            </div>
          </div>

          {/* Action Buttons: View, Reschedule, Cancel, WhatsApp */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onOpenDetails(nextUpcoming)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              View Details
            </button>

            <button
              onClick={() => onOpenReschedule(nextUpcoming)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Reschedule Slot
            </button>

            <button
              onClick={() => onOpenCancel(nextUpcoming)}
              className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel Appointment
            </button>

            <a
              href={generateWhatsAppLink(
                nextUpcoming.patientPhone,
                generateWhatsAppMessage(nextUpcoming, clinicSettings || ({} as any))
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Details</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Upcoming Appointments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not have any pending doctor visits scheduled. Book an appointment online with one of our specialists.
          </p>
          <button
            onClick={() => onNavigate('book')}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold"
          >
            Book Appointment
          </button>
        </div>
      )}

      {/* Quick Navigation to Profile & Medical Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-600" />
              <span>My Profile & Address</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintain your Indian address, emergency contacts, and contact numbers.
            </p>
            <p className="text-xs text-slate-700 font-medium pt-1">
              {profile?.city || 'Pune'}, {profile?.state || 'Maharashtra'} - {profile?.pincode || '411004'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('patient-profile')}
            className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Edit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Medical Information</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Blood group, known allergies, chronic conditions, and current medications.
            </p>
            <p className="text-xs text-slate-700 font-medium pt-1">
              Blood Group: <strong className="text-teal-800">{profile?.bloodGroup || 'Not specified'}</strong>
            </p>
          </div>
          <button
            onClick={() => onNavigate('patient-profile')}
            className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Update</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
