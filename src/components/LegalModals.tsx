import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Building, MapPin, Send, CheckCircle2, FileText, ArrowLeft } from 'lucide-react';

interface LegalModalsProps {
  activeModal: 'about' | 'contact' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose }) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!activeModal) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-indigo-950/90 text-slate-200 text-sm">
        
        {/* Close / Cross (X) Button */}
        <button
          id="legal-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md z-10"
          title="Close (Back)"
        >
          <X className="w-4 h-4 text-rose-400" />
          <span>Close (X)</span>
        </button>

        {/* 1. ABOUT US MODAL */}
        {activeModal === 'about' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Building className="w-6 h-6" />
              <h3 className="text-2xl font-extrabold text-white font-display">About AI Visibility Auditor</h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Organization: AI Visibility Auditor Systems Inc. • Established 2025
            </div>
            
            <p className="leading-relaxed">
              <strong>AI Visibility Auditor</strong> is an enterprise research platform created to bridge the transition from classical keyword search engine indexation to generative, conversational, and answer-engine information retrieval.
            </p>

            <h4 className="text-base font-bold text-slate-100 pt-2">Our Mission & E-E-A-T Standards</h4>
            <p className="text-slate-300 leading-relaxed">
              We operate under strict transparent guidelines adhering to Google's Search Quality Rater Guidelines, W3C Linked Data Consortium specifications, and open web accessibility principles. We never manufacture artificial scores, generate fake positive claims, or conceal genuine accessibility and structural defects.
            </p>

            <h4 className="text-base font-bold text-slate-100 pt-2">Leadership & Authorship</h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-lg">
                MM
              </div>
              <div>
                <div className="font-bold text-white">Manas Mughal</div>
                <div className="text-xs text-cyan-400 font-mono">Lead Search Architect & AI Engineer</div>
                <div className="text-xs text-slate-400 mt-0.5">Specialist in Answer Engine Optimization (AEO) and Semantic Entity Extraction.</div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CONTACT SUPPORT MODAL */}
        {activeModal === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Mail className="w-6 h-6" />
              <h3 className="text-2xl font-extrabold text-white font-display">Contact & Customer Support</h3>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              Reach our 24/7 technical team for API inquiries, audit consultations, enterprise onboarding, or data inquiries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-200">Customer Support</div>
                <div className="text-cyan-400 font-mono">support@ai-visibility-auditor.com</div>
                <div className="text-slate-500">Response time: Under 2 hours</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-200">Corporate Headquarters</div>
                <div className="text-slate-400">100 Enterprise Way, Suite 400</div>
                <div className="text-slate-500">San Francisco, CA 94105, USA</div>
              </div>
            </div>

            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-bold text-emerald-300">Message Dispatched Successfully</div>
                <p className="text-xs text-slate-400">Our senior search engineers will review your inquiry shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">Your Name</label>
                  <input
                    id="contact-name-input"
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                    placeholder="Manas Mughal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">Email Address</label>
                  <input
                    id="contact-email-input"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    placeholder="manas@company.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">Message / Inquiry</label>
                  <textarea
                    id="contact-msg-input"
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    placeholder="Describe your site audit inquiry or enterprise requirements..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  id="contact-submit-btn"
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 hover:from-indigo-500 hover:to-cyan-400 transition-all shadow-md shadow-indigo-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message to Support</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. PRIVACY POLICY MODAL */}
        {activeModal === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-2xl font-extrabold text-white font-display">Privacy Policy</h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Last updated: January 2026 • GDPR, CCPA & SOC-2 Compliant
            </div>
            
            <h4 className="text-sm font-bold text-slate-100">1. Data We Collect</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              We collect user-provided account details (name, email), publicly accessible web document HTML fetched during audit crawls, and telemetry queries. We never collect or harvest private credentials or unindexed backend databases.
            </p>

            <h4 className="text-sm font-bold text-slate-100">2. Crawl & Analysis Privacy</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our automated crawler strictly adheres to robots.txt directives, standard HTTP rate limits, and standard User-Agent transparency headers.
            </p>

            <h4 className="text-sm font-bold text-slate-100">3. Storage & Encryption</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              All stored records, audit findings, and password hashes are encrypted with TLS 1.3 in transit and AES-256 at rest.
            </p>
          </div>
        )}

        {/* 4. TERMS OF SERVICE MODAL */}
        {activeModal === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <FileText className="w-6 h-6" />
              <h3 className="text-2xl font-extrabold text-white font-display">Terms of Service</h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Effective Date: January 1, 2026
            </div>

            <h4 className="text-sm font-bold text-slate-100">1. Acceptable Use</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              You agree to only submit URLs and domains that you own or have legal authorization to evaluate. You may not utilize our platform for distributed denial of service or abusive crawling operations.
            </p>

            <h4 className="text-sm font-bold text-slate-100">2. Accuracy & Disclaimer</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI Visibility Auditor delivers deterministic and AI-synthesized diagnostic analysis based on real HTML extractions. Different search engines continually modify indexing algorithms; results are guidance benchmarks rather than algorithmic guarantees.
            </p>
          </div>
        )}

        {/* Bottom Back / Close Action Bar */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>Close (Go Back)</span>
          </button>
          
          <span className="text-[11px] text-slate-500 font-mono">
            AI Visibility Auditor Systems
          </span>
        </div>
      </div>
    </div>
  );
};
