import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { validateIndianMobile } from '../../utils/india';

export const ContactPage: React.FC = () => {
  const { clinicSettings } = useClinic();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'Appointment Enquiry',
    message: ''
  });
  const [error, setError] = useState('');

  const settings = clinicSettings || {
    name: 'Aarogya Multi-Speciality Clinic & Diagnostic Centre',
    phone: '+91 9876543210',
    emergencyHelpline: '+91 9876500000',
    email: 'appointments@aarogyaclinic.in',
    whatsappNumber: '+91 9876543210',
    addressFlat: 'Shop 104-106, 1st Floor',
    addressBuilding: 'Shivaji Commercial Complex',
    addressStreet: 'Fergusson College Road, Shivajinagar',
    addressArea: 'Deccan Gymkhana',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411004',
    openingHours: 'Mon - Sat: 08:30 AM - 08:30 PM, Sun: 09:00 AM - 01:00 PM (IST)'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!validateIndianMobile(formData.phone)) {
      setError('Please enter a valid 10-digit Indian mobile number (+91).');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Get In Touch
        </span>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
          Contact Aarogya Clinic (Pune)
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Reach our reception desk for appointment queries, diagnostic test reports, or general hospital navigation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Information & Clinic Address */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900">
              Clinic Address & Timings
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">{settings.name}</p>
                  <p className="mt-0.5">{settings.addressFlat}, {settings.addressBuilding}</p>
                  <p>{settings.addressStreet}, {settings.addressArea}</p>
                  <p>{settings.city}, {settings.state} - <strong className="text-slate-800 tabular-nums">{settings.pincode}</strong>, India</p>
                  <p className="text-slate-400 mt-1">Landmark: Opposite Goodluck Chowk & Fergusson College Main Gate</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Clock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Consultation Timings (IST)</p>
                  <p className="mt-0.5">{settings.openingHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Phone className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Phone Desk</p>
                  <p className="mt-0.5">{settings.phone} (Reception)</p>
                  <p className="text-rose-600 font-semibold">{settings.emergencyHelpline} (24x7 Ambulance & Emergency)</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                <Mail className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Official Email</p>
                  <p className="mt-0.5">{settings.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/91${settings.whatsappNumber.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent('Hello Aarogya Clinic, I would like to inquire about OPD timings.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Reception on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact & Enquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Send an Enquiry or Feedback
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Our front desk executive will contact you back on phone/WhatsApp within 30 minutes during OPD hours.
            </p>

            {submitted ? (
              <div className="p-6 bg-teal-50 border border-teal-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
                <h4 className="text-sm font-bold text-teal-900">Enquiry Received</h4>
                <p className="text-xs text-teal-800 leading-relaxed max-w-sm mx-auto">
                  Thank you, {formData.name}. Our clinic desk has received your request and will reach out to +91 {formData.phone.slice(-10)} shortly.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: '', phone: '', email: '', subject: 'Appointment Enquiry', message: '' }); }}
                  className="mt-3 text-xs font-semibold text-teal-700 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Joshi"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Indian Mobile Number (+91) *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs text-slate-500 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-3 py-2 text-xs rounded-r-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800 tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none bg-white text-slate-800"
                    >
                      <option>Appointment Enquiry</option>
                      <option>Pathology / Blood Test Reports</option>
                      <option>Doctor Consultation Timings</option>
                      <option>Online Video Consultation Help</option>
                      <option>Feedback / Suggestion</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Message / Specific Question
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what you are looking for..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Enquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
