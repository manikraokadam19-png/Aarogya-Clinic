import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment } from '../../types';
import {
  formatDateDDMMYYYY,
  formatINR,
  generateWhatsAppLink,
  generateWhatsAppMessage
} from '../../utils/india';
import {
  Calendar,
  Clock,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Plus
} from 'lucide-react';

interface MyAppointmentsPageProps {
  onNavigate: (tab: string, param?: string) => void;
  onOpenReschedule: (appointment: Appointment) => void;
  onOpenCancel: (appointment: Appointment) => void;
  onOpenDetails: (appointment: Appointment) => void;
}

export const MyAppointmentsPage: React.FC<MyAppointmentsPageProps> = ({
  onNavigate,
  onOpenReschedule,
  onOpenCancel,
  onOpenDetails
}) => {
  const { myAppointments, clinicSettings } = useClinic();
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

  const filtered = myAppointments.filter(apt => {
    const matchesFilter = filter === 'all'
      ? true
      : filter === 'confirmed'
      ? (apt.status === 'confirmed' || apt.status === 'rescheduled')
      : apt.status === filter;

    const matchesSearch = apt.doctorName.toLowerCase().includes(search.toLowerCase()) ||
                          apt.doctorSpecialization.toLowerCase().includes(search.toLowerCase()) ||
                          apt.appointmentNumber.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Consultation History
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
            My Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View upcoming consultations, past prescriptions, and WhatsApp reminders.
          </p>
        </div>

        <button
          onClick={() => onNavigate('book')}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor name, specialization, or appointment ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:border-teal-600 outline-none text-slate-800"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1">
          {(['all', 'confirmed', 'completed', 'cancelled'] as const).map(statusKey => (
            <button
              key={statusKey}
              onClick={() => setFilter(statusKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === statusKey
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {statusKey === 'confirmed' ? 'Upcoming' : statusKey}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(apt => {
            const isUpcoming = apt.status === 'confirmed' || apt.status === 'rescheduled';
            const isCompleted = apt.status === 'completed';
            const isCancelled = apt.status === 'cancelled';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                      Dr
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Dr. {apt.doctorName}</h3>
                      <p className="text-xs text-teal-700 font-medium">{apt.doctorSpecialization}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                      isUpcoming ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                      isCompleted ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {apt.status}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {apt.appointmentNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Appointment Date (IST)</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{formatDateDDMMYYYY(apt.appointmentDate)}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Slot Time (IST)</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span className="tabular-nums">{apt.appointmentTime}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Consultation Mode</span>
                    <span className="font-semibold text-slate-800 mt-0.5 capitalize block">
                      {apt.consultationType === 'online' ? 'Online Video' : 'In-Clinic (Pune)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Fee & Status</span>
                    <span className="font-semibold text-slate-800 mt-0.5 tabular-nums block">
                      {formatINR(apt.consultationFee)} ({apt.paymentStatus})
                    </span>
                  </div>
                </div>

                {apt.reason && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong>Reason:</strong> {apt.reason}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onOpenDetails(apt)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    View Details
                  </button>

                  {isUpcoming && (
                    <>
                      <button
                        onClick={() => onOpenReschedule(apt)}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition-colors"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => onOpenCancel(apt)}
                        className="px-3.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  <a
                    href={generateWhatsAppLink(
                      apt.patientPhone,
                      generateWhatsAppMessage(apt, clinicSettings || ({} as any))
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-1 ml-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
            <p className="text-xs text-slate-500">
              There are no appointments matching your current filter.
            </p>
            <button
              onClick={() => onNavigate('book')}
              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
            >
              Book an Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
