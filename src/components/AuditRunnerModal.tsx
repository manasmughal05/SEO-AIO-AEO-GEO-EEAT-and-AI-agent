import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Globe, Search, Layers, Cpu, ShieldCheck, ArrowRight, Loader2, X, ArrowLeft, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WebsiteAudit } from '../types';

interface AuditRunnerModalProps {
  isOpen: boolean;
  url: string;
  websiteName?: string;
  isAuditing?: boolean;
  audit?: WebsiteAudit | null;
  error?: string | null;
  onViewReport: (audit: WebsiteAudit) => void;
  onClose: () => void;
}

const STAGES = [
  { id: 'validate', label: '1. Protocol & DNS Validation', icon: Globe, desc: 'Verifying hostname, SSL certificate, and robot permissions' },
  { id: 'detect', label: '2. Server Response & DOM Extraction', icon: Search, desc: 'Measuring latency, headers, and full HTML structure' },
  { id: 'crawl', label: '3. Multi-Page Crawl & Link Discovery', icon: Layers, desc: 'Harvesting internal URLs and subpages' },
  { id: 'analyze', label: '4. Multi-Vector Scoring (SEO/AEO/AIO/GEO/E-E-A-T)', icon: Cpu, desc: 'Calculating schemas, direct answers, and citation strength' },
  { id: 'ai', label: '5. AI Strategic Recommendations', icon: Sparkles, desc: 'Synthesizing LLM visibility directives and action items' },
  { id: 'complete', label: '6. Report Generation & Diagnostics Ready', icon: ShieldCheck, desc: 'Compiling individual URL breakdowns and executive scorecards' },
];

export const AuditRunnerModal: React.FC<AuditRunnerModalProps> = ({
  isOpen,
  url,
  websiteName,
  isAuditing = false,
  audit = null,
  error,
  onViewReport,
  onClose,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIdx(0);
      setHasCelebrated(false);
      return;
    }

    // If audit finished and we have results, jump straight to completion
    if (!isAuditing && audit) {
      setCurrentStageIdx(STAGES.length - 1);
      if (!hasCelebrated) {
        setHasCelebrated(true);
        try {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      }
      return;
    }

    // Simulated steady progression while audit backend processes
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => {
        if (prev < STAGES.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isOpen, isAuditing, audit, hasCelebrated]);

  if (!isOpen) return null;

  const isCompleted = !isAuditing && Boolean(audit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-indigo-950/90 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          id="audit-runner-close-x-btn"
          onClick={onClose}
          className="absolute top-4 right-4 py-1.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md z-10 cursor-pointer"
          title="Close modal"
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>Close</span>
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className={`w-6 h-6 text-cyan-400 ${!isCompleted ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold font-display">
            {isCompleted ? 'Website Audit Complete!' : 'Auditing Target Website'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono truncate max-w-sm mx-auto">
            {url}
          </p>
        </div>

        {error ? (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-3 text-center">
            <div className="font-bold text-sm text-rose-200">Audit Notice</div>
            <p className="leading-relaxed">{error}</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* If Completed: Show Gorgeous Summary Card */}
            {isCompleted && audit && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-950/80 to-cyan-950/40 border border-indigo-500/40 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                        AUDIT READY
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {audit.urlReports.length} URLs Crawled
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-100 font-display mt-1">
                      {audit.websiteName}
                    </h4>
                  </div>
                  
                  {/* Big Overall Score Badge */}
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-md">
                    <span className="text-xl font-black text-cyan-400 font-mono">
                      {audit.averageScores.overall}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold">
                      SCORE
                    </span>
                  </div>
                </div>

                {/* Score Pills */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">SEO</div>
                    <div className="font-bold text-slate-200">{audit.averageScores.seo}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">AEO</div>
                    <div className="font-bold text-slate-200">{audit.averageScores.aeo}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">AIO</div>
                    <div className="font-bold text-slate-200">{audit.averageScores.aio}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">GEO</div>
                    <div className="font-bold text-slate-200">{audit.averageScores.geo}</div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="text-slate-400">EEAT</div>
                    <div className="font-bold text-slate-200">{audit.averageScores.eeat}</div>
                  </div>
                </div>

                {/* URL Reports list preview */}
                <div className="text-xs text-slate-300">
                  <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                    <span>Discovered URL Reports:</span>
                    <span className="text-cyan-400 font-bold">{audit.urlReports.length} pages</span>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                    {audit.urlReports.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/80">
                        <span className="truncate max-w-[280px] text-slate-200">{r.path}</span>
                        <span className="text-emerald-400 font-bold ml-2">{r.scores.overall}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stages Progression List */}
            <div className="space-y-2">
              {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isDone = isCompleted || idx < currentStageIdx;
                const isCurrent = !isCompleted && idx === currentStageIdx;

                return (
                  <div
                    key={stage.id}
                    className={`p-2.5 rounded-2xl border transition-all flex items-center gap-3 ${
                      isDone
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                        : isCurrent
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-md shadow-indigo-950/50'
                        : 'bg-slate-950/30 border-slate-900 text-slate-500 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : isCurrent
                          ? 'bg-indigo-500/20 text-cyan-400'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold tracking-tight truncate">
                        {stage.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {stage.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="pt-2">
              {isCompleted && audit ? (
                <button
                  id="audit-view-results-btn"
                  onClick={() => onViewReport(audit)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Complete Audit & URL Reports</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Deep crawler analyzing website pages...</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-300 font-semibold cursor-pointer underline text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
