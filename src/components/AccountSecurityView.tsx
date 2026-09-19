import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, Lock, Eye, EyeOff, KeyRound, Smartphone, Laptop, 
  MapPin, Clock, Trash2, CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react';
import { LoginSession } from '../types';

export const AccountSecurityView: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const [sessions, setSessions] = useState<LoginSession[]>([]);

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/user/sessions');
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch {}
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const calculateStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    return score;
  };

  const strength = calculateStrength(newPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordStatus({ type: 'success', message: 'Password successfully updated!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus({ type: 'error', message: data.error || 'Failed to update password.' });
      }
    } catch {
      setPasswordStatus({ type: 'error', message: 'Network error occurred.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Authentication Guard</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-100 font-display mt-1">
          Account & Security
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage your password security, encryption standards, and active login sessions.
        </p>
      </div>

      {/* Password Change Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 text-indigo-400">
          <KeyRound className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-100">
            Change Master Password
          </h3>
        </div>

        {passwordStatus && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              passwordStatus.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {passwordStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{passwordStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Current Password
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {showCurrent ? 'Password Visible' : 'Password Hidden'}
              </span>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                id="sec-current-password-input"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder={showCurrent ? "Enter current password" : "••••••••••••"}
                className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-20 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 ${
                  showCurrent ? 'font-sans font-medium text-cyan-200' : 'font-mono'
                }`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCurrent(!showCurrent);
                }}
                className={`absolute right-2 px-2 py-1 rounded-lg border transition-all z-20 cursor-pointer flex items-center gap-1.5 text-[11px] font-mono ${
                  showCurrent 
                    ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' 
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={showCurrent ? 'Hide password' : 'Show password'}
              >
                {showCurrent ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-bold">Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-medium">Show</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  New Password
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {showNew ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  id="sec-new-password-input"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder={showNew ? "Enter new password" : "••••••••••••"}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-20 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 ${
                    showNew ? 'font-sans font-medium text-cyan-200' : 'font-mono'
                  }`}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowNew(!showNew);
                  }}
                  className={`absolute right-2 px-2 py-1 rounded-lg border transition-all z-20 cursor-pointer flex items-center gap-1.5 text-[11px] font-mono ${
                    showNew 
                      ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' 
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-bold">Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-medium">Show</span>
                    </>
                  )}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Password Strength</span>
                    <span className={strength >= 75 ? 'text-emerald-400' : strength >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                      {strength >= 75 ? 'Strong' : strength >= 50 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength >= 75 ? 'bg-emerald-400' : strength >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Confirm New Password
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {showConfirm ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  id="sec-confirm-password-input"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder={showConfirm ? "Re-enter new password" : "••••••••••••"}
                  className={`w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-20 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 ${
                    showConfirm ? 'font-sans font-medium text-cyan-200' : 'font-mono'
                  }`}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowConfirm(!showConfirm);
                  }}
                  className={`absolute right-2 px-2 py-1 rounded-lg border transition-all z-20 cursor-pointer flex items-center gap-1.5 text-[11px] font-mono ${
                    showConfirm 
                      ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' 
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-bold">Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[10px] font-medium">Show</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="sec-update-password-btn"
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Login Sessions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Laptop className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-100">
              Active Login Sessions & Devices
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {sessions.length} Authorized Devices
          </span>
        </div>

        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                sess.isCurrent ? 'bg-slate-950/80 border-indigo-500/40' : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                  {sess.device.includes('iPhone') || sess.device.includes('Android') ? (
                    <Smartphone className="w-5 h-5" />
                  ) : (
                    <Laptop className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/30">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 mt-1 font-mono">
                    <span>IP: {sess.ip}</span>
                    <span>Loc: {sess.location}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {sess.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(sess.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1 self-end sm:self-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
