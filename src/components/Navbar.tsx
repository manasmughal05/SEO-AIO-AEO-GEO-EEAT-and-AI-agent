import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Sparkles, ShieldCheck, User, Menu, X, LogIn, ArrowRight, 
  LogOut, Settings, LayoutDashboard, ChevronDown, UserCheck, Globe 
} from 'lucide-react';
import { UserProfile } from '../types';
import { SupportedLanguage } from '../lib/translations';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout?: () => void;
  onStartAuditClick?: () => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪' },
  { code: 'de', label: 'DE', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  onStartAuditClick,
  language,
  onLanguageChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          id="nav-brand-logo"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-display">
                AI Visibility Auditor
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-semibold">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono -mt-0.5">
              Multi-Page SEO • AEO • GEO • EEAT
            </span>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors hover:text-white cursor-pointer ${
              currentView === 'landing' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('research')}
            className="transition-colors hover:text-white cursor-pointer"
          >
            Research Center
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="transition-colors hover:text-white cursor-pointer"
          >
            Audits & Reports
          </button>
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-indigo-500/30 transition-all text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              title="Change platform language"
            >
              <span>{activeLang.flag}</span>
              <span>{activeLang.label}</span>
              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-slate-900 border border-slate-800 p-1.5 shadow-2xl shadow-slate-950 z-50 animate-fadeIn">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      language === lang.code
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-md shadow-indigo-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="font-semibold">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                id="nav-btn-profile"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 transition-all text-sm font-medium text-slate-200 cursor-pointer group shadow-sm"
                title="Account Menu"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full ring-2 ring-indigo-500 group-hover:ring-cyan-400 object-cover transition-all"
                />
                <div className="text-left">
                  <span className="font-semibold block text-xs truncate max-w-[100px] leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono block leading-tight">
                    Online
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl shadow-indigo-950/80 backdrop-blur-xl z-50 animate-fadeIn text-xs">
                  {/* User info banner */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-2">
                    <div className="flex items-center gap-2.5">
                      <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-indigo-500" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-100 block truncate">{user.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono block truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-1">
                    <button
                      id="nav-dropdown-dashboard"
                      onClick={() => { onNavigate('dashboard'); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                      <span>Audit Dashboard</span>
                    </button>

                    <button
                      id="nav-dropdown-profile"
                      onClick={() => { onNavigate('profile'); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Profile & Settings</span>
                    </button>

                    <button
                      id="nav-dropdown-security"
                      onClick={() => { onNavigate('security'); setUserDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Account & Security</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-800/80 my-1.5" />

                  {/* Log out */}
                  <button
                    id="nav-dropdown-logout"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out / Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-btn-login"
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Log In</span>
              </button>

              <button
                id="nav-btn-signup"
                onClick={() => onOpenAuth('signup')}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </div>
          )}

          <button
            id="nav-btn-start-audit"
            onClick={() => {
              if (onStartAuditClick) onStartAuditClick();
              else onNavigate('dashboard');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Start Free Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile menu and user badge */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <button
              id="nav-mobile-user-link"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white cursor-pointer"
              title={`Signed in as ${user.name}`}
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500"
              />
              <span className="truncate max-w-[70px]">{user.name.split(' ')[0]}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          ) : (
            <button
              id="nav-mobile-login-quick"
              onClick={() => onOpenAuth('login')}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Log In</span>
            </button>
          )}

          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <button
            onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-900 text-sm"
          >
            Overview
          </button>
          <button
            onClick={() => { onNavigate('research'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-slate-200 hover:bg-slate-900 text-sm"
          >
            Research Center
          </button>
          <button
            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-indigo-400 font-semibold bg-indigo-950/30 text-sm"
          >
            Open Audit Dashboard
          </button>
          
          {user ? (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2.5 px-3 py-1.5">
                <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-200 block truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{user.email}</span>
                </div>
              </div>
              <button
                onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-cyan-400 font-semibold bg-cyan-950/40 text-xs"
              >
                Profile & Settings
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full text-left py-2 px-3 rounded-lg text-rose-400 font-semibold hover:bg-rose-500/10 text-xs flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="w-full py-2 px-3 rounded-lg bg-indigo-600 text-white text-center font-bold text-xs"
              >
                Log In
              </button>
              <button
                onClick={() => { onOpenAuth('signup'); setMobileMenuOpen(false); }}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-center font-bold text-xs"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
