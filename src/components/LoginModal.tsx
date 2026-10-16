import React, { useState } from 'react';
import { X, Mail, Phone, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
  onSwitchToRegister: () => void;
  theme: ThemeColors;
}

type LoginMethod = 'options' | 'email-otp' | 'phone-otp';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
  theme,
}) => {
  const [method, setMethod] = useState<LoginMethod>('options');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    setMethod('email-otp');
    setError(null);
  };

  const handleSendEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid student or personal email address.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setError('Please provide a valid mobile phone number with country code.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setError('Please enter your 4 or 6 digit verification code.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      const user = method === 'email-otp' ? email.trim() : `${phone.trim()}@sms.user`;
      onLoginSuccess(user);
      onClose();
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative"
        style={{
          backgroundColor: theme.isDark ? 'rgba(28, 24, 40, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          border: `1px solid ${theme.surfaceBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login dialog"
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          style={{ color: theme.textSecondary }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg mb-3 shadow-xs"
            style={{
              backgroundColor: '#DCD1FA',
              color: '#302747',
            }}
          >
            S
          </div>
          <h2
            id="login-title"
            className="text-2xl font-black tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            Welcome back to StudySpace
          </h2>
          <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: theme.textSecondary }}>
            Log in to access your saved notes, revision schedules, and community decks.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Method 1: Main Options */}
        {method === 'options' && (
          <div className="space-y-3">
            {/* Email OTP trigger - Prioritized */}
            <button
              type="button"
              onClick={() => {
                setMethod('email-otp');
                setError(null);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01]"
              style={{
                borderColor: theme.isDark ? 'rgba(142, 116, 219, 0.45)' : '#C9B8F9',
                backgroundColor: theme.isDark ? 'rgba(142, 116, 219, 0.12)' : 'rgba(220, 209, 250, 0.25)',
                color: theme.textPrimary,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">Email OTP Sign In</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-full bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      Primary
                    </span>
                  </div>
                  <div className="text-[11px]" style={{ color: theme.textMuted }}>
                    Sign in with a one-time code to your email
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            </button>

            {/* Phone OTP trigger */}
            <button
              type="button"
              onClick={() => {
                setMethod('phone-otp');
                setError(null);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01]"
              style={{
                borderColor: theme.surfaceBorder,
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(48, 39, 71, 0.03)',
                color: theme.textPrimary,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Phone OTP</div>
                  <div className="text-[11px]" style={{ color: theme.textMuted }}>
                    Sign in with a verification SMS
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" style={{ color: theme.textMuted }} />
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: theme.surfaceBorder }} />
              </div>
              <span
                className="relative px-3 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md"
                style={{
                  backgroundColor: theme.isDark ? '#1C1828' : '#FFFFFF',
                  color: theme.textMuted,
                }}
              >
                or continue with
              </span>
            </div>

            {/* Google Login button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-xs border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
              style={{
                borderColor: theme.surfaceBorder,
                color: theme.textPrimary,
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Email OTP Flow */}
        {method === 'email-otp' && !otpSent && (
          <form onSubmit={handleSendEmailOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textPrimary }}>
                Student / Academic Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMethod('options')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80"
                style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send One-Time Code</span>}
              </button>
            </div>
          </form>
        )}

        {/* Phone OTP Flow */}
        {method === 'phone-otp' && !otpSent && (
          <form onSubmit={handleSendPhoneOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textPrimary }}>
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 234 5678"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMethod('options')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80"
                style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send SMS Code</span>}
              </button>
            </div>
          </form>
        )}

        {/* OTP Verification Step */}
        {otpSent && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs">
              A verification code was sent to <strong>{method === 'email-otp' ? email : phone}</strong>. Please enter the code below to complete sign in.
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textPrimary }}>
                Enter Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter code"
                required
                className="w-full text-center tracking-widest text-lg font-mono px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80"
                style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
              >
                Change details
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Log in</span>}
              </button>
            </div>
          </form>
        )}

        {/* Footer info: switch to register */}
        <div className="mt-6 pt-4 border-t text-center text-xs" style={{ borderColor: theme.surfaceBorder }}>
          <span style={{ color: theme.textSecondary }}>Don't have a student account yet? </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToRegister();
            }}
            className="font-bold underline cursor-pointer"
            style={{ color: '#8E74DB' }}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
