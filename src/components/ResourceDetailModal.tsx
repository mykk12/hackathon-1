import React, { useState, useEffect } from 'react';
import {
  X,
  Bookmark,
  Download,
  Star,
  Check,
  BookOpen,
  ThumbsUp,
  Send,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  User,
  ShieldCheck,
  Lock,
  Globe,
  Loader2,
} from 'lucide-react';
import type { AcademicResource } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
);

interface ResourceReview {
  id: string;
  name: string;
  avatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verified: boolean;
  isGoogleVerified?: boolean;
  helpfulCount: number;
  userVoted?: boolean;
}

interface ResourceDetailModalProps {
  resource: AcademicResource | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  theme: ThemeColors;
  currentUser?: string | null;
  onLoginSuccess?: (email: string) => void;
  onOpenLoginModal?: () => void;
}

const DEFAULT_REVIEWS: ResourceReview[] = [];

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
  isBookmarked,
  onToggleBookmark,
  theme,
  currentUser,
  onLoginSuccess,
  onOpenLoginModal,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  // Rating & Review State (default rating stars: 0)
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [reviews, setReviews] = useState<ResourceReview[]>(DEFAULT_REVIEWS);

  // Google Sign-In State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleStatusMsg, setGoogleStatusMsg] = useState<string | null>(null);

  // Initialize reviews and reviewer name when resource opens
  useEffect(() => {
    if (!resource) return;

    if (currentUser) {
      const formattedName = currentUser.split('@')[0].replace(/[._]/g, ' ');
      setReviewerName(formattedName.charAt(0).toUpperCase() + formattedName.slice(1));
    } else {
      setReviewerName('');
    }

    // Load persisted reviews for this specific resource
    try {
      const storageKey = `studyspace_resource_reviews_${resource.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviews(parsed);
          return;
        }
      }
    } catch {
      // fallback
    }

    setReviews(DEFAULT_REVIEWS);
    setRating(0);
    setReviewComment('');
    setSubmittedSuccess(false);
  }, [resource?.id, currentUser]);

  if (!resource) return null;

  // Handle Google Sign In
  const handleGoogleSignIn = (customEmail?: string) => {
    setIsGoogleLoading(true);
    setGoogleStatusMsg(null);
    setTimeout(() => {
      const emailToUse = customEmail || (currentUser && currentUser.includes('@') ? currentUser : 'amanbamil.30@gmail.com');
      const formattedName = emailToUse.split('@')[0].replace(/[._]/g, ' ');
      const capitalized = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);

      setReviewerName(capitalized);
      if (onLoginSuccess) {
        onLoginSuccess(emailToUse);
      }
      setIsGoogleLoading(false);
      setGoogleStatusMsg(`Connected via Google (${emailToUse})`);
      setTimeout(() => setGoogleStatusMsg(null), 3500);
    }, 600);
  };

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleRatingHover = (star: number) => {
    setHoverRating(star);
  };

  const handleRatingLeave = () => {
    setHoverRating(0);
  };

  const handleSelectRating = (star: number) => {
    setRating(star);
  };

  // Submit a new review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const isGoogleAuth = Boolean(currentUser && (currentUser.includes('@gmail.com') || currentUser.includes('@university.edu') || currentUser.includes('@')));
    const newReview: ResourceReview = {
      id: `rev-${Date.now()}`,
      name: reviewerName.trim() || (currentUser ? currentUser.split('@')[0] : 'Student Buddy'),
      rating: rating > 0 ? rating : 5,
      comment: reviewComment.trim(),
      date: 'Just now',
      verified: true,
      isGoogleVerified: isGoogleAuth,
      helpfulCount: 0,
      userVoted: false,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);

    try {
      localStorage.setItem(`studyspace_resource_reviews_${resource.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    setReviewComment('');
    setRating(0);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 3500);
  };

  // Upvote review helpfulness
  const handleToggleHelpful = (reviewId: string) => {
    setReviews((prev) => {
      const next = prev.map((rev) => {
        if (rev.id === reviewId) {
          const isVoted = rev.userVoted;
          return {
            ...rev,
            helpfulCount: isVoted ? Math.max(0, rev.helpfulCount - 1) : rev.helpfulCount + 1,
            userVoted: !isVoted,
          };
        }
        return rev;
      });

      try {
        localStorage.setItem(`studyspace_resource_reviews_${resource.id}`, JSON.stringify(next));
      } catch {
        // ignore
      }

      return next;
    });
  };

  // Calculate dynamic average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : (resource.rating || 5.0).toFixed(1);

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return '5 / 5 · Outstanding ⭐';
      case 4:
        return '4 / 5 · Very Good 👍';
      case 3:
        return '3 / 5 · Good 🙂';
      case 2:
        return '2 / 5 · Needs Improvement ⚠️';
      case 1:
        return '1 / 5 · Poor ⚠️';
      default:
        return '0 / 5 · Click stars to rate';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto"
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
          aria-label="Close resource modal"
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          style={{ color: theme.textSecondary }}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{
              backgroundColor: '#DCD1FA',
              color: '#302747',
            }}
          >
            {resource.subject}
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(48, 39, 71, 0.08)',
              color: theme.textPrimary,
            }}
          >
            {resource.format}
          </span>
          {resource.isPublic ? (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                color: theme.isDark ? '#D8B4FE' : '#6B21A8',
                borderColor: 'rgba(168, 85, 247, 0.3)',
              }}
            >
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </span>
          ) : (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: theme.isDark ? '#6EE7B7' : '#047857',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <Lock className="w-3 h-3" />
              <span>Private File</span>
            </span>
          )}
          <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
            Added {resource.dateAdded}
          </span>
        </div>

        {/* Title */}
        <h2
          id="resource-modal-title"
          className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug mb-3"
          style={{ color: theme.textPrimary }}
        >
          {resource.title}
        </h2>

        {/* Author & Metrics */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium pb-4 mb-4 border-b" style={{ borderColor: theme.surfaceBorder }}>
          <div className="flex items-center gap-1.5" style={{ color: theme.textSecondary }}>
            <span className="font-bold" style={{ color: theme.textPrimary }}>Curated by:</span>
            <span>{resource.author}</span>
            {resource.institution && <span className="opacity-75">({resource.institution})</span>}
          </div>
          {resource.isPublic && (
            <div className="flex items-center gap-1" style={{ color: '#F59E0B' }}>
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="font-bold">{avgRating}</span>
              <span className="text-[11px] opacity-75">({reviews.length} buddy reviews)</span>
            </div>
          )}
          {resource.pages && (
            <span style={{ color: theme.textMuted }}>{resource.pages} document pages</span>
          )}
        </div>

        {/* Demonstration Note */}
        <div
          className="p-3.5 rounded-2xl text-xs mb-5 flex items-start gap-2.5"
          style={{
            backgroundColor: theme.isDark ? 'rgba(246, 235, 196, 0.12)' : '#FFF9F0',
            border: `1px solid ${theme.surfaceBorder}`,
            color: theme.isDark ? '#FEF3C7' : '#57410D',
          }}
        >
          <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <strong>Demonstration Resource:</strong> StudySpace provides buddy-verified study structures and curated cheat sheets.
            You can bookmark this item into your local revision deck or export the syllabus roadmap.
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.textMuted }}>
            Overview & Key Takeaways
          </h3>
          <p className="text-sm font-medium leading-relaxed" style={{ color: theme.textSecondary }}>
            {resource.summary}
          </p>
        </div>

        {/* Core Topics Covered */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: theme.textMuted }}>
            Core Syllabus Concepts
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.topics.map((topic, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(48, 39, 71, 0.06)',
                  color: theme.textPrimary,
                  border: `1px solid ${theme.surfaceBorder}`,
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Actions bar placed over the rating section */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border mb-8 backdrop-blur-sm shadow-xs"
          style={{
            backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(48, 39, 71, 0.03)',
            borderColor: theme.surfaceBorder,
          }}
        >
          <button
            type="button"
            onClick={() => onToggleBookmark(resource.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              isBookmarked ? 'bg-[#F6EBC4] text-[#57410D]' : 'border'
            }`}
            style={{
              borderColor: theme.surfaceBorder,
              color: isBookmarked ? '#57410D' : theme.textPrimary,
            }}
          >
            <Bookmark className="w-4 h-4" fill={isBookmarked ? '#57410D' : 'none'} />
            <span>{isBookmarked ? 'Saved to Your Library' : 'Save to Study List'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#302747',
                color: '#FFF9F0',
              }}
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Downloaded Note Sheet</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-purple-300" />
                  <span>Download {resource.format}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* RATING AND REVIEW SECTION (Only active for Public resources) */}
        {/* ------------------------------------------------------------- */}
        {resource.isPublic && (
          <div className="mt-4 pt-6 border-t" style={{ borderColor: theme.surfaceBorder }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs"
                style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
                  Rating & Buddy Reviews
                </h3>
                <p className="text-xs font-medium" style={{ color: theme.textMuted }}>
                  Rate this study resource and share feedback with fellow students
                </p>
              </div>
            </div>

            {/* Score Pill */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border backdrop-blur-sm"
              style={{
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFDF9',
                borderColor: theme.surfaceBorder,
              }}
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span className="font-black text-sm" style={{ color: theme.textPrimary }}>
                {avgRating}
              </span>
              <span className="text-[11px] font-semibold opacity-70" style={{ color: theme.textMuted }}>
                / 5.0
              </span>
            </div>
          </div>

          {/* Google Sign In Component for Rating & Reviews */}
          {googleStatusMsg && (
            <div className="mb-3.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-bold">{googleStatusMsg}</span>
            </div>
          )}

          {currentUser ? (
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 px-4 rounded-2xl border mb-4 text-xs transition-all backdrop-blur-sm"
              style={{
                backgroundColor: theme.isDark ? 'rgba(66, 133, 244, 0.08)' : 'rgba(66, 133, 244, 0.05)',
                borderColor: 'rgba(66, 133, 244, 0.25)',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-white shadow-xs border border-blue-100 flex items-center justify-center shrink-0">
                  <GoogleIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold truncate" style={{ color: theme.textPrimary }}>
                      Signed in with Google
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Student</span>
                    </span>
                  </div>
                  <div className="text-[11px] truncate opacity-80" style={{ color: theme.textMuted }}>
                    {currentUser}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={isGoogleLoading}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0 self-start sm:self-auto flex items-center gap-1"
              >
                {isGoogleLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                <span>Switch Google Account</span>
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl border mb-4 backdrop-blur-sm transition-all"
              style={{
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
                borderColor: theme.surfaceBorder,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white shadow-xs border border-black/10 flex items-center justify-center shrink-0">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: theme.textPrimary }}>
                    Sign in with Google
                  </div>
                  <div className="text-[11px] font-medium" style={{ color: theme.textMuted }}>
                    Sign in with your Google student account to rate this resource and submit verified reviews.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={isGoogleLoading}
                className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs border transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 shrink-0"
                style={{
                  borderColor: theme.surfaceBorder,
                  color: theme.textPrimary,
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
                }}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                ) : (
                  <GoogleIcon className="w-4 h-4" />
                )}
                <span>{isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}

          {/* Review Submission Form Card */}
          <form
            onSubmit={handleSubmitReview}
            className="p-4 sm:p-5 rounded-3xl border mb-6 transition-all"
            style={{
              backgroundColor: theme.isDark ? 'rgba(20, 16, 30, 0.55)' : 'rgba(249, 248, 253, 0.85)',
              borderColor: theme.surfaceBorder,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider block mb-1" style={{ color: theme.textMuted }}>
                  Your Rating
                </span>
                {/* 5-Star Interactive Rating Selector */}
                <div className="flex items-center gap-1.5" onMouseLeave={handleRatingLeave}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || rating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleSelectRating(star)}
                        onMouseEnter={() => handleRatingHover(star)}
                        className="p-1 rounded-lg transition-transform hover:scale-120 cursor-pointer focus:outline-hidden"
                        aria-label={`Rate ${star} stars`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors duration-150 ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating Description Label */}
              <div
                className="text-xs font-bold px-3 py-1.5 rounded-xl border self-start sm:self-auto"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                  borderColor: theme.surfaceBorder,
                  color: theme.isDark ? '#FDE68A' : '#92400E',
                }}
              >
                {getRatingLabel(hoverRating || rating)}
              </div>
            </div>

            {/* Reviewer Name */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="reviewer-name-input" className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>
                  Your Name / Student Alias
                </label>
                {currentUser ? (
                  <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 inline-flex items-center gap-1">
                    <GoogleIcon className="w-3 h-3" />
                    <span>Linked to Google Account</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn()}
                    className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <GoogleIcon className="w-3 h-3" />
                    <span>Sign in with Google</span>
                  </button>
                )}
              </div>
              <input
                id="reviewer-name-input"
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Maya Sharma (Computer Science II)"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#8E74DB] transition-all"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#FFFFFF',
                  borderColor: theme.surfaceBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>

            {/* Review Comment Textarea */}
            <div className="mb-3">
              <label htmlFor="review-comment-textarea" className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: theme.textMuted }}>
                Write Your Review & Feedback
              </label>
              <textarea
                id="review-comment-textarea"
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts on this study deck (e.g. exam relevance, clarity, topics covered)..."
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-[#8E74DB] transition-all resize-none leading-relaxed"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#FFFFFF',
                  borderColor: theme.surfaceBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>

            {/* Submit Button & Confirmation */}
            <div className="flex items-center justify-between gap-3">
              {submittedSuccess ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Review published successfully!</span>
                </div>
              ) : (
                <span className="text-[11px] font-medium opacity-70" style={{ color: theme.textMuted }}>
                  Reviews help buddies discover top-tier study notes.
                </span>
              )}

              <button
                type="submit"
                disabled={!reviewComment.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: '#302747',
                  color: '#FFF9F0',
                }}
              >
                <Send className="w-3.5 h-3.5 text-purple-300" />
                <span>Post Review</span>
              </button>
            </div>
          </form>

          {/* ------------------------------------------------------------- */}
          {/* REVIEWS OF OTHER USERS */}
          {/* ------------------------------------------------------------- */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.textMuted }}>
                <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                <span>Reviews from Other Students ({reviews.length})</span>
              </h4>
              <span className="text-[11px] font-semibold" style={{ color: theme.textMuted }}>
                Verified buddy feedback
              </span>
            </div>

            {reviews.length === 0 ? (
              <div
                className="p-6 text-center rounded-2xl border text-xs"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(48, 39, 71, 0.02)',
                  borderColor: theme.surfaceBorder,
                  color: theme.textMuted,
                }}
              >
                Be the first to leave a review for this resource!
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 sm:p-4 rounded-2xl border backdrop-blur-sm transition-all duration-200 hover:shadow-sm"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(28, 22, 42, 0.55)' : 'rgba(255, 255, 255, 0.75)',
                      borderColor: theme.surfaceBorder,
                    }}
                  >
                    {/* Review Header: User Info & Rating */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        {rev.avatar ? (
                          <img
                            src={rev.avatar}
                            alt={rev.name}
                            className="w-8 h-8 rounded-full object-cover border shrink-0"
                            style={{ borderColor: theme.surfaceBorder }}
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                            style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
                          >
                            {rev.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs" style={{ color: theme.textPrimary }}>
                              {rev.name}
                            </span>
                            {rev.isGoogleVerified && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                title="Verified Google Student"
                              >
                                <GoogleIcon className="w-2.5 h-2.5" />
                                <span>Google Verified</span>
                              </span>
                            )}
                            {rev.verified && !rev.isGoogleVerified && (
                              <span
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25"
                                title="Verified student learner"
                              >
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>Verified</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-medium opacity-65" style={{ color: theme.textMuted }}>
                            {rev.date}
                          </span>
                        </div>
                      </div>

                      {/* Review Star Rating */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Comment Body */}
                    <p className="text-xs font-medium leading-relaxed mb-2.5" style={{ color: theme.textSecondary }}>
                      {rev.comment}
                    </p>

                    {/* Review Footer / Helpful Upvote */}
                    <div className="flex items-center justify-between pt-2 border-t text-[11px]" style={{ borderColor: theme.surfaceBorder }}>
                      <button
                        type="button"
                        onClick={() => handleToggleHelpful(rev.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                          rev.userVoted
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-75 hover:opacity-100'
                        }`}
                        style={{ color: rev.userVoted ? undefined : theme.textMuted }}
                        title="Mark review as helpful"
                      >
                        <ThumbsUp className={`w-3 h-3 ${rev.userVoted ? 'fill-current' : ''}`} />
                        <span>{rev.helpfulCount > 0 ? `Helpful (${rev.helpfulCount})` : 'Helpful'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-end pt-5 mt-6 border-t" style={{ borderColor: theme.surfaceBorder }}>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            style={{
              borderColor: theme.surfaceBorder,
              color: theme.textPrimary,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
