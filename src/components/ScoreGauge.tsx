import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label, size = 'md', subtitle }) => {
  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (val >= 70) return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
    if (val >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getScoreStroke = (val: number) => {
    if (val >= 85) return '#34d399';
    if (val >= 70) return '#38bdf8';
    if (val >= 50) return '#fbbf24';
    return '#f43f5e';
  };

  const radius = size === 'lg' ? 44 : size === 'md' ? 32 : 22;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
      <div className="relative flex items-center justify-center">
        <svg
          className={`transform -rotate-90 ${size === 'lg' ? 'w-28 h-28' : size === 'md' ? 'w-20 h-20' : 'w-14 h-14'}`}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={getScoreStroke(score)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`font-extrabold tracking-tight ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'} text-slate-100 font-mono`}>
            {score}
          </span>
          {size === 'lg' && <span className="text-[10px] text-slate-400 font-medium">/ 100</span>}
        </div>
      </div>
      <span className={`mt-2 font-semibold text-slate-200 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{label}</span>
      {subtitle && <span className="text-[11px] text-slate-400 mt-0.5">{subtitle}</span>}
    </div>
  );
};
