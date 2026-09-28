import React, { useState, useEffect } from 'react';
import { Appointment } from '../../types';
import { useClinic } from '../../context/ClinicContext';
import {
  formatDateDDMMYYYY,
  formatINR,
  getCurrentISTDateString,
  generateWhatsAppLink,
  generateWhatsAppMessage
} from '../../utils/india';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Building,
  Video,
  ExternalLink
} from 'lucide-react';

interface RescheduleModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onSuccess
}) => {
  const { fetchAvailableSlots, updateAppointmentStatus } = useClinic();
  const todayIST = getCurrentISTDateString();

  const [newDate, setNewDate] = useState<string>(todayIST);
  const [newTime, setNewTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !appointment) return;
    setNewDate(appointment.appointmentDate >= todayIST ? appointment.appointmentDate : todayIST);
    setNewTime('');
    setError('');
  }, [isOpen, appointment]);

  useEffect(() => {
    if (!appointment || !newDate) return;
    let isMounted = true;
    async function load() {
      setIsLoadingSlots(true);
      const res = await fetchAvailableSlots(appointment!.doctorId, newDate);
      if (isMounted) {
        setAvailableSlots(res.availableSlots);
        setIsLoadingSlots(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [newDate, appointment]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) {
      setError('Please choose a new date and available time slot.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const res = await updateAppointmentStatus(appointment.id, 'rescheduled', {
      newDate,
      newTime
    });
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to reschedule.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 relative space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Reschedule Appointment</h3>
            <p className="text-xs text-slate-500">ID: {appointment.appointmentNumber}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p><strong>Doctor:</strong> Dr. {appointment.doctorName} ({appointment.doctorSpecialization})</p>
            <p><strong>Current:</strong> {formatDateDDMMYYYY(appointment.appointmentDate)} at {appointment.appointmentTime}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select New Date (IST)
            </label>
            <input
              type="date"
              min={todayIST}
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">
              Select New Slot (IST)
            </label>
            {isLoadingSlots ? (
              <p className="text-slate-500 py-3">Loading available doctor slots...</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200">
                No slots open for this date. Please pick another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setNewTime(slot)}
                    className={`py-2 px-1 text-center rounded-lg font-semibold tabular-nums transition-colors ${
                      newTime === slot
                        ? 'bg-teal-600 text-white shadow'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newTime}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface CancelModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  appointment,
  onClose,
  onSuccess
}) => {
  const { updateAppointmentStatus } = useClinic();
  const [reason, setReason] = useState('Patient personal conflict / rescheduling later');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !appointment) return null;

  const handleCancel = async () => {
    setError('');
    setIsSubmitting(true);
    const res = await updateAppointmentStatus(appointment.id, 'cancelled', { reason });
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Failed to cancel appointment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 relative space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Cancel Appointment?</h3>
            <p className="text-xs text-slate-500">ID: {appointment.appointmentNumber}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <p><strong>Doctor:</strong> Dr. {appointment.doctorName}</p>
          <p><strong>Schedule:</strong> {formatDateDDMMYYYY(appointment.appointmentDate)} at {appointment.appointmentTime}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason for Cancellation
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-rose-600 outline-none text-slate-800"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Keep Appointment
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow disabled:opacity-50"
          >
            {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  appointment,
  onClose
}) => {
  const { clinicSettings } = useClinic();
  if (!isOpen || !appointment) return null;

  const whatsappMsg = generateWhatsAppMessage(appointment, clinicSettings || ({} as any));
  const whatsappUrl = generateWhatsAppLink(appointment.patientPhone, whatsappMsg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 relative space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
              Appointment Details
            </span>
            <h3 className="text-base font-bold text-slate-900 font-mono">
              {appointment.appointmentNumber}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 block">Doctor</span>
              <span className="font-bold text-slate-900 text-sm">Dr. {appointment.doctorName}</span>
              <p className="text-[11px] text-teal-700">{appointment.doctorSpecialization}</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Patient</span>
              <span className="font-bold text-slate-900 text-sm">{appointment.patientName}</span>
              <p className="text-[11px] text-slate-500">{appointment.patientPhone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Date</span>
              <span className="font-semibold text-slate-900">{formatDateDDMMYYYY(appointment.appointmentDate)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Time</span>
              <span className="font-semibold text-slate-900 tabular-nums">{appointment.appointmentTime}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Status</span>
              <span className="font-semibold text-teal-800 capitalize">{appointment.status}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 block text-[11px]">Mode & Fee</span>
            <p className="font-medium text-slate-800 capitalize">
              {appointment.consultationType === 'online' ? 'Online Video Consultation' : 'In-Clinic (Pune)'} · {formatINR(appointment.consultationFee)} ({appointment.paymentStatus})
            </p>
            {appointment.consultationType === 'online' && (
              <a
                href={appointment.onlineMeetingUrl || 'https://meet.google.com/aar-ogya-doc'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 underline flex items-center gap-1 font-semibold pt-1"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Video Room (Google Meet)</span>
              </a>
            )}
          </div>

          {appointment.doctorPrescriptionNotes && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-emerald-900 font-bold block text-[11px]">Doctor Clinical Prescription Notes</span>
              <p className="text-slate-700 whitespace-pre-wrap">{appointment.doctorPrescriptionNotes}</p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
