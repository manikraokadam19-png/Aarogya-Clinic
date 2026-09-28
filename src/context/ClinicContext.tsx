import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Doctor,
  MedicalService,
  Appointment,
  ClinicSettings,
  WhatsAppNotificationLog
} from '../types';
import { useAuth } from './AuthContext';

interface ClinicContextType {
  doctors: Doctor[];
  services: MedicalService[];
  clinicSettings: ClinicSettings | null;
  myAppointments: Appointment[];
  allAppointments: Appointment[];
  whatsAppLogs: WhatsAppNotificationLog[];
  adminStats: any | null;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  fetchAvailableSlots: (doctorId: string, date: string) => Promise<{ availableSlots: string[]; isDoctorWorking: boolean; message?: string }>;
  bookAppointment: (bookingData: any) => Promise<{ success: boolean; appointment?: Appointment; whatsappMessage?: string; error?: string }>;
  updateAppointmentStatus: (id: string, status: string, details?: any) => Promise<{ success: boolean; error?: string }>;
  addDoctor: (doctorData: any) => Promise<{ success: boolean; error?: string }>;
  updateDoctor: (id: string, doctorData: any) => Promise<{ success: boolean; error?: string }>;
  addService: (serviceData: any) => Promise<{ success: boolean; error?: string }>;
  updateClinicSettings: (settingsData: any) => Promise<{ success: boolean; error?: string }>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<MedicalService[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppNotificationLog[]>([]);
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Load public data
  const loadPublicData = async () => {
    try {
      const [docRes, srvRes, setRes] = await Promise.all([
        fetch('/api/doctors'),
        fetch('/api/services'),
        fetch('/api/clinic/settings')
      ]);

      if (docRes.ok) setDoctors(await docRes.json());
      if (srvRes.ok) setServices(await srvRes.json());
      if (setRes.ok) setClinicSettings(await setRes.json());
    } catch (err) {
      console.error('Error fetching clinic data:', err);
    }
  };

  // Load authenticated data
  const loadAuthData = async () => {
    if (!token) return;

    try {
      // Patient appointments
      const myRes = await fetch('/api/appointments/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (myRes.ok) setMyAppointments(await myRes.json());

      // If admin, load all appointments and stats
      if (user?.role === 'admin') {
        const [allRes, statRes, waRes] = await Promise.all([
          fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/whatsapp-logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (allRes.ok) setAllAppointments(await allRes.json());
        if (statRes.ok) setAdminStats(await statRes.json());
        if (waRes.ok) setWhatsAppLogs(await waRes.json());
      }
    } catch (err) {
      console.error('Error fetching user clinic data:', err);
    }
  };

  const refreshData = async () => {
    setIsLoadingData(true);
    await loadPublicData();
    await loadAuthData();
    setIsLoadingData(false);
  };

  useEffect(() => {
    refreshData();
  }, [token, user]);

  const fetchAvailableSlots = async (doctorId: string, date: string) => {
    try {
      const res = await fetch(`/api/appointments/available-slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`);
      const data = await res.json();
      return {
        availableSlots: data.availableSlots || [],
        isDoctorWorking: data.isDoctorWorking ?? true,
        message: data.message
      };
    } catch (err) {
      return { availableSlots: [], isDoctorWorking: false };
    }
  };

  const bookAppointment = async (bookingData: any) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/appointments/book', {
        method: 'POST',
        headers,
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to book appointment' };
      }

      await refreshData();
      return {
        success: true,
        appointment: data.appointment,
        whatsappMessage: data.whatsappMessage
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const updateAppointmentStatus = async (id: string, status: string, details?: any) => {
    if (!token) return { success: false, error: 'Authorization required' };
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, ...details })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Update failed' };
      }
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const addDoctor = async (doctorData: any) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    try {
      const res = await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(doctorData)
      });
      if (!res.ok) {
        const d = await res.json();
        return { success: false, error: d.error };
      }
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateDoctor = async (id: string, doctorData: any) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(doctorData)
      });
      if (!res.ok) {
        const d = await res.json();
        return { success: false, error: d.error };
      }
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const addService = async (serviceData: any) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(serviceData)
      });
      if (!res.ok) {
        const d = await res.json();
        return { success: false, error: d.error };
      }
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateClinicSettings = async (settingsData: any) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    try {
      const res = await fetch('/api/clinic/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settingsData)
      });
      if (!res.ok) {
        const d = await res.json();
        return { success: false, error: d.error };
      }
      setClinicSettings(await res.json());
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        doctors,
        services,
        clinicSettings,
        myAppointments,
        allAppointments,
        whatsAppLogs,
        adminStats,
        isLoadingData,
        refreshData,
        fetchAvailableSlots,
        bookAppointment,
        updateAppointmentStatus,
        addDoctor,
        updateDoctor,
        addService,
        updateClinicSettings
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
