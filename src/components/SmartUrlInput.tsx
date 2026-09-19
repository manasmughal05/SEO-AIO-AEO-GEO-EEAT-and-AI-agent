import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check, Link2, Sparkles, Copy } from 'lucide-react';
import { copyToClipboard } from '../lib/clipboard';

export type UrlSuffix = '.com' | '.org' | '.net' | '.io' | '.ai' | '.co' | '.app' | '.pk' | '.info' | '.edu';
export type ProtocolPrefix = 'https://' | 'http://';

interface SmartUrlInputProps {
  id?: string;
  value?: string;
  onChange?: (fullUrl: string) => void;
  onSubmit?: (fullUrl: string) => void;
  placeholder?: string;
  isAuditing?: boolean;
  submitButtonText?: string;
  showSubmitButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const COMMON_SUFFIXES: UrlSuffix[] = [
  '.com',
  '.org',
  '.net',
  '.ai',
  '.io',
  '.co',
  '.app',
  '.pk',
  '.info',
  '.edu',
];

export const SmartUrlInput: React.FC<SmartUrlInputProps> = ({
  id = 'smart-url-input',
  value = '',
  onChange,
  onSubmit,
  placeholder = 'e.g. www.microsoft.com, www.google.com, or www.apple.com',
  isAuditing = false,
  submitButtonText = 'Start Free Audit',
  showSubmitButton = true,
  size = 'lg',
  className = '',
}) => {
  const [protocol, setProtocol] = useState<ProtocolPrefix>('https://');
  const [domainBody, setDomainBody] = useState<string>('');
  const [suffix, setSuffix] = useState<UrlSuffix>('.com');
  const [isSuffixOpen, setIsSuffixOpen] = useState(false);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Sync external value if provided
  useEffect(() => {
    if (value) {
      parseAndSetRawUrl(value);
    }
  }, [value]);

  // Clean and parse pasted or typed full URLs
  const parseAndSetRawUrl = (raw: string) => {
    let clean = raw.trim();
    if (!clean) return;

    // Detect protocol
    if (clean.toLowerCase().startsWith('http://')) {
      setProtocol('http://');
      clean = clean.slice(7);
    } else if (clean.toLowerCase().startsWith('https://')) {
      setProtocol('https://');
      clean = clean.slice(8);
    }

    // Detect matching suffix if present at end of domain portion
    const hostPart = clean.split('/')[0];
    for (const s of COMMON_SUFFIXES) {
      if (hostPart.toLowerCase().endsWith(s)) {
        setSuffix(s);
        break;
      }
    }

    setDomainBody(clean);
  };

  // Computes a pristine, fully-qualified URL without corrupting paths or extensions
  const computeFullUrl = (
    rawInput: string,
    chosenSuffix: UrlSuffix = suffix,
    chosenProtocol: ProtocolPrefix = protocol
  ): string => {
    let clean = rawInput.trim();
    if (!clean) return '';

    // If input already includes protocol, extract it
    let p = chosenProtocol;
    if (clean.toLowerCase().startsWith('http://')) {
      p = 'http://';
      clean = clean.slice(7);
    } else if (clean.toLowerCase().startsWith('https://')) {
      p = 'https://';
      clean = clean.slice(8);
    }

    // Split hostname vs pathname
    const slashIdx = clean.indexOf('/');
    let hostPart = slashIdx !== -1 ? clean.substring(0, slashIdx) : clean;
    const pathPart = slashIdx !== -1 ? clean.substring(slashIdx) : '';

    // Prepend www. if there's no dot or if it's a bare domain without any subdomain
    if (!hostPart.toLowerCase().startsWith('www.')) {
      if (hostPart.includes('.')) {
        const parts = hostPart.split('.');
        // Simple domain like example.com
        if (parts.length === 2) {
          hostPart = 'www.' + hostPart;
        }
      } else {
        // Bare name like microsoft
        hostPart = 'www.' + hostPart;
      }
    }

    // If host contains a dot (e.g. www.example.com, platform.openai.com)
    if (hostPart.includes('.')) {
      return `${p}${hostPart}${pathPart}`;
    }

    // Bare name without dot -> append selected suffix (.com) and prepend www.
    return `${p}${hostPart}${chosenSuffix}${pathPart}`;
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Check if user pasted a URL with protocol
    if (rawVal.toLowerCase().startsWith('http://') || rawVal.toLowerCase().startsWith('https://')) {
      parseAndSetRawUrl(rawVal);
      const computed = computeFullUrl(rawVal, suffix, rawVal.toLowerCase().startsWith('http://') ? 'http://' : 'https://');
      if (onChange) onChange(computed);
      return;
    }

    // Keep user's input intact (letters, dots, hyphens, slashes)
    const sanitized = rawVal.replace(/\s+/g, '');
    setDomainBody(sanitized);

    // Auto-detect suffix if domain portion ends with known suffix
    const hostPart = sanitized.split('/')[0];
    for (const s of COMMON_SUFFIXES) {
      if (hostPart.toLowerCase().endsWith(s)) {
        setSuffix(s);
        break;
      }
    }

    const computed = computeFullUrl(sanitized, suffix, protocol);
    if (onChange) onChange(computed);
  };

  const handleSuffixSelect = (newSuffix: UrlSuffix) => {
    setSuffix(newSuffix);
    setIsSuffixOpen(false);

    // If user typed a bare word without dot, update with new suffix
    const computed = computeFullUrl(domainBody, newSuffix, protocol);
    if (onChange) onChange(computed);
  };

  const handleProtocolSelect = (newProtocol: ProtocolPrefix) => {
    setProtocol(newProtocol);
    setIsProtocolOpen(false);
    const computed = computeFullUrl(domainBody, suffix, newProtocol);
    if (onChange) onChange(computed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainBody.trim()) return;
    const finalUrl = computeFullUrl(domainBody, suffix, protocol);
    if (onSubmit && finalUrl) {
      onSubmit(finalUrl);
    }
  };

  const displayPreviewUrl = domainBody
    ? computeFullUrl(domainBody, suffix, protocol)
    : `${protocol}www.yourwebsite.com`;

  const handleCopyPreviewUrl = async () => {
    const targetUrl = computeFullUrl(domainBody || 'www.yourwebsite.com', suffix, protocol);
    const success = await copyToClipboard(targetUrl);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      
      {/* URL Input Form Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col md:flex-row items-stretch gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl shadow-indigo-950/60 backdrop-blur-md transition-all focus-within:border-indigo-500"
      >
        
        {/* Left Side: Protocol Selector + Domain Input + Suffix */}
        <div className="flex-1 flex items-center bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-visible relative min-w-0">
          
          {/* Protocol Selector (https:// or http://) */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              id={`${id}-protocol-btn`}
              onClick={() => setIsProtocolOpen(!isProtocolOpen)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900/90 hover:bg-slate-850 text-cyan-300 font-mono text-xs sm:text-sm font-bold border-r border-slate-800 select-none transition-colors"
              title="Click to toggle HTTPS / HTTP protocol"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{protocol}</span>
              <ChevronDown className="w-3 h-3 text-cyan-400/60" />
            </button>

            {/* Protocol Dropdown */}
            {isProtocolOpen && (
              <div className="absolute left-0 top-full mt-2 w-36 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/80 py-1.5 z-50">
                <button
                  type="button"
                  onClick={() => handleProtocolSelect('https://')}
                  className={`w-full px-3 py-1.5 text-left text-xs font-mono flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    protocol === 'https://' ? 'text-emerald-400 font-bold bg-indigo-950/40' : 'text-slate-300'
                  }`}
                >
                  <span>https://</span>
                  {protocol === 'https://' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleProtocolSelect('http://')}
                  className={`w-full px-3 py-1.5 text-left text-xs font-mono flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    protocol === 'http://' ? 'text-emerald-400 font-bold bg-indigo-950/40' : 'text-slate-300'
                  }`}
                >
                  <span>http://</span>
                  {protocol === 'http://' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            )}
          </div>

          {/* Central Domain Name Input */}
          <div className="relative flex-1 min-w-0 flex items-center px-2.5">
            <input
              id={id}
              type="text"
              value={domainBody}
              onChange={handleDomainChange}
              placeholder={placeholder}
              required
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-xs sm:text-sm font-mono py-2"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          {/* Suffix Selector (.com, .org, etc.) */}
          <div className="relative flex-shrink-0">
            <button
              type="button"
              id={`${id}-suffix-select-btn`}
              onClick={() => setIsSuffixOpen(!isSuffixOpen)}
              className="flex items-center gap-1 px-3 py-2 bg-indigo-950/50 hover:bg-indigo-900/60 text-cyan-300 font-mono text-xs sm:text-sm font-black border-l border-slate-800 rounded-r-xl transition-colors select-none"
              title="Select or change domain extension"
            >
              <span>{suffix}</span>
              <ChevronDown className="w-3 h-3 text-cyan-400/70" />
            </button>

            {/* Suffix Dropdown Menu */}
            {isSuffixOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/80 py-1.5 z-50 max-h-56 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold">
                  Select TLD
                </div>
                {COMMON_SUFFIXES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuffixSelect(s)}
                    className={`w-full px-3 py-1.5 text-left text-xs font-mono flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      suffix === s ? 'text-emerald-400 font-bold bg-indigo-950/40' : 'text-slate-300'
                    }`}
                  >
                    <span>{s}</span>
                    {suffix === s && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Action Button */}
        {showSubmitButton && (
          <button
            id={`${id}-submit-btn`}
            type="submit"
            disabled={isAuditing || !domainBody.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
          >
            {isAuditing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing Links...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>{submitButtonText}</span>
              </>
            )}
          </button>
        )}
      </form>

      {/* Formatted URL preview & Quick Copy */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span>Full Protocol URL:</span>
          <span className="text-cyan-300 font-bold break-all">
            {displayPreviewUrl}
          </span>
          <button
            type="button"
            id={`${id}-copy-preview-btn`}
            onClick={handleCopyPreviewUrl}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ml-1 cursor-pointer ${
              isCopied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700'
            }`}
            title="Copy this full URL to clipboard"
          >
            {isCopied ? (
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
        <span className="text-[10px] text-slate-500">Supports all TLDs & deep subpaths</span>
      </div>
    </div>
  );
};
