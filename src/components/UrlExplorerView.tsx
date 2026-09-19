import React, { useState } from 'react';
import { 
  Globe, Search, ExternalLink, Filter, ArrowUpDown, Clock, FileText, 
  ChevronRight, AlertTriangle, CheckCircle2, AlertCircle, Layers, ArrowLeft
} from 'lucide-react';
import { UrlReport, WebsiteAudit } from '../types';

interface UrlExplorerViewProps {
  audit: WebsiteAudit | null;
  onSelectUrlReport: (report: UrlReport) => void;
  onBackToOverview?: () => void;
}

export const UrlExplorerView: React.FC<UrlExplorerViewProps> = ({
  audit,
  onSelectUrlReport,
  onBackToOverview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<'all' | 'critical' | 'warning' | 'excellent'>('all');

  if (!audit) {
    return (
      <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 space-y-3">
        <Globe className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">No Active Website Audit Selected</h3>
        <p className="text-xs">Run a new audit from the Dashboard or select an existing website to explore its discovered URLs.</p>
        {onBackToOverview && (
          <button
            onClick={onBackToOverview}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard Overview</span>
          </button>
        )}
      </div>
    );
  }

  const filteredReports = audit.urlReports.filter((report) => {
    const matchesSearch = report.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterScore === 'critical') return report.scores.overall < 70;
    if (filterScore === 'warning') return report.scores.overall >= 70 && report.scores.overall < 85;
    if (filterScore === 'excellent') return report.scores.overall >= 85;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Quick Navigation Back Bar */}
      {onBackToOverview && (
        <div className="flex items-center gap-2">
          <button
            id="url-explorer-back-overview-btn"
            onClick={onBackToOverview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span>← Back to Overview</span>
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
              MULTI-PAGE EXPLORER
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 font-mono">{audit.websiteName}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 font-display mt-1">
            Discovered URL Reports ({audit.urlReports.length} Pages Crawled)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Each URL below has a separate, isolated audit report with individualized SEO, AEO, AIO, GEO, and E-E-A-T diagnostics.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search path or title..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <select
            value={filterScore}
            onChange={(e) => setFilterScore(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Scores</option>
            <option value="critical">Needs Attention (&lt;70)</option>
            <option value="warning">Moderate (70-84)</option>
            <option value="excellent">Excellent (85+)</option>
          </select>
        </div>
      </div>

      {/* URL Reports Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">URL / Path Name</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-center">SEO</th>
                <th className="py-3.5 px-3 text-center">AEO</th>
                <th className="py-3.5 px-3 text-center">AIO</th>
                <th className="py-3.5 px-3 text-center">GEO</th>
                <th className="py-3.5 px-3 text-center">E-E-A-T</th>
                <th className="py-3.5 px-3 text-center">Overall</th>
                <th className="py-3.5 px-4 text-right">Individual Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReports.map((report) => {
                const isRoot = report.path === '/' || report.url === audit.rootUrl;
                return (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectUrlReport(report)}
                  >
                    {/* Path & Title */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-2">
                        {isRoot ? (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] font-mono">
                            HOME
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                            PAGE
                          </span>
                        )}
                        <span className="font-mono text-slate-200 font-semibold truncate block">
                          {report.path}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                        {report.title || 'Untitled Page'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[11px]">
                        {report.statusCode}
                      </span>
                    </td>

                    {/* Individual Scores */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-sky-400">
                      {report.scores.seo}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-cyan-400">
                      {report.scores.aeo}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-indigo-400">
                      {report.scores.aio}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-400">
                      {report.scores.geo}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-amber-400">
                      {report.scores.eeat}
                    </td>

                    {/* Overall Score */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-xl font-mono font-black text-xs ${
                          report.scores.overall >= 85
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : report.scores.overall >= 70
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {report.scores.overall}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectUrlReport(report);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-semibold text-xs transition-all shadow-sm"
                      >
                        <span>View Deep Report</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
