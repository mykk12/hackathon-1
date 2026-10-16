import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareQuote,
  X,
  Send,
  CheckCircle2,
  Star,
  Sparkles,
  Maximize2,
  ThumbsUp,
  User,
  Clock,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';

interface UserReview {
  id: string;
  name: string;
  avatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
  isNew?: boolean;
}

const INITIAL_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    name: 'Priya Sundaram',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face&auto=format&q=80',
    rating: 5,
    comment: 'The Data Structures cheat sheet saved my midterm exam! Clean diagrams and intuitive explanations. Definitely 5/5 stars.',
    date: '2 hours ago',
    verified: true,
    helpfulCount: 18,
  },
  {
    id: 'rev-2',
    name: 'Liam Davies',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face&auto=format&q=80',
    rating: 5,
    comment: 'Best study notes archive from buddies I have used this semester. Uploading notes was super fast and didn’t require annoying paywalls.',
    date: 'Yesterday',
    verified: true,
    helpfulCount: 12,
  },
  {
    id: 'rev-3',
    name: 'Ananya Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face&auto=format&q=80',
    rating: 4,
    comment: 'Very clean UI and the grayscale slider is a lifesaver for late night study sessions. Would love more Biology PPT slides!',
    date: '3 days ago',
    verified: true,
    helpfulCount: 9,
  },
  {
    id: 'rev-4',
    name: 'Jordan Mitchell',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face&auto=format&q=80',
    rating: 5,
    comment: 'Linear Algebra notes are top tier. Recommended this site to our entire study group.',
    date: '5 days ago',
    verified: true,
    helpfulCount: 7,
  },
];

interface FloatingFeedbackWidgetProps {
  theme: ThemeColors;
  currentUser?: string | null;
  onOpenFullPage?: () => void;
}

export const FloatingFeedbackWidget: React.FC<FloatingFeedbackWidgetProps> = ({
  theme,
  currentUser,
  onOpenFullPage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState(() => {
    if (currentUser) {
      return currentUser.split('@')[0].replace('.', ' ');
    }
    return '';
  });
  const [reviewComment, setReviewComment] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);
  const [helpfulVotedIds, setHelpfulVotedIds] = useState<string[]>([]);

  // Persistent user reviews
  const [reviews, setReviews] = useState<UserReview[]>(() => {
    try {
      const saved = localStorage.getItem('student_platform_reviews');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore JSON errors
    }
    return INITIAL_REVIEWS;
  });

  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const author = reviewName.trim() || (currentUser ? currentUser.split('@')[0] : 'Verified Student');
    const newReview: UserReview = {
      id: `rev-${Date.now()}`,
      name: author,
      rating,
      comment: reviewComment.trim(),
      date: 'Just now',
      verified: true,
      helpfulCount: 0,
      isNew: true,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem('student_platform_reviews', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSubmittedMessage(true);
    setReviewComment('');
    setRating(0);
    setTimeout(() => {
      setSubmittedMessage(false);
    }, 3500);
  };

  const handleToggleHelpful = (id: string) => {
    if (helpfulVotedIds.includes(id)) {
      setHelpfulVotedIds((prev) => prev.filter((i) => i !== id));
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, helpfulCount: Math.max(0, r.helpfulCount - 1) } : r))
      );
    } else {
      setHelpfulVotedIds((prev) => [...prev, id]);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
      );
    }
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return '5 / 5 · Outstanding ⭐';
      case 4:
        return '4 / 5 · Very Good 👍';
      case 3:
        return '3 / 5 · Good 🙂';
      case 2:
        return '2 / 5 · Fair ⚠️';
      case 1:
        return '1 / 5 · Needs Work';
      default:
        return '0 / 5 · Select stars';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Popup Card (anchored directly above button) */}
      {isOpen && (
        <div
          ref={cardRef}
          role="dialog"
          aria-labelledby="feedback-widget-title"
          className="mb-3 w-[calc(100vw-2rem)] sm:w-[410px] max-w-[430px] rounded-3xl p-5 sm:p-5.5 backdrop-blur-2xl shadow-2xl border transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 max-h-[85vh] flex flex-col"
          style={{
            backgroundColor: theme.isDark ? 'rgba(28, 24, 40, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(24px) saturate(190%)',
            WebkitBackdropFilter: 'blur(24px) saturate(190%)',
            boxShadow: theme.isDark
              ? '0 20px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(220, 209, 250, 0.15)'
              : '0 20px 40px -10px rgba(48, 39, 71, 0.18), inset 0 1px 2px 0 rgba(255, 255, 255, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b shrink-0" style={{ borderColor: theme.surfaceBorder }}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs"
                style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
              >
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h3 id="feedback-widget-title" className="font-extrabold text-sm flex items-center gap-1.5" style={{ color: theme.textPrimary }}>
                  <span>Reviews & Ratings</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300">
                    4.9 ★
                  </span>
                </h3>
                <p className="text-[10px] font-medium" style={{ color: theme.textMuted }}>
                  Community feedback & buddy reviews
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onOpenFullPage && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullPage();
                  }}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  style={{ color: theme.textSecondary }}
                  title="Open full page view"
                  aria-label="Open full page view"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                style={{ color: theme.textSecondary }}
                aria-label="Close reviews widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Container for Review Form & User Comments */}
          <div className="overflow-y-auto pr-1 space-y-4 custom-scrollbar text-left">
            {/* 1. Review Option: Star rating out of 5 & submit comment */}
            <div
              className="p-3.5 rounded-2xl border transition-all"
              style={{
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.65)',
                borderColor: theme.surfaceBorder,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black" style={{ color: theme.textPrimary }}>
                  Leave a Review
                </span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>

              {/* Stars out of 5 selector */}
              <div className="flex items-center gap-1.5 mb-2.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Review Input Form */}
              <form onSubmit={handleSubmitReview} className="space-y-2">
                <div>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB] transition-all"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F8FD',
                      border: `1px solid ${theme.surfaceBorder}`,
                      color: theme.textPrimary,
                    }}
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review or comment about notes & resources..."
                    className="w-full text-xs p-2.5 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#8E74DB] transition-all"
                    style={{
                      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9F8FD',
                      border: `1px solid ${theme.surfaceBorder}`,
                      color: theme.textPrimary,
                    }}
                  />
                </div>

                {submittedMessage && (
                  <div className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Review posted to community feed!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
                  style={{
                    backgroundColor: '#302747',
                    color: '#FFF9F0',
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review ({rating}/5 Stars)</span>
                </button>
              </form>
            </div>

            {/* 2. Below: Comments of users like on real-world websites */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-extrabold" style={{ color: theme.textPrimary }}>
                    User Comments & Reviews
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300">
                    {reviews.length}
                  </span>
                </div>
                <span className="text-[10px] font-medium" style={{ color: theme.textMuted }}>
                  Most Recent
                </span>
              </div>

              {/* List of user comments */}
              <div className="space-y-2.5">
                {reviews.map((rev) => {
                  const hasVoted = helpfulVotedIds.includes(rev.id);
                  return (
                    <div
                      key={rev.id}
                      className="p-3 rounded-2xl border transition-all text-left"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
                        borderColor: rev.isNew ? '#8E74DB' : theme.surfaceBorder,
                      }}
                    >
                      {/* User Header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {rev.avatar ? (
                            <img
                              src={rev.avatar}
                              alt={rev.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-purple-300/50"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 flex items-center justify-center font-bold text-[10px]">
                              {rev.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-extrabold truncate max-w-[120px]" style={{ color: theme.textPrimary }}>
                                {rev.name}
                              </span>
                              {rev.verified && (
                                <span className="inline-flex items-center text-[9px] font-bold text-emerald-600 dark:text-emerald-400 gap-0.5">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  <span>Verified</span>
                                </span>
                              )}
                              {rev.isNew && (
                                <span className="bg-purple-500 text-white text-[8px] font-black px-1 rounded-sm uppercase">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stars for this review */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment Body */}
                      <p className="text-xs leading-relaxed mb-2" style={{ color: theme.textSecondary }}>
                        {rev.comment}
                      </p>

                      {/* Comment Footer: Time & Helpful upvote */}
                      <div className="flex items-center justify-between pt-1 border-t text-[10px]" style={{ borderColor: theme.surfaceBorder }}>
                        <span className="flex items-center gap-1" style={{ color: theme.textMuted }}>
                          <Clock className="w-2.5 h-2.5" />
                          <span>{rev.date}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleHelpful(rev.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                            hasVoted
                              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300'
                              : 'hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                          style={{ color: hasVoted ? undefined : theme.textMuted }}
                          title="Mark review as helpful"
                        >
                          <ThumbsUp className={`w-2.5 h-2.5 ${hasVoted ? 'fill-current' : ''}`} />
                          <span>{rev.helpfulCount > 0 ? `Helpful (${rev.helpfulCount})` : 'Helpful'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button - Glass Style matching AI button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Student Feedback and Reviews"
        title="Student Reviews & Feedback"
        className="group relative flex items-center justify-center w-14 h-14 rounded-2xl shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer focus:outline-hidden hover:shadow-[0_12px_36px_-2px_rgba(142,116,219,0.5),0_0_24px_4px_rgba(220,209,250,0.4)]"
        style={{
          background: theme.isDark
            ? 'linear-gradient(135deg, rgba(32, 26, 48, 0.55) 0%, rgba(48, 39, 71, 0.45) 50%, rgba(20, 16, 30, 0.65) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(245, 240, 255, 0.6) 50%, rgba(255, 255, 255, 0.5) 100%)',
          color: theme.isDark ? '#FFF9F0' : '#302747',
          backdropFilter: 'blur(20px) saturate(190%)',
          WebkitBackdropFilter: 'blur(20px) saturate(190%)',
          border: theme.isDark
            ? '2px solid rgba(220, 209, 250, 0.45)'
            : '2px solid rgba(255, 255, 255, 0.85)',
          boxShadow: theme.isDark
            ? '0 10px 30px -4px rgba(0, 0, 0, 0.6), 0 0 20px 2px rgba(142, 116, 219, 0.3), inset 0 1px 2px 0 rgba(255, 255, 255, 0.25)'
            : '0 10px 30px -4px rgba(48, 39, 71, 0.16), 0 0 20px 2px rgba(220, 209, 250, 0.35), inset 0 1px 2px 0 rgba(255, 255, 255, 0.95), 0 0 0 1px rgba(48, 39, 71, 0.08)',
        }}
      >
        {/* Luminous background pulse on hover */}
        <span className="absolute inset-0 rounded-2xl bg-purple-400/15 group-hover:bg-purple-400/25 transition-colors animate-pulse" />

        {/* Feedback Icon matching AI button scale */}
        <div className="relative z-10 transition-transform duration-300 group-hover:rotate-12">
          {isOpen ? (
            <X
              className="w-6 h-6 transition-colors duration-200"
              style={{ color: theme.isDark ? '#F7F5FC' : '#302747' }}
            />
          ) : (
            <MessageSquareQuote
              className="w-6 h-6 transition-colors duration-200"
              style={{ color: theme.isDark ? '#F7F5FC' : '#302747' }}
            />
          )}
        </div>

        {/* Live Notification Indicator Dot matching AI button */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-[#302747]" />
        </span>
      </button>
    </div>
  );
};
