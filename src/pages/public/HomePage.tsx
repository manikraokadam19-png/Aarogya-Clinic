import React from 'react';
import {
  Calendar,
  Phone,
  MessageSquare,
  ShieldCheck,
  Award,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Baby,
  Bone,
  Sparkles,
  ChevronRight,
  Star,
  Activity
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useI18n } from '../../i18n';
import { formatINR } from '../../utils/india';

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { doctors, services, clinicSettings } = useClinic();
  const { t } = useI18n();

  const specializations = [
    { title: 'General Medicine', icon: Stethoscope, desc: 'Fever, diabetes, hypertension & chronic disease management', fee: '₹500' },
    { title: 'Cardiology', icon: HeartPulse, desc: 'Preventive cardiology, ECG, lipidology & heart health', fee: '₹800' },
    { title: 'Pediatrics', icon: Baby, desc: 'Child vaccination, infant wellness, growth & nutrition', fee: '₹600' },
    { title: 'Orthopedics', icon: Bone, desc: 'Joint pain, arthritis, fracture rehabilitation & spine care', fee: '₹700' },
    { title: 'Gynecology', icon: Sparkles, desc: 'Antenatal pregnancy care, PCOS/PCOD & women wellness', fee: '₹650' },
    { title: 'Dermatology', icon: Activity, desc: 'Clinical dermatology, acne, eczema, psoriasis & hair care', fee: '₹600' }
  ];

  const facilities = [
    { title: 'Digital X-Ray & Diagnostics', desc: 'Low-radiation 500mA digital radiography with rapid report generation in 30 minutes.' },
    { title: 'NABL-Aligned Pathology Lab', desc: 'Sterile sample collection for 68+ biochemistry, hematology, and lipid blood parameters.' },
    { title: '12-Lead Digital ECG Suite', desc: 'Immediate computerized rhythm evaluation analyzed by consultant cardiologists.' },
    { title: 'Day-Care Observation Lounge', desc: 'Short-stay air-conditioned recovery rooms with emergency oxygen & vital monitors.' },
    { title: 'In-House Registered Pharmacy', desc: '100% genuine temperature-controlled prescription medicines and vaccines.' },
    { title: 'Teleconsultation Studio', desc: 'Secure, high-definition online video consultations with instant digital prescriptions.' }
  ];

  const testimonials = [
    {
      name: 'Ramesh K. Joshi',
      location: 'Kothrud, Pune',
      rating: 5,
      comment: 'Booking with Dr. Rahul Sharma was seamless. I received an instant WhatsApp message with the appointment ID. Zero waiting time at the clinic and very compassionate diagnosis.'
    },
    {
      name: 'Deepali Shah',
      location: 'Deccan Gymkhana, Pune',
      rating: 5,
      comment: 'Dr. Priya Patel explained my cardiac ECG report in simple Marathi and Hindi. The clinic is spotless, strictly follows hygiene protocols, and the consultation fee of ₹800 is very fair.'
    },
    {
      name: 'Sunil Patil',
      location: 'Baner, Pune',
      rating: 5,
      comment: 'Took my 4-year-old son to Dr. Ananya Deshmukh for his booster immunization. Very gentle with kids. The online booking and reminder system saves so much time.'
    }
  ];

  const faqs = [
    {
      q: 'How does online appointment booking work at Aarogya Clinic?',
      a: 'Select your preferred doctor, pick an available morning or evening time slot in Indian Standard Time (IST), fill in basic patient details, and confirm. You immediately receive an Appointment ID and full appointment confirmation on WhatsApp.'
    },
    {
      q: 'Can I choose between In-Clinic and Online Video Consultation?',
      a: 'Yes, our clinic supports both In-Clinic consultations at our Pune centre and Online Video consultations from the comfort of your home.'
    },
    {
      q: 'What payment methods are supported for consultation fees?',
      a: 'We accept instant UPI (Google Pay, PhonePe, Paytm, BHIM), Indian debit/credit cards, Net Banking, or you may choose to Pay at Clinic Counter upon arrival.'
    },
    {
      q: 'Can I reschedule or cancel my appointment if plans change?',
      a: 'Yes, you can easily reschedule or cancel up to 2 hours before the scheduled slot via your Patient Dashboard or WhatsApp support.'
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/50 via-white to-slate-50 pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Tag */}
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-800">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                <span>Pune Premier Multi-Speciality Healthcare Centre</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500 font-normal">Established 2011</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                {t('heroTitle')}
              </h1>

              {/* Subtitle */}
              <p className="text-base text-slate-600 leading-relaxed max-w-xl">
                {t('heroSubtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('book')}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('bookAppointment')}</span>
                </button>

                <button
                  onClick={() => onNavigate('doctors')}
                  className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                >
                  {t('viewDoctors')}
                </button>

                <a
                  href={`https://wa.me/91${clinicSettings?.whatsappNumber?.replace(/\D/g, '').slice(-10) || '9876543210'}?text=${encodeURIComponent('Hello Aarogya Clinic, I would like to book a doctor appointment.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/80">
                <div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">25,000+</div>
                  <div className="text-[11px] text-slate-500">Patients Treated</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">14+ Years</div>
                  <div className="text-[11px] text-slate-500">Clinical Trust</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">6 Specialities</div>
                  <div className="text-[11px] text-slate-500">Senior Consultants</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">4.9 / 5.0</div>
                  <div className="text-[11px] text-slate-500">Patient Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-white">
                <img
                  src="/src/assets/images/clinic_hero_facility_1790564902018.jpg"
                  alt="Aarogya Clinic Reception and Consultation Lounge, Pune"
                  className="w-full h-80 sm:h-96 object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to styled medical visual
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>NABH-Quality Aligned Facility</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Modern Outpatient Care & Diagnostics
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    FC Road, Shivajinagar, Pune · Mon - Sat: 08:30 AM – 08:30 PM (IST)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Specializations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Clinical Specialities
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Comprehensive Care Across Departments
            </h2>
          </div>
          <button
            onClick={() => onNavigate('doctors')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition-colors"
          >
            <span>Explore all departments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specializations.map((spec, idx) => {
            const IconComponent = spec.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {spec.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {spec.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Consultation from <strong className="text-slate-900 tabular-nums">{spec.fee}</strong></span>
                  <button
                    onClick={() => onNavigate('book')}
                    className="text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Book</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Doctors Spotlight */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                Experienced Medical Faculty
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Consult With Our Senior Doctors
              </h2>
            </div>
            <button
              onClick={() => onNavigate('doctors')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View all 6 doctors</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 bg-slate-100">
                    <img
                      src={doc.avatarUrl}
                      alt={doc.fullName}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-slate-800 border border-slate-200 shadow-sm tabular-nums">
                      Fee: {formatINR(doc.consultationFee)}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {doc.fullName}
                    </h3>
                    <p className="text-xs font-medium text-teal-700">
                      {doc.qualification}
                    </p>
                    <p className="text-xs text-slate-600 font-semibold">
                      {doc.specialization}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.experienceYears} Years Clinical Exp</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.languages.slice(0, 2).join(', ')}</span>
                    </div>

                    <p className="text-xs text-slate-500 pt-1 line-clamp-2 leading-relaxed">
                      {doc.about}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigate('doctor-profile', doc.id)}
                    className="py-2.5 text-center text-xs font-semibold text-slate-700 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onNavigate('book', doc.id)}
                    className="py-2.5 text-center text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            {t('howItWorksTitle')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            {t('howItWorksSubtitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm relative">
            <span className="text-xs font-bold text-teal-600 mb-2 block">Step 01</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">{t('step1Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step1Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm relative">
            <span className="text-xs font-bold text-teal-600 mb-2 block">Step 02</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">{t('step2Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step2Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm relative">
            <span className="text-xs font-bold text-teal-600 mb-2 block">Step 03</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">{t('step3Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step3Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm relative">
            <span className="text-xs font-bold text-teal-600 mb-2 block">Step 04</span>
            <h3 className="text-base font-bold text-slate-900 mb-1">{t('step4Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Clinic Facilities */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
              Infrastructure & Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Advanced Clinical Facilities
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Equipped with computerized diagnostic labs, sterile OPD suites, and day-care monitoring units for patient safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac, idx) => (
              <div key={idx} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/70">
                <CheckCircle2 className="w-5 h-5 text-teal-400 mb-3" />
                <h3 className="text-sm font-bold text-slate-100 mb-1.5">{fac.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Patient Stories
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Trusted by Families Across Maharashtra
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed mb-4">
                  "{test.comment}"
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900">{test.name}</p>
                <p className="text-[11px] text-slate-500">{test.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Common Inquiries
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold tracking-tight">Ready to consult with a specialist?</h3>
            <p className="text-xs text-teal-100 max-w-lg leading-relaxed">
              Book online in less than 2 minutes. Instant confirmation and doctor chamber details delivered directly to your WhatsApp.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('book')}
              className="px-6 py-3 bg-white text-teal-900 hover:bg-teal-50 rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap"
            >
              Book Appointment Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
