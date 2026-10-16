import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Camera,
  Check,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Info,
  Building,
  BookOpen,
} from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';

export interface UserProfileData {
  fullName: string;
  username: string;
  avatarUrl: string;
  bio: string;
  institution: string;
  major: string;
  academicYear: string;
  email: string;
  phone: string;
}

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSaveProfile: (profile: UserProfileData) => void;
  currentProfile: UserProfileData;
  theme: ThemeColors;
}

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face&auto=format&q=80',
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onSaveProfile,
  currentProfile,
  theme,
}) => {
  const [formData, setFormData] = useState<UserProfileData>(currentProfile);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(currentProfile);
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (url: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: theme.isDark ? 'rgba(28, 24, 40, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          border: `1px solid ${theme.surfaceBorder}`,
          color: theme.textPrimary,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile settings modal"
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          style={{ color: theme.textSecondary }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: theme.surfaceBorder }}>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
            style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
          >
            <User className="w-5 h-5 text-[#302747]" />
          </div>
          <div>
            <h2 id="profile-settings-title" className="text-xl font-extrabold tracking-tight">
              Profile Settings
            </h2>
            <p className="text-xs font-medium" style={{ color: theme.textMuted }}>
              Update student details, avatar, and study goals
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Profile Picture Type & Avatar Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2.5" style={{ color: theme.textMuted }}>
              Profile Picture
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border" style={{
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(48, 39, 71, 0.02)',
              borderColor: theme.surfaceBorder,
            }}>
              {/* Current Avatar Display */}
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#DCD1FA] shadow-md relative bg-[#302747] flex items-center justify-center">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt={formData.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-extrabold text-2xl text-[#DCD1FA]">
                      {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="avatar-file-input"
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#302747] text-[#FFF9F0] border border-white shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                  title="Upload custom photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Avatar Presets Selection */}
              <div className="flex-1 w-full">
                <div className="text-[11px] font-bold mb-2 opacity-80" style={{ color: theme.textSecondary }}>
                  Choose from Student Avatars or Upload:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                        formData.avatarUrl === preset
                          ? 'border-purple-500 ring-2 ring-purple-400/40 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Avatar preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomInput((prev) => !prev)}
                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
                  >
                    Image URL
                  </button>
                </div>

                {showCustomInput && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="flex-1 text-xs px-3 py-1.5 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#8E74DB]"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#FFFFFF',
                        borderColor: theme.surfaceBorder,
                        color: theme.textPrimary,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarUrl.trim()) {
                          setFormData((prev) => ({ ...prev, avatarUrl: customAvatarUrl.trim() }));
                          setShowCustomInput(false);
                          setCustomAvatarUrl('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#302747] text-[#FFF9F0] cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Editable Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-profile-fullname" className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: theme.textMuted }}>
                Full Name
              </label>
              <input
                id="edit-profile-fullname"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="e.g. Mayank Bamil"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#8E74DB] transition-all"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#FFFFFF',
                  borderColor: theme.surfaceBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>

            <div>
              <label htmlFor="edit-profile-username" className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: theme.textMuted }}>
                Username (shown on hover)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-purple-400">
                  @
                </span>
                <input
                  id="edit-profile-username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase(),
                    }))
                  }
                  placeholder="student_handle"
                  className="w-full text-xs font-mono font-bold pl-8 pr-3.5 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#8E74DB] transition-all"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#FFFFFF',
                    borderColor: theme.surfaceBorder,
                    color: theme.textPrimary,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3. Bio / Academic Goal */}
          <div>
            <label htmlFor="edit-profile-bio" className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: theme.textMuted }}>
              Bio & Study Focus
            </label>
            <textarea
              id="edit-profile-bio"
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="e.g. Computer Science student studying graph theory, algorithms & biology."
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#8E74DB] transition-all resize-none leading-relaxed"
              style={{
                backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#FFFFFF',
                borderColor: theme.surfaceBorder,
                color: theme.textPrimary,
              }}
            />
          </div>

          {/* 4. Academic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="edit-profile-institution" className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: theme.textMuted }}>
                Institution
              </label>
              <input
                id="edit-profile-institution"
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData((prev) => ({ ...prev, institution: e.target.value }))}
                placeholder="University / College"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#8E74DB]"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#FFFFFF',
                  borderColor: theme.surfaceBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>
            <div>
              <label htmlFor="edit-profile-major" className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: theme.textMuted }}>
                Major / Course
              </label>
              <input
                id="edit-profile-major"
                type="text"
                value={formData.major}
                onChange={(e) => setFormData((prev) => ({ ...prev, major: e.target.value }))}
                placeholder="e.g. Computer Science"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#8E74DB]"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#FFFFFF',
                  borderColor: theme.surfaceBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>
            <div>
              <label htmlFor="edit-profile-year" className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: theme.textMuted }}>
                Academic Year
              </label>
              <select
                id="edit-profile-year"
                value={formData.academicYear}
                onChange={(e) => setFormData((prev) => ({ ...prev, academicYear: e.target.value }))}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#8E74DB]"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#FFFFFF',
                  borderColor: theme.surfaceBorder,
                  color: theme.textPrimary,
                }}
              >
                <option value="1st Year">1st Year / Freshman</option>
                <option value="2nd Year">2nd Year / Sophomore</option>
                <option value="3rd Year">3rd Year / Junior</option>
                <option value="4th Year">4th Year / Senior</option>
                <option value="Graduate">Graduate / Masters</option>
              </select>
            </div>
          </div>

          {/* 5. STRICT SECURITY EXCLUSIONS: EMAIL & PHONE NUMBER (NON-EDITABLE) */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold mb-2.5 text-amber-500">
              <ShieldCheck className="w-4 h-4" />
              <span>Security Credentials (Non-Editable)</span>
            </div>

            <div className="p-3.5 rounded-2xl border space-y-3" style={{
              backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.03)',
              borderColor: theme.surfaceBorder,
            }}>
              {/* Email Address - Strictly Locked */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold opacity-75" style={{ color: theme.textMuted }}>
                    Email Address
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-md bg-black/10 dark:bg-white/10 text-gray-400">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked credential</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email || userEmail}
                    readOnly
                    disabled
                    aria-readonly="true"
                    className="w-full text-xs font-mono font-medium px-3.5 py-2 rounded-xl border opacity-65 cursor-not-allowed select-none"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F3F4F6',
                      borderColor: theme.surfaceBorder,
                      color: theme.textSecondary,
                    }}
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Mobile / Phone Number - Strictly Locked */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold opacity-75" style={{ color: theme.textMuted }}>
                    Phone Number
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-md bg-black/10 dark:bg-white/10 text-gray-400">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked credential</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone || '+1 (555) 234-5678'}
                    readOnly
                    disabled
                    aria-readonly="true"
                    className="w-full text-xs font-mono font-medium px-3.5 py-2 rounded-xl border opacity-65 cursor-not-allowed select-none"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F3F4F6',
                      borderColor: theme.surfaceBorder,
                      color: theme.textSecondary,
                    }}
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <p className="text-[10px] opacity-70 flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                <Info className="w-3 h-3 text-amber-500 shrink-0" />
                <span>As requested by security policy, account email and phone numbers cannot be edited.</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme.surfaceBorder }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold border hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#302747',
                color: '#FFF9F0',
              }}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-purple-300" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
