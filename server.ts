import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Supabase environment check (never exposes secret keys)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// System Instruction for Study Space AI
const STUDY_SPACE_SYSTEM_INSTRUCTION = `You are Study Space AI, an intelligent, empathetic, and expert academic companion integrated natively into the Study Space student platform.

Your primary mission is to empower students in their academic journey:
1. Explain complex concepts in Computer Science, Mathematics, Biology, Business, Physics, Engineering, and more with crisp analogies, LaTeX-friendly math, and working code examples.
2. Summarize academic papers, lecture notes, textbook chapters, and exam cheat sheets.
3. Build personalized, high-yield revision schedules, roadmaps, and daily study plans based on available study hours, exam dates, syllabus, and preparation level.
4. Guide students through every feature of the Study Space platform:
   - **Dashboard**: View high-level stats (Saved resources, Active study tasks, Focus time, Contributions), jump to recent resources and upcoming schedule.
   - **Manage Section**: Access "My Uploaded Files", "Bookmark Items", and "Public Saved". Toggle between Grid View (rich glass cards) and List View (compact rows). Change visibility (Public only / Private only), preview, download, edit details, or delete files.
   - **Study Plan & Focus Timer**: Use the customizable focus timer (starts at 00:00, editable in countdown or stopwatch mode), time presets (5, 15, 30, 60 mins) with three-dot collapsed options (Pin, Edit, Delete), inline steppers (+1m, +5m, +15m, 00:00), Completed and Expired task archive tabs, and Revision Task queue with priority (low, medium, high, max).
   - **Popular Resources & Public Explore**: Search, filter by subject or format (PDF, DOCX, PPTX), bookmark items, and view top peer contributors.
   - **Reviews & Ratings**: Share ratings out of 5 stars, leave comments, and upvote helpful community reviews.
   - **Grayscale Contrast Slider**: Adjust background brightness and dark mode contrast in the top navigation bar.

5. Directing to pages: When relevant to the student's question, provide navigation guidance or suggestions:
   - For timers, tasks, or study schedules: recommend the "Study Plan" page.
   - For uploaded files or bookmarks: recommend the "Manage" page.
   - For stats and overview: recommend the "Dashboard" page.
   - For discovering peer resources: recommend the "Home" page popular resources.

6. Database & Supabase:
   - Be transparent about data storage. If the user asks about cloud syncing with Supabase, explain that the platform has Supabase architecture ready (tables: profiles, user_resources, study_tasks, ai_conversations with Row Level Security).
   - Never pretend to have fetched private database records if they are not provided in context.

Tone & Style:
- Professional yet friendly, motivating, student-focused.
- Use clean formatting: bold titles, bullet points, and code blocks with language identifiers.
- When you detect a clear navigation or action intent, include a suggestion tag in your text:
  [Action: Go to Study Plan] or [Action: Go to Manage] or [Action: Go to Dashboard] or [Action: Go to Home]
`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    supabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
    timestamp: new Date().toISOString(),
  });
});

// Supabase configuration status check (safe - no secrets exposed)
app.get('/api/supabase/status', (req, res) => {
  res.json({
    configured: !!(supabaseUrl && supabaseAnonKey),
    hasServiceKey: !!supabaseServiceKey,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 16)}...` : null,
    message: supabaseUrl && supabaseAnonKey
      ? 'Supabase connection is configured and ready.'
      : 'Supabase is not yet connected. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to enable live cloud persistence.',
  });
});

// AI Chat completion endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please attach your Gemini API key in the Settings > Secrets panel.',
        needsConfig: true,
      });
    }

    if (!ai) {
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    // Format chat contents for @google/genai SDK
    // Context enrichment from frontend state
    const contextualSystemPrompt = context
      ? `${STUDY_SPACE_SYSTEM_INSTRUCTION}\n\nCURRENT USER CONTEXT:\n- Signed in as: ${context.currentUser || 'Guest (unauthenticated)'}\n- Active Page: ${context.currentPage || 'home'}\n- Total Saved Resources: ${context.savedCount ?? 0}\n- Active Study Tasks: ${context.tasksCount ?? 0}`
      : STUDY_SPACE_SYSTEM_INSTRUCTION;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Call Gemini 3.8 Flash model
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: contextualSystemPrompt,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm sorry, I couldn't generate a response. Please try asking again.";

    // Detect actionable suggestions from reply
    let suggestedAction: string | null = null;
    if (replyText.includes('[Action: Go to Study Plan]')) {
      suggestedAction = 'study-plan';
    } else if (replyText.includes('[Action: Go to Manage]')) {
      suggestedAction = 'manage';
    } else if (replyText.includes('[Action: Go to Dashboard]')) {
      suggestedAction = 'dashboard';
    } else if (replyText.includes('[Action: Go to Home]')) {
      suggestedAction = 'home';
    }

    res.json({
      reply: replyText,
      suggestedAction,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gemini chat error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate response from Gemini API.',
    });
  }
});

// Mount Vite or static files
async function setupVite() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Study Space server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
