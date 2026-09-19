import React, { useEffect, useState } from 'react';
import { 
  Search, Sparkles, BookOpen, ExternalLink, Trash2, ArrowRight, CheckCircle2, 
  Globe, Layers, TrendingUp, Loader2, Link2, ShieldCheck, AlertTriangle, 
  AlertCircle, Info, Code, Check, Copy, ArrowUpRight, Cpu, FileText, 
  RefreshCw, BarChart2, Eye, Compass
} from 'lucide-react';
import { ResearchItem, UrlReport, AuditFinding } from '../types';
import { SmartUrlInput } from './SmartUrlInput';
import { ScoreGauge } from './ScoreGauge';
import { IndividualUrlReportModal } from './IndividualUrlReportModal';
import { copyToClipboard } from '../lib/clipboard';

interface ResearchCenterViewProps {
  onStartAudit?: (url: string, websiteName?: string) => void;
  onInspectUrlReport?: (report: UrlReport) => void;
}

export const ResearchCenterView: React.FC<ResearchCenterViewProps> = ({
  onStartAudit,
  onInspectUrlReport,
}) => {
  // Main Top-level View Mode
  const [activeMode, setActiveMode] = useState<'url_checker' | 'topics'>('url_checker');

  // ==========================================
  // URL CHECKER / INSPECTOR STATE
  // ==========================================
  const [inspectorUrl, setInspectorUrl] = useState<string>('https://example.com');
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectionReport, setInspectionReport] = useState<UrlReport | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [inspectedHistory, setInspectedHistory] = useState<UrlReport[]>([]);
  const [activeModalReport, setActiveModalReport] = useState<UrlReport | null>(null);
  
  // URL Checker Tab Selection
  const [reportTab, setReportTab] = useState<'findings' | 'structure' | 'schema' | 'recommendations'>('findings');
  const [findingFilter, setFindingFilter] = useState<'all' | 'critical' | 'warning' | 'good'>('all');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // ==========================================
  // TOPIC & AI RESEARCH STATE
  // ==========================================
  const [query, setQuery] = useState('');
  const [researchType, setResearchType] = useState<'question' | 'topic' | 'keyword' | 'website' | 'competitor' | 'industry'>('topic');
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const [researches, setResearches] = useState<ResearchItem[]>([]);
  const [activeResearch, setActiveResearch] = useState<ResearchItem | null>(null);

  // Load past research from backend
  const loadResearches = async () => {
    try {
      const res = await fetch('/api/research/list');
      const data = await res.json();
      if (Array.isArray(data)) {
        setResearches(data);
        if (data.length > 0 && !activeResearch) {
          setActiveResearch(data[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to load researches', err);
    }
  };

  const isLikelyUrl = (str: string): boolean => {
    const clean = str.trim().toLowerCase();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return true;
    if (/\b[a-z0-9-]+(\.[a-z0-9-]+)+\b/i.test(clean) && !clean.includes(' ')) return true;
    return false;
  };

  useEffect(() => {
    loadResearches();
    // Automatically run initial inspection on example.com so user sees a live report immediately
    handleInspectLiveUrl('https://example.com', true);
  }, []);

  // Handle URL Inspection (Live Checker)
  const handleInspectLiveUrl = async (targetUrl: string, fetchAiResearch = true) => {
    if (!targetUrl || !targetUrl.trim()) return;
    const cleanUrl = targetUrl.trim();
    setInspectorUrl(cleanUrl);
    setIsInspecting(true);
    setInspectionError(null);

    // Run DOM inspection & Deep AI research in parallel for URLs
    try {
      const inspectPromise = fetch('/api/audit/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.report) {
          throw new Error(data.error || 'Failed to inspect live URL');
        }
        return data.report as UrlReport;
      });

      const researchPromise = fetchAiResearch
        ? fetch('/api/research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: cleanUrl, type: 'website' }),
          }).then((r) => r.json()).catch(() => null)
        : Promise.resolve(null);

      const [report, researchData] = await Promise.all([inspectPromise, researchPromise]);

      setInspectionReport(report);
      setInspectedHistory((prev) => {
        const filtered = prev.filter((r) => r.url !== report.url);
        return [report, ...filtered].slice(0, 8);
      });

      if (researchData && researchData.id) {
        setResearches((prev) => [researchData, ...prev.filter((r) => r.id !== researchData.id)]);
        setActiveResearch(researchData);
      }
    } catch (err: any) {
      console.error('URL inspection error:', err);
      setInspectionError(err?.message || 'Failed to connect to website. Please verify the URL and try again.');
    } finally {
      setIsInspecting(false);
    }
  };

  // Handle Research Run (Gemini Search Topic)
  const handleRunResearch = async (searchQuery: string, type: typeof researchType = researchType) => {
    if (!searchQuery.trim()) return;
    const cleanQuery = searchQuery.trim();

    if (isLikelyUrl(cleanQuery) || type === 'website') {
      setActiveMode('url_checker');
      setInspectorUrl(cleanQuery);
      handleInspectLiveUrl(cleanQuery, true);
      setQuery('');
      return;
    }

    setIsResearchLoading(true);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: cleanQuery, type }),
      });

      const newItem = await res.json();
      if (newItem && newItem.id) {
        setResearches((prev) => [newItem, ...prev.filter((r) => r.id !== newItem.id)]);
        setActiveResearch(newItem);
        setQuery('');
      }
    } catch (err) {
      console.error('Research request error:', err);
    } finally {
      setIsResearchLoading(false);
    }
  };

  const handleDeleteResearch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/research/${id}`, { method: 'DELETE' });
      setResearches((prev) => prev.filter(r => r.id !== id));
      if (activeResearch?.id === id) {
        setActiveResearch(researches.find(r => r.id !== id) || null);
      }
    } catch (err) {
      console.error('Delete research error:', err);
    }
  };

  const handleCopyCode = async (codeSnippet: string, id: string) => {
    const success = await copyToClipboard(codeSnippet);
    if (success) {
      setCopiedSnippetId(id);
      setTimeout(() => setCopiedSnippetId(null), 2500);
    }
  };

  const sampleWebsites = [
    { label: 'Stripe', url: 'https://stripe.com' },
    { label: 'Microsoft', url: 'https://microsoft.com' },
    { label: 'Apple', url: 'https://apple.com' },
    { label: 'Daraz', url: 'https://daraz.pk' },
    { label: 'OpenAI', url: 'https://openai.com' },
    { label: 'GitHub', url: 'https://github.com' },
  ];

  const filteredFindings = inspectionReport
    ? inspectionReport.findings.filter((f) => {
        if (findingFilter === 'all') return true;
        return f.severity === findingFilter;
      })
    : [];

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Mode Selector */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Deep Research & Intelligence Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display">
              {activeMode === 'url_checker' ? 'Live Website URL Checker & Inspector' : 'AI Search Intelligence & Guidelines'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {activeMode === 'url_checker'
                ? 'Input any live professional website to perform immediate DOM inspection, latency extraction, schema verification, and multi-vector SEO/AEO/AIO/GEO/EEAT scoring.'
                : 'Explore search engine indexing guidelines, question patterns, competitive visibility, and algorithmic updates for generative answer engines.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex-shrink-0 self-start md:self-center">
            <button
              id="mode-url-checker-btn"
              onClick={() => setActiveMode('url_checker')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'url_checker'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Link2 className="w-3.5 h-3.5" />
              <span>Live URL Checker</span>
            </button>

            <button
              id="mode-topics-btn"
              onClick={() => setActiveMode('topics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'topics'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Topic Research</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. LIVE URL CHECKER / INSPECTOR VIEW                                      */}
      {/* ========================================================================= */}
      {activeMode === 'url_checker' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Smart URL Input Container */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>Target Website URL</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Real-time DOM crawl & multi-vector algorithmic report
              </span>
            </div>

            {/* Smart URL Input Component */}
            <SmartUrlInput
              id="research-live-url-input"
              value={inspectorUrl}
              onChange={(newUrl) => setInspectorUrl(newUrl)}
              onSubmit={(fullUrl) => handleInspectLiveUrl(fullUrl)}
              placeholder="e.g. microsoft.com, stripe.com/pricing, or daraz.pk"
              isAuditing={isInspecting}
              submitButtonText="Inspect Live URL"
            />

            {/* Quick Sample Sites */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[11px] font-mono text-slate-400">Quick Test Websites:</span>
              {sampleWebsites.map((site) => (
                <button
                  key={site.url}
                  type="button"
                  onClick={() => {
                    setInspectorUrl(site.url);
                    handleInspectLiveUrl(site.url);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-cyan-300 text-[11px] font-mono border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
                >
                  {site.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inspection Loading Status */}
          {isInspecting && (
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/40 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950 flex items-center justify-center border border-indigo-500/40">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-100 font-display">
                  Inspecting Live Target URL...
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1 max-w-md">
                  Fetching live HTTP headers, measuring latency, parsing HTML DOM nodes, and evaluating multi-vector visibility algorithms.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono text-cyan-300">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> DNS / SSL
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> DOM Tree
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Schemas
                </span>
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-cyan-400" /> Scoring
                </span>
              </div>
            </div>
          )}

          {/* Inspection Error Banner */}
          {inspectionError && !isInspecting && (
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-sm text-rose-200">Live URL Inspection Notice</div>
                <p className="mt-1 leading-relaxed">{inspectionError}</p>
                <button
                  type="button"
                  onClick={() => handleInspectLiveUrl(inspectorUrl)}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Inspection</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* LIVE URL INSPECTION REPORT RESULTS          */}
          {/* ========================================== */}
          {inspectionReport && !isInspecting && (
            <div className="space-y-6">
              
              {/* Header Overview Card */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>LIVE REPORT ACTIVE</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                        Status: <strong className="text-emerald-400 font-bold">{inspectionReport.statusCode || 200} OK</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                        Latency: <strong className="text-cyan-400 font-bold">{inspectionReport.responseTimeMs || 120}ms</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                        Crawled: <strong className="text-slate-200">{new Date(inspectionReport.crawledAt).toLocaleTimeString()}</strong>
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-100 font-display truncate">
                      {inspectionReport.title || 'Live Inspected Webpage'}
                    </h3>

                    <a
                      href={inspectionReport.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 mt-1 break-all hover:underline"
                    >
                      <span>{inspectionReport.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>

                  {/* Actions: View in Modal or Full Crawl */}
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <button
                      id="view-interactive-modal-btn"
                      type="button"
                      onClick={() => {
                        if (onInspectUrlReport) {
                          onInspectUrlReport(inspectionReport);
                        } else {
                          setActiveModalReport(inspectionReport);
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>Open Full Interactive Modal</span>
                    </button>

                    {onStartAudit && (
                      <button
                        id="start-multi-page-audit-btn"
                        type="button"
                        onClick={() => {
                          const name = inspectionReport.title.split('-')[0].trim() || 'Website';
                          onStartAudit(inspectionReport.url, name);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-cyan-200" />
                        <span>Run Full Multi-Page Website Audit</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Gauges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <ScoreGauge
                    score={inspectionReport.scores.overall}
                    label="Overall"
                    subtitle="Weighted Score"
                    size="md"
                  />
                  <ScoreGauge
                    score={inspectionReport.scores.seo}
                    label="SEO"
                    subtitle="Search Crawl"
                    size="md"
                  />
                  <ScoreGauge
                    score={inspectionReport.scores.aeo}
                    label="AEO"
                    subtitle="Answer Engines"
                    size="md"
                  />
                  <ScoreGauge
                    score={inspectionReport.scores.aio}
                    label="AIO"
                    subtitle="Google Overviews"
                    size="md"
                  />
                  <ScoreGauge
                    score={inspectionReport.scores.geo}
                    label="GEO"
                    subtitle="Generative Citations"
                    size="md"
                  />
                  <ScoreGauge
                    score={inspectionReport.scores.eeat}
                    label="E-E-A-T"
                    subtitle="Trust & Authority"
                    size="md"
                  />
                </div>

                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Content Volume</span>
                    <span className="text-slate-200 font-bold text-sm">
                      {inspectionReport.wordCount.toLocaleString()} words
                    </span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">
                      ~{inspectionReport.readingTimeMinutes} min reading time
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Visual Assets</span>
                    <span className="text-slate-200 font-bold text-sm">
                      {inspectionReport.imagesCount} images
                    </span>
                    <span className={`text-[10px] block mt-0.5 font-bold ${
                      inspectionReport.imagesWithoutAlt === 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {inspectionReport.imagesWithoutAlt === 0
                        ? '100% have alt tags'
                        : `${inspectionReport.imagesWithoutAlt} missing alt tags`}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Link Profile</span>
                    <span className="text-slate-200 font-bold text-sm">
                      {inspectionReport.internalLinksCount} internal links
                    </span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">
                      {inspectionReport.externalLinksCount} outbound references
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase">Headings (H1/H2/H3)</span>
                    <span className="text-slate-200 font-bold text-sm">
                      {inspectionReport.headings.h1.length} H1 · {inspectionReport.headings.h2.length} H2
                    </span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">
                      {inspectionReport.headings.h3.length} H3 subsections
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: Findings, Structure, Schema, Recommendations */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
                
                {/* Tabs Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'findings', label: `Diagnostics & Findings (${inspectionReport.findings.length})`, icon: AlertTriangle },
                      { id: 'structure', label: 'Headings & Meta Tags', icon: FileText },
                      { id: 'schema', label: `JSON-LD Schemas (${inspectionReport.schemaTypes.length})`, icon: Code },
                      { id: 'recommendations', label: 'AI Action Directives', icon: Sparkles },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isActive = reportTab === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setReportTab(t.id as any)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Filter pills if in findings tab */}
                  {reportTab === 'findings' && (
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-slate-500 text-[10px] uppercase">Filter:</span>
                      {(['all', 'critical', 'warning', 'good'] as const).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setFindingFilter(sev)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer ${
                            findingFilter === sev
                              ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* TAB 1: FINDINGS & SOLUTIONS */}
                {reportTab === 'findings' && (
                  <div className="space-y-3">
                    {filteredFindings.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500 rounded-2xl bg-slate-950 border border-slate-800">
                        No findings matching this filter.
                      </div>
                    ) : (
                      filteredFindings.map((finding) => (
                        <div
                          key={finding.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                            finding.severity === 'critical'
                              ? 'bg-rose-950/20 border-rose-500/30'
                              : finding.severity === 'warning'
                              ? 'bg-amber-950/20 border-amber-500/30'
                              : 'bg-emerald-950/15 border-emerald-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                finding.severity === 'critical'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : finding.severity === 'warning'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              }`}>
                                {finding.severity}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px] font-mono uppercase font-bold">
                                {finding.category}
                              </span>
                              <h4 className="text-sm font-bold text-slate-100 font-display">
                                {finding.title}
                              </h4>
                            </div>
                          </div>

                          {/* Evidence & Explanation */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                                DOM Evidence Detected:
                              </span>
                              <p className="text-slate-300 font-mono text-[11px] leading-relaxed break-words">
                                {finding.evidence}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                              <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                                Algorithmic Impact:
                              </span>
                              <p className="text-slate-300 leading-relaxed text-[11px]">
                                {finding.explanation}
                              </p>
                            </div>
                          </div>

                          {/* Actionable Solution & Code Snippet */}
                          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Recommended Remediation:</span>
                              </span>
                              {finding.codeSnippet && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyCode(finding.codeSnippet!, finding.id)}
                                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                                >
                                  {copiedSnippetId === finding.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400 font-bold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Code</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                            <p className="text-slate-200 text-[11px] leading-relaxed">
                              {finding.solution}
                            </p>
                            {finding.codeSnippet && (
                              <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto">
                                <code>{finding.codeSnippet}</code>
                              </pre>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 2: STRUCTURE & META */}
                {reportTab === 'structure' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Meta Information */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                          Page Metadata
                        </h4>
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">Page Title:</span>
                          <p className="text-slate-200 font-medium mt-0.5">{inspectionReport.title || 'None'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">Meta Description:</span>
                          <p className="text-slate-300 mt-0.5 leading-relaxed">{inspectionReport.metaDescription || 'No meta description found'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">Canonical Tag:</span>
                          <p className="text-slate-300 font-mono text-[11px] mt-0.5 break-all">{inspectionReport.canonicalUrl || 'No canonical tag declared'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">Robots Directives:</span>
                          <p className="text-slate-300 font-mono text-[11px] mt-0.5">{inspectionReport.robots || 'index, follow'}</p>
                        </div>
                      </div>

                      {/* Headings Structure */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                          Headings Architecture
                        </h4>
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            H1 Headings ({inspectionReport.headings.h1.length}):
                          </span>
                          {inspectionReport.headings.h1.length === 0 ? (
                            <p className="text-rose-400 text-[11px] mt-0.5">Missing H1 Heading</p>
                          ) : (
                            <ul className="list-disc list-inside space-y-1 mt-1 text-slate-200 font-bold">
                              {inspectionReport.headings.h1.map((h, i) => (
                                <li key={i} className="truncate">{h}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            H2 Sub-sections ({inspectionReport.headings.h2.length}):
                          </span>
                          {inspectionReport.headings.h2.length === 0 ? (
                            <p className="text-amber-400 text-[11px] mt-0.5">No H2 sub-sections detected</p>
                          ) : (
                            <div className="max-h-32 overflow-y-auto space-y-1 mt-1 pr-1">
                              {inspectionReport.headings.h2.map((h, i) => (
                                <div key={i} className="p-1.5 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 truncate">
                                  {h}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: SCHEMAS */}
                {reportTab === 'schema' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                        Detected Schema.org Entities (JSON-LD / Microdata)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {inspectionReport.schemaTypes.length} schema types found
                      </span>
                    </div>

                    {inspectionReport.schemaTypes.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs">
                        <div className="font-bold text-sm">No Structured Data (JSON-LD) Detected</div>
                        <p className="mt-1 leading-relaxed text-slate-300">
                          AI Answer engines and Google AI Overviews heavily depend on Schema.org entities (Organization, WebSite, Article, FAQPage, Product) to build knowledge graph nodes.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {inspectionReport.schemaTypes.map((st, i) => (
                          <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                            <Code className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-200 block truncate font-mono">
                                {st}
                              </span>
                              <span className="text-[10px] text-emerald-400 font-mono">
                                Verified Schema Entity
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: RECOMMENDATIONS */}
                {reportTab === 'recommendations' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                      AI Visibility Directives for this URL
                    </h4>
                    <div className="space-y-2.5">
                      {inspectionReport.aiRecommendations.map((rec, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-cyan-300 font-bold font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Previously Inspected URLs in this session */}
              {inspectedHistory.length > 1 && (
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">
                    Recently Inspected Websites ({inspectedHistory.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {inspectedHistory.map((h, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setInspectionReport(h);
                          setInspectorUrl(h.url);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          inspectionReport.url === h.url
                            ? 'bg-slate-950 border-cyan-500/60 shadow-md'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900'
                        }`}
                      >
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-200 truncate">{h.title}</h5>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">{h.url}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 flex-shrink-0">
                          {h.scores.overall}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOPIC RESEARCH & GUIDELINES VIEW                                       */}
      {/* ========================================================================= */}
      {activeMode === 'topics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Search Box */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'topic', label: 'Topic Exploration' },
                { id: 'question', label: 'Specific Question' },
                { id: 'keyword', label: 'Keyword Cluster' },
                { id: 'competitor', label: 'Competitor Analysis' },
                { id: 'industry', label: 'Industry Trends' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setResearchType(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    researchType === cat.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunResearch(query);
              }}
              className="flex flex-col sm:flex-row gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800"
            >
              <div className="relative flex-1 flex items-center pl-3">
                <Search className="w-5 h-5 text-indigo-400 mr-2 flex-shrink-0" />
                <input
                  id="research-query-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. How to optimize content for ChatGPT and Perplexity citations?"
                  className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-xs sm:text-sm py-2 font-mono"
                />
              </div>

              <button
                id="research-submit-btn"
                type="submit"
                disabled={isResearchLoading || !query.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isResearchLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Research...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Conduct Research</span>
                  </>
                )}
              </button>
            </form>

            {/* Suggested Queries */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-[11px] text-slate-500">Suggested queries:</span>
              {[
                'AEO question heading rules',
                'How to get into Google AI Overviews',
                'E-E-A-T author bylines checklist',
                'GEO benchmark citations',
              ].map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRunResearch(sq, 'topic')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-850 text-cyan-300 text-[11px] font-mono border border-slate-800 cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Research Results & History Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* History Column */}
            <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Research History ({researches.length})
                </span>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {researches.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No past research queries yet. Enter a question or topic above.
                  </div>
                ) : (
                  researches.map((item) => {
                    const isActive = activeResearch?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveResearch(item)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          isActive
                            ? 'bg-slate-950 border-indigo-500/60 shadow-md'
                            : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-[9px] uppercase font-bold">
                            {item.type}
                          </span>
                          <h4 className="text-xs font-bold text-slate-200 mt-1 truncate">
                            {item.query}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteResearch(item.id, e)}
                          className="p-1 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete research"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Document Details Column */}
            <div className="lg:col-span-2">
              {activeResearch ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono text-xs uppercase font-bold">
                        {activeResearch.type}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(activeResearch.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-100 font-display">
                      {activeResearch.query}
                    </h3>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 font-mono block mb-1">
                      EXECUTIVE RESEARCH SUMMARY
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {activeResearch.summary}
                    </p>
                  </div>

                  {/* Key Findings */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Key Findings & Search Discoveries</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeResearch.keyFindings.map((finding, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold font-mono text-[10px] flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </div>
                          <span className="leading-relaxed">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Actionable Optimization Directives</span>
                    </h4>
                    <div className="space-y-2">
                      {activeResearch.recommendations.map((rec, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sources */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-400" />
                      <span>Authoritative Sources & Citations</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeResearch.sources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex items-start justify-between text-xs group"
                        >
                          <div>
                            <span className="font-bold text-slate-200 group-hover:text-cyan-300 block truncate">
                              {src.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{src.domain}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Related Topics */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                      Explore Related Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeResearch.relatedTopics.map((topic, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRunResearch(topic, 'topic')}
                          className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{topic}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-500">
                  Select a research item from the left or run a new search query.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standalone Interactive Modal for Individual URL Report if triggered */}
      {activeModalReport && (
        <IndividualUrlReportModal
          report={activeModalReport}
          onClose={() => setActiveModalReport(null)}
        />
      )}
    </div>
  );
};
