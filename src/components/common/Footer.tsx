import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Shield, ExternalLink } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { clinicSettings } = useClinic();

  const settings = clinicSettings || {
    name: 'Aarogya Multi-Speciality Clinic & Diagnostic Centre',
    phone: '+91 9876543210',
    emergencyHelpline: '+91 9876500000',
    email: 'appointments@aarogyaclinic.in',
    whatsappNumber: '+91 9876543210',
    addressFlat: 'Shop 104-106, 1st Floor',
    addressBuilding: 'Shivaji Commercial Complex',
    addressStreet: 'FC Road, Shivajinagar',
    addressArea: 'Deccan Gymkhana',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411004',
    openingHours: 'Mon - Sat: 08:30 AM - 08:30 PM, Sun: 09:00 AM - 01:00 PM (IST)'
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Clinic Brand & Trust */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">
                Aarogya <span className="text-teal-400 font-semibold">Clinic</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Serving families across Maharashtra with patient-first ethical medical care, NABH-aligned protocols, and experienced senior consultants.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Reg. No: MAH-PUN-CLINIC-2018-8842</span>
              </p>
              <p className="text-[11px] text-slate-400 pl-5">GSTIN: 27AABCA1234D1ZM</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Healthcare Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-teal-400 transition-colors">
                  General Medicine & Diabetology
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-teal-400 transition-colors">
                  Interventional Cardiology & ECG
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-teal-400 transition-colors">
                  Pediatrics & Child Immunization
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-teal-400 transition-colors">
                  Orthopedics & Joint Care
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('doctors')} className="hover:text-teal-400 transition-colors">
                  Obstetrics & Gynecology
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-teal-400 transition-colors">
                  Master Health Checkup Packages
                </button>
              </li>
            </ul>
          </div>

          {/* Address & Timings */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Clinic Location (Pune)
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {settings.addressFlat}, {settings.addressBuilding}, {settings.addressStreet}, {settings.addressArea}, {settings.city}, {settings.state} - {settings.pincode}
                </p>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{settings.openingHours}</p>
              </div>
            </div>
          </div>

          {/* Emergency & Appointments */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Appointments & Helpline
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white transition-colors">
                  {settings.phone} (Reception)
                </a>
              </div>
              <div className="flex items-center gap-2 text-rose-400 font-medium">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <a href={`tel:${settings.emergencyHelpline}`} className="hover:underline">
                  {settings.emergencyHelpline} (Ambulance/Emergency)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                  {settings.email}
                </a>
              </div>
              <div className="pt-2">
                <a
                  href={`https://wa.me/91${settings.whatsappNumber.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent('Hello Aarogya Clinic, I would like to inquire about doctor appointments.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Appointment Desk</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Aarogya Multi-Speciality Clinic. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('privacy')} className="hover:text-slate-200 transition-colors">
              Privacy Policy (India DPDP Act)
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('terms')} className="hover:text-slate-200 transition-colors">
              Terms & Conditions
            </button>
            <span>·</span>
            <span className="text-slate-400">All prices in Indian Rupees (₹ / INR)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
