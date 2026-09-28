import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { Doctor, Appointment, MedicalService } from '../../types';
import {
  formatDateDDMMYYYY,
  formatINR,
  getCurrentISTDateString,
  generateWhatsAppLink,
  generateWhatsAppMessage
} from '../../utils/india';
import {
  ShieldCheck,
  Users,
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Settings,
  DollarSign,
  FileText,
  Edit2,
  Check
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenReschedule: (apt: Appointment) => void;
  onOpenCancel: (apt: Appointment) => void;
  onOpenDetails: (apt: Appointment) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenReschedule,
  onOpenCancel,
  onOpenDetails
}) => {
  const {
    adminStats,
    allAppointments,
    doctors,
    services,
    whatsAppLogs,
    clinicSettings,
    updateAppointmentStatus,
    addDoctor,
    updateDoctor,
    addService,
    updateClinicSettings,
    refreshData
  } = useClinic();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'appointments' | 'doctors' | 'patients' | 'services' | 'whatsapp' | 'settings'
  >('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');

  // Complete modal state
  const [completeModalApt, setCompleteModalApt] = useState<Appointment | null>(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');

  // Doctor Form Modal
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    fullName: '',
    qualification: '',
    specialization: '',
    experienceYears: 10,
    councilRegNumber: '',
    consultationFee: 500,
    clinicRoom: 'OPD Room 105',
    about: '',
    languages: 'English, Hindi, Marathi',
    expertise: 'General Medical Care, Outpatient Diagnostics'
  });

  // Services Form Modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    department: 'General Medicine',
    description: '',
    fee: 500,
    durationMinutes: 30
  });

  const stats = adminStats || {
    totalPatients: 48,
    totalDoctors: doctors.length,
    todayAppointmentsCount: 4,
    upcomingAppointmentsCount: 12,
    completedAppointmentsCount: 28,
    cancelledAppointmentsCount: 2,
    totalAppointmentsCount: allAppointments.length,
    totalRevenueINR: 34500
  };

  const filteredAppointments = allAppointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.appointmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.patientPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === 'all' || apt.doctorId === doctorFilter;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const handleMarkComplete = async () => {
    if (!completeModalApt) return;
    await updateAppointmentStatus(completeModalApt.id, 'completed', {
      prescriptionNotes
    });
    setCompleteModalApt(null);
    setPrescriptionNotes('');
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoctor({
      ...doctorForm,
      languages: doctorForm.languages.split(',').map(s => s.trim()),
      expertise: doctorForm.expertise.split(',').map(s => s.trim())
    });
    setShowDoctorModal(false);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    await addService(serviceForm);
    setShowServiceModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Administrative Console
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Logged in as Medical Director</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Clinic Operations & Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Full control over doctors, patient records, IST schedules, and WhatsApp delivery logs.
          </p>
        </div>

        <button
          onClick={() => setShowDoctorModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Admin Subtabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: Activity },
          { id: 'appointments', label: `Appointments (${allAppointments.length})`, icon: Calendar },
          { id: 'doctors', label: `Doctors (${doctors.length})`, icon: Users },
          { id: 'services', label: `Clinic Services (${services.length})`, icon: FileText },
          { id: 'whatsapp', label: `WhatsApp Logs (${whatsAppLogs.length})`, icon: MessageSquare },
          { id: 'settings', label: 'Clinic Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Patients
              </span>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {stats.totalPatients}
              </p>
              <span className="text-[11px] text-slate-400">Registered records</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Specialists
              </span>
              <p className="text-2xl font-bold text-teal-700 tabular-nums">
                {stats.totalDoctors}
              </p>
              <span className="text-[11px] text-slate-400">Consulting doctors</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Today Appointments
              </span>
              <p className="text-2xl font-bold text-sky-700 tabular-nums">
                {stats.todayAppointmentsCount}
              </p>
              <span className="text-[11px] text-slate-400">Scheduled for today</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Revenue (INR)
              </span>
              <p className="text-2xl font-bold text-emerald-700 tabular-nums">
                {formatINR(stats.totalRevenueINR)}
              </p>
              <span className="text-[11px] text-slate-400">Fees collected</span>
            </div>
          </div>

          {/* Quick Appointments Overview Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Appointments</h3>
                <p className="text-xs text-slate-500">Live booking queue and status flags</p>
              </div>
              <button
                onClick={() => setActiveTab('appointments')}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Manage All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Patient</th>
                    <th className="pb-3">Doctor</th>
                    <th className="pb-3">Date (IST)</th>
                    <th className="pb-3">Slot</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allAppointments.slice(0, 5).map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50">
                      <td className="py-3 font-mono font-medium text-slate-800">{apt.appointmentNumber}</td>
                      <td className="py-3 font-medium text-slate-900">
                        {apt.patientName}
                        <span className="block text-[11px] text-slate-400">{apt.patientPhone}</span>
                      </td>
                      <td className="py-3 text-slate-700">{apt.doctorName}</td>
                      <td className="py-3 text-slate-700">{formatDateDDMMYYYY(apt.appointmentDate)}</td>
                      <td className="py-3 font-medium text-slate-800 tabular-nums">{apt.appointmentTime}</td>
                      <td className="py-3 capitalize text-slate-600">{apt.consultationType}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          apt.status === 'confirmed' ? 'bg-teal-50 text-teal-800' :
                          apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800' :
                          apt.status === 'rescheduled' ? 'bg-amber-50 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-medium tabular-nums">{formatINR(apt.consultationFee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS MANAGEMENT TAB */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient name, phone, or appointment ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:border-teal-600 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={doctorFilter}
                onChange={e => setDoctorFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none"
              >
                <option value="all">All Doctors</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-4">Appt Number</th>
                    <th className="p-4">Patient Info</th>
                    <th className="p-4">Doctor</th>
                    <th className="p-4">Date & Slot (IST)</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Fee</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/80">
                      <td className="p-4 font-mono font-medium text-slate-900">{apt.appointmentNumber}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{apt.patientName}</span>
                        <span className="text-[11px] text-slate-500 tabular-nums">{apt.patientPhone}</span>
                      </td>
                      <td className="p-4 text-slate-800 font-medium">
                        Dr. {apt.doctorName}
                        <span className="block text-[11px] text-teal-700">{apt.doctorSpecialization}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{formatDateDDMMYYYY(apt.appointmentDate)}</span>
                        <span className="text-[11px] text-slate-500 tabular-nums">{apt.appointmentTime}</span>
                      </td>
                      <td className="p-4 capitalize text-slate-600">{apt.consultationType}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          apt.status === 'confirmed' ? 'bg-teal-50 text-teal-800' :
                          apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800' :
                          apt.status === 'rescheduled' ? 'bg-amber-50 text-amber-800' :
                          apt.status === 'cancelled' ? 'bg-rose-50 text-rose-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-4 font-semibold tabular-nums">{formatINR(apt.consultationFee)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => setCompleteModalApt(apt)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                                title="Mark Completed & Add Prescription"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => onOpenReschedule(apt)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-medium"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => onOpenCancel(apt)}
                                className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded text-[11px] font-medium"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => onOpenDetails(apt)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DOCTORS MANAGEMENT TAB */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Registered Medical Consultants</h3>
            <button
              onClick={() => setShowDoctorModal(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.fullName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{doc.fullName}</h4>
                    <p className="text-xs text-teal-700 font-medium">{doc.specialization}</p>
                    <p className="text-[11px] text-slate-500">{doc.qualification}</p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">{doc.councilRegNumber}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Consultation Fee:</span>
                    <strong className="text-slate-900 tabular-nums">{formatINR(doc.consultationFee)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Chamber:</span>
                    <strong className="text-slate-900">{doc.clinicRoom}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience:</span>
                    <strong className="text-slate-900">{doc.experienceYears} Years</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    doc.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {doc.isActive ? 'Active Outpatient' : 'On Leave'}
                  </span>
                  <button
                    onClick={() => updateDoctor(doc.id, { isActive: !doc.isActive })}
                    className="text-xs text-teal-700 font-semibold hover:underline"
                  >
                    Toggle Active Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Clinic Departments & Diagnostic Pricing</h3>
            <button
              onClick={() => setShowServiceModal(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                <tr>
                  <th className="p-4">Service Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Est. Duration</th>
                  <th className="p-4 text-right">Fee (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map(srv => (
                  <tr key={srv.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{srv.name}</td>
                    <td className="p-4 text-teal-700 font-medium">{srv.department}</td>
                    <td className="p-4 text-slate-600 max-w-sm">{srv.description}</td>
                    <td className="p-4 text-slate-500 tabular-nums">{srv.durationMinutes} mins</td>
                    <td className="p-4 text-right font-bold text-slate-900 tabular-nums">{formatINR(srv.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WHATSAPP LOGS TAB */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">WhatsApp Notification Audit Logs</h3>
            <p className="text-xs text-slate-500">
              All transactional appointment alerts dispatched to patients via WhatsApp Business API.
            </p>
          </div>

          <div className="space-y-3">
            {whatsAppLogs.map(log => (
              <div key={log.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-slate-900">Recipient: {log.recipientName} ({log.recipientPhone})</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span className="capitalize">{log.templateType.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className="tabular-nums">{new Date(log.sentAt).toLocaleTimeString()} IST</span>
                  </div>
                </div>

                <pre className="p-3 bg-slate-50 rounded-lg text-[11px] font-mono whitespace-pre-wrap text-slate-700 border border-slate-100">
                  {log.messageText}
                </pre>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Provider: <strong>{log.provider}</strong></span>
                  <span className="text-emerald-700 font-semibold capitalize flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Delivered to +91 Mobile</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-3xl">
          <h3 className="text-base font-bold text-slate-900">Clinic Profile & Registration Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Clinic Name</span>
              <span className="font-bold text-slate-900">{clinicSettings?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Registration Number</span>
              <span className="font-bold text-slate-900">{clinicSettings?.registrationNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">GSTIN</span>
              <span className="font-semibold text-slate-900">{clinicSettings?.gstNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">WhatsApp Desk</span>
              <span className="font-semibold text-slate-900 tabular-nums">{clinicSettings?.whatsappNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Emergency Ambulance Helpline</span>
              <span className="font-semibold text-rose-600 tabular-nums">{clinicSettings?.emergencyHelpline}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">UPI Merchant VPA</span>
              <span className="font-semibold text-slate-900">{clinicSettings?.upiId}</span>
            </div>
          </div>
        </div>
      )}

      {/* MARK COMPLETE MODAL */}
      {completeModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">Complete Consultation</h3>
            <p className="text-xs text-slate-500">
              Patient: <strong>{completeModalApt.patientName}</strong> · Dr. {completeModalApt.doctorName}
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Doctor Prescription / Clinical Notes
              </label>
              <textarea
                rows={4}
                value={prescriptionNotes}
                onChange={e => setPrescriptionNotes(e.target.value)}
                placeholder="Prescription medicines, follow-up advice in 7 days..."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:border-teal-600 outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setCompleteModalApt(null)}
                className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkComplete}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DOCTOR MODAL */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Add Consulting Doctor</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Dr. Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kulkarni"
                  value={doctorForm.fullName}
                  onChange={e => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Qualification *</label>
                  <input
                    type="text"
                    required
                    placeholder="MBBS, MD"
                    value={doctorForm.qualification}
                    onChange={e => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Specialization *</label>
                  <input
                    type="text"
                    required
                    placeholder="Neurologist"
                    value={doctorForm.specialization}
                    onChange={e => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Council Reg No *</label>
                  <input
                    type="text"
                    required
                    placeholder="MMC-2018-99231"
                    value={doctorForm.councilRegNumber}
                    onChange={e => setDoctorForm({ ...doctorForm, councilRegNumber: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Consultation Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={doctorForm.consultationFee}
                    onChange={e => setDoctorForm({ ...doctorForm, consultationFee: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Medical Service</h3>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thyroid Profile Test"
                  value={serviceForm.name}
                  onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.department}
                    onChange={e => setServiceForm({ ...serviceForm, department: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.fee}
                    onChange={e => setServiceForm({ ...serviceForm, fee: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
