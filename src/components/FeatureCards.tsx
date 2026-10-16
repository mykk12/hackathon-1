import React from 'react';
import { BookOpen, Calendar, Bookmark, Share2 } from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';

interface FeatureCardsProps {
  theme: ThemeColors;
  savedCount?: number;
  onSelectFeature?: (feature: 'library' | 'planner' | 'saved' | 'share') => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  theme,
  savedCount,
  onSelectFeature,
}) => {
  const cards = [
    {
      id: 'library' as const,
      title: 'Resource Library',
      description: 'Notes, PDFs, presentations, and curated academic reference links.',
      actionLabel: 'Explore Library →',
      icon: BookOpen,
      pastelTranslucent: 'rgba(220, 209, 250, 0.42)', // Soft lavender translucent
      darkTranslucent: 'rgba(220, 209, 250, 0.14)',
      pastelColor: '#DCD1FA',
      borderColor: 'rgba(220, 209, 250, 0.6)',
      textColor: '#302747',
      darkTextColor: '#F7F5FC',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=80',
      delay: '0ms',
    },
    {
      id: 'planner' as const,
      title: 'Study Planner',
      description: 'Organize revision sprints, balance task workloads, and monitor velocity.',
      actionLabel: 'Open Planner →',
      icon: Calendar,
      pastelTranslucent: 'rgba(188, 233, 213, 0.42)', // Mint green translucent
      darkTranslucent: 'rgba(188, 233, 213, 0.14)',
      pastelColor: '#BCE9D5',
      borderColor: 'rgba(188, 233, 213, 0.6)',
      textColor: '#164E3A',
      darkTextColor: '#D1FAE5',
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=700&q=80',
      delay: '150ms',
    },
    {
      id: 'saved' as const,
      title: 'Saved Materials',
      description: savedCount ? `${savedCount} verified revision resources saved in your repository.` : 'Keep verified revision resources organized in a distraction-free repository.',
      actionLabel: 'View Saved Decks →',
      icon: Bookmark,
      pastelTranslucent: 'rgba(246, 235, 196, 0.48)', // Butter yellow translucent
      darkTranslucent: 'rgba(246, 235, 196, 0.14)',
      pastelColor: '#F6EBC4',
      borderColor: 'rgba(246, 235, 196, 0.6)',
      textColor: '#57410D',
      darkTextColor: '#FEF3C7',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=700&q=80',
      delay: '300ms',
    },
    {
      id: 'share' as const,
      title: 'Share with Buddies',
      description: 'Upload study notes, slides, PDFs, and whiteboard photos to exchange with buddies.',
      actionLabel: 'Upload Material (PPT, DOC, PDF, Photo) →',
      icon: Share2,
      pastelTranslucent: 'rgba(255, 209, 184, 0.42)', // Peach translucent
      darkTranslucent: 'rgba(255, 209, 184, 0.14)',
      pastelColor: '#FFD1B8',
      borderColor: 'rgba(255, 209, 184, 0.6)',
      textColor: '#662E1B',
      darkTextColor: '#FFE4E6',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80',
      delay: '450ms',
    },
  ];

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: theme.textPrimary }}
            >
              What would you like to do?
            </h2>
            <p className="text-sm sm:text-base font-medium mt-1" style={{ color: theme.textSecondary }}>
              Click any option below to browse resources, manage schedule, or upload study decks.
            </p>
          </div>
        </div>

        {/* Responsive Grid: Clickable, interactive cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            const cardTextColor = theme.isDark ? card.darkTextColor : card.textColor;

            return (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectFeature?.(card.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectFeature?.(card.id);
                  }
                }}
                aria-label={`${card.title}: ${card.description}`}
                className="group relative p-6 rounded-3xl text-left flex flex-col justify-between overflow-hidden cursor-pointer backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#8E74DB]"
                style={{
                  backgroundColor: theme.isDark ? card.darkTranslucent : card.pastelTranslucent,
                  border: `1px solid ${theme.isDark ? 'rgba(255, 255, 255, 0.12)' : card.borderColor}`,
                  minHeight: '230px',
                  boxShadow: theme.isDark
                    ? '0 20px 40px -15px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)'
                    : '0 20px 40px -15px rgba(48, 39, 71, 0.12), 0 8px 16px -6px rgba(48, 39, 71, 0.06), inset 0 1px 1px 0 rgba(255, 255, 255, 0.85)',
                }}
              >
                {/* Reference Image Container: Right-to-Left Fade-in as moving forward */}
                <div
                  className="absolute top-0 right-0 bottom-0 w-[60%] pointer-events-none overflow-hidden transition-all duration-700 ease-out group-hover:w-[65%]"
                  style={{
                    maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <img
                    src={card.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="w-full h-full object-cover object-center transform translate-x-3 opacity-50 transition-all duration-700 ease-out group-hover:translate-x-0 group-hover:opacity-90 group-hover:scale-110"
                    style={{
                      transitionDelay: card.delay,
                    }}
                  />
                  {/* Subtle translucent pastel color wash blending image with the card theme */}
                  <div
                    className="absolute inset-0 mix-blend-color opacity-40 transition-opacity duration-500 group-hover:opacity-20"
                    style={{ backgroundColor: card.pastelColor }}
                  />
                  {/* Additional dark overlay for dark mode contrast */}
                  {theme.isDark && (
                    <div className="absolute inset-0 bg-black/40" />
                  )}
                </div>

                {/* Background soft ambient glow */}
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none"
                  style={{ backgroundColor: card.pastelTranslucent }}
                />

                {/* Content layer: Icon, Header, Subheading, and Interactive Action Pill */}
                <div className="relative z-10 max-w-[85%] sm:max-w-[80%] flex flex-col h-full justify-between">
                  <div>
                    {/* 1. Icon */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-md mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.85)',
                        color: cardTextColor,
                        border: '1px solid rgba(255, 255, 255, 0.45)',
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* 2. Header */}
                    <h3
                      className="text-lg sm:text-xl font-bold tracking-tight mb-2 group-hover:underline"
                      style={{ color: cardTextColor }}
                    >
                      {card.title}
                    </h3>

                    {/* 3. Subheading text */}
                    <p
                      className="text-xs sm:text-sm font-medium leading-relaxed opacity-90"
                      style={{ color: cardTextColor }}
                    >
                      {card.description}
                    </p>
                  </div>

                  {/* 4. Interactive Action Pill */}
                  <div className="mt-4 pt-1">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs backdrop-blur-md transition-all group-hover:scale-105"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(255, 255, 255, 0.9)',
                        color: cardTextColor,
                        border: `1px solid ${theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)'}`,
                      }}
                    >
                      <span>{card.actionLabel}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
