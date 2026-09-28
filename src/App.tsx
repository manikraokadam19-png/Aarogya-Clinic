import React, { useState } from 'react';
import { I18nProvider } from './i18n';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { DoctorsPage } from './pages/public/DoctorsPage';
import { DoctorProfilePage } from './pages/public/DoctorProfilePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ContactPage } from './pages/public/ContactPage';
import { BookAppointmentPage } from './pages/public/BookAppointmentPage';
import { ConfirmationPage } from './pages/public/ConfirmationPage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { LegalPages } from './pages/public/LegalPages';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { MyAppointmentsPage } from './pages/patient/MyAppointmentsPage';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import {
  RescheduleModal,
  CancelModal,
  AppointmentDetailsModal
} from './components/common/AppointmentModals';
import { Appointment } from './types';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [confirmedWhatsAppMsg, setConfirmedWhatsAppMsg] = useState<string>('');

  // Modals
  const [activeModalApt, setActiveModalApt] = useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { refreshData } = useClinic();

  const handleNavigate = (tab: string, param?: string) => {
    if (tab === 'doctor-profile' && param) {
      setSelectedDoctorId(param);
    }
    if (tab === 'book' && param) {
      setSelectedDoctorId(param);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (appointment: Appointment, whatsappMessage: string) => {
    setConfirmedAppointment(appointment);
    setConfirmedWhatsAppMsg(whatsappMessage);
    setCurrentTab('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReschedule = (apt: Appointment) => {
    setActiveModalApt(apt);
    setShowRescheduleModal(true);
  };

  const handleOpenCancel = (apt: Appointment) => {
    setActiveModalApt(apt);
    setShowCancelModal(true);
  };

  const handleOpenDetails = (apt: Appointment) => {
    setActiveModalApt(apt);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header currentTab={currentTab} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentTab === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentTab === 'about' && <AboutPage onNavigate={handleNavigate} />}
        {currentTab === 'doctors' && <DoctorsPage onNavigate={handleNavigate} />}
        {currentTab === 'doctor-profile' && (
          <DoctorProfilePage doctorId={selectedDoctorId} onNavigate={handleNavigate} />
        )}
        {currentTab === 'services' && <ServicesPage onNavigate={handleNavigate} />}
        {currentTab === 'contact' && <ContactPage />}
        {currentTab === 'book' && (
          <BookAppointmentPage
            initialDoctorId={selectedDoctorId}
            onNavigate={handleNavigate}
            onBookingSuccess={handleBookingSuccess}
          />
        )}
        {currentTab === 'confirmation' && confirmedAppointment && (
          <ConfirmationPage
            appointment={confirmedAppointment}
            whatsappMessage={confirmedWhatsAppMsg}
            onNavigate={handleNavigate}
          />
        )}
        {currentTab === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {currentTab === 'signup' && <SignupPage onNavigate={handleNavigate} />}
        {currentTab === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}
        {currentTab === 'privacy' && <LegalPages type="privacy" onNavigate={handleNavigate} />}
        {currentTab === 'terms' && <LegalPages type="terms" onNavigate={handleNavigate} />}
        {currentTab === 'patient-dashboard' && (
          <PatientDashboard
            onNavigate={handleNavigate}
            onOpenReschedule={handleOpenReschedule}
            onOpenCancel={handleOpenCancel}
            onOpenDetails={handleOpenDetails}
          />
        )}
        {currentTab === 'my-appointments' && (
          <MyAppointmentsPage
            onNavigate={handleNavigate}
            onOpenReschedule={handleOpenReschedule}
            onOpenCancel={handleOpenCancel}
            onOpenDetails={handleOpenDetails}
          />
        )}
        {currentTab === 'patient-profile' && <PatientProfilePage />}
        {currentTab === 'admin-dashboard' && (
          <AdminDashboard
            onOpenReschedule={handleOpenReschedule}
            onOpenCancel={handleOpenCancel}
            onOpenDetails={handleOpenDetails}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <WhatsAppButton />

      {/* Appointment Action Modals */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        appointment={activeModalApt}
        onClose={() => {
          setShowRescheduleModal(false);
          setActiveModalApt(null);
        }}
        onSuccess={() => {
          refreshData();
        }}
      />

      <CancelModal
        isOpen={showCancelModal}
        appointment={activeModalApt}
        onClose={() => {
          setShowCancelModal(false);
          setActiveModalApt(null);
        }}
        onSuccess={() => {
          refreshData();
        }}
      />

      <AppointmentDetailsModal
        isOpen={showDetailsModal}
        appointment={activeModalApt}
        onClose={() => {
          setShowDetailsModal(false);
          setActiveModalApt(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ClinicProvider>
          <MainApp />
        </ClinicProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
