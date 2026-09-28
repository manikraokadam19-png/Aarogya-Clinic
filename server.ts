import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  User,
  PatientProfile,
  Doctor,
  Appointment,
  MedicalService,
  WhatsAppNotificationLog,
  ClinicSettings,
  AppointmentStatus,
  ConsultationType
} from './src/types';
import {
  validateIndianMobile,
  normalizeIndianPhone,
  validateIndianPincode,
  checkPasswordStrength,
  getCurrentISTDateString,
  generateWhatsAppMessage,
  generateDayTimeSlots,
  formatDateDDMMYYYY
} from './src/utils/india';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.resolve(__dirname, 'clinic_database.json');

// Helper to hash password with PBKDF2
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (e) {
    return false;
  }
}

// Database Structure
interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  patientProfiles: PatientProfile[];
  doctors: Doctor[];
  appointments: Appointment[];
  services: MedicalService[];
  whatsappLogs: WhatsAppNotificationLog[];
  otpStore: Record<string, {
    otp: string;
    purpose: 'signup' | 'forgot_password';
    expiresAt: number;
    attemptsLeft: number;
    resendAvailableAt: number;
    payload?: any;
  }>;
  clinicSettings: ClinicSettings;
}

const defaultClinicSettings: ClinicSettings = {
  name: 'Aarogya Multi-Speciality Clinic & Diagnostic Centre',
  tagline: 'Compassionate Care, Advanced Medical Excellence',
  registrationNumber: 'MAH-PUN-CLINIC-2018-8842',
  gstNumber: '27AABCA1234D1ZM',
  phone: '+91 9876543210',
  emergencyHelpline: '+91 9876500000',
  email: 'appointments@aarogyaclinic.in',
  whatsappNumber: '+91 9876543210',
  addressFlat: 'Shop 104-106, 1st Floor',
  addressBuilding: 'Shivaji Commercial Complex',
  addressStreet: 'Fergusson College Road, Shivajinagar',
  addressArea: 'Deccan Gymkhana',
  city: 'Pune',
  district: 'Pune',
  state: 'Maharashtra',
  pincode: '411004',
  openingHours: 'Mon - Sat: 08:30 AM - 08:30 PM, Sun: 09:00 AM - 01:00 PM',
  slotDurationMinutes: 30,
  advanceBookingDays: 30,
  onlineConsultationEnabled: true,
  upiId: 'aarogyaclinic@icici'
};

const defaultScheduleTemplate = [
  { dayOfWeek: 'Monday' as const, isWorking: true, startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
  { dayOfWeek: 'Tuesday' as const, isWorking: true, startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
  { dayOfWeek: 'Wednesday' as const, isWorking: true, startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
  { dayOfWeek: 'Thursday' as const, isWorking: true, startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
  { dayOfWeek: 'Friday' as const, isWorking: true, startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
  { dayOfWeek: 'Saturday' as const, isWorking: true, startTime: '09:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', slotDurationMinutes: 30 },
  { dayOfWeek: 'Sunday' as const, isWorking: false, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30 }
];

// Initialize seed data
function getInitialDatabase(): DatabaseSchema {
  const adminId = 'usr_admin_01';
  const patient1Id = 'usr_pat_01';
  const patient2Id = 'usr_pat_02';

  const users: (User & { passwordHash: string })[] = [
    {
      id: adminId,
      fullName: 'Dr. Suresh Kulkarni (Medical Director / Admin)',
      email: 'admin@aarogyaclinic.in',
      phone: '+919876543210',
      role: 'admin',
      isVerified: true,
      avatarUrl: '/src/assets/images/doctor_rahul_sharma_1790564915836.jpg',
      passwordHash: hashPassword('Admin@123'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: patient1Id,
      fullName: 'Rajesh Ramanathan',
      email: 'rajesh.raman@gmail.com',
      phone: '+919822012345',
      role: 'patient',
      isVerified: true,
      passwordHash: hashPassword('Patient@123'),
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: patient2Id,
      fullName: 'Sunita Mehra',
      email: 'sunita.mehra@rediffmail.com',
      phone: '+919890123456',
      role: 'patient',
      isVerified: true,
      passwordHash: hashPassword('Patient@123'),
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const patientProfiles: PatientProfile[] = [
    {
      id: 'prof_01',
      userId: patient1Id,
      dateOfBirth: '1985-06-14',
      gender: 'Male',
      bloodGroup: 'B+',
      allergies: 'Penicillin, Dust mite',
      chronicConditions: 'Mild Hypertension',
      currentMedications: 'Telmisartan 40mg once daily',
      pastMedicalHistory: 'Appendectomy in 2018',
      addressFlat: 'Flat 402, B-Wing',
      addressStreet: 'Mayur Residency, DP Road',
      addressArea: 'Kothrud',
      addressLandmark: 'Near City Pride Theatre',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
      emergencyContactName: 'Kavita Ramanathan (Wife)',
      emergencyContactPhone: '+919822099999'
    },
    {
      id: 'prof_02',
      userId: patient2Id,
      dateOfBirth: '1992-11-20',
      gender: 'Female',
      bloodGroup: 'O+',
      allergies: 'None known',
      chronicConditions: 'None',
      currentMedications: 'Multivitamins',
      pastMedicalHistory: 'None',
      addressFlat: 'House 12, Gulmohar Enclave',
      addressStreet: 'MG Road, Camp',
      addressArea: 'Camp Area',
      addressLandmark: 'Opposite Aurora Towers',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      emergencyContactName: 'Vikram Mehra (Brother)',
      emergencyContactPhone: '+919890988888'
    }
  ];

  const doctors: Doctor[] = [
    {
      id: 'doc_01',
      fullName: 'Dr. Rahul Sharma',
      qualification: 'MBBS, MD (General Medicine)',
      specialization: 'General Physician & Diabetologist',
      experienceYears: 14,
      councilRegNumber: 'MCI-2010-44912',
      languages: ['English', 'Hindi', 'Marathi'],
      about: 'Senior physician with over 14 years of clinical experience in treating acute viral illnesses, lifestyle disorders, metabolic management, diabetes care, and preventative medicine.',
      expertise: ['Diabetes Mellitus', 'Hypertension Management', 'Infectious Diseases', 'Geriatric Health', 'Preventive Health Checks'],
      consultationFee: 500,
      avatarUrl: '/src/assets/images/doctor_rahul_sharma_1790564915836.jpg',
      clinicRoom: 'OPD Chamber 101',
      isActive: true,
      schedule: defaultScheduleTemplate
    },
    {
      id: 'doc_02',
      fullName: 'Dr. Priya Patel',
      qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
      specialization: 'Interventional Cardiologist',
      experienceYears: 12,
      councilRegNumber: 'MMC-2012-78231',
      languages: ['English', 'Hindi', 'Gujarati', 'Marathi'],
      about: 'Renowned Cardiologist specializing in preventive heart health, coronary artery disease management, lipidology, hypertension, and post-angioplasty rehabilitative care.',
      expertise: ['Heart Disease Prevention', 'ECG & Echocardiography', 'Lipid Disorders', 'Chest Pain Evaluation', 'Arrhythmia Management'],
      consultationFee: 800,
      avatarUrl: '/src/assets/images/doctor_priya_patel_1790564930553.jpg',
      clinicRoom: 'Cardio Suite 102',
      isActive: true,
      schedule: defaultScheduleTemplate
    },
    {
      id: 'doc_03',
      fullName: 'Dr. Ananya Deshmukh',
      qualification: 'MBBS, DCH, DNB (Pediatrics)',
      specialization: 'Pediatrician & Neonatologist',
      experienceYears: 9,
      councilRegNumber: 'MMC-2015-32114',
      languages: ['English', 'Hindi', 'Marathi'],
      about: 'Compassionate child specialist devoted to newborn care, growth and developmental milestones, childhood immunization, and pediatric respiratory conditions.',
      expertise: ['Childhood Vaccination', 'Newborn & Infant Care', 'Pediatric Asthma', 'Growth & Nutrition Assessment', 'Childhood Infections'],
      consultationFee: 600,
      avatarUrl: '/src/assets/images/doctor_ananya_deshmukh_1790564942351.jpg',
      clinicRoom: 'Pediatrics Room 103',
      isActive: true,
      schedule: defaultScheduleTemplate
    },
    {
      id: 'doc_04',
      fullName: 'Dr. Vikramaditya Rao',
      qualification: 'MBBS, MS (Orthopedics), MCh (Ortho)',
      specialization: 'Orthopedic Surgeon & Joint Specialist',
      experienceYears: 16,
      councilRegNumber: 'KMC-2008-19823',
      languages: ['English', 'Hindi', 'Kannada', 'Telugu'],
      about: 'Expert orthopedic surgeon specializing in knee and hip joint pain, arthritis management, sports injuries, spine ergonomics, and fracture treatments.',
      expertise: ['Osteoarthritis', 'Sports Injury Rehabilitation', 'Knee & Shoulder Pain', 'Spine & Backache', 'Bone Density & Osteoporosis'],
      consultationFee: 700,
      avatarUrl: '/src/assets/images/doctor_rahul_sharma_1790564915836.jpg', // safe fallback
      clinicRoom: 'Orthopedics Suite 104',
      isActive: true,
      schedule: defaultScheduleTemplate
    },
    {
      id: 'doc_05',
      fullName: 'Dr. Meenakshi Sundaram',
      qualification: 'MBBS, MS (OBGYN), DGO, FMAS',
      specialization: 'Obstetrician & Gynecologist',
      experienceYears: 11,
      councilRegNumber: 'TNMC-2013-55612',
      languages: ['English', 'Hindi', 'Tamil', 'Marathi'],
      about: 'Dedicated specialist focusing on women comprehensive health, antenatal pregnancy care, PCOD/PCOS lifestyle treatment, and fertility guidance.',
      expertise: ['Antenatal Care', 'PCOS & PCOD Management', 'Menstrual Health', 'High Risk Pregnancy Guidance', 'Menopause Support'],
      consultationFee: 650,
      avatarUrl: '/src/assets/images/doctor_priya_patel_1790564930553.jpg', // safe fallback
      clinicRoom: 'Gynaecology Suite 105',
      isActive: true,
      schedule: defaultScheduleTemplate
    },
    {
      id: 'doc_06',
      fullName: 'Dr. Sameer Khan',
      qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
      specialization: 'Consultant Dermatologist & Trichologist',
      experienceYears: 8,
      councilRegNumber: 'DMC-2016-89021',
      languages: ['English', 'Hindi', 'Urdu'],
      about: 'Board-certified dermatologist focusing on clinical dermatology, chronic eczema, acne, psoriasis, hair fall evaluation, and laser medical procedures.',
      expertise: ['Acne & Scarring', 'Hair Fall & PRP', 'Eczema & Psoriasis', 'Skin Allergies', 'Pigmentation Management'],
      consultationFee: 600,
      avatarUrl: '/src/assets/images/doctor_ananya_deshmukh_1790564942351.jpg', // safe fallback
      clinicRoom: 'Derma Lounge 106',
      isActive: true,
      schedule: defaultScheduleTemplate
    }
  ];

  const services: MedicalService[] = [
    { id: 'srv_01', name: 'General Physician Consultation', department: 'General Medicine', description: 'Comprehensive physical examination, diagnosis of acute fevers, cough, fatigue, and primary healthcare guidance.', fee: 500, durationMinutes: 20, isActive: true },
    { id: 'srv_02', name: 'Cardiology Consultation & 12-Lead ECG', department: 'Cardiology', description: 'Specialist heart evaluation with high-definition digital 12-lead ECG, blood pressure profiling, and cardiovascular risk assessment.', fee: 800, durationMinutes: 30, isActive: true },
    { id: 'srv_03', name: 'Pediatric Health & Immunization', department: 'Pediatrics', description: 'Full pediatric developmental assessment, IAP-schedule vaccination, growth tracking, and infant nutrition counseling.', fee: 600, durationMinutes: 20, isActive: true },
    { id: 'srv_04', name: 'Orthopedic Joint & Spine Assessment', department: 'Orthopedics', description: 'Evaluation of joint mobility, chronic arthritis, sciatica, posture evaluation, and physical therapy planning.', fee: 700, durationMinutes: 25, isActive: true },
    { id: 'srv_05', name: 'Gynecology & Antenatal Wellness', department: 'Gynecology', description: 'Routine women wellness check, fertility assessment, pregnancy trimester review, and hormonal balance guidance.', fee: 650, durationMinutes: 25, isActive: true },
    { id: 'srv_06', name: 'Dermatology & Scalp Examination', department: 'Dermatology', description: 'Digital dermoscopy for skin conditions, mole checks, persistent rash analysis, and targeted treatment plans.', fee: 600, durationMinutes: 20, isActive: true },
    { id: 'srv_07', name: 'Executive Master Health Checkup', department: 'Diagnostics', description: 'Complete 68-parameter panel: CBC, Lipid Profile, Liver Function, Kidney Function, HbA1c, Thyroid, Urine Routine & Doctor Review.', fee: 1999, durationMinutes: 45, isActive: true },
    { id: 'srv_08', name: 'Digital X-Ray & Bone Health', department: 'Radiology', description: 'High-resolution digital radiography for chest, limbs, and spine with rapid radiologist reporting within 30 minutes.', fee: 850, durationMinutes: 15, isActive: true }
  ];

  const todayStr = getCurrentISTDateString();

  const appointments: Appointment[] = [
    {
      id: 'apt_01',
      appointmentNumber: `CLN-${todayStr.replace(/-/g, '')}-001`,
      patientId: patient1Id,
      patientName: 'Rajesh Ramanathan',
      patientPhone: '+919822012345',
      patientEmail: 'rajesh.raman@gmail.com',
      patientGender: 'Male',
      patientDob: '1985-06-14',
      doctorId: 'doc_01',
      doctorName: 'Dr. Rahul Sharma',
      doctorSpecialization: 'General Physician & Diabetologist',
      doctorAvatarUrl: '/src/assets/images/doctor_rahul_sharma_1790564915836.jpg',
      appointmentDate: todayStr,
      appointmentTime: '10:30 AM',
      consultationType: 'in-clinic',
      reason: 'Routine quarterly diabetes checkup and blood pressure review',
      symptoms: 'Occasional mild dizziness in the morning',
      status: 'confirmed',
      consultationFee: 500,
      paymentStatus: 'pay_at_clinic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'apt_02',
      appointmentNumber: `CLN-${todayStr.replace(/-/g, '')}-002`,
      patientId: patient2Id,
      patientName: 'Sunita Mehra',
      patientPhone: '+919890123456',
      patientEmail: 'sunita.mehra@rediffmail.com',
      patientGender: 'Female',
      patientDob: '1992-11-20',
      doctorId: 'doc_02',
      doctorName: 'Dr. Priya Patel',
      doctorSpecialization: 'Interventional Cardiologist',
      doctorAvatarUrl: '/src/assets/images/doctor_priya_patel_1790564930553.jpg',
      appointmentDate: todayStr,
      appointmentTime: '02:30 PM',
      consultationType: 'online',
      onlineMeetingUrl: 'https://meet.google.com/aar-ogya-doc',
      reason: 'Palpitations after intense exercise and ECG review',
      symptoms: 'Rapid heartbeat after stair climbing',
      status: 'confirmed',
      consultationFee: 800,
      paymentStatus: 'paid',
      paymentMethod: 'UPI (aarogyaclinic@icici)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const whatsappLogs: WhatsAppNotificationLog[] = [
    {
      id: 'wa_01',
      appointmentId: 'apt_01',
      recipientPhone: '+919822012345',
      recipientName: 'Rajesh Ramanathan',
      templateType: 'booking_confirmation',
      messageText: generateWhatsAppMessage(appointments[0], defaultClinicSettings),
      sentAt: new Date().toISOString(),
      status: 'delivered',
      provider: 'WhatsApp Business API'
    },
    {
      id: 'wa_02',
      appointmentId: 'apt_02',
      recipientPhone: '+919890123456',
      recipientName: 'Sunita Mehra',
      templateType: 'booking_confirmation',
      messageText: generateWhatsAppMessage(appointments[1], defaultClinicSettings),
      sentAt: new Date().toISOString(),
      status: 'delivered',
      provider: 'WhatsApp Business API'
    }
  ];

  return {
    users,
    patientProfiles,
    doctors,
    appointments,
    services,
    whatsappLogs,
    otpStore: {},
    clinicSettings: defaultClinicSettings
  };
}

// Database helper
let db: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Ensure missing tables exist
      if (!parsed.clinicSettings) parsed.clinicSettings = defaultClinicSettings;
      if (!parsed.otpStore) parsed.otpStore = {};
      return parsed;
    }
  } catch (err) {
    console.error('Error loading DB file, falling back to seed:', err);
  }
  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(dataToSave: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

db = loadDatabase();

// Middleware
app.use(express.json());

// Token/Session store in memory (simple Bearer token)
const activeTokens: Record<string, { userId: string; role: string; expiresAt: number }> = {
  'demo-admin-token': { userId: 'usr_admin_01', role: 'admin', expiresAt: Date.now() + 86400000 * 7 },
  'demo-patient-token': { userId: 'usr_pat_01', role: 'patient', expiresAt: Date.now() + 86400000 * 7 }
};

function authMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const session = activeTokens[token];
  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Session expired or invalid. Please login again.' });
  }
  (req as any).user = session;
  next();
}

function optionalAuthMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const session = activeTokens[token];
    if (session && session.expiresAt >= Date.now()) {
      (req as any).user = session;
    }
  }
  next();
}

/* ==========================================================================
   AUTHENTICATION & OTP FLOWS
   ========================================================================== */

/**
 * Step 1: Sign up request
 * - Validates input (+91 mobile, email, password rules)
 * - Checks duplicate email or phone ("User already exists. Please login.")
 * - Generates 6-digit OTP with 60-second cooldown and 10-minute expiry
 */
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    dateOfBirth,
    gender,
    addressFlat,
    addressStreet,
    addressArea,
    city,
    state,
    pincode,
    emergencyContactName,
    emergencyContactPhone,
    termsAccepted
  } = req.body;

  // Validation
  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!phone || !validateIndianMobile(phone)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  const normalizedPhone = normalizeIndianPhone(phone);

  const pwdCheck = checkPasswordStrength(password);
  if (!pwdCheck.isValid) {
    return res.status(400).json({
      error: 'Password must contain at least 6 characters, including a letter, number and special character.'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (!termsAccepted) {
    return res.status(400).json({ error: 'Please accept the Terms & Conditions and Privacy Policy.' });
  }

  if (pincode && !validateIndianPincode(pincode)) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit Indian PIN code.' });
  }

  // Duplicate User Detection
  const existingUser = db.users.find(
    u => u.email.toLowerCase() === email.toLowerCase() || u.phone === normalizedPhone
  );

  if (existingUser) {
    return res.status(409).json({
      error: 'User already exists. Please login.',
      userExists: true
    });
  }

  // Generate secure 6-digit OTP
  const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();

  // Store in otpStore with 60s cooldown and 10min expiry
  db.otpStore[normalizedPhone] = {
    otp: otpNumber,
    purpose: 'signup',
    expiresAt: now + 10 * 60 * 1000,
    attemptsLeft: 5,
    resendAvailableAt: now + 60 * 1000,
    payload: {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      passwordHash: hashPassword(password),
      dateOfBirth,
      gender,
      addressFlat,
      addressStreet,
      addressArea,
      city: city || 'Pune',
      state: state || 'Maharashtra',
      pincode: pincode || '411004',
      emergencyContactName,
      emergencyContactPhone
    }
  };
  saveDatabase(db);

  // Return success. In dev, simulatedOtp is sent so the user can easily test the UI verification.
  return res.status(200).json({
    message: `OTP sent successfully to ${normalizedPhone}`,
    phone: normalizedPhone,
    resendCooldownSeconds: 60,
    // Provide simulated SMS copy for transparency
    simulatedSms: `[Aarogya Clinic] Your 6-digit OTP is ${otpNumber}. Valid for 10 minutes. Do not share this with anyone.`,
    simulatedOtp: otpNumber
  });
});

/**
 * Step 2: Verify OTP
 * - Checks attempts and expiry
 * - Verifies 6-digit OTP
 * - Creates verified user and patient profile
 */
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  const normalizedPhone = normalizeIndianPhone(phone);
  const record = db.otpStore[normalizedPhone];

  if (!record) {
    return res.status(400).json({ error: 'No active OTP verification found. Please request a new OTP.' });
  }

  if (Date.now() > record.expiresAt) {
    delete db.otpStore[normalizedPhone];
    saveDatabase(db);
    return res.status(400).json({ error: 'OTP has expired. Please request a new OTP.' });
  }

  if (record.attemptsLeft <= 0) {
    delete db.otpStore[normalizedPhone];
    saveDatabase(db);
    return res.status(429).json({ error: 'Too many incorrect attempts. Please request a new OTP.' });
  }

  if (record.otp !== otp?.trim()) {
    record.attemptsLeft -= 1;
    saveDatabase(db);
    return res.status(400).json({
      error: `Invalid OTP. ${record.attemptsLeft} attempt(s) remaining.`
    });
  }

  // OTP Verified Successfully!
  if (record.purpose === 'signup' && record.payload) {
    const newUserId = `usr_${Date.now()}`;
    const p = record.payload;

    const newUser: User & { passwordHash: string } = {
      id: newUserId,
      fullName: p.fullName,
      email: p.email,
      phone: p.phone,
      role: 'patient',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash: p.passwordHash
    };

    const newProfile: PatientProfile = {
      id: `prof_${Date.now()}`,
      userId: newUserId,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      bloodGroup: 'B+',
      addressFlat: p.addressFlat,
      addressStreet: p.addressStreet,
      addressArea: p.addressArea,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      emergencyContactName: p.emergencyContactName,
      emergencyContactPhone: p.emergencyContactPhone
    };

    db.users.push(newUser);
    db.patientProfiles.push(newProfile);

    // Clean up OTP record
    delete db.otpStore[normalizedPhone];
    saveDatabase(db);

    // Generate Session Token
    const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
    activeTokens[token] = {
      userId: newUserId,
      role: 'patient',
      expiresAt: Date.now() + 86400000 * 7
    };

    const { passwordHash, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Account verified and created successfully!',
      token,
      user: safeUser,
      profile: newProfile
    });
  }

  if (record.purpose === 'forgot_password') {
    // Return temp reset token
    const resetToken = `rst_${crypto.randomBytes(20).toString('hex')}`;
    record.payload = { ...(record.payload || {}), resetToken, verified: true };
    saveDatabase(db);

    return res.status(200).json({
      message: 'OTP verified successfully.',
      resetToken
    });
  }

  return res.status(400).json({ error: 'Unexpected verification state.' });
});

/**
 * Step 3: Resend OTP
 * - Enforces 60-second cooldown
 * - Invalidates old OTP and generates fresh one
 */
app.post('/api/auth/resend-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  const normalizedPhone = normalizeIndianPhone(phone);
  const record = db.otpStore[normalizedPhone];

  if (!record) {
    return res.status(400).json({ error: 'No verification in progress. Please sign up or request password reset.' });
  }

  const now = Date.now();
  if (now < record.resendAvailableAt) {
    const remainingSeconds = Math.ceil((record.resendAvailableAt - now) / 1000);
    return res.status(429).json({
      error: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`
    });
  }

  // Generate new OTP & invalidate previous
  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  record.otp = newOtp;
  record.attemptsLeft = 5;
  record.expiresAt = now + 10 * 60 * 1000;
  record.resendAvailableAt = now + 60 * 1000;
  saveDatabase(db);

  return res.status(200).json({
    message: `A new 6-digit OTP has been sent to ${normalizedPhone}`,
    resendCooldownSeconds: 60,
    simulatedSms: `[Aarogya Clinic] Your new 6-digit OTP is ${newOtp}. Valid for 10 minutes.`,
    simulatedOtp: newOtp
  });
});

/**
 * Login:
 * Option 1: Email + Password
 * Option 2: Indian Mobile (+91) + Password
 */
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter your email or mobile number and password.' });
  }

  const cleanIdentifier = identifier.trim();
  const isEmail = cleanIdentifier.includes('@');
  const normalizedPhone = !isEmail ? normalizeIndianPhone(cleanIdentifier) : '';

  const user = db.users.find(u => {
    if (isEmail) {
      return u.email.toLowerCase() === cleanIdentifier.toLowerCase();
    }
    return u.phone === normalizedPhone || u.phone.endsWith(cleanIdentifier.slice(-10));
  });

  if (!user) {
    return res.status(404).json({ error: 'Account not found. Please sign up.' });
  }

  const isValidPassword = verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Incorrect password. Please check your credentials.' });
  }

  const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
  activeTokens[token] = {
    userId: user.id,
    role: user.role,
    expiresAt: Date.now() + 86400000 * 7
  };

  const profile = db.patientProfiles.find(p => p.userId === user.id) || null;
  const { passwordHash, ...safeUser } = user;

  return res.status(200).json({
    message: 'Logged in successfully.',
    token,
    user: safeUser,
    profile
  });
});

/**
 * Forgot Password - Step 1: Request OTP
 */
app.post('/api/auth/forgot-password/request-otp', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Please enter your registered email or +91 mobile number.' });
  }

  const cleanIdentifier = identifier.trim();
  const isEmail = cleanIdentifier.includes('@');
  const normalizedPhone = !isEmail ? normalizeIndianPhone(cleanIdentifier) : '';

  const user = db.users.find(u => {
    if (isEmail) return u.email.toLowerCase() === cleanIdentifier.toLowerCase();
    return u.phone === normalizedPhone || u.phone.endsWith(cleanIdentifier.slice(-10));
  });

  if (!user) {
    return res.status(404).json({ error: 'Account not found with this identifier. Please check and try again.' });
  }

  const targetPhone = user.phone;
  const otpNumber = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();

  db.otpStore[targetPhone] = {
    otp: otpNumber,
    purpose: 'forgot_password',
    expiresAt: now + 10 * 60 * 1000,
    attemptsLeft: 5,
    resendAvailableAt: now + 60 * 1000,
    payload: { userId: user.id, phone: targetPhone }
  };
  saveDatabase(db);

  return res.status(200).json({
    message: `OTP sent to ${targetPhone}`,
    phone: targetPhone,
    resendCooldownSeconds: 60,
    simulatedSms: `[Aarogya Clinic] Your password reset OTP is ${otpNumber}. Valid for 10 minutes.`,
    simulatedOtp: otpNumber
  });
});

/**
 * Forgot Password - Step 2: Set New Password
 */
app.post('/api/auth/forgot-password/reset', (req: Request, res: Response) => {
  const { phone, resetToken, newPassword, confirmPassword } = req.body;
  const normalizedPhone = normalizeIndianPhone(phone);
  const record = db.otpStore[normalizedPhone];

  if (!record || !record.payload?.verified || record.payload?.resetToken !== resetToken) {
    return res.status(400).json({ error: 'Invalid or expired password reset session. Please request OTP again.' });
  }

  const pwdCheck = checkPasswordStrength(newPassword);
  if (!pwdCheck.isValid) {
    return res.status(400).json({
      error: 'Password must contain at least 6 characters, including a letter, number and special character.'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const user = db.users.find(u => u.id === record.payload.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.passwordHash = hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();

  delete db.otpStore[normalizedPhone];
  saveDatabase(db);

  return res.status(200).json({
    message: 'Password changed successfully. Please login with your new password.'
  });
});

/**
 * Current user profile
 */
app.get('/api/auth/me', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const profile = db.patientProfiles.find(p => p.userId === user.id) || null;
  const { passwordHash, ...safeUser } = user;
  return res.status(200).json({ user: safeUser, profile });
});

/* ==========================================================================
   DOCTORS & SERVICES
   ========================================================================== */

app.get('/api/doctors', (req: Request, res: Response) => {
  return res.status(200).json(db.doctors);
});

app.get('/api/doctors/:id', (req: Request, res: Response) => {
  const doc = db.doctors.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  return res.status(200).json(doc);
});

app.post('/api/doctors', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }

  const { fullName, qualification, specialization, experienceYears, councilRegNumber, languages, about, expertise, consultationFee, avatarUrl, clinicRoom } = req.body;

  const newDoc: Doctor = {
    id: `doc_${Date.now()}`,
    fullName,
    qualification,
    specialization,
    experienceYears: Number(experienceYears) || 5,
    councilRegNumber,
    languages: Array.isArray(languages) ? languages : ['English', 'Hindi'],
    about: about || '',
    expertise: Array.isArray(expertise) ? expertise : ['General Care'],
    consultationFee: Number(consultationFee) || 500,
    avatarUrl: avatarUrl || '/src/assets/images/doctor_rahul_sharma_1790564915836.jpg',
    clinicRoom: clinicRoom || 'OPD Room',
    isActive: true,
    schedule: defaultScheduleTemplate
  };

  db.doctors.push(newDoc);
  saveDatabase(db);
  return res.status(201).json(newDoc);
});

app.put('/api/doctors/:id', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }

  const index = db.doctors.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  db.doctors[index] = { ...db.doctors[index], ...req.body };
  saveDatabase(db);
  return res.status(200).json(db.doctors[index]);
});

app.get('/api/services', (req: Request, res: Response) => {
  return res.status(200).json(db.services);
});

app.post('/api/services', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  const { name, department, description, fee, durationMinutes } = req.body;
  const newService: MedicalService = {
    id: `srv_${Date.now()}`,
    name,
    department,
    description,
    fee: Number(fee) || 500,
    durationMinutes: Number(durationMinutes) || 30,
    isActive: true
  };
  db.services.push(newService);
  saveDatabase(db);
  return res.status(201).json(newService);
});

/* ==========================================================================
   APPOINTMENTS & SCHEDULING (DOUBLE BOOKING PREVENTION & IST)
   ========================================================================== */

/**
 * Get available time slots for a doctor on a specific date in IST.
 * Automatically eliminates slots that are already confirmed/rescheduled!
 */
app.get('/api/appointments/available-slots', (req: Request, res: Response) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ error: 'doctorId and date query parameters are required' });
  }

  const doc = db.doctors.find(d => d.id === doctorId);
  if (!doc) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const dateObj = new Date(date as string);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dateObj.getDay()];

  const daySchedule = doc.schedule.find(s => s.dayOfWeek === dayName);

  if (!daySchedule || !daySchedule.isWorking) {
    return res.status(200).json({
      date,
      dayName,
      isDoctorWorking: false,
      availableSlots: [],
      bookedSlots: [],
      message: `${doc.fullName} is not scheduled to consult on ${dayName}s.`
    });
  }

  // Generate all regular slots for this day
  const allDaySlots = generateDayTimeSlots(
    daySchedule.startTime,
    daySchedule.endTime,
    daySchedule.breakStartTime,
    daySchedule.breakEndTime,
    daySchedule.slotDurationMinutes || 30
  );

  // Find existing bookings on this date for this doctor that are active
  const existingBookings = db.appointments.filter(
    a => a.doctorId === doctorId &&
         a.appointmentDate === date &&
         (a.status === 'confirmed' || a.status === 'rescheduled')
  );

  const bookedSlotTimes = existingBookings.map(b => b.appointmentTime);
  const availableSlots = allDaySlots.filter(slot => !bookedSlotTimes.includes(slot));

  return res.status(200).json({
    date,
    dayName,
    isDoctorWorking: true,
    allSlots: allDaySlots,
    bookedSlots: bookedSlotTimes,
    availableSlots
  });
});

/**
 * Book an Appointment
 * - Strict double booking prevention server-side!
 * - Generates official Appointment Number (CLN-YYYYMMDD-XXX)
 * - Formats WhatsApp message and logs notification
 */
app.post('/api/appointments/book', optionalAuthMiddleware, (req: Request, res: Response) => {
  const {
    doctorId,
    appointmentDate, // YYYY-MM-DD
    appointmentTime, // "10:30 AM"
    consultationType,
    patientName,
    patientPhone,
    patientEmail,
    patientGender,
    patientDob,
    reason,
    symptoms,
    emergencyContactPhone,
    paymentMethod
  } = req.body;

  // Validation
  if (!doctorId || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'Doctor, appointment date, and time slot are required.' });
  }

  if (!patientName || !patientName.trim()) {
    return res.status(400).json({ error: 'Patient name is required.' });
  }

  if (!patientPhone || !validateIndianMobile(patientPhone)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  const normalizedPatientPhone = normalizeIndianPhone(patientPhone);

  const doc = db.doctors.find(d => d.id === doctorId);
  if (!doc) {
    return res.status(404).json({ error: 'Selected doctor could not be found.' });
  }

  // Server-side check: Prevent past bookings
  const todayIST = getCurrentISTDateString();
  if (appointmentDate < todayIST) {
    return res.status(400).json({ error: 'Appointments cannot be booked for past dates.' });
  }

  // DOUBLE BOOKING PREVENTION CHECK
  const conflict = db.appointments.find(
    a => a.doctorId === doctorId &&
         a.appointmentDate === appointmentDate &&
         a.appointmentTime === appointmentTime &&
         (a.status === 'confirmed' || a.status === 'rescheduled')
  );

  if (conflict) {
    return res.status(409).json({
      error: 'This appointment slot is no longer available. Please select another slot.'
    });
  }

  // Generate Appointment ID: CLN-YYYYMMDD-XXX
  const dateFormattedCompact = appointmentDate.replace(/-/g, '');
  const dailyCount = db.appointments.filter(a => a.appointmentDate === appointmentDate).length + 1;
  const appointmentNumber = `CLN-${dateFormattedCompact}-${dailyCount.toString().padStart(3, '0')}`;

  const loggedUser = (req as any).user;
  const patientId = loggedUser?.userId || `guest_${Date.now()}`;

  const newAppointment: Appointment = {
    id: `apt_${Date.now()}`,
    appointmentNumber,
    patientId,
    patientName: patientName.trim(),
    patientPhone: normalizedPatientPhone,
    patientEmail: patientEmail ? patientEmail.trim().toLowerCase() : '',
    patientGender: patientGender || 'Prefer not to say',
    patientDob: patientDob || '',
    doctorId: doc.id,
    doctorName: doc.fullName,
    doctorSpecialization: doc.specialization,
    doctorAvatarUrl: doc.avatarUrl,
    appointmentDate,
    appointmentTime,
    consultationType: (consultationType as ConsultationType) || 'in-clinic',
    onlineMeetingUrl: consultationType === 'online' ? 'https://meet.google.com/aar-ogya-doc' : undefined,
    reason: reason || 'General medical consultation',
    symptoms: symptoms || '',
    status: 'confirmed',
    consultationFee: doc.consultationFee,
    paymentStatus: paymentMethod === 'online' ? 'paid' : 'pay_at_clinic',
    paymentMethod: paymentMethod === 'online' ? 'UPI (Verified)' : 'Pay at Clinic Counter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.appointments.push(newAppointment);

  // Generate official WhatsApp message
  const whatsappText = generateWhatsAppMessage(newAppointment, db.clinicSettings);
  const waLog: WhatsAppNotificationLog = {
    id: `wa_${Date.now()}`,
    appointmentId: newAppointment.id,
    recipientPhone: normalizedPatientPhone,
    recipientName: newAppointment.patientName,
    templateType: 'booking_confirmation',
    messageText: whatsappText,
    sentAt: new Date().toISOString(),
    status: 'delivered',
    provider: 'WhatsApp Business API'
  };
  db.whatsappLogs.unshift(waLog);

  saveDatabase(db);

  return res.status(201).json({
    message: 'Appointment booked successfully.',
    appointment: newAppointment,
    whatsappMessage: whatsappText
  });
});

/**
 * Get appointments for logged in patient
 */
app.get('/api/appointments/my', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  const user = db.users.find(u => u.id === session.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Match by patientId or phone
  const userAppointments = db.appointments.filter(
    a => a.patientId === user.id || a.patientPhone === user.phone || (user.email && a.patientEmail === user.email)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.status(200).json(userAppointments);
});

/**
 * Get all appointments (Admin & Doctor view)
 */
app.get('/api/appointments', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  const { date, status, doctorId, search } = req.query;

  let list = [...db.appointments];

  if (session.role === 'doctor') {
    // Filter to this doctor's appointments
    list = list.filter(a => a.doctorId === session.userId || a.doctorName.includes(session.userId));
  }

  if (date) {
    list = list.filter(a => a.appointmentDate === date);
  }

  if (status) {
    list = list.filter(a => a.status === status);
  }

  if (doctorId) {
    list = list.filter(a => a.doctorId === doctorId);
  }

  if (search) {
    const s = (search as string).toLowerCase();
    list = list.filter(
      a => a.patientName.toLowerCase().includes(s) ||
           a.appointmentNumber.toLowerCase().includes(s) ||
           a.patientPhone.includes(s)
    );
  }

  list.sort((a, b) => new Date(`${b.appointmentDate} ${b.appointmentTime}`).getTime() - new Date(`${a.appointmentDate} ${a.appointmentTime}`).getTime());
  return res.status(200).json(list);
});

/**
 * Reschedule or Cancel or Complete an appointment
 */
app.patch('/api/appointments/:id/status', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, newDate, newTime, reason } = req.body;
  const apt = db.appointments.find(a => a.id === id);

  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (status === 'rescheduled') {
    if (!newDate || !newTime) {
      return res.status(400).json({ error: 'New date and time are required for rescheduling.' });
    }

    // Check conflict
    const conflict = db.appointments.find(
      a => a.id !== id &&
           a.doctorId === apt.doctorId &&
           a.appointmentDate === newDate &&
           a.appointmentTime === newTime &&
           (a.status === 'confirmed' || a.status === 'rescheduled')
    );
    if (conflict) {
      return res.status(409).json({ error: 'The selected slot is already booked. Please choose another.' });
    }

    apt.appointmentDate = newDate;
    apt.appointmentTime = newTime;
    apt.status = 'rescheduled';
    apt.updatedAt = new Date().toISOString();

    // Log WhatsApp notification
    const reschedMsg = `Hello ${apt.patientName},\n\nYour appointment with Dr. ${apt.doctorName} at ${db.clinicSettings.name} has been rescheduled.\n\nNew Date: ${formatDateDDMMYYYY(newDate)}\nNew Time: ${newTime}\nAppointment ID: ${apt.appointmentNumber}\n\nClinic Phone: ${db.clinicSettings.phone}`;
    db.whatsappLogs.unshift({
      id: `wa_${Date.now()}`,
      appointmentId: apt.id,
      recipientPhone: apt.patientPhone,
      recipientName: apt.patientName,
      templateType: 'reschedule',
      messageText: reschedMsg,
      sentAt: new Date().toISOString(),
      status: 'delivered',
      provider: 'WhatsApp Business API'
    });

    saveDatabase(db);
    return res.status(200).json({ message: 'Appointment rescheduled successfully.', appointment: apt });
  }

  if (status === 'cancelled') {
    apt.status = 'cancelled';
    apt.updatedAt = new Date().toISOString();

    const cancelMsg = `Hello ${apt.patientName},\n\nYour appointment (ID: ${apt.appointmentNumber}) with Dr. ${apt.doctorName} at ${db.clinicSettings.name} on ${formatDateDDMMYYYY(apt.appointmentDate)} at ${apt.appointmentTime} has been cancelled.\n\nReason: ${reason || 'Patient/Clinic request'}.\n\nIf you need to rebook, please visit our website or call ${db.clinicSettings.phone}.`;
    db.whatsappLogs.unshift({
      id: `wa_${Date.now()}`,
      appointmentId: apt.id,
      recipientPhone: apt.patientPhone,
      recipientName: apt.patientName,
      templateType: 'cancellation',
      messageText: cancelMsg,
      sentAt: new Date().toISOString(),
      status: 'delivered',
      provider: 'WhatsApp Business API'
    });

    saveDatabase(db);
    return res.status(200).json({ message: 'Appointment cancelled.', appointment: apt });
  }

  if (['confirmed', 'completed', 'no-show'].includes(status)) {
    apt.status = status as AppointmentStatus;
    if (status === 'completed' && req.body.prescriptionNotes) {
      apt.doctorPrescriptionNotes = req.body.prescriptionNotes;
    }
    apt.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return res.status(200).json({ message: `Appointment marked as ${status}.`, appointment: apt });
  }

  return res.status(400).json({ error: 'Invalid status update requested' });
});

/* ==========================================================================
   PATIENT PROFILE & MEDICAL INFO
   ========================================================================== */

app.get('/api/patient/profile', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  const profile = db.patientProfiles.find(p => p.userId === session.userId);
  return res.status(200).json(profile || {});
});

app.put('/api/patient/profile', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  let profile = db.patientProfiles.find(p => p.userId === session.userId);

  if (!profile) {
    const newProfile: PatientProfile = {
      id: `prof_${Date.now()}`,
      userId: session.userId,
      ...req.body
    };
    db.patientProfiles.push(newProfile);
    profile = newProfile;
  } else {
    Object.assign(profile, req.body);
  }

  saveDatabase(db);
  return res.status(200).json({ message: 'Profile updated successfully.', profile });
});

/* ==========================================================================
   ADMIN METRICS & SETTINGS
   ========================================================================== */

app.get('/api/admin/stats', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }

  const todayIST = getCurrentISTDateString();
  const totalPatients = db.users.filter(u => u.role === 'patient').length;
  const totalDoctors = db.doctors.filter(d => d.isActive).length;
  const todayAppointments = db.appointments.filter(a => a.appointmentDate === todayIST);
  const upcomingAppointments = db.appointments.filter(a => a.appointmentDate >= todayIST && a.status === 'confirmed');
  const completedAppointments = db.appointments.filter(a => a.status === 'completed');
  const cancelledAppointments = db.appointments.filter(a => a.status === 'cancelled');

  // Total revenue collected in INR
  const totalRevenue = db.appointments
    .filter(a => a.paymentStatus === 'paid' || a.status === 'completed')
    .reduce((sum, a) => sum + (a.consultationFee || 0), 0);

  // Specialization breakdown
  const specializationCounts: Record<string, number> = {};
  db.appointments.forEach(a => {
    specializationCounts[a.doctorSpecialization] = (specializationCounts[a.doctorSpecialization] || 0) + 1;
  });

  return res.status(200).json({
    totalPatients,
    totalDoctors,
    todayAppointmentsCount: todayAppointments.length,
    upcomingAppointmentsCount: upcomingAppointments.length,
    completedAppointmentsCount: completedAppointments.length,
    cancelledAppointmentsCount: cancelledAppointments.length,
    totalAppointmentsCount: db.appointments.length,
    totalRevenueINR: totalRevenue,
    specializationBreakdown: specializationCounts
  });
});

app.get('/api/admin/whatsapp-logs', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }
  return res.status(200).json(db.whatsappLogs);
});

app.get('/api/clinic/settings', (req: Request, res: Response) => {
  return res.status(200).json(db.clinicSettings);
});

app.put('/api/clinic/settings', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).user;
  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin permission required' });
  }

  db.clinicSettings = { ...db.clinicSettings, ...req.body };
  saveDatabase(db);
  return res.status(200).json({ message: 'Clinic settings updated.', settings: db.clinicSettings });
});

/* ==========================================================================
   VITE SPA MIDDLEWARE MOUNTING
   ========================================================================== */
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aarogya Clinic] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
