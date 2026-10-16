import React, { useState } from 'react';
import { FolderKanban, Trash2, Eye, Filter, Bookmark, Plus } from 'lucide-react';
import type { AcademicResource } from '../types/index.ts';
import { ThemeColors } from '../utils/theme.ts';

interface ManageViewProps {
  theme: ThemeColors;
  resources: AcademicResource[];
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onOpenResource: (resource: AcademicResource) => void;
  onOpenShareModal: () => void;
  onGoToHome: () => void;
}

export const ManageView: React.FC<ManageViewProps> = ({
  theme,
  resources,
  bookmarks,
  onToggleBookmark,
  onOpenResource,
  onOpenShareModal,
  onGoToHome,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'saved' | 'my-contributions'>('saved');

  const savedList = resources.filter((r) => bookmarks.includes(r.id));
  const contributedList = resources.filter((r) => r.id.startsWith('user-res-'));

  const displayedList =
    filterType === 'saved'
      ? savedList
      : filterType === 'my-contributions'
      ? contributedList
      : resources;

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8E74DB' }}>
            <span>Materials Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: theme.textPrimary }}>
            Manage Materials
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: theme.textSecondary }}>
            Review your bookmarked study collections and shared community contributions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:opacity-90"
            style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Material</span>
          </button>
          <button
            type="button"
            onClick={onGoToHome}
            className="px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer hover:opacity-80"
            style={{ borderColor: theme.surfaceBorder, color: theme.textPrimary }}
          >
            ← Home
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilterType('saved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterType === 'saved' ? 'shadow-sm' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: filterType === 'saved' ? '#DCD1FA' : 'transparent',
            color: filterType === 'saved' ? '#302747' : theme.textSecondary,
            border: `1px solid ${filterType === 'saved' ? 'transparent' : theme.surfaceBorder}`,
          }}
        >
          Bookmarked Items ({savedList.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('my-contributions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterType === 'my-contributions' ? 'shadow-sm' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: filterType === 'my-contributions' ? '#DCD1FA' : 'transparent',
            color: filterType === 'my-contributions' ? '#302747' : theme.textSecondary,
            border: `1px solid ${filterType === 'my-contributions' ? 'transparent' : theme.surfaceBorder}`,
          }}
        >
          My Uploaded Decks ({contributedList.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterType === 'all' ? 'shadow-sm' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: filterType === 'all' ? '#DCD1FA' : 'transparent',
            color: filterType === 'all' ? '#302747' : theme.textSecondary,
            border: `1px solid ${filterType === 'all' ? 'transparent' : theme.surfaceBorder}`,
          }}
        >
          All Library Resources ({resources.length})
        </button>
      </div>

      {/* Materials Table/Cards */}
      {displayedList.length === 0 ? (
        <div
          className="p-12 text-center rounded-3xl backdrop-blur-md"
          style={{
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.surfaceBorder}`,
          }}
        >
          <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-40 text-purple-400" />
          <h3 className="font-bold text-base" style={{ color: theme.textPrimary }}>
            No items in this collection
          </h3>
          <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: theme.textSecondary }}>
            Save resources from the homepage or upload new summary notes for your study group.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedList.map((res) => {
            const isSaved = bookmarks.includes(res.id);
            return (
              <div
                key={res.id}
                className="p-5 rounded-3xl backdrop-blur-md flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xs"
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.surfaceBorder}`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#DCD1FA] text-[#302747] text-[11px]">
                      {res.subject}
                    </span>
                    <span className="text-[11px]" style={{ color: theme.textMuted }}>
                      {res.format} · {res.pages ? `${res.pages} pages` : 'Deck'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base mb-1.5" style={{ color: theme.textPrimary }}>
                    {res.title}
                  </h3>

                  <p className="text-xs line-clamp-2 mb-3" style={{ color: theme.textSecondary }}>
                    {res.summary}
                  </p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-xs font-semibold" style={{ borderColor: theme.surfaceBorder }}>
                  <button
                    type="button"
                    onClick={() => onOpenResource(res)}
                    className="flex items-center gap-1.5 hover:underline cursor-pointer"
                    style={{ color: theme.textPrimary }}
                  >
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span>View Detail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleBookmark(res.id)}
                    className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 cursor-pointer"
                    title={isSaved ? 'Remove from bookmarks' : 'Add to bookmarks'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'Unsave' : 'Save'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
