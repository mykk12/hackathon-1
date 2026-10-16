import React, { useRef, useEffect, useState } from 'react';
import {
  Sun,
  Moon,
  Menu,
  X,
  Home,
  LayoutDashboard,
  FolderKanban,
  CalendarClock,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import type { SidebarTab } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';
import { ProfileSettingsModal, UserProfileData, AVATAR_PRESETS } from './ProfileSettingsModal.tsx';

interface HeaderProps {
  currentTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  theme: ThemeColors;
  sliderValue: number;
  onSliderChange: (value: number) => void;
  isBrightnessOpen: boolean;
  onToggleBrightness: () => void;
  onCloseBrightness: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  userEmail?: string | null;
  onLogout?: () => void;
}

interface NavItem {
  id: SidebarTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'manage', label: 'Manage', icon: FolderKanban },
  { id: 'study-plan', label: 'Study Plan', icon: CalendarClock },
];

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  theme,
  sliderValue,
  onSliderChange,
  isBrightnessOpen,
  onToggleBrightness,
  onCloseBrightness,
  onOpenLogin,
  onOpenRegister,
  userEmail,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const brightnessBtnRef = useRef<HTMLButtonElement>(null);

  // User Profile state with local persistence
  const [profile, setProfile] = useState<UserProfileData>(() => {
    if (!userEmail) {
      return {
        fullName: '',
        username: '',
        avatarUrl: AVATAR_PRESETS[0],
        bio: '',
        institution: '',
        major: '',
        academicYear: '',
        email: '',
        phone: '',
      };
    }
    const namePart = userEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const cleanUsername = userEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    try {
      const saved = localStorage.getItem(`studyspace_profile_${userEmail}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }

    return {
      fullName: formattedName,
      username: cleanUsername,
      avatarUrl: AVATAR_PRESETS[0],
      bio: '',
      institution: '',
      major: '',
      academicYear: '',
      email: userEmail,
      phone: '',
    };
  });

  useEffect(() => {
    if (!userEmail) return;
    try {
      const saved = localStorage.getItem(`studyspace_profile_${userEmail}`);
      if (saved) {
        setProfile(JSON.parse(saved));
        return;
      }
    } catch {
      // ignore
    }

    const namePart = userEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const cleanUsername = userEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    setProfile((prev) => ({
      ...prev,
      fullName: prev.fullName || formattedName,
      username: prev.username || cleanUsername,
      email: userEmail,
    }));
  }, [userEmail]);

  const handleSaveProfile = (updated: UserProfileData) => {
    setProfile(updated);
    try {
      localStorage.setItem(`studyspace_profile_${userEmail || updated.email}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Close brightness popover when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isBrightnessOpen &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        brightnessBtnRef.current &&
        !brightnessBtnRef.current.contains(event.target as Node)
      ) {
        onCloseBrightness();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (isBrightnessOpen) {
          onCloseBrightness();
          brightnessBtnRef.current?.focus();
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBrightnessOpen, onCloseBrightness, isMobileMenuOpen]);

  const handleNavClick = (tabId: SidebarTab) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Full-Width Horizontal Navigation Bar */}
      <header
        className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 py-3 shadow-md transition-colors"
        style={{
          backgroundColor: '#302747', // Signature plum/charcoal brand color
          borderBottom: '1px solid rgba(220, 209, 250, 0.18)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: StudySpace Brand Logo & Horizontal Nav Links beside it */}
          <div className="flex items-center gap-3 lg:gap-6">
            {/* OriginKit Crystal Glow Brand Component */}
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="relative text-left cursor-pointer group focus:outline-none select-none"
              aria-label="StudySpace"
              title="StudySpace"
            >
              <div className="crystal-glow-btn flex items-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-2xl transition-all duration-300">
                {/* Crystal Glare Sweep Animation */}
                <div className="crystal-glare-sweep pointer-events-none" aria-hidden="true" />

                {/* Website Brand Name (Enlarged) */}
                <span className="font-black text-2xl sm:text-3xl lg:text-[34px] tracking-tight leading-none bg-gradient-to-r from-white via-[#EDE9FE] to-[#DCD1FA] bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(220,209,250,0.6)]">
                  StudySpace
                </span>
              </div>
            </button>

            {/* Horizontal Navigation Links - Placed Horizontally Beside Logo */}
            <nav
              className="hidden md:flex items-center gap-1 lg:gap-1.5 ml-2 lg:ml-4"
              aria-label="Main horizontal navigation"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'shadow-xs font-bold'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    style={{
                      backgroundColor: isActive ? '#DCD1FA' : 'transparent',
                      color: isActive ? '#302747' : 'rgba(255, 255, 255, 0.82)',
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#302747]' : 'text-white/70'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Controls (Brightness + Login/Register / Account + Mobile Hamburger) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Brightness Grayscale Control */}
            <div className="relative">
              <button
                ref={brightnessBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBrightness();
                }}
                aria-expanded={isBrightnessOpen}
                aria-label="Adjust page background grayscale shade"
                className="p-2 sm:p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isBrightnessOpen ? '#DCD1FA' : 'rgba(255, 255, 255, 0.12)',
                  color: isBrightnessOpen ? '#302747' : '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {isBrightnessOpen ? (
                  <Sun className="w-4 h-4 text-[#302747]" />
                ) : sliderValue > 50 ? (
                  <Moon className="w-4 h-4 text-purple-200" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-300" />
                )}
              </button>

              {/* Grayscale Slider Popover */}
              {isBrightnessOpen && (
                <div
                  ref={popoverRef}
                  role="dialog"
                  aria-label="Background brightness shade adjustment"
                  className="absolute right-0 top-full mt-2.5 w-52 p-3 rounded-2xl z-50 backdrop-blur-2xl shadow-2xl transition-all duration-150 animate-in fade-in zoom-in-95"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(28, 24, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: `1px solid ${theme.surfaceBorder}`,
                    boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun
                      className="w-4 h-4 shrink-0 transition-opacity"
                      style={{
                        color: '#F59E0B',
                        opacity: sliderValue < 50 ? 1 : 0.5,
                      }}
                      aria-label="Bright background"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={sliderValue}
                      onChange={(e) => onSliderChange(parseFloat(e.target.value))}
                      aria-label="Page background grayscale shade slider"
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#8E74DB] bg-gradient-to-r from-white via-gray-400 to-black border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                    />
                    <Moon
                      className="w-4 h-4 shrink-0 transition-opacity"
                      style={{
                        color: '#A78BFA',
                        opacity: sliderValue > 50 ? 1 : 0.5,
                      }}
                      aria-label="Low brightness background"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* User Session Info (Profile Picture Type with Hover Username & Profile Settings) or Login / Register */}
            {userEmail ? (
              <div className="flex items-center gap-2.5">
                {/* Profile Picture Type Trigger - Shows Username on Hover & Opens Profile Settings on Click */}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsProfileModalOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsProfileModalOpen(true);
                    }
                  }}
                  className="group relative inline-flex items-center cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DCD1FA] rounded-full"
                  aria-label={`Profile settings for @${profile.username || userEmail.split('@')[0]}`}
                  title={`@${profile.username || userEmail.split('@')[0]} - Click to edit profile`}
                >
                  {/* Circular Profile Picture / Avatar */}
                  <div className="relative">
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#DCD1FA] shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:border-white group-hover:shadow-[0_0_12px_rgba(220,209,250,0.5)]"
                      style={{
                        backgroundColor: '#241D35',
                      }}
                    >
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.fullName || profile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-extrabold text-sm sm:text-base text-[#DCD1FA]">
                          {(profile.fullName || profile.username || userEmail).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Small Profile Settings Indicator Badge */}
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110"
                      style={{
                        backgroundColor: '#DCD1FA',
                        color: '#302747',
                        border: '1.5px solid #302747',
                      }}
                      title="Edit Profile Settings"
                    >
                      <Settings className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  {/* Username Displayed on Hover */}
                  <div
                    className="absolute top-full mt-2.5 right-0 sm:left-1/2 sm:-translate-x-1/2 pointer-events-none opacity-0 invisible -translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50 flex flex-col items-end sm:items-center"
                    style={{ filter: 'drop-shadow(0 10px 24px rgba(0, 0, 0, 0.45))' }}
                  >
                    {/* Tooltip Arrow */}
                    <div
                      className="w-2.5 h-2.5 rotate-45 -mb-1 shadow-xs hidden sm:block"
                      style={{
                        backgroundColor: '#1E172E',
                        borderTop: '1px solid rgba(220, 209, 250, 0.3)',
                        borderLeft: '1px solid rgba(220, 209, 250, 0.3)',
                      }}
                    />
                    {/* Tooltip Bubble */}
                    <div
                      className="px-3.5 py-2 rounded-2xl border text-white whitespace-nowrap flex flex-col items-start sm:items-center gap-0.5"
                      style={{
                        backgroundColor: '#1E172E',
                        borderColor: 'rgba(220, 209, 250, 0.3)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55)',
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-[#DCD1FA] font-mono font-bold text-xs">@</span>
                        <span className="font-mono text-xs font-bold text-white tracking-tight">
                          {profile.username || userEmail.split('@')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-purple-200/80 flex items-center gap-1">
                        <Settings className="w-2.5 h-2.5 text-purple-300" />
                        <span>Profile edit settings</span>
                      </span>
                    </div>
                  </div>
                </span>

                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl transition-all border cursor-pointer hover:opacity-85 active:scale-95"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(220, 209, 250, 0.3)',
                    color: '#DCD1FA',
                  }}
                  title="Sign out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLogin();
                  }}
                  className="text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                  }}
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenRegister();
                  }}
                  className="text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: '#DCD1FA',
                    color: '#302747',
                    border: '1px solid rgba(48, 39, 71, 0.12)',
                  }}
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl transition-colors cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
              }}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Responsive Mobile Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            role="button"
            tabIndex={0}
            aria-label="Close navigation overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter') setIsMobileMenuOpen(false);
            }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in"
          />

          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw] p-6 shadow-2xl flex flex-col justify-between md:hidden animate-in slide-in-from-right duration-200"
            style={{
              backgroundColor: '#302747',
              borderLeft: '1px solid rgba(220, 209, 250, 0.18)',
            }}
          >
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base shadow-sm"
                    style={{
                      backgroundColor: '#DCD1FA',
                      color: '#302747',
                    }}
                  >
                    S
                  </div>
                  <span className="font-extrabold text-lg text-white">StudySpace</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links inside drawer */}
              <nav className="space-y-1.5" aria-label="Mobile navigation links">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                        isActive ? 'shadow-sm font-bold' : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#DCD1FA' : 'transparent',
                        color: isActive ? '#302747' : 'rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#302747]' : 'text-white/70'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer with User info & Profile Settings Trigger */}
            <div className="pt-4 border-t border-white/10">
              {userEmail ? (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 transition-all text-left cursor-pointer border border-white/10 group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#DCD1FA] shrink-0 bg-[#241D35] flex items-center justify-center">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.fullName || profile.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-sm text-[#DCD1FA]">
                          {(profile.fullName || profile.username || userEmail).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                        <span>@{profile.username || userEmail.split('@')[0]}</span>
                      </div>
                      <div className="text-[11px] text-purple-200/80 truncate flex items-center gap-1 mt-0.5">
                        <Settings className="w-3 h-3 text-purple-300" />
                        <span>Edit Profile Settings</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogout?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs border border-purple-300/30 text-[#DCD1FA] hover:bg-white/5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="py-2.5 rounded-xl font-semibold text-xs text-white border border-white/20 hover:bg-white/10 text-center"
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenRegister();
                    }}
                    className="py-2.5 rounded-xl font-bold text-xs bg-[#DCD1FA] text-[#302747] text-center"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Student Profile Settings Modal */}
      {userEmail && (
        <ProfileSettingsModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userEmail={userEmail}
          onSaveProfile={handleSaveProfile}
          currentProfile={profile}
          theme={theme}
        />
      )}
    </>
  );
};
