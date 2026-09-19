import React, { useState } from 'react';
import { 
  Globe, Search, Sparkles, ArrowRight, ShieldCheck, AlertCircle, AlertTriangle, 
  CheckCircle2, ExternalLink, Trash2, Eye, Plus, TrendingUp, Layers, Zap, Clock,
  Copy, Check
} from 'lucide-react';
import { WebsiteAudit } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { SmartUrlInput } from './SmartUrlInput';
import { EnterpriseAuditOptions, EnterpriseAuditSettings } from './EnterpriseAuditOptions';
import { copyToClipboard } from '../lib/clipboard';
import { TRANSLATIONS, SupportedLanguage } from '../lib/translations';

interface DashboardViewProps {
  audits: WebsiteAudit[];
  activeAudit: WebsiteAudit | null;
  onSelectAudit: (audit: WebsiteAudit, view?: 'report' | 'explorer') => void;
  onStartAudit: (url: string, websiteName?: string) => void;
  onDeleteAudit: (id: string) => void;
  onNavigate: (view: string) => void;
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
  { name: 'GitHub', url: 'https://www.github.com', displayUrl: 'www.github.com', category: 'Software Collaboration' },
  { name: 'Microsoft', url: 'https://www.microsoft.com', displayUrl: 'www.microsoft.com', category: 'Enterprise Tech' },
  { name: 'Apple', url: 'https://www.apple.com', displayUrl: 'www.apple.com', category: 'Hardware & OS' },
  { name: 'Amazon', url: 'https://www.amazon.com', displayUrl: 'www.amazon.com', category: 'E-Commerce' },
  { name: 'Shopify', url: 'https://www.shopify.com', displayUrl: 'www.shopify.com', category: 'Global Commerce' },
  { name: 'Nike', url: 'https://www.nike.com', displayUrl: 'www.nike.com', category: 'Retail Commerce' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  audits,
  activeAudit,
  onSelectAudit,
  onStartAudit,
  onDeleteAudit,
  onNavigate,
  isAuditing,
  language,
  crawlerRegion,
  onCrawlerRegionChange,
  enterpriseSettings,
  onEnterpriseSettingsChange,
  isEnterprisePanelOpen,
  onToggleEnterprisePanel,
}) => {
  const [quickUrl, setQuickUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  
  const t = TRANSLATIONS[language];

  const handleCopyUrl = async (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2500);
    }
  };

  // Latest audit or null
  const latestAudit = activeAudit || audits[0] || null;

  return (
    <div className="space-y-6">
      
      {/* 1. Quick Start New Audit Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t.heroTagline}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display mt-1">
              {t.startNewAuditTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {t.startNewAuditSub}
            </p>
          </div>
        </div>

        {/* Input Form with Prefix & Suffix Selectors */}
        <SmartUrlInput
          id="dash-quick-url-input"
          value={quickUrl}
          onChange={(url) => setQuickUrl(url)}
          onSubmit={(url) => {
            onStartAudit(url);
            setQuickUrl('');
          }}
          placeholder="e.g. shopify or yourdomain"
          isAuditing={isAuditing}
          submitButtonText={t.launchDeepAudit}
          showSubmitButton={true}
        />

        <div className="pt-2">
          <EnterpriseAuditOptions
            settings={enterpriseSettings}
            onChange={onEnterpriseSettingsChange}
            crawlerRegion={crawlerRegion}
            onCrawlerRegionChange={onCrawlerRegionChange}
            isOpen={isEnterprisePanelOpen}
            onToggle={onToggleEnterprisePanel}
          />
        </div>

        {/* Quick sample chips with 1-click Copy and Audit */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Quick Test:
          </span>
          {SAMPLE_WEBSITES.map((sample) => {
            const isThisCopied = copiedUrl === sample.url;
            return (
              <div
                key={sample.name}
                className="inline-flex items-center rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => onStartAudit(sample.url, sample.name)}
                  className="px-2.5 py-1 text-slate-300 hover:text-cyan-300 flex items-center gap-1 hover:bg-slate-900 transition-colors"
                  title={`Audit ${sample.displayUrl}`}
                >
                  <span className="font-bold text-slate-200">{sample.name}:</span>
                  <span className="text-cyan-400 font-semibold">{sample.displayUrl}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCopyUrl(e, sample.url)}
                  className={`px-1.5 py-1 border-l border-slate-800 hover:bg-slate-800 transition-colors ${
                    isThisCopied ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-cyan-300'
                  }`}
                  title={isThisCopied ? 'Copied to clipboard!' : `Copy ${sample.url}`}
                >
                  {isThisCopied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Top Metric Scorecards (For the Selected/Latest Audit) */}
      {latestAudit && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                {t.currentAuditSnapshot}
              </span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <h3 className="text-xl font-bold text-slate-100">
                  {latestAudit.websiteName}
                </h3>
                <span className="text-xs font-mono text-cyan-300">
                  ({latestAudit.domain})
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopyUrl(e, latestAudit.rootUrl)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                    copiedUrl === latestAudit.rootUrl
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-750'
                  }`}
                  title="Copy root URL"
                >
                  {copiedUrl === latestAudit.rootUrl ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-cyan-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectAudit(latestAudit, 'explorer')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Explore {latestAudit.urlReports.length} URLs</span>
              </button>
              <button
                onClick={() => onSelectAudit(latestAudit, 'report')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                {t.viewReportBtn} →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <ScoreGauge score={latestAudit.averageScores.overall} label={t.overallScore} size="md" subtitle="Site-wide" />
            <ScoreGauge score={latestAudit.averageScores.seo} label={t.seoScore} size="md" subtitle="Technical & Meta" />
            <ScoreGauge score={latestAudit.averageScores.aeo} label={t.aeoScore} size="md" subtitle="Direct Answers" />
            <ScoreGauge score={latestAudit.averageScores.aio} label={t.aioScore} size="md" subtitle="Entity Graphs" />
            <ScoreGauge score={latestAudit.averageScores.geo} label={t.geoScore} size="md" subtitle="Quotable Data" />
            <ScoreGauge score={latestAudit.averageScores.eeat} label={t.eeatScore} size="md" subtitle="Trust & Bylines" />
          </div>
        </div>
      )}

      {/* 3. Recent Website Audits List */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 font-display">
            {t.recentAudits} ({audits.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Persistent Full-Stack Storage
          </span>
        </div>

        {audits.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 space-y-2">
            <Globe className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No websites audited yet. Enter a URL above or click a sample brand.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {audits.map((audit) => (
              <div
                key={audit.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 p-3 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-cyan-400 font-mono text-sm">
                    {audit.averageScores.overall}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <span>{audit.websiteName}</span>
                      <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {audit.urlReports.length} URLs Crawled
                      </span>
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">{audit.rootUrl}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onSelectAudit(audit, 'explorer')}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    URLs Explorer
                  </button>
                  <button
                    onClick={() => onSelectAudit(audit, 'report')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                  >
                    View Report
                  </button>
                  <button
                    onClick={() => onDeleteAudit(audit.id)}
                    className="p-1.5 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete audit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
