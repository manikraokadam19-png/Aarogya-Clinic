import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, KeyRound, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickDemoLogin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or +91 mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    const res = await login(identifier, password);
    setIsSubmitting(false);

    if (res.success) {
      // Navigate to patient dashboard or admin
      onNavigate('patient-dashboard');
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleDemoClick = async (role: 'admin' | 'patient') => {
    setError('');
    setIsSubmitting(true);
    await quickDemoLogin(role);
    setIsSubmitting(false);
    onNavigate(role === 'admin' ? 'admin-dashboard' : 'patient-dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-teal-50 border border-teal-200 rounded-xl text-teal-700 flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Account Login
          </h1>
          <p className="text-xs text-slate-500">
            Sign in with your Email ID or registered +91 Mobile Number
          </p>
        </div>

        {/* Demo Fast-Login Box for Evaluation */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span>Instant Demo Access:</span>
            <span className="text-[10px] text-slate-400">One-click sign in</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="py-2 px-2.5 bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 hover:border-teal-300 rounded-lg font-medium text-[11px] text-center transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Admin / Director</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('patient')}
              className="py-2 px-2.5 bg-white hover:bg-sky-50 text-sky-800 border border-slate-200 hover:border-sky-300 rounded-lg font-medium text-[11px] text-center transition-colors flex items-center justify-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>Patient (Ramesh)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email ID or +91 Mobile Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. rajesh.raman@gmail.com or 9822012345"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] text-teal-700 hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-none text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Verifying...' : 'Login to Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          New to Aarogya Clinic?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-teal-700 font-semibold hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
