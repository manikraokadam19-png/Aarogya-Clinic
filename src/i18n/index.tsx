import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

export const translations = {
  en: {
    // Header & Navigation
    clinicName: 'Aarogya Clinic',
    tagline: 'Multi-Speciality Healthcare & Diagnostic Centre',
    home: 'Home',
    aboutClinic: 'About Clinic',
    doctors: 'Doctors',
    services: 'Services',
    contact: 'Contact',
    bookAppointment: 'Book Appointment',
    patientPortal: 'Patient Portal',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    dashboard: 'Dashboard',
    adminConsole: 'Admin Console',

    // Hero Section
    heroTitle: 'Book Your Doctor Appointment Online',
    heroSubtitle: 'Connect with experienced specialists at Aarogya Clinic, Pune. Comprehensive healthcare, verified doctors, hassle-free scheduling, and instant WhatsApp confirmations.',
    viewDoctors: 'View Doctors',
    callUs: 'Call Reception',
    emergency24x7: '24x7 Helpline',
    chatOnWhatsApp: 'Chat on WhatsApp',

    // Stats
    statPatients: '25,000+ Happy Patients',
    statExperience: '15+ Years Clinical Excellence',
    statDoctors: '12+ Specialist Doctors',
    statRating: '4.9/5 Patient Rating',

    // How It Works
    howItWorksTitle: 'How It Works',
    howItWorksSubtitle: 'Book a doctor consultation in 4 simple steps',
    step1Title: 'Select Specialist',
    step1Desc: 'Choose from our certified doctors across diverse medical faculties.',
    step2Title: 'Choose Date & Slot',
    step2Desc: 'Pick an IST morning or evening slot that fits your schedule.',
    step3Title: 'Patient Details',
    step3Desc: 'Provide required health and contact information safely.',
    step4Title: 'Instant Confirmation',
    step4Desc: 'Receive Appointment ID and full details directly on WhatsApp.',

    // Doctors Page & Cards
    doctorSpecialization: 'Specialization',
    experienceYears: 'Years Experience',
    languagesSpoken: 'Languages',
    consultationFee: 'Consultation Fee',
    availableTimings: 'Available Timings',
    registrationNumber: 'Reg. No.',
    bookNow: 'Book Appointment',
    viewProfile: 'View Full Profile',

    // Booking Flow
    stepDoctor: '1. Doctor',
    stepDateTime: '2. Date & Time',
    stepPatient: '3. Patient Details',
    stepReview: '4. Review & Confirm',
    consultationType: 'Consultation Type',
    inClinic: 'In-Clinic Consultation',
    online: 'Online Video Consultation',
    selectDate: 'Select Appointment Date',
    selectTime: 'Select Available Slot (IST)',
    reasonForVisit: 'Reason for Visit',
    symptoms: 'Current Symptoms / Health Concerns',
    emergencyContact: 'Emergency Contact Phone',
    confirmBooking: 'Confirm & Book Appointment',
    slotUnavailable: 'This appointment slot is no longer available.',
    bookingSuccess: 'Appointment booked successfully.',

    // Common
    loading: 'Loading...',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    doctor: 'Doctor',
    patient: 'Patient',
    action: 'Action',
  },
  hi: {
    // Header & Navigation
    clinicName: 'आरोग्य क्लिनिक',
    tagline: 'मल्टी-स्पेशियलिटी हेल्थकेयर और डायग्नोस्टिक सेंटर',
    home: 'होम',
    aboutClinic: 'क्लिनिक के बारे में',
    doctors: 'डॉक्टर्स',
    services: 'चिकित्सा सेवाएं',
    contact: 'संपर्क',
    bookAppointment: 'अपॉइंटमेंट बुक करें',
    patientPortal: 'मरीज पोर्टल',
    login: 'लॉग इन',
    signup: 'साइन अप',
    logout: 'लॉग आउट',
    dashboard: 'डैशबोर्ड',
    adminConsole: 'व्यवस्थापक कंसोल',

    // Hero Section
    heroTitle: 'डॉक्टर अपॉइंटमेंट ऑनलाइन बुक करें',
    heroSubtitle: 'आरोग्य क्लिनिक में अनुभवी विशेषज्ञों से परामर्श लें। व्यापक स्वास्थ्य सेवा, सत्यापित डॉक्टर, आसान शेड्यूलिंग और तुरंत व्हाट्सएप सूचनाएं।',
    viewDoctors: 'डॉक्टर देखें',
    callUs: 'रिसेप्शन पर कॉल करें',
    emergency24x7: '24x7 हेल्पलाइन',
    chatOnWhatsApp: 'व्हाट्सएप पर बात करें',

    // Stats
    statPatients: '२५,०००+ संतुष्ट मरीज',
    statExperience: '१५+ वर्ष का अनुभव',
    statDoctors: '१२+ विशेषज्ञ डॉक्टर',
    statRating: '४.९/५ मरीज रेटिंग',

    // How It Works
    howItWorksTitle: 'अपॉइंटमेंट कैसे बुक करें',
    howItWorksSubtitle: 'केवल ४ सरल चरणों में डॉक्टर का समय लें',
    step1Title: 'विशेषज्ञ चुनें',
    step1Desc: 'विभिन्न चिकित्सा विभागों से हमारे योग्य डॉक्टर चुनें।',
    step2Title: 'दिनांक और समय चुनें',
    step2Desc: 'अपनी सुविधानुसार सुबह या शाम का समय चुनें।',
    step3Title: 'मरीज का विवरण',
    step3Desc: 'आवश्यक स्वास्थ्य व संपर्क जानकारी सुरक्षित रूप से भरें।',
    step4Title: 'तुरंत पुष्टि',
    step4Desc: 'व्हाट्सएप पर अपॉइंटमेंट आईडी और पूरा विवरण प्राप्त करें।',

    // Doctors Page & Cards
    doctorSpecialization: 'विशेषज्ञता',
    experienceYears: 'वर्षों का अनुभव',
    languagesSpoken: 'भाषाएं',
    consultationFee: 'परामर्श शुल्क',
    availableTimings: 'उपलब्ध समय',
    registrationNumber: 'पंजीकरण संख्या',
    bookNow: 'अपॉइंटमेंट लें',
    viewProfile: 'प्रोफाइल देखें',

    // Booking Flow
    stepDoctor: '१. डॉक्टर',
    stepDateTime: '२. दिनांक व समय',
    stepPatient: '३. मरीज का विवरण',
    stepReview: '४. समीक्षा व पुष्टि',
    consultationType: 'परामर्श प्रकार',
    inClinic: 'क्लिनिक में परामर्श',
    online: 'ऑनलाइन वीडियो परामर्श',
    selectDate: 'अपॉइंटमेंट की तारीख चुनें',
    selectTime: 'उपलब्ध समय स्लॉट चुनें',
    reasonForVisit: 'परामर्श का कारण',
    symptoms: 'लक्षण व स्वास्थ्य संबंधी समस्याएं',
    emergencyContact: 'आपातकालीन संपर्क नंबर',
    confirmBooking: 'अपॉइंटमेंट पक्की करें',
    slotUnavailable: 'यह स्लॉट अब उपलब्ध नहीं है।',
    bookingSuccess: 'अपॉइंटमेंट सफलतापूर्वक दर्ज हो गया।',

    // Common
    loading: 'लोड हो रहा है...',
    saveChanges: 'बदलाव सहेजें',
    cancel: 'रद्द करें',
    status: 'स्थिति',
    date: 'तारीख',
    time: 'समय',
    doctor: 'डॉक्टर',
    patient: 'मरीज',
    action: 'कार्रवाई',
  },
  mr: {
    clinicName: 'आरोग्य क्लिनिक',
    tagline: 'मल्टी-स्पेशालिटी हेल्थकेअर आणि डायग्नोस्टिक केंद्र',
    home: 'मुख्यपृष्ठ',
    aboutClinic: 'क्लिनिक बद्दल',
    doctors: 'डॉक्टर्स',
    services: 'वैद्यकीय सेवा',
    contact: 'संपर्क',
    bookAppointment: 'अपॉइंटमेंट बुक करा',
    patientPortal: 'रुग्ण पोर्टल',
    login: 'लॉगिन',
    signup: 'नोंदणी करा',
    logout: 'बाहेर पडा',
    dashboard: 'डॅशबोर्ड',
    adminConsole: 'प्रशासक कन्सोल',
    heroTitle: 'डॉक्टर अपॉइंटमेंट ऑनलाइन बुक करा',
    heroSubtitle: 'आरोग्य क्लिनिक, पुणे येथे अनुभवी तज्ञांशी संपर्क साधा. दर्जेदार आरोग्य सेवा, पडताळलेले डॉक्टर्स आणि व्हॉट्सॲपवर त्वरित माहिती.',
    viewDoctors: 'डॉक्टर्स पहा',
    callUs: 'कॉल करा',
    emergency24x7: '२४x७ मदत कक्ष',
    chatOnWhatsApp: 'व्हॉट्सॲपवर चॅट करा',
    statPatients: '२५,०००+ समाधानी रुग्ण',
    statExperience: '१५+ वर्षांचा अनुभव',
    statDoctors: '१२+ तज्ज्ञ डॉक्टर्स',
    statRating: '४.९/५ रुग्ण रेटिंग',
    howItWorksTitle: 'अपॉइंटमेंट कशी बुक करावी',
    howItWorksSubtitle: '४ सोप्या टप्प्यांत डॉक्टरांची भेट बुक करा',
    step1Title: 'तज्ज्ञ निवडा',
    step1Desc: 'आमच्या प्रमाणित डॉक्टरांमधून योग्य डॉक्टर निवडा.',
    step2Title: 'तारीख व वेळ निवडा',
    step2Desc: 'आपल्या सोयीनुसार सकाळ किंवा संध्याकाळची वेळ निवडा.',
    step3Title: 'रुग्णाची माहिती',
    step3Desc: 'आवश्यक आरोग्य आणि संपर्क माहिती सुरक्षितपणे भरा.',
    step4Title: 'त्वरित पुष्टी',
    step4Desc: 'थेट व्हॉट्सॲपवर अपॉइंटमेंट आयडी व तपशील मिळवा.',
    doctorSpecialization: 'विशेषज्ञता',
    experienceYears: 'अनुभव वर्षे',
    languagesSpoken: 'भाषा',
    consultationFee: 'तपासणी शुल्क',
    availableTimings: 'उपलब्ध वेळ',
    registrationNumber: 'नोंदणी क्र.',
    bookNow: 'अपॉइंटमेंट बुक करा',
    viewProfile: 'तपशील पहा',
    stepDoctor: '१. डॉक्टर',
    stepDateTime: '२. दिनांक व वेळ',
    stepPatient: '३. रुग्णाचा तपशील',
    stepReview: '४. खात्री करा',
    consultationType: 'सल्ला प्रकार',
    inClinic: 'क्लिनिकमध्ये भेट',
    online: 'ऑनलाइन व्हिडिओ सल्ला',
    selectDate: 'तारीख निवडा',
    selectTime: 'उपलब्ध वेळ निवडा',
    reasonForVisit: 'भेटीचे कारण',
    symptoms: 'लक्षणे व तक्रारी',
    emergencyContact: 'आपत्कालीन फोन',
    confirmBooking: 'अपॉइंटमेंट निश्चित करा',
    slotUnavailable: 'हा स्लॉट आता उपलब्ध नाही.',
    bookingSuccess: 'अपॉइंटमेंट यशस्वीरीत्या बुक झाली.',
    loading: 'लोड होत आहे...',
    saveChanges: 'बदल जतन करा',
    cancel: 'रद्द करा',
    status: 'स्थिती',
    date: 'दिनांक',
    time: 'वेळ',
    doctor: 'डॉक्टर',
    patient: 'रुग्ण',
    action: 'कृती',
  }
};

interface I18nContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('aarogya_lang') as SupportedLanguage;
    return (saved && ['en', 'hi', 'mr'].includes(saved)) ? saved : 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('aarogya_lang', lang);
  };

  const t = (key: keyof typeof translations['en']): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || String(key);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
