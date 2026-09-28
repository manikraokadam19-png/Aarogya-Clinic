import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatINR } from '../../utils/india';
import { Clock, CheckCircle2, ChevronRight, Stethoscope, ShieldCheck } from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const { services } = useClinic();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Medical & Diagnostic Care
        </span>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
          Our Clinical Services & Transparent Fees
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          All consultations and medical diagnostic tests are conducted according to strict clinical governance standards. Transparent pricing with no hidden charges.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div
            key={service.id}
            className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                  {service.department}
                </span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">
                  {formatINR(service.fee)}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {service.name}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {service.description}
              </p>

              <div className="pt-2 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="tabular-nums">Approx. {service.durationMinutes} mins</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
                  <span>Certified Doctor</span>
                </span>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('book')}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Book This Service</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
