import React, { useState } from 'react';
import { 
  LayoutDashboard, PlusCircle, Globe, Layers, FileText, BookOpen, Bot, 
  Sparkles, Download, User, ShieldCheck, CreditCard, LogOut, Menu, X, 
  ArrowLeft, Search
} from 'lucide-react';
import { UserProfile, WebsiteAudit } from '../types';
import { SupportedLanguage } from '../lib/translations';

interface DashboardLayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: UserProfile;
  auditsCount: number;
  activeAudit: WebsiteAudit | null;
  onReturnToLanding: () => void;
  onLogout: () => void;
  children: React.ReactNode;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentTab,
  onSelectTab,
  user,
  auditsCount,
  activeAudit,
  onReturnToLanding,
  onLogout,
  children,
  language,
  onLanguageChange,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const NAV_ITEMS = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, section: 'Core' },
    { id: 'add-website', label: 'Add Website', icon: PlusCircle, section: 'Core' },
    { id: 'my-websites', label: 'My Websites', icon: Globe, count: auditsCount, section: 'Auditing' },
    { id: 'url-explorer', label: 'URL Explorer', icon: Layers, count: activeAudit?.urlReports.length, section: 'Auditing' },
    { id: 'reports', label: 'Complete Reports', icon: FileText, section: 'Auditing' },
    { id: 'research', label: 'Research Center', icon: BookOpen, section: 'AI Intelligence' },
    { id: 'recommendations', label: 'AI Directives', icon: Sparkles, section: 'AI Intelligence' },
    { id: 'exports', label: 'Export Reports', icon: Download, section: 'Data' },
    { id: 'profile', label: 'Profile Settings', icon: User, section: 'Account' },
    { id: 'security', label: 'Account & Security', icon: ShieldCheck, section: 'Account' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden selection:bg-indigo-500/30">
      
      {/* 1. Desktop & Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Brand header */}
          <div
            onClick={onReturnToLanding}
            className="flex items-center gap-2.5 px-2 py-1.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white font-display block">
                AI Visibility Auditor
              </span>
              <span className="text-[10px] text-slate-400 font-mono">SEO • AEO • GEO • EEAT</span>
            </div>
          </div>

          {/* Navigation Links Grouped */}
          <nav className="space-y-1 text-xs">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[10px]">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card in Bottom Sidebar */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/60 space-y-3">
          <div
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 cursor-pointer transition-colors"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-9 h-9 rounded-full ring-1 ring-indigo-500 object-cover"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-100 truncate block">
                {user.name}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono truncate block font-medium">
                Profile & Settings
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReturnToLanding}
              className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>
            <button
              onClick={onLogout}
              className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white"
              title="Toggle navigation"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Direct Back to Landing / Home Button */}
            <button
              id="dash-back-home-btn"
              onClick={onReturnToLanding}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm flex-shrink-0"
              title="Return to Main Landing Page"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline">Back to Home</span>
              <span className="xs:hidden">Home</span>
            </button>

            {/* Quick Back to Overview when in subtab */}
            {currentTab !== 'overview' && (
              <button
                onClick={() => onSelectTab('overview')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 hover:text-white border border-indigo-800/50 text-xs font-medium transition-all"
                title="Back to Dashboard Overview"
              >
                <span>← Overview</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 truncate">
              <span className="font-mono text-slate-500">/</span>
              <span className="font-bold text-slate-200 capitalize">
                {currentTab.replace('-', ' ')}
              </span>
              {activeAudit && (
                <>
                  <span className="text-slate-600">/</span>
                  <span className="text-cyan-400 font-mono truncate max-w-[140px]">
                    {activeAudit.domain}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Global Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
                title="Change platform language"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="ur">🇵🇰 اردو</option>
                <option value="es">🇪🇸 ES</option>
                <option value="ar">🇦🇪 العربية</option>
                <option value="de">🇩🇪 DE</option>
                <option value="ja">🇯🇵 日本語</option>
              </select>
            </div>

            <button
              onClick={() => onSelectTab('add-website')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Audit</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
