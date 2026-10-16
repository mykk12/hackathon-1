import React, { useState } from 'react';
import { MessageSquareQuote, Send, CheckCircle2, Star, Sparkles, ArrowLeft } from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';

interface FeedbackViewProps {
  theme: ThemeColors;
  onGoToHome: () => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ theme, onGoToHome }) => {
  const [category, setCategory] = useState<'subject-request' | 'resource-quality' | 'platform-suggestion' | 'general'>('subject-request');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText('');
      setContactEmail('');
    }, 3000);
  };

  return (
    <div className="py-6 sm:py-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8E74DB' }}>
            <span>Community Voice</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
            Student Feedback
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: theme.textSecondary }}>
            Tell us which academic subjects, formula sheets, or platform features you'd like added.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToHome}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80 self-start"
          style={{ borderColor: theme.surfaceBorder, color: theme.textPrimary }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
      </div>

      <div
        className="p-6 sm:p-10 rounded-3xl backdrop-blur-xl shadow-lg relative"
        style={{
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.surfaceBorder}`,
        }}
      >
        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
              Thank You for Your Feedback!
            </h2>
            <p className="text-xs sm:text-sm max-w-md mx-auto" style={{ color: theme.textSecondary }}>
              Your suggestion has been logged for our student academic review board.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Topic Category */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: theme.textPrimary }}>
                Feedback Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'subject-request', label: 'Request Subject' },
                  { id: 'resource-quality', label: 'Resource Notes' },
                  { id: 'platform-suggestion', label: 'Feature Idea' },
                  { id: 'general', label: 'General Review' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      category === cat.id ? 'ring-2 ring-[#8E74DB]' : 'opacity-70'
                    }`}
                    style={{
                      backgroundColor: category === cat.id
                        ? (theme.isDark ? 'rgba(220, 209, 250, 0.25)' : '#DCD1FA')
                        : 'transparent',
                      borderColor: theme.surfaceBorder,
                      color: theme.textPrimary,
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Rating */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: theme.textPrimary }}>
                How has StudySpace helped your revision?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold ml-2" style={{ color: theme.textMuted }}>
                  {rating === 5 ? 'Exceptional' : rating >= 4 ? 'Very Helpful' : 'Helpful'}
                </span>
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                Your Feedback or Course Suggestion *
              </label>
              <textarea
                required
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Suggest topics, note format improvements, or study planner features..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>

            {/* Student Email */}
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                Student Email (Optional, if you'd like updates)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your.name@student.edu"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-90"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                <Send className="w-4 h-4" />
                <span>Submit Student Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
