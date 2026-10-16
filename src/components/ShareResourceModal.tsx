import React, { useState } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';
import type { SubjectType, ResourceFormat, AcademicResource } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface ShareResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource: (resource: AcademicResource) => void;
  theme: ThemeColors;
}

export const ShareResourceModal: React.FC<ShareResourceModalProps> = ({
  isOpen,
  onClose,
  onAddResource,
  theme,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectType>('Computer Science');
  const [format, setFormat] = useState<ResourceFormat>('Notes');
  const [author, setAuthor] = useState('');
  const [topics, setTopics] = useState('');
  const [summary, setSummary] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    const newResource: AcademicResource = {
      id: `user-res-${Date.now()}`,
      title: title.trim(),
      subject,
      format,
      author: author.trim() || 'Anonymous Student Peer',
      readsCount: 1,
      rating: 5.0,
      pages: 12,
      summary: summary.trim(),
      topics: topics
        ? topics.split(',').map((t) => t.trim()).filter(Boolean)
        : ['Revision Deck', 'Peer Notes'],
      isPublic: true,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    onAddResource(newResource);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset
      setTitle('');
      setTopics('');
      setSummary('');
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative"
        style={{
          backgroundColor: theme.isDark ? 'rgba(28, 24, 40, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          border: `1px solid ${theme.surfaceBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close share dialog"
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          style={{ color: theme.textSecondary }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg mb-3 shadow-xs"
            style={{
              backgroundColor: '#FFD1B8',
              color: '#662E1B',
            }}
          >
            <Upload className="w-5 h-5" />
          </div>
          <h2
            id="share-title"
            className="text-2xl font-black tracking-tight"
            style={{ color: theme.textPrimary }}
          >
            Share with Fellow Students
          </h2>
          <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: theme.textSecondary }}>
            Upload or submit summaries, lecture notes, or revision decks to the public library.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
              Resource Submitted Successfully!
            </h3>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              Your revision material is now accessible to peers across StudySpace.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                Resource Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Organic Chemistry Reaction Pathways"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  Subject *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectType)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  Format *
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ResourceFormat)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                >
                  <option value="Notes">Notes</option>
                  <option value="PDF">PDF Sheet</option>
                  <option value="Slides">Lecture Slides</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                  Author Name / Handle
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Jordan K."
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
                  Key Topics (comma separated)
                </label>
                <input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="Aldehydes, Ketones, Mechanisms"
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none"
                  style={{
                    backgroundColor: theme.inputBg,
                    borderColor: theme.inputBorder,
                    color: theme.textPrimary,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1" style={{ color: theme.textPrimary }}>
                Short Summary / Key Formula Highlights *
              </label>
              <textarea
                required
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary explaining what concepts are covered and how it helps students..."
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-[#DCD1FA]"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                }}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80"
                style={{ borderColor: theme.surfaceBorder, color: theme.textSecondary }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer hover:opacity-90"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                Publish to Community
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
