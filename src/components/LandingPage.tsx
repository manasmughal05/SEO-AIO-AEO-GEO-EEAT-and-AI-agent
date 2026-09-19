import React, { useState } from 'react';
import { 
  Globe, Search, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Zap, 
  Layers, BarChart3, Database, FileText, Cpu, Eye, ExternalLink, HelpCircle,
  TrendingUp, Compass, MessageSquare, Terminal, ChevronRight, Lock,
  Server, PenTool, Building2, Briefcase, Copy, Check
} from 'lucide-react';
import { ScoreGauge } from './ScoreGauge';
import { SmartUrlInput } from './SmartUrlInput';
import { EnterpriseAuditOptions, EnterpriseAuditSettings } from './EnterpriseAuditOptions';
import { copyToClipboard } from '../lib/clipboard';
import { UserProfile, WebsiteAudit } from '../types';
import { TRANSLATIONS, SupportedLanguage, CRAWLER_REGIONS } from '../lib/translations';

interface LandingPageProps {
  user?: UserProfile | null;
  audits?: WebsiteAudit[];
  onStartAudit: (url: string, siteName?: string) => void;
  onSelectAudit?: (audit: WebsiteAudit) => void;
  onNavigate: (view: string) => void;
  onOpenLegalModal: (modal: 'about' | 'contact' | 'privacy' | 'terms') => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
  isAuditing?: boolean;
  language: SupportedLanguage;
  crawlerRegion: string;
  onCrawlerRegionChange: (region: string) => void;
  enterpriseSettings: EnterpriseAuditSettings;
  onEnterpriseSettingsChange: (settings: EnterpriseAuditSettings) => void;
  isEnterprisePanelOpen: boolean;
  onToggleEnterprisePanel: () => void;
}

const SAMPLE_WEBSITES = [
  {
    name: 'GitHub',
    url: 'https://www.github.com',
    displayUrl: 'www.github.com',
    category: 'Software Development & Collaboration',
    badge: 'Developer Platform',
    color: 'from-violet-500/25 to-fuchsia-500/25 text-violet-400 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-pulse',
  },
  {
    name: 'Microsoft',
    url: 'https://www.microsoft.com',
    displayUrl: 'www.microsoft.com',
    category: 'Enterprise Tech & Cloud',
    badge: 'Global Portal',
    color: 'from-blue-500/20 to-sky-500/20 text-sky-400',
  },
  {
    name: 'Apple',
    url: 'https://www.apple.com',
    displayUrl: 'www.apple.com',
    category: 'Consumer Electronics & OS',
    badge: 'Hardware & OS',
    color: 'from-slate-500/20 to-zinc-500/20 text-slate-300',
  },
  {
    name: 'Amazon',
    url: 'https://www.amazon.com',
    displayUrl: 'www.amazon.com',
    category: 'Global E-Commerce & Cloud',
    badge: 'Retail Platform',
    color: 'from-orange-500/20 to-yellow-500/20 text-orange-400',
  },
  {
    name: 'Shopify',
    url: 'https://www.shopify.com',
    displayUrl: 'www.shopify.com',
    category: 'Global Commerce Platform',
    badge: 'SaaS E-Commerce',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
  },
  {
    name: 'Nike',
    url: 'https://www.nike.com',
    displayUrl: 'www.nike.com',
    category: 'Athletic Footwear & Apparel',
    badge: 'Retail Commerce',
    color: 'from-red-500/20 to-orange-500/20 text-red-400',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  user,
  audits = [],
  onStartAudit,
  onSelectAudit,
  onNavigate,
  onOpenLegalModal,
  onOpenAuth,
  isAuditing,
  language,
  crawlerRegion,
  onCrawlerRegionChange,
  enterpriseSettings,
  onEnterpriseSettingsChange,
  isEnterprisePanelOpen,
  onToggleEnterprisePanel,
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'seo' | 'aeo' | 'aio' | 'geo' | 'eeat'>('seo');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState<{ url: string; name: string } | null>(null);
  
  const t = TRANSLATIONS[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    onStartAudit(inputUrl.trim());
  };

  const handleSampleClick = (sample: typeof SAMPLE_WEBSITES[0]) => {
    setInputUrl(sample.url);
    // Check if a pre-loaded audit already exists for this domain
    const cleanSampleDomain = sample.url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
    const existingAudit = audits.find(a => {
      const aDomain = (a.domain || a.rootUrl || '').replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
      return aDomain === cleanSampleDomain || a.rootUrl.includes(cleanSampleDomain);
    });

    if (existingAudit && onSelectAudit) {
      onSelectAudit(existingAudit);
    } else {
      onStartAudit(sample.url, sample.name);
    }
  };

  const handleCopyUrl = async (e: React.MouseEvent, url: string, name?: string) => {
    e.stopPropagation();
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(url);
      setCopiedFeedback({ url, name: name || url });
      // Automatically pre-populate input bar
      setInputUrl(url);
      setTimeout(() => {
        setCopiedLink((prev) => (prev === url ? null : prev));
      }, 3000);
      setTimeout(() => {
        setCopiedFeedback((prev) => (prev?.url === url ? null : prev));
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] overflow-hidden pointer-events-none -z-10 opacity-30">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[140px]" />
        <div className="absolute -top-20 right-1/4 w-[450px] h-[450px] bg-cyan-500 rounded-full blur-[140px]" />
      </div>

      {/* ==========================================
          1. HERO SECTION
         ========================================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center space-y-6">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{t.heroTagline}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          {/* Main Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-display max-w-4xl">
            Analyze. Optimize.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Get AI-Ready.
            </span>
          </h1>

          {/* Subtitle with 5 Key Disciplines */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* URL Audit Input Box with Standard www. and .com */}
          <div className="w-full max-w-2xl pt-4">
            <SmartUrlInput
              id="hero-url-input"
              value={inputUrl}
              onChange={(url) => setInputUrl(url)}
              onSubmit={(url) => onStartAudit(url)}
              placeholder="e.g. microsoft, apple, or yourbusiness"
              isAuditing={isAuditing}
              submitButtonText={t.startFreeAudit}
              showSubmitButton={true}
            />
            <p className="text-xs text-slate-400 mt-2.5 text-center">
              Instant multi-page crawl • Standard World Wide Web (.com) • Real server DOM extraction & AI recommendations
            </p>
          </div>

          {/* Target Crawler Node Region Selector */}
          <div className="w-full max-w-2xl mt-1">
            <EnterpriseAuditOptions
              settings={enterpriseSettings}
              onChange={onEnterpriseSettingsChange}
              crawlerRegion={crawlerRegion}
              onCrawlerRegionChange={onCrawlerRegionChange}
              isOpen={isEnterprisePanelOpen}
              onToggle={onToggleEnterprisePanel}
            />
          </div>

          {/* ==========================================
              2. SAMPLE PROFESSIONAL WEBSITES
             ========================================== */}
          <div className="w-full max-w-4xl pt-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {t.testingSites}
              </span>
              <span className="text-xs text-slate-400">{t.clickCardTip}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {SAMPLE_WEBSITES.map((sample) => {
                const isCopiedThis = copiedLink === sample.url;
                return (
                  <div
                    key={sample.name}
                    id={`sample-card-${sample.name.toLowerCase()}`}
                    className="group relative p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between text-left shadow-lg cursor-pointer"
                    onClick={() => handleSampleClick(sample)}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {sample.name}
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                          {sample.badge}
                        </span>
                      </div>
                      
                      {/* Selectable & Copyable URL Display */}
                      <div className="mt-1.5 flex items-center justify-between gap-1">
                        <span 
                          className="text-[11px] text-cyan-300/90 truncate font-mono font-bold select-all cursor-text"
                          title={sample.url}
                        >
                          {sample.displayUrl}
                        </span>
                        <a
                          href={sample.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-500 hover:text-cyan-400 p-0.5 rounded transition-colors"
                          title={`Open ${sample.url} in new tab`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* DEDICATED ACTION BUTTONS: Copy Link & Audit */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        id={`copy-btn-${sample.name.toLowerCase()}`}
                        onClick={(e) => handleCopyUrl(e, sample.url, sample.name)}
                        className={`w-full py-1.5 px-2 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          isCopiedThis 
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-emerald-950/40 ring-1 ring-emerald-500/40' 
                            : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 cursor-pointer'
                        }`}
                        title={isCopiedThis ? 'Copied to clipboard!' : `Copy ${sample.url} to clipboard`}
                      >
                        {isCopiedThis ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        id={`audit-sample-btn-${sample.name.toLowerCase()}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSampleClick(sample);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg font-sans text-[11px] font-bold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                        title={`Run full audit on ${sample.name}`}
                      >
                        <span>Audit</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Copy Notification Toast Banner */}
            {copiedFeedback && (
              <div 
                id="copy-notification-banner"
                className="mt-3.5 p-3 rounded-2xl bg-slate-900/95 border border-emerald-500/50 text-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl shadow-emerald-950/40 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white font-mono">{copiedFeedback.url}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300 font-bold uppercase font-mono">
                        Copied to Clipboard
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      URL copied successfully & pre-loaded into audit search bar.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const inputEl = document.getElementById('hero-url-input');
                      inputEl?.focus();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700 cursor-pointer"
                  >
                    View in Input
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartAudit(copiedFeedback.url, copiedFeedback.name)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-md shadow-emerald-950/50 cursor-pointer"
                  >
                    <span>Start Audit Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ==========================================
              INTERACTIVE DASHBOARD PREVIEW MOCKUP
             ========================================== */}
          <div className="w-full max-w-5xl pt-10">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    AI Visibility Auditor • Multi-URL Live Diagnostics
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Grounded Analysis
                  </span>
                </div>
              </div>

              {/* Mock Dashboard Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
                <ScoreGauge score={94} label="Overall" size="md" subtitle="A+ Visibility" />
                <ScoreGauge score={96} label="SEO" size="md" subtitle="Meta & Schemas" />
                <ScoreGauge score={91} label="AEO" size="md" subtitle="Answer Snippets" />
                <ScoreGauge score={93} label="AIO" size="md" subtitle="Entity Graphs" />
                <ScoreGauge score={89} label="GEO" size="md" subtitle="Quotable Data" />
                <ScoreGauge score={98} label="E-E-A-T" size="md" subtitle="Trust & Authority" />
              </div>

              {/* Sample URL table snippet */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden text-left">
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>DISCOVERED URLS & SEPARATE REPORTS</span>
                  <span>STATUS / SCORES</span>
                </div>
                <div className="divide-y divide-slate-900 text-xs font-mono">
                  <div className="px-4 py-2 flex items-center justify-between hover:bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">200 OK</span>
                      <span className="text-slate-200">/</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <span>SEO: 98</span>
                      <span>AEO: 92</span>
                      <span>GEO: 95</span>
                      <span className="text-emerald-400 font-bold">96/100</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 flex items-center justify-between hover:bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">200 OK</span>
                      <span className="text-slate-200">/services/ai-optimization</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <span>SEO: 94</span>
                      <span>AEO: 96</span>
                      <span>GEO: 88</span>
                      <span className="text-emerald-400 font-bold">93/100</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 flex items-center justify-between hover:bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">200 OK</span>
                      <span className="text-slate-200">/blog/aeo-vs-seo-guide-2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <span>SEO: 92</span>
                      <span>AEO: 95</span>
                      <span>GEO: 94</span>
                      <span className="text-emerald-400 font-bold">94/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          3. THE 5 PILLARS OF VISIBILITY
         ========================================== */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/70 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-display">
            The 5 Modern Pillars of Digital Visibility
          </h2>
          <p className="text-slate-400 mt-3 text-base">
            Modern search engines and AI assistants don't just count keywords. We inspect every page against the five crucial visibility vectors.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: 'seo', label: '1. SEO (Search Engine)', icon: Search, color: 'text-sky-400' },
            { id: 'aeo', label: '2. AEO (Answer Engines)', icon: MessageSquare, color: 'text-cyan-400' },
            { id: 'aio', label: '3. AIO (AI Overviews)', icon: Cpu, color: 'text-indigo-400' },
            { id: 'geo', label: '4. GEO (Generative Engines)', icon: TrendingUp, color: 'text-emerald-400' },
            { id: 'eeat', label: '5. E-E-A-T (Trust & Authority)', icon: ShieldCheck, color: 'text-amber-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  active
                    ? 'bg-slate-800 text-white border border-indigo-500/50 shadow-lg shadow-indigo-950/40'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8">
          {activeTab === 'seo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 font-mono">
                  TRADITIONAL & MODERN ON-PAGE SEO
                </span>
                <h3 className="text-2xl font-bold mt-1 text-slate-100">
                  Precision Indexability & Technical Architecture
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  Deeply checks title tags, meta descriptions, single H1 requirements, H2/H3 semantic hierarchy, canonical URLs, robots instructions, OpenGraph tags, image alt text, and internal link architecture.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Exact title length optimization (30–60 characters)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Canonical URL duplicate-content protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated broken image alt attribute detection
                  </li>
                </ul>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500">// Real Page Evaluator Output</div>
                <div className="text-emerald-400">✓ Single H1 Tag: "Enterprise Digital Platform"</div>
                <div className="text-emerald-400">✓ Canonical URL: Valid & Self-Referencing</div>
                <div className="text-amber-400">⚠ Meta Description: 68 chars (Expand to 120–160 chars)</div>
                <div className="text-emerald-400">✓ OpenGraph Protocol: Complete</div>
              </div>
            </div>
          )}

          {activeTab === 'aeo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  ANSWER ENGINE OPTIMIZATION (AEO)
                </span>
                <h3 className="text-2xl font-bold mt-1 text-slate-100">
                  Dominating Perplexity, SearchGPT & Voice Snippets
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  Inspects question-based heading patterns (What, How, Why, Can, Is), checks for 40-to-60 word direct answers directly below headings, and validates Schema.org FAQPage integration.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Conversational query pattern extraction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct featured snippet summary readiness
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> FAQPage JSON-LD schema verification
                  </li>
                </ul>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500">// AEO Engine Verification</div>
                <div className="text-cyan-400">&lt;h2&gt;How does the platform ensure data security?&lt;/h2&gt;</div>
                <div className="text-slate-400">&lt;p&gt;The platform enforces AES-256 encryption at rest and TLS 1.3...&lt;/p&gt;</div>
                <div className="text-emerald-400">✓ Concise Answer Detected: 48 words (Ideal)</div>
                <div className="text-emerald-400">✓ FAQPage Schema: Active</div>
              </div>
            </div>
          )}

          {activeTab === 'aio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  AI OVERVIEWS OPTIMIZATION (AIO)
                </span>
                <h3 className="text-2xl font-bold mt-1 text-slate-100">
                  Optimized for Google SGE & LLM Knowledge Graphs
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  Checks machine-readability of semantic sections (&lt;main&gt;, &lt;article&gt;, &lt;section&gt;), tabular data clarity, entity definition presence, and comprehensive Schema.org linked data.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Entity disambiguation & context depth
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Machine-readable table & list structure
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Semantic HTML5 nesting hierarchy
                  </li>
                </ul>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500">// AIO Entity Extraction</div>
                <div className="text-indigo-400">Found Entities: Organization, SoftwareApplication, AggregateRating</div>
                <div className="text-emerald-400">✓ Semantic Containers: &lt;main&gt;, &lt;article&gt;, &lt;section&gt;</div>
                <div className="text-emerald-400">✓ Word Count Depth: 1,420 words</div>
              </div>
            </div>
          )}

          {activeTab === 'geo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  GENERATIVE ENGINE OPTIMIZATION (GEO)
                </span>
                <h3 className="text-2xl font-bold mt-1 text-slate-100">
                  Quotation Likelihood in ChatGPT & Copilot
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  Evaluates quantitative statistics, original benchmarks, authoritative quotation signals, and outbound citations to trusted research institutions.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Statistical metrics & benchmark detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> High-authority external citations (.edu, .org, standards)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Quotable factual assertions index
                  </li>
                </ul>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500">// GEO Citation Evaluation</div>
                <div className="text-emerald-400">✓ Quotable Statistics Found: 6 data assertions</div>
                <div className="text-emerald-400">✓ External Authority Links: 4 outbound citations</div>
                <div className="text-slate-400">Citation Ratio: 8.4% (Top 5% percentile)</div>
              </div>
            </div>
          )}

          {activeTab === 'eeat' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  GOOGLE QUALITY RATER E-E-A-T
                </span>
                <h3 className="text-2xl font-bold mt-1 text-slate-100">
                  Experience, Expertise, Authoritativeness & Trust
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  Evaluates author bylines and credential links, HTTPS transport security, direct contact & customer support accessibility, and transparent Privacy Policy and Terms of Service presence.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified author byline & Person schema
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full SSL/TLS encryption & HTTPS enforcement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Transparent business contact & legal pages
                  </li>
                </ul>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500">// E-E-A-T Quality Signals</div>
                <div className="text-emerald-400">✓ Author Byline: Verified with professional credentials</div>
                <div className="text-emerald-400">✓ HTTPS Protocol: Enforced with TLS 1.3</div>
                <div className="text-emerald-400">✓ Privacy Policy & Terms: Linked in site footer</div>
                <div className="text-emerald-400">✓ Direct Contact Channel: Found</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          SPECIALIZED DOMAIN BENEFIT SHOWCASE
          (Students, CS, AI/Software Engineers, IT, CSS, Schools & Colleges)
         ========================================== */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Dedicated Multi-Profession Intelligence</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-display text-slate-100">
            Tailored Tools for CS, AI Engineers, IT, CSS & Education
          </h2>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl mx-auto">
            From LeetCode problem solving and RAG pipeline blueprints to CSS essay evaluations and school admission SEO, discover tailored AI tools for your domain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: CS & Software Students */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-400/60 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800">
                  CS & Software
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                CS Students & Developers
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                DSA LeetCode mastery with Big-O breakdown, Final Year Project (FYP) architecture proposals, and camera OCR for handwritten code & whiteboard ER diagrams.
              </p>
            </div>
            <button
              onClick={() => onNavigate('assistant')}
              className="mt-5 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 group-hover:border-cyan-500/40 transition-all"
            >
              <span>Explore CS AI Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: AI & ML Engineers */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-400/60 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold text-purple-400 px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800">
                  AI & ML
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                AI & Machine Learning Engineers
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Production-grade RAG pipeline blueprints, vector indexing strategies, Prompt defense hardening against injections, and token latency reduction.
              </p>
            </div>
            <button
              onClick={() => onNavigate('assistant')}
              className="mt-5 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 group-hover:border-purple-500/40 transition-all"
            >
              <span>Explore AI Engineer Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: IT & DevOps SysAdmins */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-blue-500/30 hover:border-blue-400/60 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800">
                  IT & DevOps
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-300 transition-colors">
                IT & DevOps SysAdmins
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Linux administration, multi-stage Docker builds, secure Nginx reverse proxy configs with SSL, terminal log crash OCR debugging, and server hardening checklists.
              </p>
            </div>
            <button
              onClick={() => onNavigate('assistant')}
              className="mt-5 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 group-hover:border-blue-500/40 transition-all"
            >
              <span>Explore IT & DevOps Kit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: CSS & Competitive Exam Aspirants */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 hover:border-amber-400/60 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800">
                  CSS / PMS
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                CSS & Competitive Exams
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-scoring English Essay outlines with thesis statements, Current & Pakistan Affairs multidimensional arguments, and camera OCR grading for handwritten précis drafts.
              </p>
            </div>
            <button
              onClick={() => onNavigate('assistant')}
              className="mt-5 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 group-hover:border-amber-500/40 transition-all"
            >
              <span>Explore CSS Mentor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5: Schools, Colleges & Academies */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-indigo-500/30 hover:border-indigo-400/60 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800">
                  Institutions
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                Schools, Colleges & Academies
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Local SEO strategies to rank #1 on Google Maps for student admissions, EducationalOrganization Schema JSON-LD, 16-week semester syllabus outlines & grading rubrics.
              </p>
            </div>
            <button
              onClick={() => onNavigate('assistant')}
              className="mt-5 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 group-hover:border-indigo-500/40 transition-all"
            >
              <span>Explore Educational Kit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6: Business, Doctors & Trades */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-400/60 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800">
                  Enterprises
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                Business, Doctors & Police
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Local business Google Maps domination, Medical E-E-A-T patient advisories, public cybercrime fraud alerts, and invoice billing OCR for retailers.
              </p>
            </div>
            <button
              onClick={() => onNavigate('assistant')}
              className="mt-5 w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 group-hover:border-emerald-500/40 transition-all"
            >
              <span>Explore Business Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ==========================================
          4. HOW IT WORKS WORKFLOW
         ========================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
            END-TO-END AUDIT PIPELINE
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-display mt-1">
            How AI Visibility Auditor Works
          </h2>
          <p className="text-slate-400 mt-2">
            Automated deep-crawl engine executing real DOM extraction, algorithmic scoring, and grounded AI fix synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg mb-3">
              1
            </div>
            <h4 className="font-bold text-slate-100 text-base">URL Validation & Crawl</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Accepts any public website domain, establishes SSL handshake, and crawls the live HTML.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg mb-3">
              2
            </div>
            <h4 className="font-bold text-slate-100 text-base">Multi-URL Discovery</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Discovers internal URLs (/about, /services, /blog, /contact) and visits each page individually.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg mb-3">
              3
            </div>
            <h4 className="font-bold text-slate-100 text-base">5-Vector Page Audit</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every page is deeply scored for SEO, AEO, AIO, GEO, and E-E-A-T with actual evidence.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-3">
              4
            </div>
            <h4 className="font-bold text-slate-100 text-base">Grounded AI Solutions</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Gemini AI produces executive recommendations, copy fixes, and copyable Schema markup.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          5. OPEN ACCESS PLANS
         ========================================== */}
      <section className="py-16 border-t border-slate-900 bg-slate-950/60 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
            FREE COMMUNITY & ACADEMIC ACCESS
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl font-display mt-1">
            100% Free & Open Access
          </h2>
          <p className="text-slate-400 mt-2">
            Full access to deep multi-page auditing, research centers, domain AI assistants, and unlimited free profile personalization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free Standard Tier */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Free Public Access</span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">$0<span className="text-xs text-emerald-400 font-normal"> / 100% Free</span></div>
              <p className="text-xs text-slate-400 mt-2">Perfect for students, individuals, website owners, and developers.</p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Full SEO, AEO, AIO, GEO & EEAT scoring</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Multi-page URL discovery & crawling</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Unlimited Free Profile Photo & Avatar Customization</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Research Center queries without restrictions</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="mt-8 w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors shadow-md"
            >
              Start Free Audit
            </button>
          </div>

          {/* Academic & Professional Tier */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border-2 border-indigo-500/70 shadow-2xl shadow-indigo-950/50 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider">
              Specialized Roles Included
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">Academic & Pro Suite</span>
              <div className="text-3xl font-extrabold text-white mt-2 font-mono">$0<span className="text-xs text-cyan-400 font-normal"> / Free For All</span></div>
              <p className="text-xs text-slate-400 mt-2">Tailored for CS students, AI engineers, IT admins, CSS aspirants & colleges.</p>
              <ul className="mt-6 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 10+ Specialized domain assistant personas</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Camera OCR handwritten code & essay evaluation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Real-time Gemini AI grounded recommendations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Permanent photo storage & instant anytime updates</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="mt-8 w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
            >
              {user ? 'Open Your Audit Dashboard →' : 'Launch Platform Free'}
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          6. E-E-A-T COMPLIANT FOOTER
         ========================================== */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-100 font-display">AI Visibility Auditor</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier autonomous audit platform evaluating public websites across SEO, Answer Engines, AI Overviews, Generative Search, and E-E-A-T standards.
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              HTTPS 256-bit Encrypted • SOC-2 Ready • W3C Semantic
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono">
              Platform Features
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-cyan-400">Multi-URL Crawler</button></li>
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-cyan-400">AEO Question Scorer</button></li>
              <li><button onClick={() => onNavigate('dashboard')} className="hover:text-cyan-400">AI Overview Entity Graphs</button></li>
              <li><button onClick={() => onNavigate('research')} className="hover:text-cyan-400">Deep Research Center</button></li>
              <li><button onClick={() => onNavigate('assistant')} className="hover:text-cyan-400">Multilingual AI Assistant</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono">
              Trust & E-E-A-T Transparency
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button id="footer-link-about" onClick={() => onOpenLegalModal('about')} className="hover:text-cyan-400 text-left">About Us & Editorial Guidelines</button></li>
              <li><button id="footer-link-contact" onClick={() => onOpenLegalModal('contact')} className="hover:text-cyan-400 text-left">Contact & Customer Support</button></li>
              <li><button id="footer-link-privacy" onClick={() => onOpenLegalModal('privacy')} className="hover:text-cyan-400 text-left">Privacy Policy (GDPR / CCPA)</button></li>
              <li><button id="footer-link-terms" onClick={() => onOpenLegalModal('terms')} className="hover:text-cyan-400 text-left">Terms of Service</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-mono">
              Organization & Author
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Published by <strong className="text-slate-200">AI Visibility Auditor Systems</strong>. Lead Architect: <strong className="text-slate-200">Manas Mughal</strong>.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              Support: <span className="text-cyan-400 font-mono">support@ai-visibility-auditor.com</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <div>© 2026 AI Visibility Auditor. All rights reserved. Built with Next.js, Express & Gemini AI.</div>
          <div className="mt-2 sm:mt-0 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Systems Normal (100% Uptime)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
