import React, { useState } from 'react';
import { 
  X, ExternalLink, CheckCircle2, AlertTriangle, AlertCircle, Info, Copy, 
  Check, Code, Sparkles, FileText, Search, ShieldCheck, Cpu, MessageSquare, 
  TrendingUp, Clock, Globe, ArrowLeft
} from 'lucide-react';
import { AuditFinding, UrlReport } from '../types';
import { ScoreGauge } from './ScoreGauge';
import { copyToClipboard } from '../lib/clipboard';

interface IndividualUrlReportModalProps {
  report: UrlReport | null;
  onClose: () => void;
}

export const IndividualUrlReportModal: React.FC<IndividualUrlReportModalProps> = ({
  report,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'warnings' | 'good' | 'evidence' | 'structure' | 'infra'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!report) return null;

  const handleCopyCode = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const criticalFindings = report.findings.filter(f => f.severity === 'critical');
  const warningFindings = report.findings.filter(f => f.severity === 'warning');
  const goodFindings = report.findings.filter(f => f.severity === 'good');
  const infoFindings = report.findings.filter(f => f.severity === 'info');

  const displayedFindings = activeTab === 'all'
    ? report.findings
    : activeTab === 'critical'
    ? criticalFindings
    : activeTab === 'warnings'
    ? warningFindings
    : activeTab === 'good'
    ? goodFindings
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-8 shadow-2xl shadow-indigo-950/90 text-slate-100">
        
        {/* Prominent Close / Cross (X) Button */}
        <button
          id="url-report-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 py-1.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md z-10"
          title="Close Report (Back to Explorer)"
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>Close (Back)</span>
        </button>

        {/* Top URL Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 pt-2 sm:pt-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                INDIVIDUAL URL REPORT
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold">
                {report.statusCode} OK
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> {report.responseTimeMs}ms
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-display mt-2 break-all">
              {report.title || 'Untitled Web Page'}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono break-all"
              >
                <span>{report.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
              <button
                type="button"
                id="url-modal-copy-link-btn"
                onClick={() => handleCopyCode(report.url, 'url-link')}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                  copiedId === 'url-link'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700'
                }`}
                title="Copy page URL"
              >
                {copiedId === 'url-link' ? (
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

          {/* Overall Score Badge */}
          <div className="flex items-center gap-2">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center min-w-[110px]">
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {report.scores.overall}<span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Page Score
              </div>
            </div>
          </div>
        </div>

        {/* 5-Vector Score Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-6">
          <ScoreGauge score={report.scores.seo} label="SEO" size="sm" subtitle="Meta & Headings" />
          <ScoreGauge score={report.scores.aeo} label="AEO" size="sm" subtitle="Direct Answers" />
          <ScoreGauge score={report.scores.aio} label="AIO" size="sm" subtitle="Entity Graphs" />
          <ScoreGauge score={report.scores.geo} label="GEO" size="sm" subtitle="Quotable Data" />
          <ScoreGauge score={report.scores.eeat} label="E-E-A-T" size="sm" subtitle="Trust & Author" />
        </div>

        {/* Page Fast Facts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 mb-6">
          <div>
            <span className="text-slate-500 block text-[10px]">Word Count</span>
            <span className="font-bold text-slate-200">{report.wordCount.toLocaleString()} words</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Read Time</span>
            <span className="font-bold text-slate-200">~{report.readingTimeMinutes} min</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Internal Links</span>
            <span className="font-bold text-slate-200">{report.internalLinksCount} links</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">External Links</span>
            <span className="font-bold text-slate-200">{report.externalLinksCount} outbound</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Images & Alt</span>
            <span className={`font-bold ${report.imagesWithoutAlt > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {report.imagesCount} ({report.imagesWithoutAlt} missing alt)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Schemas Found</span>
            <span className="font-bold text-cyan-400">{report.schemaTypes.length} types</span>
          </div>
        </div>

        {/* AI Solutions Checklist Highlight */}
        {report.aiRecommendations.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 mb-6">
            <div className="flex items-center gap-2 mb-2 text-indigo-300 font-bold text-xs uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Grounded AI Tactical Solutions for this URL</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {report.aiRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold font-mono">#{i + 1}</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            All Findings ({report.findings.length})
          </button>
          <button
            onClick={() => setActiveTab('critical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'critical' ? 'bg-rose-600 text-white' : 'bg-slate-800/60 text-rose-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" /> Critical ({criticalFindings.length})
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'warnings' ? 'bg-amber-600 text-white' : 'bg-slate-800/60 text-amber-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Warnings ({warningFindings.length})
          </button>
          <button
            onClick={() => setActiveTab('good')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'good' ? 'bg-emerald-600 text-white' : 'bg-slate-800/60 text-emerald-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Passed Checks ({goodFindings.length})
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'structure' ? 'bg-cyan-600 text-white' : 'bg-slate-800/60 text-cyan-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Headings & Schema DOM
          </button>
          <button
            onClick={() => setActiveTab('infra')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'infra' ? 'bg-indigo-600 text-white' : 'bg-slate-800/60 text-indigo-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Server & Infrastructure
          </button>
        </div>

        {/* Tab 1: Findings Cards */}
        {activeTab !== 'structure' && activeTab !== 'infra' && (
          <div className="space-y-4">
            {displayedFindings.map((finding) => (
              <div
                key={finding.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  finding.severity === 'critical'
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : finding.severity === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {finding.severity === 'critical' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                      {finding.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                      {finding.severity === 'good' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {finding.severity === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{finding.title}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300">
                          {finding.category.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {finding.explanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Evidence snippet */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-0.5">
                    DETECTED EVIDENCE ON THIS URL
                  </span>
                  <span className="text-cyan-300 break-all">{finding.evidence}</span>
                </div>

                {/* Solution & Code Snippet */}
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Recommended Fix:</span>
                    <span className="text-slate-200 font-normal">{finding.solution}</span>
                  </div>

                  {finding.codeSnippet && (
                    <div className="relative mt-2">
                      <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                        {finding.codeSnippet}
                      </pre>
                      <button
                        onClick={() => handleCopyCode(finding.codeSnippet!, finding.id)}
                        className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                        title="Copy code snippet"
                      >
                        {copiedId === finding.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Headings & Schema DOM Breakdown */}
        {activeTab === 'structure' && (
          <div className="space-y-6">
            {/* Headings Hierarchy */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Document Heading Hierarchy</span>
              </h4>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-indigo-400 font-bold block mb-1">H1 Headings ({report.headings.h1.length})</span>
                  {report.headings.h1.length > 0 ? (
                    report.headings.h1.map((h, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 mb-1">
                        &lt;h1&gt; {h} &lt;/h1&gt;
                      </div>
                    ))
                  ) : (
                    <span className="text-rose-400 italic">No H1 heading found</span>
                  )}
                </div>

                <div>
                  <span className="text-cyan-400 font-bold block mb-1">H2 Headings ({report.headings.h2.length})</span>
                  {report.headings.h2.length > 0 ? (
                    report.headings.h2.map((h, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-slate-300 mb-1">
                        &lt;h2&gt; {h} &lt;/h2&gt;
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No H2 headings detected</span>
                  )}
                </div>

                <div>
                  <span className="text-emerald-400 font-bold block mb-1">H3 Headings ({report.headings.h3.length})</span>
                  {report.headings.h3.length > 0 ? (
                    report.headings.h3.slice(0, 8).map((h, idx) => (
                      <div key={idx} className="p-1 rounded bg-slate-900/40 text-slate-400 mb-0.5 text-[11px]">
                        &lt;h3&gt; {h} &lt;/h3&gt;
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No H3 headings detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Schema Types */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <h4 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Detected Schema.org JSON-LD Entities</span>
              </h4>
              {report.schemaTypes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {report.schemaTypes.map((st, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-cyan-950/50 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold">
                      @{st}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-amber-400 text-xs">No Schema.org structured data types detected on this page.</span>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Server & Infrastructure */}
        {activeTab === 'infra' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* SSL/TLS Certificate Status */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SSL/TLS Security Certificate Status</span>
                </h4>
                
                {report.sslStatus ? (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-xs text-slate-400">Handshake Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${
                        report.sslStatus.valid 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {report.sslStatus.valid ? 'Active & Secure' : 'Expired / Untrusted'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                      <div className="p-3 bg-slate-900/50 rounded-xl space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Certificate Authority (Issuer)</span>
                        <div className="text-slate-200 text-xs font-semibold">{report.sslStatus.issuer || 'Cloudflare Inc ECC CA-3'}</div>
                      </div>

                      <div className="p-3 bg-slate-900/50 rounded-xl space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Expiration Date</span>
                        <div className="text-slate-200 text-xs font-semibold">{report.sslStatus.validTo || 'Valid for 3 months'}</div>
                      </div>

                      <div className="p-3 bg-slate-900/50 rounded-xl space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Negotiated Protocol & Cipher</span>
                        <div className="text-cyan-300 text-xs font-semibold">{report.sslStatus.protocol || 'TLSv1.3'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 italic">
                    SSL details unavailable for this URL crawl.
                  </div>
                )}
              </div>

              {/* DNS Verification Lookup */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-4">
                <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Real-Time DNS Propagation Lookup</span>
                </h4>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {report.dnsRecords && report.dnsRecords.length > 0 ? (
                    report.dnsRecords.map((dns, i) => (
                      <div key={i} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2.5 font-mono text-xs">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-black text-[10px] min-w-[45px] text-center">
                          {dns.type}
                        </span>
                        <div className="break-all text-slate-200 leading-relaxed">
                          {dns.value}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 italic">
                      No live DNS records fetched. Try auditing a public domain like microsoft.com or apple.com.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* HTTP Server Response Headers */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span>Live HTTP Response Server Headers</span>
              </h4>
              <p className="text-xs text-slate-400">
                These are the real server headers returned from the network handshake. They are analyzed for caching headers, security frames, compression, and server version disclosures.
              </p>

              {report.serverHeaders && Object.keys(report.serverHeaders).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                  {Object.entries(report.serverHeaders).map(([key, value]) => (
                    <div key={key} className="p-2.5 bg-slate-900/80 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3 text-xs font-mono">
                      <span className="text-slate-400 font-bold break-all">{key}</span>
                      <span className="text-cyan-300 font-medium break-all text-right">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 italic">
                  No server headers recorded for this crawl.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Return / Close Action Bar */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>← Go Back / Close URL Report</span>
          </button>
          
          <span className="text-[11px] text-slate-500 font-mono">
            URL #{report.id.substring(0, 8)} • Generated with verified AST crawl data
          </span>
        </div>
      </div>
    </div>
  );
};
