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
} from 'lucide-react';
import { ThemeColors } from '../utils/theme.ts';
import type { SidebarTab } from '../types/index.ts';
import { isSupabaseConfigured, getSupabaseConnectionStatus, SupabaseStatus } from '../utils/supabase.ts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: 'study-plan' | 'manage' | 'dashboard' | 'home' | null;
  error?: boolean;
}

interface FloatingAIAssistantProps {
  theme: ThemeColors;
  currentTab: SidebarTab;
  currentUser?: string | null;
  savedCount?: number;
  tasksCount?: number;
  onNavigate: (tab: SidebarTab) => void;
  onScrollToPopular?: () => void;
}

const STARTER_PROMPTS = [
  {
    title: 'Study Schedule',
    prompt: 'Can you create a 7-day revision schedule for my upcoming exams with 3 hours of study daily?',
    icon: Calendar,
  },
  {
    title: 'Explain Concepts',
    prompt: 'Explain time complexity and Big-O notation with simple real-world analogies and code examples.',
    icon: BookOpen,
  },
  {
    title: 'Platform Guide',
    prompt: 'How do I use the Study Plan Focus Timer, presets, and manage my uploaded notes on Study Space?',
    icon: Compass,
  },
  {
    title: 'Exam Preparation',
    prompt: 'Give me 5 high-yield study techniques and active recall strategies to score higher on midterms.',
    icon: Clock,
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus | null>(null);

  // Storage key is user-specific for privacy
  const storageKey = `study_ai_chat_${currentUser || 'guest'}`;

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
        content: `👋 Hi ${currentUser ? currentUser.split('@')[0] : 'there'}! I'm your **Study Space AI Assistant**.\n\nI can help you:\n- 📚 **Explain difficult academic concepts** across CS, Math, Biology, Business, and more\n- 📅 **Build customized study plans & roadmaps** tailored to your exam schedule\n- ⏱️ **Guide you through website features** (Focus Timer, Manage files, Dashboard, Notes)\n- 💡 **Summarize resources & test your knowledge**\n\nHow can I help you excel today?`,
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
      // Build conversation payload for the server
      const apiPayload = {
        messages: updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        context: {
          currentPage: currentTab,
          currentUser: currentUser || null,
          savedCount,
          tasksCount,
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
        },
      ]);
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
      // Remove any trailing error message
      setMessages((prev) => {
        if (prev[prev.length - 1].error) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      handleSendMessage(lastUserMessage.content);
    }
  };

  // Clear Chat
  const handleNewChat = () => {
    const welcome: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `Fresh conversation started! 🚀\n\nAsk me anything about your courses, planning your revision, or navigating the platform.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcome]);
    try {
      localStorage.setItem(storageKey, JSON.stringify([welcome]));
    } catch (e) {
      console.warn(e);
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

  // Simple Markdown renderer
  const renderFormattedContent = (content: string, msgId: string) => {
    const cleanContent = content
      .replace(/\[Action: Go to Study Plan\]/g, '')
      .replace(/\[Action: Go to Manage\]/g, '')
      .replace(/\[Action: Go to Dashboard\]/g, '')
      .replace(/\[Action: Go to Home\]/g, '');

    // Split code blocks
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

      // Format basic paragraphs, bolding, lists
      const lines = part.split('\n');
      return (
        <div key={`part-${index}`} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="h-1.5" />;

            // Headings
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

            // Bullet points
            if (line.startsWith('- ') || line.startsWith('* ')) {
              const text = line.substring(2);
              return (
                <div key={lIdx} className="flex items-start gap-2 text-xs pl-1">
                  <span className="text-purple-400 mt-1 font-bold">•</span>
                  <span>{parseInlineStyles(text)}</span>
                </div>
              );
            }

            // Numbered list
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
    // Process **bold** and `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((chunk, i) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={i} className="font-bold text-purple-200">{chunk.slice(2, -2)}</strong>;
      }
      if (chunk.startsWith('`') && chunk.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded font-mono text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/20"
          >
            {chunk.slice(1, -1)}
          </code>
        );
      }
      return chunk;
    });
  };

  return (
    <>
      {/* Floating Container: Positioned strictly ABOVE the feedback button without overlapping */}
      <div
        className="fixed bottom-[5.5rem] right-6 z-50 flex flex-col items-end"
        style={{ pointerEvents: 'none' }}
      >
        {/* Responsive Chat Panel Card */}
        {isOpen && (
          <div
            role="dialog"
            aria-labelledby="ai-assistant-title"
            className={`pointer-events-auto mb-3 rounded-3xl backdrop-blur-2xl shadow-2xl border transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 flex flex-col overflow-hidden ${
              isExpanded
                ? 'w-[calc(100vw-2rem)] sm:w-[580px] h-[82vh] max-h-[850px]'
                : 'w-[calc(100vw-2rem)] sm:w-[420px] md:w-[440px] h-[72vh] max-h-[640px]'
            }`}
            style={{
              backgroundColor: theme.isDark ? 'rgba(24, 20, 36, 0.92)' : 'rgba(255, 255, 255, 0.94)',
              borderColor: theme.isDark ? 'rgba(220, 209, 250, 0.20)' : 'rgba(220, 209, 250, 0.85)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              boxShadow: theme.isDark
                ? '0 24px 48px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(142, 116, 219, 0.25)'
                : '0 24px 48px -12px rgba(48, 39, 71, 0.22), inset 0 1px 2px 0 rgba(255, 255, 255, 0.9), 0 0 0 1px rgba(142, 116, 219, 0.2)',
            }}
          >
            {/* Header with Title, Status Badges & Controls */}
            <div
              className="flex items-center justify-between px-4 sm:px-5 py-3 border-b shrink-0 relative"
              style={{
                borderColor: theme.surfaceBorder,
                backgroundColor: theme.isDark ? 'rgba(40, 33, 60, 0.4)' : 'rgba(220, 209, 250, 0.25)',
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #8E74DB 0%, #4C3A7A 100%)',
                    color: '#FFF9F0',
                  }}
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3
                      id="ai-assistant-title"
                      className="font-extrabold text-xs sm:text-sm tracking-tight truncate"
                      style={{ color: theme.textPrimary }}
                    >
                      Study Space AI
                    </h3>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Gemini
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: theme.textMuted }}>
                    <span>Active on {currentTab.toUpperCase()}</span>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setShowStatusModal(true)}
                      className="hover:underline flex items-center gap-1 text-purple-400 font-semibold cursor-pointer"
                      title="View Supabase & Gemini status"
                    >
                      <Database className="w-2.5 h-2.5" />
                      <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Supabase Ready'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  style={{ color: theme.textSecondary }}
                  title="New conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
                  style={{ color: theme.textSecondary }}
                  title={isExpanded ? 'Collapse size' : 'Expand panel'}
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

            {/* Quick Starters Carousel (Only when single message) */}
            {messages.length <= 1 && (
              <div
                className="px-4 py-2 border-b shrink-0 flex items-center gap-2 overflow-x-auto no-scrollbar"
                style={{
                  backgroundColor: theme.isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                  borderColor: theme.surfaceBorder,
                }}
              >
                {STARTER_PROMPTS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(item.prompt)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10.5px] font-bold border shrink-0 hover:scale-102 active:scale-98 transition-all cursor-pointer"
                      style={{
                        backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
                        borderColor: theme.surfaceBorder,
                        color: theme.textPrimary,
                      }}
                    >
                      <Icon className="w-3 h-3 text-purple-400" />
                      <span>{item.title}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] opacity-70" style={{ color: theme.textSecondary }}>
                      <span>{isUser ? (currentUser ? currentUser.split('@')[0] : 'You') : 'Study Space AI'}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`relative group max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 shadow-sm text-xs ${
                        isUser
                          ? 'rounded-tr-xs text-white'
                          : 'rounded-tl-xs border'
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
                    <span className="font-semibold">Study Space AI is thinking...</span>
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

            {/* Input Bar */}
            <div
              className="p-3 sm:p-4 border-t shrink-0"
              style={{
                backgroundColor: theme.isDark ? 'rgba(28, 23, 42, 0.7)' : 'rgba(245, 242, 253, 0.8)',
                borderColor: theme.surfaceBorder,
              }}
            >
              <div
                className="flex items-end gap-2 p-1.5 rounded-2xl border shadow-inner transition-all focus-within:ring-2 focus-within:ring-[#8E74DB]"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.surfaceBorder,
                }}
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question, request a study roadmap, or search topics..."
                  disabled={isLoading}
                  className="w-full text-xs p-2 bg-transparent resize-none focus:outline-none max-h-28 font-sans leading-relaxed"
                  style={{ color: theme.textPrimary }}
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  aria-label="Send message"
                  className="p-2.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: inputMessage.trim() ? '#8E74DB' : '#302747',
                    color: '#FFF9F0',
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 px-1 text-[10px]" style={{ color: theme.textMuted }}>
                <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
                <span>Powered by Gemini 3.8</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Trigger Button - Positioned Directly Above Feedback Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="AI Study Assistant"
          className="pointer-events-auto group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl backdrop-blur-2xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#8E74DB]"
          style={{
            backgroundColor: theme.isDark ? 'rgba(32, 26, 48, 0.40)' : 'rgba(48, 39, 71, 0.35)',
            color: theme.isDark ? '#FFF9F0' : '#302747',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            border: theme.isDark
              ? '1.5px solid rgba(220, 209, 250, 0.35)'
              : '1.5px solid rgba(142, 116, 219, 0.45)',
            boxShadow: theme.isDark
              ? '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 8px 32px 0 rgba(48, 39, 71, 0.15), inset 0 1px 2px 0 rgba(255, 255, 255, 0.9), 0 0 0 1px rgba(142, 116, 219, 0.15)',
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:rotate-12 backdrop-blur-md shadow-xs"
            style={{
              background: 'linear-gradient(135deg, #8E74DB 0%, #4C3A7A 100%)',
              color: '#FFF9F0',
              border: '1px solid rgba(255, 255, 255, 0.45)',
            }}
          >
            {isOpen ? <X className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 animate-pulse" />}
          </div>
          <span className="font-extrabold text-xs sm:text-sm tracking-tight drop-shadow-xs">AI Assistant</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
          </span>
        </button>
      </div>

      {/* Supabase & Gemini Connectivity Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md p-6 rounded-3xl shadow-2xl border backdrop-blur-xl animate-in zoom-in-95"
            style={{
              backgroundColor: theme.cardBg,
              borderColor: theme.surfaceBorder,
              color: theme.textPrimary,
            }}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b" style={{ borderColor: theme.surfaceBorder }}>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-500" />
                <h3 className="font-extrabold text-base">Backend & Cloud Integration</h3>
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
              {/* Gemini AI Status */}
              <div className="p-3 rounded-2xl border flex items-start gap-3" style={{ borderColor: theme.surfaceBorder }}>
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Google Gemini 3.8</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400">
                      Server-Side Active
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-75" style={{ color: theme.textSecondary }}>
                    Chat calls run via server-side `@google/genai` proxy. Your API key remains secure and is never exposed to the client.
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
                    <span className="font-bold text-sm">Supabase Database</span>
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
                  <span>How to connect your existing Supabase project:</span>
                </p>
                <ol className="list-decimal pl-4 space-y-1 opacity-80">
                  <li>In your Supabase project, run the provided <code>supabase-schema.sql</code> script in the SQL editor.</li>
                  <li>Copy your <strong>Project URL</strong> and <strong>anon public API key</strong> from Settings &gt; API.</li>
                  <li>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your environment variables.</li>
                  <li>Student data is protected by Row Level Security (RLS) so each user only accesses their own records.</li>
                </ol>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t flex justify-end" style={{ borderColor: theme.surfaceBorder }}>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer transition-all"
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
