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
} from 'lucide-react';
import type { SidebarTab } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

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
  const popoverRef = useRef<HTMLDivElement>(null);
  const brightnessBtnRef = useRef<HTMLButtonElement>(null);

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
            {/* StudySpace Logo */}
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left cursor-pointer group focus:outline-none"
              aria-label="StudySpace Home"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: '#DCD1FA',
                  color: '#302747',
                  border: '1px solid rgba(48, 39, 71, 0.12)',
                }}
              >
                S
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight leading-none text-white">
                  StudySpace
                </span>
                <span
                  className="text-[10px] font-semibold tracking-wider uppercase opacity-85"
                  style={{ color: '#DCD1FA' }}
                >
                  Academic Platform
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

            {/* User Session Info or Login / Register Buttons */}
            {userEmail ? (
              <div className="flex items-center gap-2">
                <span
                  className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl truncate max-w-[200px]"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                  }}
                  title={userEmail}
                >
                  <User className="w-3.5 h-3.5 text-purple-200 shrink-0" />
                  <span className="truncate">{userEmail}</span>
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl transition-all border cursor-pointer hover:opacity-85 active:scale-95"
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(220, 209, 250, 0.3)',
                    color: '#DCD1FA',
                  }}
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

            {/* Mobile Footer with User info */}
            <div className="pt-4 border-t border-white/10">
              {userEmail ? (
                <div className="space-y-2">
                  <div className="text-xs text-white/70 truncate">
                    Logged in as: <strong className="text-white">{userEmail}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs border border-purple-300/30 text-[#DCD1FA] hover:bg-white/5"
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
    </>
  );
};
