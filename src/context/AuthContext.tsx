import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PatientProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: PatientProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: any) => Promise<{ success: boolean; phone?: string; simulatedOtp?: string; error?: string; userExists?: boolean }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resendOtp: (phone: string) => Promise<{ success: boolean; simulatedOtp?: string; error?: string }>;
  forgotPasswordRequest: (identifier: string) => Promise<{ success: boolean; phone?: string; simulatedOtp?: string; error?: string }>;
  forgotPasswordReset: (phone: string, resetToken: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<PatientProfile>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickDemoLogin: (role: 'admin' | 'patient') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('aarogya_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize or restore session
  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('aarogya_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setProfile(data.profile);
          setToken(storedToken);
        } else {
          localStorage.removeItem('aarogya_token');
          setToken(null);
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      localStorage.setItem('aarogya_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred' };
    }
  };

  const signup = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Signup failed',
          userExists: data.userExists || false
        };
      }
      return {
        success: true,
        phone: data.phone,
        simulatedOtp: data.simulatedOtp
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error occurred' };
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'OTP verification failed' };
      }
      if (data.token) {
        localStorage.setItem('aarogya_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setProfile(data.profile);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const resendOtp = async (phone: string) => {
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Could not resend OTP' };
      }
      return { success: true, simulatedOtp: data.simulatedOtp };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const forgotPasswordRequest = async (identifier: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Request failed' };
      }
      return { success: true, phone: data.phone, simulatedOtp: data.simulatedOtp };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const forgotPasswordReset = async (phone: string, resetToken: string, newPassword: string, confirmPassword: string) => {
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, resetToken, newPassword, confirmPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Reset failed' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const updateProfile = async (profileData: Partial<PatientProfile>) => {
    if (!token) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Update failed' };
      }
      setProfile(data.profile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('aarogya_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const quickDemoLogin = async (role: 'admin' | 'patient') => {
    if (role === 'admin') {
      await login('admin@aarogyaclinic.in', 'Admin@123');
    } else {
      await login('rajesh.raman@gmail.com', 'Patient@123');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        signup,
        verifyOtp,
        resendOtp,
        forgotPasswordRequest,
        forgotPasswordReset,
        updateProfile,
        logout,
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
