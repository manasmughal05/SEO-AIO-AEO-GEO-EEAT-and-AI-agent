import React, { useState } from 'react';
import { 
  Globe, Download, Printer, Share2, Sparkles, AlertCircle, AlertTriangle, 
  CheckCircle2, FileSpreadsheet, ExternalLink, ArrowRight, ShieldCheck, Check,
  ArrowLeft
} from 'lucide-react';
import { UrlReport, WebsiteAudit } from '../types';
import { ScoreGauge } from './ScoreGauge';

interface CompleteWebsiteReportViewProps {
  audit: WebsiteAudit | null;
  onSelectUrlReport: (report: UrlReport) => void;
  onBackToOverview?: () => void;
  onBackToExplorer?: () => void;
}

export const CompleteWebsiteReportView: React.FC<CompleteWebsiteReportViewProps> = ({
  audit,
  onSelectUrlReport,
  onBackToOverview,
  onBackToExplorer,
}) => {
  const [shareCopied, setShareCopied] = useState(false);

  if (!audit) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-3">
        <Globe className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">No active website audit report to display</h3>
        {onBackToOverview && (
          <button
            onClick={onBackToOverview}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard Overview</span>
          </button>
        )}
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['URL', 'Path', 'Title', 'Overall', 'SEO', 'AEO', 'AIO', 'GEO', 'EEAT', 'WordCount', 'ResponseTimeMs'];
    const rows = audit.urlReports.map(r => [
      `"${r.url}"`,
      `"${r.path}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      r.scores.overall,
      r.scores.seo,
      r.scores.aeo,
      r.scores.aio,
      r.scores.geo,
      r.scores.eeat,
      r.wordCount,
      r.responseTimeMs,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${audit.domain}_ai_visibility_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Navigation Back Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onBackToOverview && (
            <button
              id="report-back-overview-btn"
              onClick={onBackToOverview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
              <span>← Back to Overview</span>
            </button>
          )}

          {onBackToExplorer && (
            <button
              onClick={onBackToExplorer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
            >
              <span>Explore Discovered URLs ({audit.urlReports.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Action & Report Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
              FULL SITEWIDE AUDIT COMPLETED
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date(audit.completedAt || audit.createdAt || Date.now()).toLocaleString()}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 font-display mt-2">
            {audit.websiteName}
          </h2>
          <a
            href={audit.rootUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono mt-1"
          >
            <span>{audit.rootUrl}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Export and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="report-print-pdf-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print / PDF</span>
          </button>

          <button
            id="report-export-csv-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            id="report-share-link-btn"
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors shadow-md shadow-indigo-600/30"
          >
            {shareCopied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <ScoreGauge score={audit.averageScores.overall} label="Overall Score" size="lg" subtitle="Site-wide Average" />
        <ScoreGauge score={audit.averageScores.seo} label="SEO Rating" size="lg" subtitle="Technical & Meta" />
        <ScoreGauge score={audit.averageScores.aeo} label="AEO Rating" size="lg" subtitle="Answer Snippets" />
        <ScoreGauge score={audit.averageScores.aio} label="AIO Rating" size="lg" subtitle="Knowledge Graph" />
        <ScoreGauge score={audit.averageScores.geo} label="GEO Rating" size="lg" subtitle="Quotable Data" />
        <ScoreGauge score={audit.averageScores.eeat} label="E-E-A-T Score" size="lg" subtitle="Trust & Authority" />
      </div>

      {/* Global AI Executive Directives */}
      {audit.globalAiRecommendations && audit.globalAiRecommendations.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-100 font-display">
                Executive AI Search & Visibility Strategy Plan
              </h3>
              <p className="text-xs text-slate-400">
                Synthesized across all {audit.analyzedUrlsCount} crawled URLs to maximize LLM indexation & citation rates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {audit.globalAiRecommendations.map((rec, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discovered URLs Performance Matrix */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100 font-display">
            Crawled URL Performance Matrix
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {audit.analyzedUrlsCount} URLs with isolated diagnostics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {audit.urlReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectUrlReport(report)}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate max-w-[180px]">
                    {report.path}
                  </span>
                  <span className="font-mono text-xs font-black text-emerald-400">
                    {report.scores.overall}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate mb-2">
                  {report.title || 'Untitled Page'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>SEO:{report.scores.seo} AEO:{report.scores.aeo}</span>
                <span className="text-indigo-400 group-hover:text-indigo-300 font-bold flex items-center gap-0.5">
                  Report →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
