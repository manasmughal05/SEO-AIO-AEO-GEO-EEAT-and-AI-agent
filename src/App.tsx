import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardView } from './components/DashboardView';
import { UrlExplorerView } from './components/UrlExplorerView';
import { CompleteWebsiteReportView } from './components/CompleteWebsiteReportView';
import { ResearchCenterView } from './components/ResearchCenterView';
import { ProfileView } from './components/ProfileView';
import { AccountSecurityView } from './components/AccountSecurityView';
import { IndividualUrlReportModal } from './components/IndividualUrlReportModal';
import { AuditRunnerModal } from './components/AuditRunnerModal';
import { AuthModal } from './components/AuthModal';
import { LegalModals } from './components/LegalModals';
import { SmartUrlInput } from './components/SmartUrlInput';
import { EnterpriseAuditOptions, EnterpriseAuditSettings } from './components/EnterpriseAuditOptions';
import { UrlReport, UserProfile, WebsiteAudit } from './types';
import { SupportedLanguage } from './lib/translations';
import { 
  Sparkles, Globe, Download, Layers, ShieldCheck, CheckCircle2, 
  CreditCard, ArrowRight, Printer, FileSpreadsheet, PlusCircle 
} from 'lucide-react';

export function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [currentTab, setCurrentTab] = useState('overview');

  // Global Market Settings & Multi-Lingual Localizations
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('global_language') as SupportedLanguage;
      if (['en', 'ur', 'es', 'ar', 'de', 'ja'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const [crawlerRegion, setCrawlerRegion] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('crawler_region');
      if (saved) return saved;
    } catch {}
    return 'us-east';
  });

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    try {
      localStorage.setItem('global_language', lang);
    } catch {}
  };

  const [enterpriseSettings, setEnterpriseSettings] = useState<EnterpriseAuditSettings>(() => {
    try {
      const saved = localStorage.getItem('enterprise_audit_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      targetEngine: 'google',
      deviceSimulation: 'mobile',
      crawlDepth: 6,
      connectionSpeed: '5g'
    };
  });

  const [isEnterprisePanelOpen, setIsEnterprisePanelOpen] = useState(false);

  const handleEnterpriseSettingsChange = (settings: EnterpriseAuditSettings) => {
    setEnterpriseSettings(settings);
    try {
      localStorage.setItem('enterprise_audit_settings', JSON.stringify(settings));
    } catch {}
  };

  const handleCrawlerRegionChange = (region: string) => {
    setCrawlerRegion(region);
    try {
      localStorage.setItem('crawler_region', region);
    } catch {}
  };

  // User Authentication State (synchronously restored from storage to avoid flash of sign-in options)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const rawUser = localStorage.getItem('auth_user') || 
                      sessionStorage.getItem('auth_user') || 
                      localStorage.getItem('user_profile_data');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        if (parsed && parsed.email) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');

  // Legal Modals State
  const [activeLegalModal, setActiveLegalModal] = useState<'about' | 'contact' | 'privacy' | 'terms' | null>(null);

  // Audits & Reports State
  const [audits, setAudits] = useState<WebsiteAudit[]>([]);
  const [activeAudit, setActiveAudit] = useState<WebsiteAudit | null>(null);
  const [newlyCompletedAudit, setNewlyCompletedAudit] = useState<WebsiteAudit | null>(null);
  const [activeUrlReport, setActiveUrlReport] = useState<UrlReport | null>(null);

  // Audit Execution State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgressModalOpen, setAuditProgressModalOpen] = useState(false);
  const [auditingUrl, setAuditingUrl] = useState('');
  const [auditingSiteName, setAuditingSiteName] = useState<string | undefined>(undefined);
  const [auditError, setAuditError] = useState<string | null>(null);

  // User update handler with persistent storage
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    try {
      if (updatedUser.avatarUrl) {
        localStorage.setItem('user_profile_avatar', updatedUser.avatarUrl);
      }
      localStorage.setItem('user_profile_data', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Fetch initial audits and current user session
  useEffect(() => {
    const initData = async () => {
      try {
        // Read any saved user session or credentials from localStorage
        const authToken = localStorage.getItem('auth_token');
        const rawUser = localStorage.getItem('auth_user') || localStorage.getItem('user_profile_data');
        let cachedProfile: UserProfile | null = null;
        if (rawUser) {
          try {
            cachedProfile = JSON.parse(rawUser);
          } catch {}
        }

        // If user has a token, sync with backend /api/auth/me
        if (authToken) {
          try {
            const userRes = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${authToken}` },
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              if (userData && userData.email) {
                setUser(userData);
              } else if (cachedProfile) {
                setUser(cachedProfile);
              }
            } else if (cachedProfile) {
              setUser(cachedProfile);
            }
          } catch {
            if (cachedProfile) setUser(cachedProfile);
          }
        } else if (cachedProfile) {
          setUser(cachedProfile);
        } else {
          // Fresh user: not logged in until email/password is entered
          setUser(null);
        }

        // Fetch past audits
        const auditsRes = await fetch('/api/audit/list');
        if (auditsRes.ok) {
          const auditsData = await auditsRes.json();
          if (Array.isArray(auditsData)) {
            setAudits(auditsData);
            if (auditsData.length > 0) {
              setActiveAudit(auditsData[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Initialization error:', err);
      }
    };

    initData();
  }, []);

  // Trigger real deep website audit
  const handleStartAudit = async (url: string, siteName?: string) => {
    if (!url) return;
    setAuditingUrl(url);
    setAuditingSiteName(siteName);
    setIsAuditing(true);
    setAuditError(null);
    setNewlyCompletedAudit(null);
    setAuditProgressModalOpen(true);

    try {
      const res = await fetch('/api/audit/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          websiteName: siteName, 
          maxPages: enterpriseSettings.crawlDepth,
          settings: enterpriseSettings,
          crawlerRegion
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete website audit');
      }

      // Add to list of audits
      setAudits((prev) => [data, ...prev.filter(a => a.id !== data.id)]);
      setActiveAudit(data);
      setNewlyCompletedAudit(data);
    } catch (err: any) {
      console.error('Audit execution error:', err);
      setAuditError(err?.message || 'Error occurred while auditing website');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDeleteAudit = async (id: string) => {
    try {
      await fetch(`/api/audit/${id}`, { method: 'DELETE' });
      setAudits((prev) => prev.filter(a => a.id !== id));
      if (activeAudit?.id === id) {
        setActiveAudit(audits.find(a => a.id !== id) || null);
      }
    } catch (err) {
      console.error('Delete audit error:', err);
    }
  };

  const handleSelectAudit = (audit: WebsiteAudit, targetView: 'report' | 'explorer' = 'report') => {
    setActiveAudit(audit);
    setCurrentView('dashboard');
    setCurrentTab(targetView === 'report' ? 'reports' : 'url-explorer');
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    try {
      localStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('user_profile_data', JSON.stringify(authenticatedUser));
      sessionStorage.setItem('auth_user', JSON.stringify(authenticatedUser));
    } catch (e) {
      console.warn('Session save error:', e);
    }
    setCurrentView('dashboard');
    setCurrentTab('overview');
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_profile_data');
    localStorage.removeItem('user_profile_avatar');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setUser(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      
      {/* 1. LANDING PAGE VIEW */}
      {currentView === 'landing' && (
        <>
          <Navbar
            currentView={currentView}
            onNavigate={(v) => {
              if (v === 'profile') {
                setCurrentView('dashboard');
                setCurrentTab('profile');
              } else if (v === 'security') {
                setCurrentView('dashboard');
                setCurrentTab('security');
              } else if (v === 'dashboard') {
                setCurrentView('dashboard');
                setCurrentTab('overview');
              } else if (v === 'research') {
                setCurrentView('dashboard');
                setCurrentTab('research');
              } else {
                setCurrentView('landing');
              }
            }}
            user={user}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            onStartAuditClick={() => {
              const inputEl = document.getElementById('hero-url-input');
              inputEl?.focus();
            }}
            language={language}
            onLanguageChange={handleLanguageChange}
          />

          <LandingPage
            user={user}
            audits={audits}
            onStartAudit={handleStartAudit}
            onSelectAudit={handleSelectAudit}
            onNavigate={(v: string) => {
              setCurrentView('dashboard');
              setCurrentTab(v === 'research' ? 'research' : 'overview');
            }}
            onOpenLegalModal={setActiveLegalModal}
            onOpenAuth={handleOpenAuth}
            isAuditing={isAuditing}
            language={language}
            crawlerRegion={crawlerRegion}
            onCrawlerRegionChange={handleCrawlerRegionChange}
            enterpriseSettings={enterpriseSettings}
            onEnterpriseSettingsChange={handleEnterpriseSettingsChange}
            isEnterprisePanelOpen={isEnterprisePanelOpen}
            onToggleEnterprisePanel={() => setIsEnterprisePanelOpen(!isEnterprisePanelOpen)}
          />
        </>
      )}

      {/* 2. DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <DashboardLayout
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          user={user || {
            id: 'usr-guest',
            name: 'Manas Mughal',
            email: 'manasmughal05@gmail.com',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            accountType: 'Professional',
            subscription: 'Free Open Access',
            memberSince: 'January 2025',
          }}
          auditsCount={audits.length}
          activeAudit={activeAudit}
          onReturnToLanding={() => setCurrentView('landing')}
          onLogout={handleLogout}
          language={language}
          onLanguageChange={handleLanguageChange}
        >
          {/* TAB 1: OVERVIEW */}
          {currentTab === 'overview' && (
            <DashboardView
              audits={audits}
              activeAudit={activeAudit}
              onSelectAudit={handleSelectAudit}
              onStartAudit={handleStartAudit}
              onDeleteAudit={handleDeleteAudit}
              onNavigate={(tab) => setCurrentTab(tab)}
              isAuditing={isAuditing}
              language={language}
              crawlerRegion={crawlerRegion}
              onCrawlerRegionChange={handleCrawlerRegionChange}
              enterpriseSettings={enterpriseSettings}
              onEnterpriseSettingsChange={handleEnterpriseSettingsChange}
              isEnterprisePanelOpen={isEnterprisePanelOpen}
              onToggleEnterprisePanel={() => setIsEnterprisePanelOpen(!isEnterprisePanelOpen)}
            />
          )}

          {/* TAB 2: ADD WEBSITE */}
          {currentTab === 'add-website' && (
            <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <span>Audit Dispatcher</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-100 font-display mt-1">
                  Add & Crawl New Website
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Our crawler visits every discovered page, generating individual URL reports and aggregated visibility metrics.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                    Website Name / Brand (Optional)
                  </label>
                  <input
                    id="add-name-input"
                    type="text"
                    placeholder="e.g. My Brand or Enterprise SaaS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                    Website Root Domain (.com) *
                  </label>
                  <SmartUrlInput
                    id="add-url-input"
                    placeholder="e.g. microsoft or yourcompany"
                    isAuditing={isAuditing}
                    submitButtonText="Start Multi-URL Crawl & Audit"
                    showSubmitButton={true}
                    onSubmit={(targetUrl) => {
                      const targetName = (document.getElementById('add-name-input') as HTMLInputElement)?.value;
                      handleStartAudit(targetUrl, targetName);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MY WEBSITES */}
          {currentTab === 'my-websites' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-100 font-display">
                    My Monitored Websites ({audits.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous monitoring across SEO, Answer Engines (AEO), AI Overviews, and Generative Citations.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('add-website')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Website</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {audits.map((audit) => (
                  <div
                    key={audit.id}
                    className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-slate-100">{audit.websiteName}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs font-black">
                          {audit.averageScores.overall}/100
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono block mt-1 truncate">{audit.rootUrl}</span>
                      <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-400">
                        <span>SEO: {audit.averageScores.seo}</span>
                        <span>•</span>
                        <span>AEO: {audit.averageScores.aeo}</span>
                        <span>•</span>
                        <span>GEO: {audit.averageScores.geo}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => handleSelectAudit(audit, 'explorer')}
                        className="text-xs font-semibold text-slate-300 hover:text-white"
                      >
                        {audit.urlReports.length} URLs Crawled
                      </button>
                      <button
                        onClick={() => handleSelectAudit(audit, 'report')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
                      >
                        View Report →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: URL EXPLORER */}
          {currentTab === 'url-explorer' && (
            <UrlExplorerView
              audit={activeAudit}
              onSelectUrlReport={setActiveUrlReport}
              onBackToOverview={() => setCurrentTab('overview')}
            />
          )}

          {/* TAB 5: COMPLETE REPORTS */}
          {currentTab === 'reports' && (
            <CompleteWebsiteReportView
              audit={activeAudit}
              onSelectUrlReport={setActiveUrlReport}
              onBackToOverview={() => setCurrentTab('overview')}
              onBackToExplorer={() => setCurrentTab('url-explorer')}
            />
          )}

          {/* TAB 6: RESEARCH CENTER */}
          {currentTab === 'research' && (
            <ResearchCenterView
              onStartAudit={(url, siteName) => handleStartAudit(url, siteName)}
              onInspectUrlReport={(report) => setActiveUrlReport(report)}
            />
          )}

          {/* TAB 8: AI RECOMMENDATIONS */}
          {currentTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Executive AI Fixes</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-100 font-display mt-1">
                  AI Visibility Recommendations for {activeAudit?.websiteName || 'Active Audit'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Prioritized actions synthesized from multi-page DOM parsing to improve inclusion in Perplexity, Google AI Overviews, and ChatGPT.
                </p>
              </div>

              {activeAudit?.globalAiRecommendations ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeAudit.globalAiRecommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-300 font-bold font-mono text-xs flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-900 border border-slate-800">
                  Select a website audit to view AI strategic recommendations.
                </div>
              )}
            </div>
          )}

          {/* TAB 9: EXPORTS */}
          {currentTab === 'exports' && (
            <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-100 font-display">Export Audit Data</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Generate PDF executive decks, CSV datasets, or shareable web links for {activeAudit?.websiteName || 'the current audit'}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => window.print()}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center justify-center text-center group transition-colors"
                >
                  <Printer className="w-8 h-8 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm text-slate-200">Print / PDF Report</span>
                  <span className="text-[11px] text-slate-500 mt-1">Complete executive print layout</span>
                </button>

                <button
                  onClick={() => {
                    if (activeAudit) {
                      const headers = ['URL', 'Path', 'Overall', 'SEO', 'AEO', 'AIO', 'GEO', 'EEAT'];
                      const rows = activeAudit.urlReports.map(r => [
                        `"${r.url}"`, `"${r.path}"`, r.scores.overall, r.scores.seo, r.scores.aeo, r.scores.aio, r.scores.geo, r.scores.eeat
                      ]);
                      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', `${activeAudit.domain}_report.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center justify-center text-center group transition-colors"
                >
                  <FileSpreadsheet className="w-8 h-8 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm text-slate-200">Export CSV Data</span>
                  <span className="text-[11px] text-slate-500 mt-1">Spreadsheet with all URL scores</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 10: PROFILE */}
          {currentTab === 'profile' && user && (
            <ProfileView user={user} onUpdateUser={handleUpdateUser} />
          )}

          {/* TAB 11: SECURITY */}
          {currentTab === 'security' && <AccountSecurityView />}

          {/* TAB 12: SUBSCRIPTION */}
          {currentTab === 'subscription' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    ACTIVE PLAN & USAGE
                  </span>
                  <h2 className="text-3xl font-extrabold text-slate-100 font-display mt-1">
                    {user?.subscription || 'Free Open Access'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    100% Free access to multi-page crawling, Gemini AI recommendations, Research Center, and Multilingual Assistant.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                  ACTIVE
                </span>
              </div>
            </div>
          )}
        </DashboardLayout>
      )}

      {/* 3. INDIVIDUAL URL REPORT MODAL */}
      <IndividualUrlReportModal
        report={activeUrlReport}
        onClose={() => setActiveUrlReport(null)}
      />

      {/* 4. AUDIT RUNNER ANIMATED PROGRESS MODAL */}
      <AuditRunnerModal
        isOpen={auditProgressModalOpen}
        url={auditingUrl}
        websiteName={auditingSiteName}
        isAuditing={isAuditing}
        audit={newlyCompletedAudit}
        error={auditError}
        onViewReport={(completedAudit) => {
          setAuditProgressModalOpen(false);
          handleSelectAudit(completedAudit, 'report');
        }}
        onClose={() => {
          setAuditProgressModalOpen(false);
          if (newlyCompletedAudit) {
            handleSelectAudit(newlyCompletedAudit, 'report');
          }
        }}
      />

      {/* 5. AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* 6. LEGAL & TRUST MODALS */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
}

export default App;
