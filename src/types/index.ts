export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string; // +91XXXXXXXXXX
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string;
  chronicConditions?: string;
  currentMedications?: string;
  pastMedicalHistory?: string;
  // Indian Address
  addressFlat?: string;
  addressStreet?: string;
  addressArea?: string;
  addressLandmark?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface DoctorScheduleDay {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isWorking: boolean;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "18:00"
  breakStartTime?: string; // e.g. "13:00"
  breakEndTime?: string;   // e.g. "14:00"
  slotDurationMinutes: number; // e.g. 30
}

export interface Doctor {
  id: string;
  userId?: string;
  fullName: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  councilRegNumber: string; // e.g. "MCI-2010-44912" or State Medical Council
  languages: string[];
  about: string;
  expertise: string[];
  consultationFee: number; // in ₹ INR
  avatarUrl: string;
  clinicRoom: string;
  isActive: boolean;
  schedule: DoctorScheduleDay[];
}

export type ConsultationType = 'in-clinic' | 'online';

export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';

export type PaymentStatus = 'pending' | 'paid' | 'pay_at_clinic';

export interface Appointment {
  id: string;
  appointmentNumber: string; // e.g. "CLN-20260928-001"
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientGender?: string;
  patientDob?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorAvatarUrl?: string;
  appointmentDate: string; // YYYY-MM-DD in IST
  appointmentTime: string; // e.g. "10:30 AM"
  consultationType: ConsultationType;
  onlineMeetingUrl?: string;
  reason: string;
  symptoms?: string;
  notes?: string;
  status: AppointmentStatus;
  consultationFee: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  // Medical notes for completed
  doctorPrescriptionNotes?: string;
}

export interface MedicalService {
  id: string;
  name: string;
  department: string;
  description: string;
  fee: number; // in ₹
  durationMinutes: number;
  isActive: boolean;
  iconName?: string;
}

export interface WhatsAppNotificationLog {
  id: string;
  appointmentId: string;
  recipientPhone: string;
  recipientName: string;
  templateType: 'booking_confirmation' | 'reminder' | 'reschedule' | 'cancellation';
  messageText: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
  provider: 'WhatsApp Business API' | 'Simulated';
}

export interface ClinicSettings {
  name: string;
  tagline: string;
  registrationNumber: string;
  gstNumber?: string;
  phone: string;
  emergencyHelpline: string;
  email: string;
  whatsappNumber: string;
  addressFlat: string;
  addressBuilding: string;
  addressStreet: string;
  addressArea: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  openingHours: string;
  slotDurationMinutes: number;
  advanceBookingDays: number;
  onlineConsultationEnabled: boolean;
  upiId: string;
}

export interface OtpVerificationRecord {
  phoneOrEmail: string;
  otp: string;
  purpose: 'signup' | 'forgot_password';
  expiresAt: number;
  attemptsLeft: number;
  resendAvailableAt: number;
}
