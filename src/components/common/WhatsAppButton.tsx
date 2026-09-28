import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const WhatsAppButton: React.FC = () => {
  const { clinicSettings } = useClinic();
  const [isOpen, setIsOpen] = useState(false);

  const phone = clinicSettings?.whatsappNumber || '+91 9876543210';
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);

  const defaultMessage = `Hello Aarogya Clinic! I am looking to book a doctor consultation. Could you please share the available specialist doctors and timings?`;
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-in slide-in-from-bottom-2 duration-200 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-slate-800">Aarogya Clinic WhatsApp</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="py-2.5 text-slate-600 leading-relaxed">
            Need urgent assistance, appointment confirmation, or doctor consultation queries? Connect directly with our front desk.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open WhatsApp Chat</span>
          </a>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-emerald-200"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp (+91 9876543210)"
      >
        <MessageSquare className="w-6 h-6 fill-current text-white" />
      </button>
    </div>
  );
};
