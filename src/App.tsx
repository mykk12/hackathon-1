import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { FeatureCards } from './components/FeatureCards.tsx';
import { SubjectExploration } from './components/SubjectExploration.tsx';
import { PopularResources } from './components/PopularResources.tsx';
import { StudyPlannerPreview } from './components/StudyPlannerPreview.tsx';
import { PublicExploreSpace } from './components/PublicExploreSpace.tsx';
import { Footer } from './components/Footer.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { RegisterModal } from './components/RegisterModal.tsx';
import { ResourceDetailModal } from './components/ResourceDetailModal.tsx';
import { ShareResourceModal } from './components/ShareResourceModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ManageView } from './components/ManageView.tsx';
import { StudyPlanView } from './components/StudyPlanView.tsx';
import { FeedbackView } from './components/FeedbackView.tsx';
import { FloatingFeedbackWidget } from './components/FloatingFeedbackWidget.tsx';
import { FloatingAIAssistant } from './components/FloatingAIAssistant.tsx';

import type { SidebarTab, SubjectType, AcademicResource, StudyTask, UserRegistrationData } from './types/index.ts';
import {
  getThemeTokens,
  loadSavedThemeValue,
  saveThemeValue,
} from './utils/theme.ts';
import {
  INITIAL_RESOURCES,
  INITIAL_STUDY_TASKS,
  loadSavedBookmarks,
  saveBookmarks,
  filterAcademicResources,
} from './utils/resources.ts';
import {
  insertUserEntryToSupabase,
  fetchAllResourcesFromSupabase,
  insertResourceToSupabase,
  updateResourceInSupabase,
  deleteResourceFromSupabase,
  fetchStudyTasksFromSupabase,
  insertStudyTaskToSupabase,
  updateStudyTaskInSupabase,
  fetchBookmarksFromSupabase,
  saveBookmarkToSupabase,
  removeBookmarkFromSupabase,
} from './utils/supabase.ts';

export default function App() {
  // Theme & Grayscale Background Slider State
  const [sliderValue, setSliderValue] = useState<number>(() => loadSavedThemeValue());
  const [isBrightnessOpen, setIsBrightnessOpen] = useState(false);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<SidebarTab>('home');

  // Authentication State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('study_user_email') || null;
  });

  // Academic Resources & Bookmarks State
  const [resources, setResources] = useState<AcademicResource[]>(INITIAL_RESOURCES);
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadSavedBookmarks());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'All'>('All');
  const [selectedFormat, setSelectedFormat] = useState('All');

  // Modals for resource preview and sharing
  const [selectedResource, setSelectedResource] = useState<AcademicResource | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Study Tasks State
  const [tasks, setTasks] = useState<StudyTask[]>(INITIAL_STUDY_TASKS);

  // Load data from Supabase on mount and sync whenever user changes
  useEffect(() => {
    let isMounted = true;

    async function loadCloudData() {
      try {
        // Fetch all available public + user resources from Supabase
        const cloudResources = await fetchAllResourcesFromSupabase(currentUser);
        if (isMounted && cloudResources.length > 0) {
          setResources(cloudResources);
        }

        // Fetch user tasks & bookmarks if authenticated
        if (currentUser) {
          const [cloudTasks, cloudBookmarks] = await Promise.all([
            fetchStudyTasksFromSupabase(currentUser),
            fetchBookmarksFromSupabase(currentUser),
          ]);

          if (isMounted) {
            if (cloudTasks.length > 0) {
              setTasks(cloudTasks);
            }
            if (cloudBookmarks.length > 0) {
              setBookmarks(cloudBookmarks);
              saveBookmarks(cloudBookmarks);
            }
          }
        }
      } catch (err) {
        console.warn('Supabase initial data fetch warning:', err);
      }
    }

    loadCloudData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Calculate theme tokens based on continuous grayscale value
  const theme = getThemeTokens(sliderValue);

  // Save grayscale value to localStorage whenever changed
  const handleSliderChange = (newValue: number) => {
    setSliderValue(newValue);
    saveThemeValue(newValue);
  };

  // Toggle bookmark with state persistence and Supabase sync
  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const isBookmarked = prev.includes(id);
      const next = isBookmarked ? prev.filter((item) => item !== id) : [...prev, id];
      saveBookmarks(next);

      // Persist to Supabase if logged in
      if (currentUser) {
        if (isBookmarked) {
          removeBookmarkFromSupabase(currentUser, id).catch(() => {});
        } else {
          saveBookmarkToSupabase(currentUser, id).catch(() => {});
        }
      }
      return next;
    });
  };

  // Filtered resources for search and exploration - ONLY public resources appear in public buddies library
  const filteredResources = filterAcademicResources(
    resources.filter((r) => r.isPublic !== false),
    searchQuery,
    selectedSubject,
    selectedFormat
  );

  const [pendingTab, setPendingTab] = useState<SidebarTab | null>(null);

  // Protected navigation: Dashboard, Manage, and Study Plan only feasible when logged in
  const handleSelectTab = (tab: SidebarTab) => {
    const isProtected = tab === 'dashboard' || tab === 'manage' || tab === 'study-plan';
    if (!currentUser && isProtected) {
      setPendingTab(tab);
      setIsLoginOpen(true);
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFeature = (feature: 'library' | 'planner' | 'saved' | 'share') => {
    if (feature === 'library') {
      setCurrentTab('home');
      const el = document.getElementById('popular-resources');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (feature === 'planner') {
      handleSelectTab('study-plan');
    } else if (feature === 'saved') {
      handleSelectTab('manage');
    } else if (feature === 'share') {
      setIsShareModalOpen(true);
    }
  };

  const handleAddResource = async (newResource: AcademicResource) => {
    setResources((prev) => [newResource, ...prev]);
    // Also automatically bookmark for user
    handleToggleBookmark(newResource.id);

    // Save into Supabase user_resources table
    insertResourceToSupabase(newResource, currentUser).catch((err) =>
      console.warn('Supabase save error:', err)
    );

    // Auto-index into server-side RAG Knowledge Base
    try {
      await fetch('/api/rag/index-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: newResource, userEmail: currentUser }),
      });
    } catch (e) {
      console.warn('RAG auto-index error:', e);
    }
  };

  const handleDeleteResource = async (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    setBookmarks((prev) => prev.filter((b) => b !== id));

    // Delete from Supabase user_resources
    deleteResourceFromSupabase(id).catch((err) =>
      console.warn('Supabase delete error:', err)
    );

    // Remove from server-side RAG Knowledge Base
    try {
      await fetch(`/api/rag/resource/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('RAG delete error:', e);
    }
  };

  const handleUpdateResource = async (updatedResource: AcademicResource) => {
    setResources((prev) =>
      prev.map((r) => (r.id === updatedResource.id ? updatedResource : r))
    );

    // Update in Supabase user_resources
    updateResourceInSupabase(updatedResource).catch((err) =>
      console.warn('Supabase update error:', err)
    );

    // Re-index updated resource in server-side RAG
    try {
      await fetch('/api/rag/index-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: updatedResource, userEmail: currentUser }),
      });
    } catch (e) {
      console.warn('RAG update error:', e);
    }
  };

  const handleOpenResourceById = (resourceId: string) => {
    const found = resources.find((r) => r.id === resourceId);
    if (found) {
      setSelectedResource(found);
    }
  };

  const handleAddTask = (newTask: StudyTask) => {
    setTasks((prev) => [newTask, ...prev]);
    // Save to Supabase study_tasks table
    insertStudyTaskToSupabase(newTask, currentUser).catch((err) =>
      console.warn('Supabase task save error:', err)
    );
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, completed: !t.completed };
          // Update in Supabase study_tasks
          updateStudyTaskInSupabase(updated).catch((err) =>
            console.warn('Supabase task update error:', err)
          );
          return updated;
        }
        return t;
      })
    );
  };

  const handleScrollToPopular = () => {
    setCurrentTab('home');
    const el = document.getElementById('popular-resources');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToPublic = () => {
    setCurrentTab('home');
    const el = document.getElementById('public-explore');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen transition-colors duration-200 font-sans selection:bg-[#DCD1FA] selection:text-[#302747]"
      style={{
        backgroundColor: theme.background,
        color: theme.textPrimary,
      }}
    >
      {/* Full-width container with top horizontal navigation */}
      <div className="flex flex-col min-h-screen w-full">
        {/* Full-Width Horizontal Header & Navigation Bar */}
        <Header
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          theme={theme}
          sliderValue={sliderValue}
          onSliderChange={handleSliderChange}
          isBrightnessOpen={isBrightnessOpen}
          onToggleBrightness={() => setIsBrightnessOpen((prev) => !prev)}
          onCloseBrightness={() => setIsBrightnessOpen(false)}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
          userEmail={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            localStorage.removeItem('study_user_email');
            if (currentTab === 'dashboard' || currentTab === 'manage' || currentTab === 'study-plan') {
              setCurrentTab('home');
            }
          }}
        />

        {/* Tab View Router */}
        <main className="flex-1">
          {currentTab === 'home' && (
            <>
              {/* 3. Hero Section */}
              <HeroSection
                theme={theme}
                onTryForFree={() => {
                  if (currentUser) {
                    setCurrentTab('dashboard');
                  } else {
                    setIsLoginOpen(true);
                  }
                }}
              />

              {/* Personal Study Planner: Only occurs as per login info, associated with login credentials, located above "What would you like to do?" */}
              {currentUser && (
                <StudyPlannerPreview
                  theme={theme}
                  initialTasks={tasks}
                  userEmail={currentUser}
                  onOpenPlanner={() => {
                    setCurrentTab('study-plan');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}

              {/* 4. Student Feature Cards ("What would you like to do?") */}
              <FeatureCards
                theme={theme}
                onSelectFeature={handleSelectFeature}
                savedCount={bookmarks.length}
              />

              {/* 5. Subject Exploration */}
              <SubjectExploration
                theme={theme}
                selectedSubject={selectedSubject}
                onSelectSubject={(subject) => {
                  setSelectedSubject(subject);
                  handleScrollToPopular();
                }}
              />

              {/* 6. Popular Academic Resources */}
              <PopularResources
                theme={theme}
                resources={filteredResources}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                onSelectResource={(res) => setSelectedResource(res)}
                activeFormatFilter={selectedFormat}
                onSelectFormatFilter={setSelectedFormat}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onViewAllClick={() => {
                  setSelectedSubject('All');
                  setSelectedFormat('All');
                  setSearchQuery('');
                }}
              />

              {/* 8. Public Explore Space near bottom (~85% scroll) */}
              <PublicExploreSpace
                theme={theme}
                onBrowsePublic={handleScrollToPopular}
                onContributeResource={() => setIsShareModalOpen(true)}
                onSelectResource={(res) => setSelectedResource(res)}
                publicResources={resources.filter((r) => r.isPublic)}
              />
            </>
          )}

          {/* Fallback protection for protected views if logged out */}
          {!currentUser && (currentTab === 'dashboard' || currentTab === 'manage' || currentTab === 'study-plan') && (
            <div className="py-24 px-4 text-center max-w-md mx-auto">
              <div
                className="w-14 h-14 rounded-3xl mx-auto mb-4 flex items-center justify-center font-bold text-xl shadow-xs"
                style={{ backgroundColor: '#DCD1FA', color: '#302747' }}
              >
                🔒
              </div>
              <h2 className="text-2xl font-black mb-2" style={{ color: theme.textPrimary }}>
                Sign In Required
              </h2>
              <p className="text-sm font-medium mb-6" style={{ color: theme.textSecondary }}>
                This student workspace is private and requires an active login session.
              </p>
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#302747', color: '#FFF9F0' }}
              >
                Sign In to Continue
              </button>
            </div>
          )}

          {currentUser && currentTab === 'dashboard' && (
            <DashboardView
              theme={theme}
              savedResources={resources.filter((r) => bookmarks.includes(r.id))}
              tasks={tasks}
              onOpenResource={(res) => setSelectedResource(res)}
              onGoToPlanner={() => setCurrentTab('study-plan')}
              onGoToHome={() => setCurrentTab('home')}
              onOpenUpload={() => setIsShareModalOpen(true)}
            />
          )}

          {currentUser && currentTab === 'manage' && (
            <ManageView
              theme={theme}
              resources={resources}
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              onOpenResource={(res) => setSelectedResource(res)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onGoToHome={() => setCurrentTab('home')}
              onBrowsePublic={handleScrollToPopular}
              onDeleteResource={handleDeleteResource}
              onUpdateResource={handleUpdateResource}
            />
          )}

          {currentUser && currentTab === 'study-plan' && (
            <StudyPlanView
              theme={theme}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onGoToHome={() => setCurrentTab('home')}
            />
          )}

          {currentTab === 'feedback' && (
            <FeedbackView
              theme={theme}
              onGoToHome={() => setCurrentTab('home')}
              currentUser={currentUser}
            />
          )}
        </main>

        {/* 9. Footer */}
        <Footer
          theme={theme}
          onNavigate={handleSelectTab}
          onOpenResourceDiscovery={handleScrollToPopular}
          onOpenFeedback={() => {
            setCurrentTab('feedback');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setPendingTab(null);
        }}
        onLoginSuccess={(email) => {
          setCurrentUser(email);
          localStorage.setItem('study_user_email', email);
          if (pendingTab) {
            setCurrentTab(pendingTab);
            setPendingTab(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onSwitchToRegister={() => setIsRegisterOpen(true)}
        theme={theme}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setPendingTab(null);
        }}
        onRegisterSuccess={(data: UserRegistrationData) => {
          setCurrentUser(data.email);
          localStorage.setItem('study_user_email', data.email);
          insertUserEntryToSupabase(data).catch(() => {});
          if (pendingTab) {
            setCurrentTab(pendingTab);
            setPendingTab(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onSwitchToLogin={() => setIsLoginOpen(true)}
        theme={theme}
      />

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        isBookmarked={selectedResource ? bookmarks.includes(selectedResource.id) : false}
        onToggleBookmark={handleToggleBookmark}
        theme={theme}
        currentUser={currentUser}
        onLoginSuccess={(email) => {
          setCurrentUser(email);
          localStorage.setItem('study_user_email', email);
        }}
        onOpenLoginModal={() => setIsLoginOpen(true)}
      />

      {/* Share / Upload Resource Modal */}
      <ShareResourceModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onAddResource={handleAddResource}
        theme={theme}
      />

      {/* Floating AI Study Space Assistant - Positioned directly above Feedback button */}
      <FloatingAIAssistant
        theme={theme}
        currentTab={currentTab}
        currentUser={currentUser}
        savedCount={bookmarks.length}
        tasksCount={tasks.length}
        tasks={tasks}
        resources={resources}
        bookmarks={bookmarks}
        onNavigate={handleSelectTab}
        onScrollToPopular={handleScrollToPopular}
        onOpenResource={handleOpenResourceById}
      />

      {/* Floating Bottom-Right Feedback Widget */}
      <FloatingFeedbackWidget
        theme={theme}
        currentUser={currentUser}
        onOpenFullPage={() => {
          setCurrentTab('feedback');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
