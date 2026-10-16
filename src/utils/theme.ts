/**
 * Theme & Grayscale Background Calculator
 * Controls continuous grayscale range: 0 (white #FFFFFF) to 100 (black #000000)
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceBorder: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  isDark: boolean;
  navActiveBg: string;
  navActiveText: string;
  inputBg: string;
  inputBorder: string;
}

export function calculateGrayscaleRgb(sliderValue: number): { r: number; g: number; b: number; hex: string } {
  // Clamped between 0 and 100
  const clamped = Math.max(0, Math.min(100, sliderValue));
  // 0 -> 255 (white), 100 -> 0 (black)
  const channel = Math.round(255 * (1 - clamped / 100));
  const hexPart = channel.toString(16).padStart(2, '0');
  const hex = `#${hexPart}${hexPart}${hexPart}`;
  return { r: channel, g: channel, b: channel, hex };
}

export function getThemeTokens(sliderValue: number): ThemeColors {
  const { hex, r } = calculateGrayscaleRgb(sliderValue);
  const isDark = sliderValue > 52;

  if (!isDark) {
    // Light mode (default ivory to mid-gray)
    // If slider is near 0, we mix with warm ivory #FFF9F0 for the signature aesthetic
    const bg = sliderValue === 0 ? '#FFF9F0' : hex;
    return {
      background: bg,
      surface: 'rgba(255, 255, 255, 0.75)',
      surfaceBorder: 'rgba(48, 39, 71, 0.08)',
      cardBg: 'rgba(255, 255, 255, 0.85)',
      cardBorder: 'rgba(48, 39, 71, 0.08)',
      textPrimary: '#302747', // Charcoal/plum signature text
      textSecondary: '#5A526E',
      textMuted: '#847B9B',
      isDark: false,
      navActiveBg: '#DCD1FA',
      navActiveText: '#302747',
      inputBg: 'rgba(255, 255, 255, 0.95)',
      inputBorder: 'rgba(48, 39, 71, 0.15)',
    };
  } else {
    // Dark mode (mid-gray to pure black)
    return {
      background: hex,
      surface: 'rgba(30, 26, 42, 0.85)',
      surfaceBorder: 'rgba(220, 209, 250, 0.18)',
      cardBg: 'rgba(26, 22, 38, 0.88)',
      cardBorder: 'rgba(220, 209, 250, 0.15)',
      textPrimary: '#F7F5FC',
      textSecondary: '#CBC3E3',
      textMuted: '#9E94B8',
      isDark: true,
      navActiveBg: 'rgba(220, 209, 250, 0.28)',
      navActiveText: '#F7F5FC',
      inputBg: 'rgba(40, 35, 56, 0.9)',
      inputBorder: 'rgba(220, 209, 250, 0.25)',
    };
  }
}

export const THEME_STORAGE_KEY = 'studyspace_theme_grayscale';

export function loadSavedThemeValue(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return 0; // Default to 0 (warm ivory / light)
}

export function saveThemeValue(value: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, value.toString());
  } catch {
    // Ignore storage errors
  }
}
