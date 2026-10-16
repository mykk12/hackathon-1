import React, { useState } from 'react';
import { X, Check, GraduationCap, School, AlertCircle, Loader2 } from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';
import type { UserRegistrationData } from '../types/index.ts';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (userData: UserRegistrationData) => void;
  onSwitchToLogin: () => void;
  theme: ThemeColors;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onSwitchToLogin,
  theme,
}) => {
  const [formData, setFormData] = useState<UserRegistrationData>({
    fullName: '',
    age: '',
    educationLevel: '',
    schoolClass: '',
    collegeName: '',
    collegeCourse: '',
    collegeYear: '',
    collegeSemester: '',
    email: '',
    mobile: '',
    otp: '',
  });

  const [step, setStep] = useState<'profile' | 'otp'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!formData.age || parseInt(formData.age, 10) < 10) {
      setError('Please enter a valid age (10+).');
      return;
    }
    if (!formData.educationLevel) {
      setError('Please select whether you are currently in School or College.');
      return;
    }
    if (formData.educationLevel === 'school' && !formData.schoolClass) {
      setError('Please select or specify your school class/grade.');
      return;
    }
    if (formData.educationLevel === 'college' && (!formData.collegeName || !formData.collegeCourse)) {
      setError('Please fill in your college name and course.');
      return;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!formData.mobile || formData.mobile.length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.trim().length < 4) {
      setError('Please enter your 4 or 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess(formData);
      onClose();
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative my-8"
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
          aria-label="Close registration dialog"
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
            id="register-title"
            className="text-2xl font-black tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            Join StudySpace Community
          </h2>
          <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: theme.textSecondary }}>
            Create your personalized academic profile to save materials and organize study plans.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'profile' ? (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Full Name & Age */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  Age *
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="19"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                />
              </div>
            </div>

            {/* Education Level Selector */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textPrimary }}>
                Education Level *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, educationLevel: 'school' })}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                    formData.educationLevel === 'school' ? 'ring-2 ring-[#8E74DB] font-bold' : 'opacity-85'
                  }`}
                  style={{
                    backgroundColor: formData.educationLevel === 'school'
                      ? (theme.isDark ? 'rgba(220, 209, 250, 0.2)' : '#DCD1FA')
                      : (theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(48, 39, 71, 0.03)'),
                    borderColor: theme.surfaceBorder,
                    color: theme.textPrimary,
                  }}
                >
                  <School className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                  <div>
                    <div className="text-xs">School Student</div>
                    <div className="text-[10px]" style={{ color: theme.textMuted }}>K-12 / Secondary</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, educationLevel: 'college' })}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                    formData.educationLevel === 'college' ? 'ring-2 ring-[#8E74DB] font-bold' : 'opacity-85'
                  }`}
                  style={{
                    backgroundColor: formData.educationLevel === 'college'
                      ? (theme.isDark ? 'rgba(220, 209, 250, 0.2)' : '#DCD1FA')
                      : (theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(48, 39, 71, 0.03)'),
                    borderColor: theme.surfaceBorder,
                    color: theme.textPrimary,
                  }}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                  <div>
                    <div className="text-xs">College / University</div>
                    <div className="text-[10px]" style={{ color: theme.textMuted }}>Undergrad / Postgrad</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Conditional fields for School students */}
            {formData.educationLevel === 'school' && (
              <div className="p-3.5 rounded-2xl bg-[#DCD1FA]/20 border border-[#DCD1FA]/50 space-y-2 animate-in fade-in">
                <label className="block text-xs font-bold" style={{ color: theme.textPrimary }}>
                  Class or Grade Level *
                </label>
                <select
                  value={formData.schoolClass}
                  onChange={(e) => setFormData({ ...formData, schoolClass: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                >
                  <option value="">Select your class/grade</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10 / High School Sophomore</option>
                  <option value="Grade 11">Grade 11 / High School Junior</option>
                  <option value="Grade 12">Grade 12 / High School Senior</option>
                </select>
              </div>
            )}

            {/* Conditional fields for College students */}
            {formData.educationLevel === 'college' && (
              <div className="p-3.5 rounded-2xl bg-[#BCE9D5]/20 border border-[#BCE9D5]/50 space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                    College / University Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    placeholder="e.g. State University"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                    style={{
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                      color: theme.textPrimary,
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                      Course / Major *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.collegeCourse}
                      onChange={(e) => setFormData({ ...formData, collegeCourse: e.target.value })}
                      placeholder="Computer Science"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none"
                      style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.textPrimary,
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                      Year
                    </label>
                    <select
                      value={formData.collegeYear}
                      onChange={(e) => setFormData({ ...formData, collegeYear: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none"
                      style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.textPrimary,
                      }}
                    >
                      <option value="">Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                      Semester
                    </label>
                    <select
                      value={formData.collegeSemester}
                      onChange={(e) => setFormData({ ...formData, collegeSemester: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none"
                      style={{
                        backgroundColor: theme.inputBg,
                        borderColor: theme.inputBorder,
                        color: theme.textPrimary,
                      }}
                    >
                      <option value="">Sem</option>
                      <option value="Sem 1">Sem 1</option>
                      <option value="Sem 2">Sem 2</option>
                      <option value="Sem 3">Sem 3</option>
                      <option value="Sem 4">Sem 4</option>
                      <option value="Sem 5">Sem 5</option>
                      <option value="Sem 6">Sem 6</option>
                      <option value="Sem 7">Sem 7</option>
                      <option value="Sem 8">Sem 8</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Email and Mobile Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="maya@student.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g. +1 234 567 8900"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: '#DCD1FA',
                  color: '#302747',
                }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Proceed to OTP Verification</span>}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs">
              A verification code was sent to <strong>{formData.mobile || formData.email}</strong>.
              Enter your verification code below to complete registration.
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: theme.textPrimary }}>
                Enter Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                placeholder="Enter code"
                required
                className="w-full text-center tracking-widest text-lg font-mono px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
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
                onClick={() => setStep('profile')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80"
                style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
              >
                Edit Details
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Complete Registration</span>}
              </button>
            </div>
          </form>
        )}

        {/* Footer info: switch to login */}
        <div className="mt-6 pt-4 border-t text-center text-xs" style={{ borderColor: theme.surfaceBorder }}>
          <span style={{ color: theme.textSecondary }}>Already have an account? </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="font-bold underline cursor-pointer"
            style={{ color: '#8E74DB' }}
          >
            Log in instead
          </button>
        </div>
      </div>
    </div>
  );
};
