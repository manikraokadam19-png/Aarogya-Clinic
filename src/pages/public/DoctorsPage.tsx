import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { formatINR } from '../../utils/india';
import { Clock, Shield, Languages, ChevronRight, Search, Filter } from 'lucide-react';

interface DoctorsPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({ onNavigate }) => {
  const { doctors } = useClinic();
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const specializations = ['All', ...Array.from(new Set(doctors.map(d => d.specialization.split('&')[0].trim())))];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSpec = selectedSpecialization === 'All' || doc.specialization.toLowerCase().includes(selectedSpecialization.toLowerCase());
    const matchesSearch = doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSpec && matchesSearch && doc.isActive;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Medical Faculty
        </span>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
          Our Specialist Doctors
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Certified consultants with decades of combined clinical experience across general medicine, cardiology, pediatrics, orthopedics, gynecology, and dermatology.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor name, specialization, or language..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none transition-all text-slate-800"
          />
        </div>

        {/* Specialization Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Speciality:</span>
          </span>
          {specializations.slice(0, 5).map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialization(spec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedSpecialization === spec
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doc => (
          <div
            key={doc.id}
            className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-60 bg-slate-100">
                <img
                  src={doc.avatarUrl}
                  alt={doc.fullName}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-slate-800 border border-slate-200 shadow-sm tabular-nums">
                  Fee: {formatINR(doc.consultationFee)}
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-medium text-white flex items-center gap-1">
                  <Shield className="w-3 h-3 text-teal-400" />
                  <span>{doc.councilRegNumber}</span>
                </div>
              </div>

              <div className="p-5 space-y-2.5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 hover:text-teal-700 transition-colors">
                    {doc.fullName}
                  </h3>
                  <p className="text-xs text-teal-700 font-semibold mt-0.5">
                    {doc.qualification}
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    {doc.specialization}
                  </p>
                </div>

                <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{doc.experienceYears} Years Clinical Exp</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Languages className="w-3 h-3 text-slate-400" />
                    <span>{doc.languages.join(', ')}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {doc.about}
                </p>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Chamber & Room
                  </span>
                  <p className="text-xs text-slate-700 font-medium">{doc.clinicRoom} (FC Road Clinic)</p>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 grid grid-cols-2 gap-2 border-t border-slate-100 mt-4">
              <button
                onClick={() => onNavigate('doctor-profile', doc.id)}
                className="py-2.5 text-center text-xs font-semibold text-slate-700 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={() => onNavigate('book', doc.id)}
                className="py-2.5 text-center text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm transition-colors"
              >
                Book Slot
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No doctors found matching your search.</p>
          <p className="text-xs text-slate-500 mt-1">Try selecting a different speciality or clearing the search query.</p>
          <button
            onClick={() => { setSelectedSpecialization('All'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
