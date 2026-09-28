import React, { useState } from 'react';
import { Appointment } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  formatDateDDMMYYYY,
  formatINR,
  generateWhatsAppLink
} from '../../utils/india';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Copy,
  Printer,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface ConfirmationPageProps {
  appointment: Appointment;
  whatsappMessage: string;
  onNavigate: (tab: string) => void;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  appointment,
  whatsappMessage,
  onNavigate
}) => {
  const { clinicSettings } = useClinic();
  const [copied, setCopied] = useState(false);

  const settings = clinicSettings || {
    name: 'Aarogya Multi-Speciality Clinic & Diagnostic Centre',
    phone: '+91 9876543210',
    addressFlat: 'Shop 104-106, 1st Floor',
    addressBuilding: 'Shivaji Commercial Complex',
    addressStreet: 'Fergusson College Road, Shivajinagar',
    addressArea: 'Deccan Gymkhana',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411004'
  };

  const clinicFullAddress = `${settings.addressFlat}, ${settings.addressBuilding}, ${settings.addressStreet}, ${settings.addressArea}, ${settings.city}, ${settings.state} - ${settings.pincode}`;

  const whatsappUrl = generateWhatsAppLink(
    appointment.patientPhone,
    whatsappMessage
  );

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-teal-100/80 border border-teal-200 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-2 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-10 h-10 text-teal-600" />
        </div>
        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block">
          Booking Confirmed
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Appointment Booked Successfully
        </h1>
        <p className="text-xs text-slate-500">
          Your appointment is scheduled with Dr. {appointment.doctorName}. A confirmation has been logged.
        </p>
      </div>

      {/* Main Appointment Slip Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden print:border-none print:shadow-none">
        {/* Slip Top Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-teal-400 font-semibold block uppercase tracking-wider">
              Aarogya Multi-Speciality Clinic
            </span>
            <p className="text-sm font-bold mt-0.5">Outpatient Appointment Slip</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase">Appointment ID</span>
            <span className="text-sm font-mono font-bold text-white tracking-wider">
              {appointment.appointmentNumber}
            </span>
          </div>
        </div>

        {/* Slip Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 block">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{appointment.patientName}</span>
              <p className="text-[11px] text-slate-500 mt-0.5">{appointment.patientPhone}</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Consulting Doctor</span>
              <span className="font-bold text-slate-900 text-sm">Dr. {appointment.doctorName}</span>
              <p className="text-[11px] text-teal-700 font-medium">{appointment.doctorSpecialization}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 block">Date (IST)</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                <span>{formatDateDDMMYYYY(appointment.appointmentDate)}</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Time Slot (IST)</span>
              <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span className="tabular-nums">{appointment.appointmentTime}</span>
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Consultation Type</span>
              <span className="font-bold text-slate-900 mt-0.5 capitalize">
                {appointment.consultationType === 'online' ? 'Online Video' : 'In-Clinic'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 block">Clinic Address</span>
            <p className="font-medium text-slate-800 leading-relaxed">
              {clinicFullAddress}
            </p>
            <p className="text-[11px] text-slate-500">Contact: {settings.phone}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200 text-xs">
            <span>Consultation Fee:</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              {formatINR(appointment.consultationFee)} ({appointment.paymentStatus === 'paid' ? 'Paid Online' : 'Pay at Clinic'})
            </span>
          </div>
        </div>

        {/* WhatsApp Notification Card */}
        <div className="bg-emerald-50/70 border-t border-emerald-100 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>WhatsApp Appointment Message</span>
            </span>
            <button
              onClick={handleCopyMessage}
              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <pre className="p-3 bg-white rounded-lg border border-emerald-200 text-[11px] text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
            {whatsappMessage}
          </pre>

          {/* Action button: Send Appointment Details on WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Appointment Details on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Auxiliary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Slip</span>
        </button>

        <button
          onClick={() => onNavigate('patient-dashboard')}
          className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Go to Patient Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
