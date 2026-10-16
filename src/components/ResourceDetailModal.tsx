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
} from 'lucide-react';
import type { AcademicResource } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface ResourceReview {
  id: string;
  name: string;
  avatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verified: boolean;
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
}

const DEFAULT_REVIEWS: ResourceReview[] = [
  {
    id: 'rev-seed-1',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face&auto=format&q=80',
    rating: 5,
    comment: 'Super concise and well-structured! The visual diagrams and formulas directly mirrored the questions on our midterm exam.',
    date: '3 days ago',
    verified: true,
    helpfulCount: 14,
  },
  {
    id: 'rev-seed-2',
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&auto=format&q=80',
    rating: 5,
    comment: 'Saved me hours of lecture note transcription. High signal-to-noise ratio, zero fluff, and great algorithmic proofs.',
    date: '1 week ago',
    verified: true,
    helpfulCount: 9,
  },
  {
    id: 'rev-seed-3',
    name: 'Sophia Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face&auto=format&q=80',
    rating: 4,
    comment: 'Very thorough explanations throughout. The core theorem breakdown and derivation steps helped our entire study group.',
    date: '2 weeks ago',
    verified: true,
    helpfulCount: 6,
  },
];

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
  isBookmarked,
  onToggleBookmark,
  theme,
  currentUser,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  // Rating & Review State (default rating stars: 0)
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [reviews, setReviews] = useState<ResourceReview[]>(DEFAULT_REVIEWS);

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

    const newReview: ResourceReview = {
      id: `rev-${Date.now()}`,
      name: reviewerName.trim() || (currentUser ? currentUser.split('@')[0] : 'Student Peer'),
      rating: rating > 0 ? rating : 5,
      comment: reviewComment.trim(),
      date: 'Just now',
      verified: true,
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
              <span className="text-[11px] opacity-75">({reviews.length} peer reviews)</span>
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
            <strong>Demonstration Resource:</strong> StudySpace provides peer-verified study structures and curated cheat sheets.
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
                  Rating & Peer Reviews
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
              <label htmlFor="reviewer-name-input" className="block text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: theme.textMuted }}>
                Your Name / Student Alias
              </label>
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
                  Reviews help peers discover top-tier study notes.
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
                Verified peer feedback
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
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs" style={{ color: theme.textPrimary }}>
                              {rev.name}
                            </span>
                            {rev.verified && (
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
