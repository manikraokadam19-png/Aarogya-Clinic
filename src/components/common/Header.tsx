import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useI18n, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n';
import { Calendar, User, ShieldCheck, LogOut, Menu, X, Globe, PhoneCall } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate }) => {
  const { user, logout, quickDemoLogin } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t('home') },
    { id: 'about', label: t('aboutClinic') },
    { id: 'doctors', label: t('doctors') },
    { id: 'services', label: t('services') },
    { id: 'contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro-bar for emergency + demo switch */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-teal-400 font-medium">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>24x7 Emergency: +91 98765 00000</span>
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">
              Pune, Maharashtra (IST: Asia/Kolkata)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher for instant reviewing */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-[11px]">
              <span className="text-slate-400">Demo Accounts:</span>
              <button
                onClick={() => quickDemoLogin('admin')}
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                title="Login as Medical Director / Admin (Dr. Suresh Kulkarni)"
              >
                Admin
              </button>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => quickDemoLogin('patient')}
                className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
                title="Login as Patient (Rajesh Ramanathan)"
              >
                Patient
              </button>
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-0.5 px-1.5 rounded"
                title="Switch Language (भाषा)"
              >
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <span className="uppercase font-semibold tracking-wider text-[11px]">{language}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-slate-800 text-xs z-50">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between ${
                        language === lang.code ? 'font-semibold text-teal-700 bg-teal-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] uppercase text-slate-400">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract: Zone 1 (Brand) - Zone 2 (4-6 links) - Zone 3 (1-2 primary actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark in display face */}
        <button
          onClick={() => onNavigate('home')}
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 text-left hover:text-teal-700 transition-colors shrink-0"
        >
          <span>Aarogya</span>
          <span className="text-teal-600 font-semibold ml-1.5">Clinic</span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links with subtle hover underlines */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navLinks.map(link => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`whitespace-nowrap transition-colors py-1 relative ${
                  isActive ? 'text-teal-700 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'patient-dashboard')}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                  currentTab.includes('dashboard')
                    ? 'bg-teal-50 text-teal-800 border-teal-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                {user.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                ) : (
                  <User className="w-4 h-4 text-teal-600" />
                )}
                <span className="max-w-[120px] truncate">{user.fullName.split(' ')[0]}</span>
              </button>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                {t('login')}
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-300 hover:border-slate-400 rounded-lg transition-colors whitespace-nowrap"
              >
                {t('signup')}
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            onClick={() => onNavigate('book')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('bookAppointment')}</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 lg:hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-1 gap-1 text-sm font-medium text-slate-700">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                  currentTab === link.id ? 'bg-teal-50 text-teal-800 font-semibold' : 'hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => {
                    onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'patient-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg bg-teal-50 text-teal-800 font-medium text-sm flex items-center justify-between"
                >
                  <span>{user.role === 'admin' ? 'Admin Dashboard' : 'Patient Dashboard'}</span>
                  <span className="text-xs text-slate-500">{user.role}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => {
                    onNavigate('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-white bg-slate-900 rounded-lg"
                >
                  {t('signup')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
