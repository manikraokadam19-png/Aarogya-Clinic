import { ClinicSettings, Appointment, Doctor } from '../types';

/**
 * Validates an Indian mobile number.
 * Must be 10 digits starting with 6, 7, 8, or 9.
 * Accepts with or without +91 or leading 0.
 */
export function validateIndianMobile(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Matches +919876543210, 919876543210, 09876543210, or 9876543210
  const indianPhoneRegex = /^(?:\+?91|0)?[6-9]\d{9}$/;
  return indianPhoneRegex.test(cleaned);
}

/**
 * Normalizes phone number to standard Indian format: +91XXXXXXXXXX
 */
export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }
  return phone.trim();
}

/**
 * Validates a 6-digit Indian Postal PIN code.
 * Indian PIN codes are 6 numeric digits, first digit 1-9 (never 0).
 */
export function validateIndianPincode(pincode: string): boolean {
  if (!pincode) return false;
  const pinRegex = /^[1-9][0-9]{5}$/;
  return pinRegex.test(pincode.trim());
}

/**
 * Password validation:
 * - Minimum 6 characters
 * - At least 1 letter
 * - At least 1 number
 * - At least 1 special character
 */
export function checkPasswordStrength(password: string): {
  isValid: boolean;
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
} {
  const hasMinLength = (password || '').length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password || '');
  const hasNumber = /[0-9]/.test(password || '');
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_=+]/.test(password || '');

  return {
    isValid: hasMinLength && hasLetter && hasNumber && hasSpecialChar,
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecialChar
  };
}

/**
 * Format currency in Indian Rupees (₹)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date in Indian format DD/MM/YYYY
 */
export function formatDateDDMMYYYY(dateInput: string | Date): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  // Use Asia/Kolkata timezone
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  return formatter.format(date);
}

/**
 * Format date to readable string with day: "Monday, 28/09/2026"
 */
export function formatDateReadable(dateInput: string | Date): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Get current date in IST in YYYY-MM-DD format
 */
export function getCurrentISTDateString(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

/**
 * Generate official WhatsApp appointment message formatted as per guidelines
 */
export function generateWhatsAppMessage(
  appointment: Partial<Appointment>,
  clinic: ClinicSettings
): string {
  const formattedDate = appointment.appointmentDate ? formatDateDDMMYYYY(appointment.appointmentDate) : '';
  const clinicAddress = `${clinic.addressFlat}, ${clinic.addressBuilding}, ${clinic.addressStreet}, ${clinic.addressArea}, ${clinic.city}, ${clinic.state} - ${clinic.pincode}`;

  const rawDoctorName = appointment.doctorName || '';
  const doctorDisplayName = rawDoctorName.startsWith('Dr.') ? rawDoctorName : `Dr. ${rawDoctorName}`;

  return `Hello ${appointment.patientName || 'Patient'},

Your appointment has been confirmed.

Clinic: ${clinic.name}

Doctor: ${doctorDisplayName}

Appointment ID: ${appointment.appointmentNumber || ''}

Date: ${formattedDate}

Time: ${appointment.appointmentTime || ''}

Consultation: ${appointment.consultationType === 'online' ? 'Online Consultation' : 'In-Clinic Consultation'}

Clinic Address:
${clinicAddress}

Contact:
${clinic.phone}

Thank you.`;
}

/**
 * Generate direct WhatsApp URL (click-to-chat)
 */
export function generateWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * List of 28 Indian States and 8 Union Territories
 */
export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

/**
 * Helper to generate 12-hour slots for a doctor on a given day
 */
export function generateDayTimeSlots(
  startTime = '09:00',
  endTime = '18:00',
  breakStart = '13:00',
  breakEnd = '14:00',
  slotDurationMinutes = 30
): string[] {
  const slots: string[] = [];

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const [bStartH, bStartM] = (breakStart || '').split(':').map(Number);
  const [bEndH, bEndM] = (breakEnd || '').split(':').map(Number);

  let currentMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  const breakStartMin = !isNaN(bStartH) ? bStartH * 60 + bStartM : -1;
  const breakEndMin = !isNaN(bEndH) ? bEndH * 60 + bEndM : -1;

  while (currentMin + slotDurationMinutes <= endMin) {
    // Check if in break
    const isInBreak = breakStartMin !== -1 && currentMin >= breakStartMin && currentMin < breakEndMin;

    if (!isInBreak) {
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m.toString().padStart(2, '0');
      slots.push(`${displayH.toString().padStart(2, '0')}:${displayM} ${period}`);
    }

    currentMin += slotDurationMinutes;
  }

  return slots;
}
