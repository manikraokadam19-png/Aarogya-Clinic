import React, { useState, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import {
  getCurrentISTDateString,
  formatINR,
  validateIndianMobile,
  formatDateDDMMYYYY
} from '../../utils/india';
import {
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  MessageSquare,
  Building,
  Video
} from 'lucide-react';

interface BookAppointmentPageProps {
  initialDoctorId?: string;
  onNavigate: (tab: string, param?: string) => void;
  onBookingSuccess: (appointmentData: any, whatsappMsg: string) => void;
}

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  initialDoctorId,
  onNavigate,
  onBookingSuccess
}) => {
  const { doctors, clinicSettings, fetchAvailableSlots, bookAppointment } = useClinic();
  const { user, profile } = useAuth();

  const todayIST = getCurrentISTDateString();

  // Booking Flow Steps
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctorId || (doctors[0]?.id ?? '')
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayIST);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'in-clinic' | 'online'>('in-clinic');

  // Slot availability state
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isDoctorWorking, setIsDoctorWorking] = useState<boolean>(true);
  const [doctorOffMessage, setDoctorOffMessage] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Patient Details
  const [patientName, setPatientName] = useState(user?.fullName || profile?.emergencyContactName || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone?.replace(/\D/g, '').slice(-10) || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientGender, setPatientGender] = useState(profile?.gender || 'Male');
  const [patientDob, setPatientDob] = useState(profile?.dateOfBirth || '');
  const [reason, setReason] = useState('Routine health checkup / consultation');
  const [symptoms, setSymptoms] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pay_at_clinic' | 'online'>('pay_at_clinic');

  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialDoctorId ? 2 : 1);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  // Fetch available slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    let isMounted = true;
    async function loadSlots() {
      setIsLoadingSlots(true);
      setError('');
      const data = await fetchAvailableSlots(selectedDoctorId, selectedDate);
      if (isMounted) {
        setIsDoctorWorking(data.isDoctorWorking);
        setDoctorOffMessage(data.message || '');
        setAvailableSlots(data.availableSlots);
        setIsLoadingSlots(false);
        // Clear slot if currently selected slot is not in available slots
        if (selectedTimeSlot && !data.availableSlots.includes(selectedTimeSlot)) {
          setSelectedTimeSlot('');
        }
      }
    }
    loadSlots();
    return () => { isMounted = false; };
  }, [selectedDoctorId, selectedDate]);

  // Sync profile details if logged in
  useEffect(() => {
    if (user) {
      if (!patientName) setPatientName(user.fullName);
      if (!patientPhone) setPatientPhone(user.phone.replace(/\D/g, '').slice(-10));
      if (!patientEmail) setPatientEmail(user.email);
    }
  }, [user]);

  const handleProceedToDetails = () => {
    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }
    if (!selectedDate) {
      setError('Please choose an appointment date.');
      return;
    }
    if (!selectedTimeSlot) {
      setError('Please choose an available appointment time slot.');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleProceedToReview = () => {
    if (!patientName.trim()) {
      setError('Please enter patient full name.');
      return;
    }
    if (!validateIndianMobile(patientPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (+91).');
      return;
    }
    setError('');
    setStep(4);
  };

  const handleConfirmAppointment = async () => {
    setError('');
    setIsSubmitting(true);

    const bookingPayload = {
      doctorId: selectedDoctor.id,
      appointmentDate: selectedDate,
      appointmentTime: selectedTimeSlot,
      consultationType,
      patientName,
      patientPhone,
      patientEmail,
      patientGender,
      patientDob,
      reason,
      symptoms,
      paymentMethod
    };

    const res = await bookAppointment(bookingPayload);
    setIsSubmitting(false);

    if (res.success && res.appointment) {
      onBookingSuccess(res.appointment, res.whatsappMessage || '');
    } else {
      setError(res.error || 'Failed to book appointment. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Online Outpatient Booking
        </span>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
          Book Doctor Appointment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Instant slot confirmation in Indian Standard Time (IST) with WhatsApp communication.
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="grid grid-cols-4 gap-2 text-xs font-medium">
        <button
          onClick={() => setStep(1)}
          className={`py-2 px-3 rounded-lg border text-left transition-colors ${
            step === 1 ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600'
          }`}
        >
          <span className="block text-[10px] uppercase text-slate-400">Step 1</span>
          <span className="truncate block">1. Doctor</span>
        </button>

        <button
          onClick={() => selectedDoctor && setStep(2)}
          disabled={!selectedDoctor}
          className={`py-2 px-3 rounded-lg border text-left transition-colors ${
            step === 2 ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600'
          }`}
        >
          <span className="block text-[10px] uppercase text-slate-400">Step 2</span>
          <span className="truncate block">2. Date & Slot</span>
        </button>

        <button
          onClick={() => selectedTimeSlot && setStep(3)}
          disabled={!selectedTimeSlot}
          className={`py-2 px-3 rounded-lg border text-left transition-colors ${
            step === 3 ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600'
          }`}
        >
          <span className="block text-[10px] uppercase text-slate-400">Step 3</span>
          <span className="truncate block">3. Patient Info</span>
        </button>

        <button
          onClick={() => patientName && patientPhone && setStep(4)}
          disabled={!patientName || !patientPhone}
          className={`py-2 px-3 rounded-lg border text-left transition-colors ${
            step === 4 ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600'
          }`}
        >
          <span className="block text-[10px] uppercase text-slate-400">Step 4</span>
          <span className="truncate block">4. Confirm</span>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Select Doctor */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Select Consulting Doctor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doc => {
              const isSelected = doc.id === selectedDoctorId;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctorId(doc.id);
                    setStep(2);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 shadow-sm ring-1 ring-teal-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <img
                    src={doc.avatarUrl}
                    alt={doc.fullName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold text-slate-900">{doc.fullName}</h3>
                      <span className="text-xs font-bold text-teal-800 tabular-nums">
                        {formatINR(doc.consultationFee)}
                      </span>
                    </div>
                    <p className="text-xs text-teal-700 font-medium">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-500">{doc.experienceYears} Years Exp · {doc.languages.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Select Date & Slot */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Doctor Summary banner */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <img
                src={selectedDoctor.avatarUrl}
                alt={selectedDoctor.fullName}
                className="w-12 h-12 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedDoctor.fullName}</h3>
                <p className="text-xs text-slate-600">{selectedDoctor.specialization} · Fee: <strong className="tabular-nums">{formatINR(selectedDoctor.consultationFee)}</strong></p>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-teal-700 hover:underline font-semibold"
            >
              Change Doctor
            </button>
          </div>

          {/* Consultation Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Consultation Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConsultationType('in-clinic')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                  consultationType === 'in-clinic'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-1 ring-teal-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Building className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">In-Clinic Consultation</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Visit {clinicSettings?.addressStreet || 'FC Road Clinic'}, Chamber {selectedDoctor.clinicRoom}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConsultationType('online')}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                  consultationType === 'online'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-900 ring-1 ring-teal-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Video className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Online Video Consultation</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Secure Google Meet / Tele-health link sent on WhatsApp
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Date (IST: Asia/Kolkata)
              </label>
              <span className="text-[11px] text-slate-400">Past dates not permitted</span>
            </div>
            <input
              type="date"
              min={todayIST}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
            />
          </div>

          {/* Time Slot Picker */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Available Appointment Slots
              </label>
              <span className="text-xs text-teal-700 font-semibold">
                Selected: {selectedTimeSlot || 'None'}
              </span>
            </div>

            {isLoadingSlots ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Checking live slot availability...
              </div>
            ) : !isDoctorWorking ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                {doctorOffMessage || 'Doctor is not available on this date. Please pick another date.'}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                All slots are booked for this date. Please select another date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map(slot => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold tabular-nums text-center transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleProceedToDetails}
              disabled={!selectedTimeSlot}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>Continue to Patient Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Enter Patient Details */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Patient Details</h3>
            <span className="text-xs text-slate-500">
              {formatDateDDMMYYYY(selectedDate)} at {selectedTimeSlot}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Full Name *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh Ramanathan"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number (for WhatsApp Confirmation) *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-2.5 text-xs text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-xs rounded-r-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800 tabular-nums"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={patientEmail}
                onChange={e => setPatientEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={patientGender}
                onChange={e => setPatientGender(e.target.value as any)}
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
                value={patientDob}
                onChange={e => setPatientDob(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Consultation / Chief Complaint *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Persistent fever and throat irritation for 3 days"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Existing Medical Conditions / Current Medications (Optional)
            </label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="e.g. Hypertension on Telmisartan, or allergies to penicillin..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none text-slate-800"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleProceedToReview}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Review Appointment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Confirm */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Review Appointment Summary
            </h3>
            <p className="text-xs text-slate-500">
              Please double check all booking details before final confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                Doctor & Schedule
              </span>
              <div>
                <p className="font-bold text-slate-900 text-sm">{selectedDoctor.fullName}</p>
                <p className="text-slate-600">{selectedDoctor.specialization}</p>
              </div>
              <div className="space-y-1 text-slate-700">
                <p><strong>Date:</strong> {formatDateDDMMYYYY(selectedDate)} (IST)</p>
                <p><strong>Time:</strong> <span className="tabular-nums font-semibold">{selectedTimeSlot}</span></p>
                <p><strong>Type:</strong> {consultationType === 'online' ? 'Online Video Consultation' : 'In-Clinic Consultation'}</p>
                <p><strong>Location:</strong> {clinicSettings?.name}, {clinicSettings?.addressStreet}, Pune</p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                Patient & Payment
              </span>
              <div className="space-y-1 text-slate-700">
                <p><strong>Patient Name:</strong> {patientName}</p>
                <p><strong>WhatsApp Mobile:</strong> +91 {patientPhone}</p>
                {patientEmail && <p><strong>Email:</strong> {patientEmail}</p>}
                <p><strong>Reason:</strong> {reason}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Consultation Fee:</span>
                  <span className="text-base text-teal-800 tabular-nums">
                    {formatINR(selectedDoctor.consultationFee)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Payment Preference
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer text-xs ${
                paymentMethod === 'pay_at_clinic' ? 'border-teal-600 bg-teal-50/50 font-semibold' : 'border-slate-200'
              }`}>
                <span>Pay at Clinic Counter (Cash / UPI / Card)</span>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'pay_at_clinic'}
                  onChange={() => setPaymentMethod('pay_at_clinic')}
                  className="text-teal-600"
                />
              </label>

              <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer text-xs ${
                paymentMethod === 'online' ? 'border-teal-600 bg-teal-50/50 font-semibold' : 'border-slate-200'
              }`}>
                <span>Instant UPI Payment ({clinicSettings?.upiId || 'aarogyaclinic@icici'})</span>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="text-teal-600"
                />
              </label>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              An instant WhatsApp confirmation will be sent to <strong>+91 {patientPhone}</strong> with your Appointment ID and doctor chamber details.
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleConfirmAppointment}
              disabled={isSubmitting}
              className="px-8 py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
