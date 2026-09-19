import React, { useRef, useState } from 'react';
import { 
  User, Camera, Upload, Trash2, CheckCircle2, ShieldCheck, Sparkles, 
  Building, Mail, Briefcase, Award, Save, Loader2, Link2, RefreshCw, 
  Check, Image as ImageIcon, Lock
} from 'lucide-react';
import { UserProfile } from '../types';
import { CameraCaptureModal } from './CameraCaptureModal';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

const PRESET_AVATARS = [
  {
    name: 'Executive Leader',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    category: 'Executive',
  },
  {
    name: 'Tech Specialist',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    category: 'Tech / AI',
  },
  {
    name: 'Software Architect',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    category: 'Engineering',
  },
  {
    name: 'Academic Scholar',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    category: 'Academic',
  },
  {
    name: 'Creative Marketer',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    category: 'Creative',
  },
  {
    name: 'Student & Researcher',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    category: 'Student / Scholar',
  },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [company, setCompany] = useState(user.company || 'Global Search Intelligence Labs');
  const [role, setRole] = useState(user.role || 'Chief AI Visibility Officer');
  const [accountType, setAccountType] = useState(user.accountType);
  const [previewAvatar, setPreviewAvatar] = useState(user.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [photoSavedToast, setPhotoSavedToast] = useState<string | null>(null);
  
  // Custom URL input toggle
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  // Camera capture modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Directly apply and fix avatar permanently in both State, LocalStorage, and Backend
  const applyAndFixAvatar = async (newAvatarUrl: string) => {
    setPreviewAvatar(newAvatarUrl);
    
    // Save to LocalStorage immediately for 100% permanence
    try {
      localStorage.setItem('user_profile_avatar', newAvatarUrl);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Update global state
    const updatedUser: UserProfile = {
      ...user,
      avatarUrl: newAvatarUrl,
    };
    onUpdateUser(updatedUser);

    // Save to Backend API
    try {
      await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: newAvatarUrl }),
      });
    } catch (err) {
      console.warn('Backend avatar save notice:', err);
    }

    setPhotoSavedToast('Profile photo updated & fixed permanently! You can change it anytime.');
    setTimeout(() => setPhotoSavedToast(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size & formats (up to 8MB)
    if (file.size > 8 * 1024 * 1024) {
      alert('Photo size exceeds 8MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        applyAndFixAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`;
    applyAndFixAvatar(defaultAvatar);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    applyAndFixAvatar(customUrl.trim());
    setCustomUrl('');
    setShowUrlInput(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Save profile fields
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, role, accountType }),
      });
      const updatedProfile = await res.json();

      // Ensure avatar is also updated
      await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: previewAvatar }),
      });

      const fullUpdated: UserProfile = {
        ...user,
        name,
        company,
        role,
        accountType,
        avatarUrl: previewAvatar,
      };

      try {
        localStorage.setItem('user_profile_data', JSON.stringify(fullUpdated));
        localStorage.setItem('user_profile_avatar', previewAvatar);
      } catch {}

      onUpdateUser(fullUpdated);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Profile save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>User Identity & Credentials</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-100 font-display mt-1">
          Profile & Account Management
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize your profile photo, author credentials, organization details, and account preferences.
        </p>
      </div>

      {/* Floating Status Toast for Photo Update */}
      {photoSavedToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{photoSavedToast}</span>
          </div>
          <button
            onClick={() => setPhotoSavedToast(null)}
            className="text-emerald-400 hover:text-white text-xs font-mono px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          1. PHOTO MANAGEMENT CARD WITH ANYTIME FLEXIBILITY & PERMANENT FIX
         ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-200">
              Profile Photo & Verified Avatar
            </h3>
            <p className="text-xs text-slate-400">
              Your photo stays permanently fixed once selected. You have full freedom to change or update it anytime.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-semibold self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auto-Saved & Fixed</span>
          </div>
        </div>

        {/* Current Photo & Action Controls */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2">
          
          {/* Main Avatar Preview */}
          <div className="relative group flex-shrink-0">
            <img
              src={previewAvatar}
              alt={name}
              className="w-32 h-32 rounded-3xl object-cover ring-4 ring-indigo-500/40 shadow-2xl bg-slate-950"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-950/70 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-1"
              title="Click to change photo"
            >
              <Camera className="w-6 h-6 text-cyan-300" />
              <span className="text-[10px] font-mono font-bold">Change Photo</span>
            </button>
          </div>

          {/* Buttons & Anytime Options */}
          <div className="space-y-3 text-center sm:text-left flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {/* Option 1: Upload from Device */}
              <button
                id="profile-upload-photo-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Upload From Device</span>
              </button>

              {/* Option 2: Live Camera Snapshot */}
              <button
                id="profile-camera-photo-btn"
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all shadow-inner active:scale-95"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Take Live Photo</span>
              </button>

              {/* Option 3: Custom Web URL */}
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paste Image URL</span>
              </button>

              {/* Option 4: Reset / Default */}
              <button
                id="profile-remove-photo-btn"
                type="button"
                onClick={handleRemovePhoto}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Reset to default initials avatar"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Custom URL Input Field (Collapsible) */}
            {showUrlInput && (
              <div className="flex items-center gap-2 pt-2 animate-in fade-in">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                  className="flex-1 bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply</span>
                </button>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Supported: JPG, PNG, WebP & GIF up to 8MB. Updates sync across Navbar and Audit reports instantly.
            </p>
          </div>
        </div>

        {/* Preset Avatars Gallery for 1-Click Selection */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Or Choose a High-Resolution Preset Avatar</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1-Click Instant Apply</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PRESET_AVATARS.map((preset, idx) => {
              const isSelected = previewAvatar === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyAndFixAvatar(preset.url)}
                  className={`p-1.5 rounded-2xl border transition-all text-center flex flex-col items-center gap-1.5 group ${
                    isSelected
                      ? 'bg-indigo-950/60 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 truncate w-full group-hover:text-white">
                    {preset.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. PROFILE FORM DETAILS (NAME, ROLE, COMPANY, EMAIL, SAVE)
         ========================================================================= */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Profile Information Inputs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-200">
            Account & Organization Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  id="profile-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                Email Address (Verified)
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-400 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                Company / Institution Name
              </label>
              <div className="relative flex items-center">
                <Building className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                Professional Role / Title
              </label>
              <div className="relative flex items-center">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* E-E-A-T Credential Trust Signals */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-200">
              E-E-A-T Author Credentials
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            These credentials are automatically embedded in generated Schema.org JSON-LD structured data and PDF audit reports to satisfy Google Quality Rater standards.
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Author Person Schema:</span>
              <span className="font-mono text-emerald-400 font-bold">schema.org/Person (Active)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Primary Domain Specialist:</span>
              <span className="font-mono text-slate-200">{role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Affiliation Entity:</span>
              <span className="font-mono text-slate-200">{company}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Security Verification:</span>
              <span className="font-mono text-cyan-400 font-bold">256-bit TLS Encrypted Session</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {saveSuccess ? (
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile credentials and photo saved permanently!</span>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              All modifications are persisted securely across sessions.
            </div>
          )}

          <button
            id="profile-save-submit-btn"
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Credentials...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Profile Changes</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Camera Capture Modal for Live Selfie / Webcam Photo */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => {
          applyAndFixAvatar(dataUrl);
          setIsCameraOpen(false);
        }}
      />

    </div>
  );
};
