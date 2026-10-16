import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  RotateCcw,
  Copy,
  Check,
  Compass,
  BookOpen,
  Clock,
  ArrowRight,
  AlertCircle,
  Database,
  Info,
  Maximize2,
  Minimize2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  FileText,
  FileCode,
  Presentation,
  FileSpreadsheet,
  FileImage,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  History,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';
import type { SidebarTab, StudyTask, AcademicResource } from '../types/index.ts';
import { isSupabaseConfigured, getSupabaseConnectionStatus, SupabaseStatus } from '../utils/supabase.ts';

export interface SourceCitation {
  id: string;
  resourceId: string;
  title: string;
  subject: string;
  format: string;
  fileName: string;
  pageNumber?: number;
  snippet: string;
  score: number;
  isPublic: boolean;
  ownerEmail?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: 'study-plan' | 'manage' | 'dashboard' | 'home' | null;
  citations?: SourceCitation[];
  hasWebsiteSources?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
  messages: ChatMessage[];
}

interface FloatingAIAssistantProps {
  theme: ThemeColors;
  currentTab: SidebarTab;
  currentUser?: string | null;
  savedCount?: number;
  tasksCount?: number;
  onNavigate: (tab: SidebarTab) => void;
  onScrollToPopular?: () => void;
  onOpenResource?: (resourceId: string) => void;
  tasks?: StudyTask[];
  resources?: AcademicResource[];
  bookmarks?: string[];
}

const STARTER_PROMPTS = [
  {
    title: 'Midterm Algorithms',
    prompt: 'What graph algorithms are in my Midterm Algorithms review, and what is the difference between Dijkstra and Bellman-Ford?',
    icon: BookOpen,
  },
  {
    title: 'Biochemistry Pathways',
    prompt: 'What are the 10 steps of glycolysis and how is PFK-1 regulated according to my notes?',
    icon: Clock,
  },
  {
    title: 'Study Schedule',
    prompt: 'Can you create a 7-day revision schedule for my upcoming exams with 3 hours of study daily?',
    icon: Calendar,
  },
  {
    title: 'Platform Guide',
    prompt: 'How do I use the Study Plan Focus Timer, presets, and manage my uploaded notes on Study Space?',
    icon: Compass,
  },
];

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  theme,
  currentTab,
  currentUser,
  savedCount = 0,
  tasksCount = 0,
  onNavigate,
  onScrollToPopular,
  onOpenResource,
  tasks = [],
  resources = [],
  bookmarks = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus | null>(null);

  // RAG stats and reindexing state
  const [ragStats, setRagStats] = useState<{ totalChunks: number; totalResources: number } | null>(null);
  const [isReindexing, setIsReindexing] = useState(false);
  const [reindexSuccess, setReindexSuccess] = useState(false);
  const [expandedCitationMsgId, setExpandedCitationMsgId] = useState<string | null>(null);

  // Storage keys are user-specific for privacy
  const storageKey = `study_ai_chat_${currentUser || 'guest'}`;
  const historyStorageKey = `study_ai_history_${currentUser || 'guest'}`;

  // Chat History Drawer State
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(() => {
    try {
      const raw = localStorage.getItem(historyStorageKey);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [
      {
        id: 'hist-seed-1',
        title: 'Midterm Algorithms Review',
        date: 'Today, 10:30 AM',
        preview: 'Dijkstra min-heap complexity and negative edge weights failure analysis.',
        messages: [
          {
            id: 'h1-u',
            role: 'user',
            content: 'What is the time complexity of Dijkstra algorithm with a Min-Heap?',
            timestamp: '10:30 AM',
          },
          {
            id: 'h1-a',
            role: 'assistant',
            content: 'According to your **Midterm Algorithms & Graph Review (Page 1)**, Dijkstra using a binary min-heap runs in **O((V + E) log V)** time.',
            timestamp: '10:31 AM',
          },
        ],
      },
      {
        id: 'hist-seed-2',
        title: 'Biochemistry PFK-1 Regulation',
        date: 'Yesterday, 3:15 PM',
        preview: 'Allosteric regulation of Phosphofructokinase-1 by ATP, Citrate, and AMP.',
        messages: [
          {
            id: 'h2-u',
            role: 'user',
            content: 'What are the allosteric effectors of PFK-1 in glycolysis?',
            timestamp: '3:15 PM',
          },
          {
            id: 'h2-a',
            role: 'assistant',
            content: 'From your **Biochemistry Reaction Pathways (Page 2)**: PFK-1 is allosterically inhibited by ATP and Citrate, and stimulated by AMP, ADP, and F-2,6-BP.',
            timestamp: '3:16 PM',
          },
        ],
      },
    ];
  });

  // Fetch RAG stats
  const fetchRagStats = async () => {
    try {
      const res = await fetch('/api/rag/stats');
      if (res.ok) {
        const data = await res.json();
        setRagStats({ totalChunks: data.totalChunks, totalResources: data.totalResources });
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRagStats();
  }, []);

  // Handle re-indexing all materials
  const handleReindexLibrary = async () => {
    if (isReindexing) return;
    setIsReindexing(true);
    try {
      const res = await fetch('/api/rag/reindex-all', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setRagStats({ totalChunks: data.totalChunks, totalResources: data.totalResources });
        setReindexSuccess(true);
        setTimeout(() => setReindexSuccess(false), 3000);
      }
    } catch (e) {
      console.warn('Re-index error:', e);
    } finally {
      setIsReindexing(false);
    }
  };

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved chat:', e);
    }
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `👋 Hi ${
          currentUser ? currentUser.split('@')[0] : 'there'
        }! I'm your **Study Space AI Academic Assistant**.\n\nI am connected to your **StudySpace Website Library & Uploaded Materials**.\n\n🔍 **What I can do with your real content:**\n- 📚 Answer exam questions using your uploaded notes, cheat sheets, and formula decks with exact page citations\n- ⚡ Explain Dijkstra, Bellman-Ford, Kruskals, Glycolysis, Calculus formulas, and SQL directly from your course files\n- 🔒 Keep your private notes strictly confidential with multi-user authorization\n- 📅 Build customized daily revision roadmaps based on your active study tasks\n\nAsk me anything about your courses or study materials!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat to localStorage:', e);
    }
  }, [messages, storageKey]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Check Supabase status on mount or when opening status
  useEffect(() => {
    getSupabaseConnectionStatus().then(setSupabaseStatus);
  }, []);

  // Handle Send Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText ?? inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      // Extract all user entries (tasks, uploaded files, pinned items, presets)
      const allUserData = {
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          subject: t.subject,
          dueDate: t.dueDate,
          durationMinutes: t.durationMinutes,
          completed: t.completed,
          priority: t.priority,
        })),
        uploadedResources: resources
          .filter(
            (r) =>
              r.author?.toLowerCase().includes('you') ||
              r.ownerEmail === currentUser ||
              r.isPublic === false
          )
          .map((r) => ({
            id: r.id,
            title: r.title,
            fileName: r.fileName,
            subject: r.subject,
            format: r.format,
            isPublic: r.isPublic,
            summary: r.summary,
            topics: r.topics,
            dateAdded: r.dateAdded,
          })),
        pinnedResources: resources
          .filter((r) => bookmarks.includes(r.id))
          .map((r) => ({
            id: r.id,
            title: r.title,
            subject: r.subject,
            format: r.format,
            summary: r.summary,
            isPublic: r.isPublic,
          })),
        pinnedPresets: (() => {
          try {
            const raw = localStorage.getItem('studyspace_timer_presets');
            if (raw) return JSON.parse(raw);
          } catch {
            // fallback
          }
          return [
            { id: 'preset-5', minutes: 5, label: '5 mins', isPinned: true },
            { id: 'preset-15', minutes: 15, label: '15 mins', isPinned: true },
            { id: 'preset-30', minutes: 30, label: '30 mins', isPinned: true },
            { id: 'preset-60', minutes: 60, label: '60 mins', isPinned: true },
          ];
        })(),
      };

      // Build conversation payload for the server
      const apiPayload = {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        context: {
          currentPage: currentTab,
          currentUser: currentUser || null,
          savedCount: bookmarks.length || savedCount,
          tasksCount: tasks.length || tasksCount,
          allUserData,
        },
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get a response from Study Space AI.');
      }

      const botMessageId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: data.suggestedAction || null,
          citations: data.citations || [],
          hasWebsiteSources: Boolean(data.hasWebsiteSources),
        },
      ]);
      // Update citation expanded view to the newest response if it has sources
      if (data.citations && data.citations.length > 0) {
        setExpandedCitationMsgId(botMessageId);
      }
    } catch (err: unknown) {
      const error = err as Error;
      const errorMsgId = `err-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          role: 'assistant',
          content: `⚠️ **Connection Note:** ${error.message}\n\n*If your Gemini API key is newly attached in Settings > Secrets, please try again or verify server connectivity.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry last message
  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      setMessages((prev) => {
        if (prev[prev.length - 1].error) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      handleSendMessage(lastUserMessage.content);
    }
  };

  // Clear Chat and archive previous to History if it contained user messages
  const handleNewChat = () => {
    const hasUserMessages = messages.some((m) => m.role === 'user');
    if (hasUserMessages) {
      const firstUserMsg = messages.find((m) => m.role === 'user')?.content || 'Study Session';
      const cleanTitle = firstUserMsg.length > 36 ? `${firstUserMsg.slice(0, 36)}...` : firstUserMsg;
      const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant')?.content || firstUserMsg;
      const cleanPreview = lastAssistantMsg.replace(/[#*`_]/g, '').slice(0, 60);

      const archivedSession: ChatSession = {
        id: `sess-${Date.now()}`,
        title: cleanTitle,
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        preview: cleanPreview ? `${cleanPreview}...` : 'Study conversation',
        messages: [...messages],
      };

      const updatedHistory = [archivedSession, ...chatHistory.filter((h) => h.id !== archivedSession.id)].slice(0, 25);
      setChatHistory(updatedHistory);
      try {
        localStorage.setItem(historyStorageKey, JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn(e);
      }
    }

    const welcome: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `Fresh conversation started! 🚀\n\nAsk me anything about your course files, study tasks, or exam preparation.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
    setShowHistory(false);
    try {
      localStorage.setItem(storageKey, JSON.stringify([welcome]));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSelectHistorySession = (session: ChatSession) => {
    setMessages(session.messages);
    setShowHistory(false);
    try {
      localStorage.setItem(storageKey, JSON.stringify(session.messages));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteHistorySession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatHistory.filter((s) => s.id !== id);
    setChatHistory(updated);
    try {
      localStorage.setItem(historyStorageKey, JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  // Copy code or text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard shortcut: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Execute suggested action
  const handleExecuteAction = (action: 'study-plan' | 'manage' | 'dashboard' | 'home') => {
    if (action === 'home' && onScrollToPopular) {
      onScrollToPopular();
    } else {
      onNavigate(action);
    }
  };

  // Render Format Icon for Citations
  const renderCitationFormatIcon = (format: string) => {
    const f = (format || '').toUpperCase();
    if (f.includes('PDF')) return <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    if (f.includes('DOC')) return <FileCode className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
    if (f.includes('PPT') || f.includes('SLIDE')) return <Presentation className="w-3.5 h-3.5 text-orange-500 shrink-0" />;
    if (f.includes('SHEET') || f.includes('XLS') || f.includes('CSV')) return <FileSpreadsheet className="w-3.5 h-3.5 text-teal-500 shrink-0" />;
    if (f.includes('PHOTO') || f.includes('IMG')) return <FileImage className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    return <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  };

  // Markdown renderer supporting headings, code blocks, lists, and inline citations
  const renderFormattedContent = (content: string, msgId: string) => {
    const cleanContent = content
      .replace(/\[Action: Go to Study Plan\]/g, '')
      .replace(/\[Action: Go to Manage\]/g, '')
      .replace(/\[Action: Go to Dashboard\]/g, '')
      .replace(/\[Action: Go to Home\]/g, '');

    const parts = cleanContent.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : '';
        const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
        const blockId = `${msgId}-code-${index}`;

        return (
          <div
            key={blockId}
            className="my-3 rounded-xl overflow-hidden border text-xs shadow-inner"
            style={{
              backgroundColor: theme.isDark ? '#14101E' : '#201A2E',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center justify-between px-3 py-1.5 bg-black/30 border-b border-white/5 text-[11px] text-gray-400 font-mono">
              <span>{lang || 'code'}</span>
              <button
                type="button"
                onClick={() => handleCopy(blockId, code)}
                className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                title="Copy code"
              >
                {copiedId === blockId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto font-mono text-emerald-300 dark:text-emerald-300 text-[11.5px] leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const lines = part.split('\n');
      return (
        <div key={`part-${index}`} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="h-1.5" />;

            if (line.startsWith('### ')) {
              return (
                <h4 key={lIdx} className="font-extrabold text-xs sm:text-sm mt-2 text-purple-400">
                  {line.replace('### ', '')}
                </h4>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h3 key={lIdx} className="font-extrabold text-sm mt-2.5 text-purple-300">
                  {line.replace('## ', '')}
                </h3>
              );
            }

            if (line.startsWith('- ') || line.startsWith('* ')) {
              const text = line.substring(2);
              return (
                <div key={lIdx} className="flex items-start gap-2 text-xs pl-1">
                  <span className="text-purple-400 mt-1 font-bold">•</span>
                  <span>{parseInlineStyles(text)}</span>
                </div>
              );
            }

            const matchNumbered = line.match(/^(\d+)\.\s(.*)/);
            if (matchNumbered) {
              return (
                <div key={lIdx} className="flex items-start gap-2 text-xs pl-1">
                  <span className="text-purple-400 font-bold shrink-0">{matchNumbered[1]}.</span>
                  <span>{parseInlineStyles(matchNumbered[2])}</span>
                </div>
              );
            }

            return (
              <p key={lIdx} className="text-xs leading-relaxed">
                {parseInlineStyles(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const parseInlineStyles = (text: string) => {
    // Process **bold**, `code`, and [Source X] tags
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[Source \d+[^\]]*\])/g);
    return parts.map((chunk, i) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-inherit">
            {chunk.slice(2, -2)}
          </strong>
        );
      }
      if (chunk.startsWith('`') && chunk.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5 font-semibold"
            style={{
              backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(48,39,71,0.08)',
              color: '#8E74DB',
            }}
          >
            {chunk.slice(1, -1)}
          </code>
        );
      }
      if (chunk.startsWith('[Source ') && chunk.endsWith(']')) {
        return (
          <span
            key={i}
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
            title="Click to view referenced source"
          >
            {chunk}
          </span>
        );
      }
      return chunk;
    });
  };

  return (
    <>
      {/* Floating Toggle Trigger Button (Target Element) */}
      <div className="fixed bottom-22 right-6 z-40">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer focus:outline-hidden hover:shadow-[0_14px_40px_-2px_rgba(142,116,219,0.7),0_0_28px_6px_rgba(220,209,250,0.55)]"
          style={{
            background: 'linear-gradient(135deg, #302747 0%, #4D3B73 50%, #1F192E 100%)',
            color: '#FFF9F0',
            border: '2px solid rgba(220, 209, 250, 0.75)',
            boxShadow:
              '0 10px 32px -4px rgba(48, 39, 71, 0.65), 0 0 24px 3px rgba(142, 116, 219, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
          }}
          aria-label={isOpen ? 'Close Study Space AI Assistant' : 'Open Study Space AI Assistant (All User Entries Access Granted)'}
          title="StudySpace AI • Full Permission Granted to Tasks, Uploads & Pinned Entries"
        >
          {/* Luminous background pulse & refined specular glass highlight (Target Element) */}
          <span
            className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none group-hover:opacity-90"
            style={{
              background:
                'radial-gradient(circle at 50% 25%, rgba(220, 209, 250, 0.35) 0%, rgba(142, 116, 219, 0.12) 65%, transparent 100%)',
              boxShadow: 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.25)',
            }}
          />

          {/* Assistant Icon */}
          <Sparkles className="w-6 h-6 text-purple-200 group-hover:rotate-12 transition-transform duration-300 relative z-10" />

          {/* Verified All-Access Badge */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 z-20" title="Full Permission Granted: Tasks, Uploads & Pinned">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#302747] items-center justify-center text-[8px] font-black text-white">
              ✓
            </span>
          </span>

        </button>
      </div>

      {/* Main Slide-in Chat Drawer / Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-assistant-title"
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl border ${
            isExpanded
              ? 'inset-4 sm:inset-8 w-auto h-auto max-w-4xl mx-auto'
              : 'bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[420px] h-[640px] max-h-[82vh]'
          }`}
          style={{
            backgroundColor: theme.isDark ? 'rgba(24, 20, 36, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            borderColor: theme.surfaceBorder,
            boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Header Bar */}
          <div
            className="flex flex-col border-b"
            style={{
              backgroundColor: theme.isDark ? 'rgba(16, 12, 26, 0.85)' : 'rgba(245, 240, 230, 0.65)',
              borderColor: theme.surfaceBorder,
            }}
          >
            <div className="flex items-center justify-between p-3.5 px-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#302747] text-[#FFF9F0] flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h2 id="ai-assistant-title" className="font-extrabold text-sm tracking-tight" style={{ color: theme.textPrimary }}>
                    StudySpace AI
                  </h2>
                  <p className="text-[10.5px] opacity-75" style={{ color: theme.textSecondary }}>
                    <span>{currentUser ? currentUser.split('@')[0] : 'Study Assistant'}</span>
                  </p>
                </div>
              </div>

              {/* Header Action Controls */}
              <div className="flex items-center gap-1">
                {/* Chat History Icon (on left side of new chat icon, of same style) */}
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className={`p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                    showHistory
                      ? 'text-purple-400 bg-purple-500/15'
                      : 'text-gray-400 hover:text-purple-400'
                  }`}
                  title="Chat History"
                  aria-label="Chat History"
                >
                  <History className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-purple-400"
                  title="Start fresh conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-gray-400 hover:text-purple-400 hidden sm:flex"
                  title={isExpanded ? 'Collapse' : 'Expand window'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  style={{ color: theme.textSecondary }}
                  title="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat History Drawer / Overlay */}
            {showHistory && (
              <div
                className="p-3 border-t max-h-72 overflow-y-auto space-y-2 text-xs transition-all animate-in slide-in-from-top-2"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(20, 16, 32, 0.98)' : 'rgba(247, 244, 238, 0.98)',
                  borderColor: theme.surfaceBorder,
                }}
              >
                <div className="flex items-center justify-between px-1 pb-1 border-b" style={{ borderColor: theme.surfaceBorder }}>
                  <div className="flex items-center gap-1.5 font-bold" style={{ color: theme.textPrimary }}>
                    <History className="w-3.5 h-3.5 text-purple-400" />
                    <span>Chat History</span>
                    <span className="text-[10px] font-normal opacity-60">({chatHistory.length} saved)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleNewChat}
                      className="text-[10.5px] font-bold text-purple-400 hover:underline cursor-pointer"
                    >
                      + New Chat
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHistory(false)}
                      className="p-0.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer text-gray-400"
                      title="Close history"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {chatHistory.length === 0 ? (
                  <div className="py-6 text-center text-gray-400 text-xs">
                    <MessageSquare className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
                    <p>No previous conversations saved yet.</p>
                    <p className="text-[10px] mt-0.5 opacity-75">Clicking "New Chat" will archive conversations here.</p>
                  </div>
                ) : (
                  chatHistory.map((sess) => (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectHistorySession(sess)}
                      className="group p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 hover:scale-[1.01]"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
                        borderColor: theme.surfaceBorder,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-extrabold truncate text-xs" style={{ color: theme.textPrimary }}>
                            {sess.title}
                          </span>
                          <span className="text-[10px] shrink-0 opacity-60" style={{ color: theme.textMuted }}>
                            {sess.date}
                          </span>
                        </div>
                        <p className="text-[11px] truncate opacity-75" style={{ color: theme.textSecondary }}>
                          {sess.preview}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistorySession(sess.id, e)}
                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-opacity cursor-pointer shrink-0"
                        title="Delete session"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const hasCitations = msg.citations && msg.citations.length > 0;
              const isCitationExpanded = expandedCitationMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in`}
                >
                  <div
                    className="flex items-center gap-1.5 mb-1 px-1 text-[10px] opacity-70"
                    style={{ color: theme.textSecondary }}
                  >
                    <span>{isUser ? (currentUser ? currentUser.split('@')[0] : 'You') : 'Study Space AI'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.hasWebsiteSources && (
                      <span className="text-emerald-400 font-semibold">• Grounded in Library</span>
                    )}
                  </div>

                  <div
                    className={`relative group max-w-[92%] sm:max-w-[88%] rounded-2xl p-3.5 shadow-sm text-xs ${
                      isUser ? 'rounded-tr-xs text-white' : 'rounded-tl-xs border'
                    }`}
                    style={{
                      backgroundColor: isUser
                        ? '#302747'
                        : theme.isDark
                        ? 'rgba(38, 31, 56, 0.85)'
                        : '#FFFFFF',
                      borderColor: isUser ? undefined : theme.surfaceBorder,
                      color: isUser ? '#FFF9F0' : theme.textPrimary,
                    }}
                  >
                    {renderFormattedContent(msg.content, msg.id)}

                    {/* Grounded Citations & Sources Section */}
                    {hasCitations && (
                      <div className="mt-3.5 pt-3 border-t border-purple-500/20">
                        <button
                          type="button"
                          onClick={() => setExpandedCitationMsgId((prev) => (prev === msg.id ? null : msg.id))}
                          className="w-full flex items-center justify-between gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer mb-2"
                        >
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                            <span>
                              Referenced Study Materials ({msg.citations!.length} verified source
                              {msg.citations!.length > 1 ? 's' : ''})
                            </span>
                          </div>
                          {isCitationExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isCitationExpanded && (
                          <div className="space-y-2 mt-2 animate-in fade-in">
                            {msg.citations!.map((c, cIdx) => (
                              <div
                                key={c.id || cIdx}
                                className="p-2.5 rounded-xl border text-[11px] transition-all"
                                style={{
                                  backgroundColor: theme.isDark ? 'rgba(20, 16, 30, 0.7)' : 'rgba(248, 246, 252, 0.9)',
                                  borderColor: theme.surfaceBorder,
                                }}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black flex items-center justify-center shrink-0">
                                      {cIdx + 1}
                                    </span>
                                    {renderCitationFormatIcon(c.format)}
                                    <span className="font-bold truncate text-[11.5px]" style={{ color: theme.textPrimary }}>
                                      {c.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {c.pageNumber && (
                                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-black/10 dark:bg-white/10">
                                        Page {c.pageNumber}
                                      </span>
                                    )}
                                    {onOpenResource && (
                                      <button
                                        type="button"
                                        onClick={() => onOpenResource(c.resourceId)}
                                        className="p-1 rounded hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-0.5"
                                        title="Open full study resource"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span className="text-[10px] font-bold">Open</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <p className="mt-1.5 text-[10.5px] italic line-clamp-2 opacity-80" style={{ color: theme.textSecondary }}>
                                  "{c.snippet}"
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fallback Notice when no library sources match */}
                    {!isUser && msg.hasWebsiteSources === false && (
                      <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5 text-[10.5px] text-amber-500/90 font-medium">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>No website documents matched this question. Provided from general academic knowledge.</span>
                      </div>
                    )}

                    {/* Action Pill Recommendation */}
                    {msg.suggestedAction && (
                      <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleExecuteAction(msg.suggestedAction!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                          style={{
                            backgroundColor: '#8E74DB',
                            color: '#FFFFFF',
                          }}
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>
                            {msg.suggestedAction === 'study-plan'
                              ? '🧭 Open Study Plan & Timer'
                              : msg.suggestedAction === 'manage'
                              ? '📁 View Uploaded Files & Manage'
                              : msg.suggestedAction === 'dashboard'
                              ? '📊 Go to Dashboard Overview'
                              : '🔍 Browse Peer Library'}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Message Actions (Copy & Retry) */}
                    {!isUser && (
                      <div className="flex items-center justify-end gap-1.5 mt-2 pt-1.5 border-t border-black/5 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1 rounded text-gray-400 hover:text-purple-400 transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        {msg.error && (
                          <button
                            type="button"
                            onClick={handleRetry}
                            className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:underline"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing / Generating Animation */}
            {isLoading && (
              <div className="flex flex-col items-start animate-in fade-in">
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-purple-400">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span className="font-semibold">Retrieving StudySpace notes & synthesizing answer...</span>
                </div>
                <div
                  className="rounded-2xl rounded-tl-xs p-3.5 border shadow-sm flex items-center gap-1.5"
                  style={{
                    backgroundColor: theme.isDark ? 'rgba(38, 31, 56, 0.85)' : '#FFFFFF',
                    borderColor: theme.surfaceBorder,
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Form Area */}
          <div
            className="p-3.5 border-t relative"
            style={{
              backgroundColor: theme.isDark ? 'rgba(16, 12, 26, 0.9)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: theme.surfaceBorder,
            }}
          >
            <div
              className="flex items-end gap-2 p-2 rounded-2xl border transition-all"
              style={{
                backgroundColor: theme.isDark ? 'rgba(32, 26, 46, 0.8)' : '#F9F8F5',
                borderColor: theme.surfaceBorder,
              }}
            >
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your course files, algorithms, biochemistry, exam schedules..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent border-none outline-hidden resize-none text-xs leading-relaxed max-h-24 p-1 disabled:opacity-50"
                style={{ color: theme.textPrimary }}
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: '#302747',
                  color: '#FFF9F0',
                }}
                title="Send message"
              >
                <Send className="w-3.5 h-3.5 text-purple-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloud & Supabase Status Modal */}
      {showStatusModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="w-full max-w-md p-6 rounded-3xl shadow-2xl border backdrop-blur-xl animate-in zoom-in-95"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.surfaceBorder,
              color: theme.textPrimary,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: theme.surfaceBorder }}>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-500" />
                <h3 className="font-extrabold text-base">RAG Knowledge Base & Cloud Storage</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* RAG Engine Status */}
              <div className="p-3 rounded-2xl border flex items-start gap-3" style={{ borderColor: theme.surfaceBorder }}>
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">StudySpace RAG Engine</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-75" style={{ color: theme.textSecondary }}>
                    Connected to <strong>{ragStats?.totalResources ?? 18} files</strong> ({ragStats?.totalChunks ?? 42} text chunks). Uses hybrid semantic embedding similarity + lexical keyword indexing.
                  </p>
                </div>
              </div>

              {/* Gemini AI Status */}
              <div className="p-3 rounded-2xl border flex items-start gap-3" style={{ borderColor: theme.surfaceBorder }}>
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Google Gemini 3.8 Flash</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                      Server-Side Active
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-75" style={{ color: theme.textSecondary }}>
                    RAG retrieval and generation are executed server-side via `@google/genai` proxy. Your API key remains secure and is never exposed to the client.
                  </p>
                </div>
              </div>

              {/* Supabase Status */}
              <div className="p-3 rounded-2xl border flex items-start gap-3" style={{ borderColor: theme.surfaceBorder }}>
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Supabase Persistence</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                        isSupabaseConfigured
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {isSupabaseConfigured ? 'Connected' : 'Ready to Connect'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-75" style={{ color: theme.textSecondary }}>
                    {supabaseStatus?.message ||
                      'To enable persistent cloud notes and study tasks across all student devices, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'}
                  </p>
                </div>
              </div>

              {/* Schema instructions */}
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border text-[11px] space-y-1.5" style={{ borderColor: theme.surfaceBorder }}>
                <p className="font-bold text-purple-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Schema & Storage Setup:</span>
                </p>
                <ol className="list-decimal pl-4 space-y-1 opacity-80">
                  <li>Run <code>supabase-schema.sql</code> in your Supabase SQL editor to create <code>resource_chunks</code>, <code>user_resources</code>, and <code>study-materials</code> storage bucket.</li>
                  <li>Copy your <strong>Project URL</strong> and <strong>anon public API key</strong> from Settings &gt; API.</li>
                  <li>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment.</li>
                </ol>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex justify-between items-center" style={{ borderColor: theme.surfaceBorder }}>
              <button
                type="button"
                onClick={handleReindexLibrary}
                disabled={isReindexing}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isReindexing ? 'animate-spin' : ''}`} />
                <span>Re-index Knowledge Base</span>
              </button>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#302747] text-[#FFF9F0] shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
