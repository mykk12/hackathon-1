import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import {
  ragStore,
  searchKnowledgeBase,
  getEmbedding,
  splitIntoChunks,
  extractTextFromContent,
  dataUrlToBuffer,
  type DocumentChunk,
  type SourceCitation,
} from './src/server/ragEngine.ts';
import { initializeSeedKnowledgeBase } from './src/server/seedMaterials.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

let supabaseServer: SupabaseClient | null = null;
if (supabaseUrl && (supabaseServiceKey || supabaseAnonKey)) {
  try {
    supabaseServer = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey!);
  } catch (err) {
    console.warn('Could not initialize Supabase server client:', err);
  }
}

// -------------------------------------------------------------
// Initialize Seed Knowledge Base & Background Embeddings
// -------------------------------------------------------------
async function initKnowledgeBase() {
  try {
    const seedChunks = initializeSeedKnowledgeBase();
    ragStore.addChunks(seedChunks);
    ragStore.markInitialized();
    console.log(`[RAG Engine] Initialized knowledge store with ${seedChunks.length} chunks from ${ragStore.getResourceCount()} seed academic resources.`);

    // Asynchronously generate embeddings for seed chunks in background (non-blocking)
    if (ai) {
      setTimeout(async () => {
        console.log('[RAG Engine] Generating embeddings for seed chunks in background...');
        let embeddedCount = 0;
        for (const chunk of ragStore.getAllChunks()) {
          if (!chunk.embedding) {
            try {
              const embedding = await getEmbedding(chunk.content, ai);
              if (embedding) {
                chunk.embedding = embedding;
                embeddedCount++;
              }
              // Respect API rate limits with small pauses
              await new Promise((resolve) => setTimeout(resolve, 80));
            } catch (e) {
              // Gracefully continue
            }
          }
        }
        console.log(`[RAG Engine] Background embedding generation completed (${embeddedCount} chunks).`);
      }, 1000);
    }
  } catch (err) {
    console.error('[RAG Engine] Failed to initialize seed knowledge base:', err);
  }
}

initKnowledgeBase();

// System Instruction for Study Space AI
const STUDY_SPACE_SYSTEM_INSTRUCTION = `You are Study Space AI, a precision academic assistant integrated natively into Study Space.

CRITICAL DIRECTIVES: COMPACT, PRECISE, ASKED OUTPUTS ONLY (STRICT):
1. COMPACT & DIRECT: Give compact and asked outputs ONLY. Answer strictly what was asked, nothing extra.
2. ZERO FLUFF OR CHIT-CHAT: Do NOT include greetings (e.g., no "Hello Mayank!", no "Welcome back!"), pleasantries, intros ("Certainly, I can explain that..."), or wrap-up conversation ("I hope this helps!", "Let me know if you need more..."). Jump immediately into the direct answer.
3. HIGH ACADEMIC DENSITY: Use crisp bullet points, exact formulas, precise definitions, code snippets, or concise tables. Eliminate filler sentences, lengthy essays, or unprompted historical background.
4. EXACT CITATIONS: If referencing study materials, cite the document title and page number succinctly (e.g. [Source 1, Page 2]).
5. NO UNSOLICITED ADVICE OR ACTION TAGS: Do NOT offer unprompted study schedules, unrelated tips, or platform tours unless the student explicitly asks for them.
`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!apiKey,
    supabaseConfigured: !!(supabaseUrl && supabaseAnonKey),
    ragStore: {
      totalChunks: ragStore.getChunkCount(),
      totalResources: ragStore.getResourceCount(),
      isInitialized: ragStore.getIsInitialized(),
    },
    timestamp: new Date().toISOString(),
  });
});

// Supabase configuration status check (safe - no secrets exposed)
app.get('/api/supabase/status', (req, res) => {
  res.json({
    configured: !!(supabaseUrl && supabaseAnonKey),
    hasServiceKey: !!supabaseServiceKey,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 16)}...` : null,
    message:
      supabaseUrl && supabaseAnonKey
        ? 'Supabase connection is configured and ready.'
        : 'Supabase is not yet connected. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to enable live cloud persistence.',
  });
});

// -------------------------------------------------------------
// RAG Knowledge Base Management API
// -------------------------------------------------------------

// Get RAG Knowledge Base Stats
app.get('/api/rag/stats', (req, res) => {
  res.json({
    totalChunks: ragStore.getChunkCount(),
    totalResources: ragStore.getResourceCount(),
    isInitialized: ragStore.getIsInitialized(),
  });
});

// Index or Re-index an Academic Resource (Handles PDF, DOCX, PPTX, Images, Text)
app.post('/api/rag/index-resource', async (req, res) => {
  try {
    const { resource, userEmail } = req.body;
    if (!resource || !resource.id || !resource.title) {
      return res.status(400).json({ error: 'Valid academic resource with id and title is required.' });
    }

    // Remove any previous chunks for this resource to avoid stale duplicates
    ragStore.removeChunksByResourceId(resource.id);

    let extractedText = resource.summary || '';
    let extractedPages: { pageNumber: number; text: string }[] = [];

    // If actual file data is provided (base64 dataURL or text)
    if (resource.fileData) {
      const { buffer, mimeType } = dataUrlToBuffer(resource.fileData);
      const extraction = await extractTextFromContent(
        buffer,
        resource.fileMimeType || mimeType,
        resource.fileName || `${resource.title}.${resource.format?.toLowerCase() || 'pdf'}`,
        ai
      );
      if (extraction.text && extraction.text.length > 0) {
        extractedText = extraction.text;
        extractedPages = extraction.pages;
      }
    }

    // If no document body extracted, combine title, summary, topics
    if (!extractedText || extractedText.trim().length === 0) {
      extractedText = `${resource.title}\nSubject: ${resource.subject}\nAuthor: ${resource.author || 'Peer'}\nSummary: ${resource.summary || ''}\nTopics: ${(resource.topics || []).join(', ')}`;
      extractedPages = [{ pageNumber: 1, text: extractedText }];
    }

    // Split into overlapping chunks
    const chunks = splitIntoChunks(
      extractedText,
      {
        resourceId: resource.id,
        title: resource.title,
        subject: resource.subject,
        format: resource.format || 'PDF',
        fileName: resource.fileName || `${resource.title}.pdf`,
        isPublic: Boolean(resource.isPublic),
        ownerEmail: userEmail || resource.ownerEmail || undefined,
        topics: Array.isArray(resource.topics) ? resource.topics : [resource.subject],
      },
      extractedPages
    );

    // Generate embeddings for the new chunks
    if (ai) {
      for (const chunk of chunks) {
        try {
          const emb = await getEmbedding(chunk.content, ai);
          if (emb) chunk.embedding = emb;
        } catch {
          // fallback to keyword indexing
        }
      }
    }

    ragStore.addChunks(chunks);

    // Optional Supabase sync if server client is available
    if (supabaseServer) {
      try {
        const rows = chunks.map((c) => ({
          id: c.id,
          resource_id: c.resourceId,
          title: c.title,
          subject: c.subject,
          format: c.format,
          file_name: c.fileName,
          page_number: c.pageNumber || 1,
          chunk_index: c.chunkIndex,
          content: c.content,
          is_public: c.isPublic,
          owner_email: c.ownerEmail || null,
          topics: c.topics,
        }));
        await supabaseServer.from('resource_chunks').upsert(rows);
      } catch (sbErr) {
        console.warn('Supabase sync warning for chunks:', sbErr);
      }
    }

    res.json({
      success: true,
      resourceId: resource.id,
      chunksCreated: chunks.length,
      totalChunksInStore: ragStore.getChunkCount(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error indexing resource:', error);
    res.status(500).json({ error: error.message || 'Failed to index resource.' });
  }
});

// Delete Resource from RAG Knowledge Base
app.delete('/api/rag/resource/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const removedCount = ragStore.removeChunksByResourceId(id);

    if (supabaseServer) {
      try {
        await supabaseServer.from('resource_chunks').delete().eq('resource_id', id);
      } catch {
        // ignore
      }
    }

    res.json({
      success: true,
      removedChunks: removedCount,
      totalChunksInStore: ragStore.getChunkCount(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message || 'Failed to remove resource.' });
  }
});

// Re-index all seed materials
app.post('/api/rag/reindex-all', async (req, res) => {
  try {
    ragStore.clear();
    await initKnowledgeBase();
    res.json({
      success: true,
      message: 'All seed resources successfully re-indexed.',
      totalChunks: ragStore.getChunkCount(),
      totalResources: ragStore.getResourceCount(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// AI Chat completion with RAG & Strict Website Grounding
// -------------------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!apiKey) {
      return res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured on the server. Please attach your Gemini API key in the Settings > Secrets panel.',
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

    const currentUser = context?.currentUser || null;

    // Get the latest user query from the message thread
    const lastUserMessage = [...messages].reverse().find((m: { role: string; content: string }) => m.role === 'user');
    const userQuery = lastUserMessage?.content || '';

    // Perform multi-user authorized hybrid search against StudySpace library
    const retrievedResults = await searchKnowledgeBase(userQuery, currentUser, ai, 5);

    // Format citations to return to frontend
    const citations: SourceCitation[] = retrievedResults.map((r) => ({
      id: r.chunk.id,
      resourceId: r.chunk.resourceId,
      title: r.chunk.title,
      subject: r.chunk.subject,
      format: r.chunk.format,
      fileName: r.chunk.fileName,
      pageNumber: r.chunk.pageNumber,
      snippet: r.chunk.content.length > 200 ? `${r.chunk.content.slice(0, 200)}...` : r.chunk.content,
      score: Math.round(r.score * 100) / 100,
      isPublic: r.chunk.isPublic,
      ownerEmail: r.chunk.ownerEmail,
    }));

    const hasWebsiteSources = retrievedResults.length > 0;

    // Construct grounded context block
    let ragGroundingBlock = '';
    if (hasWebsiteSources) {
      ragGroundingBlock = `\n\n------------------------------------------------------------
RELEVANT AUTHORIZED STUDY MATERIALS RETRIEVED FROM STUDYSPACE:
${retrievedResults
  .map(
    (r, idx) =>
      `[Source ${idx + 1}: "${r.chunk.title}" | File: ${r.chunk.fileName} | Subject: ${r.chunk.subject}${
        r.chunk.pageNumber ? ` | Page: ${r.chunk.pageNumber}` : ''
      }]\n${r.chunk.content}`
  )
  .join('\n\n')}
------------------------------------------------------------
STRICT GROUNDING INSTRUCTIONS:
1. Answer the student's question directly, compactly, and authoritatively based ONLY on the retrieved StudySpace materials above.
2. Provide ONLY what was asked—no extra introductory or closing remarks.
3. Explicitly reference which source document and page number the information comes from using concise tags like "[Source 1]" or title and page.
4. If the retrieved passages do not fully cover the question, state what is in the documents concisely, then provide the direct academic answer under "🧠 General Academic Knowledge:" without fluff.
5. Never fabricate citations.`;
    } else {
      ragGroundingBlock = `\n\n------------------------------------------------------------
SEARCH RESULT IN STUDYSPACE LIBRARY:
No matching study materials were found in the student's authorized StudySpace library for this query.

STRICT INSTRUCTION:
1. State in one short line: "⚠️ **Library Search:** No matching study material found in your StudySpace library."
2. Immediately answer the question directly, compactly, and authoritatively under:
   "🧠 **General Academic Knowledge:**"
3. Do NOT add conversational preamble or wrap-up filler. Give precise, asked outputs only.`;
    }

    const allUserData = context?.allUserData;
    let userEntriesBlock = '';
    if (allUserData) {
      const taskEntries = Array.isArray(allUserData.tasks) && allUserData.tasks.length > 0
        ? allUserData.tasks.map((t: any, idx: number) =>
            `   ${idx + 1}. [${t.completed ? 'COMPLETED' : 'ACTIVE / PENDING'}] "${t.title}" | Subject: ${t.subject} | Due: ${t.dueDate} | Duration: ${t.durationMinutes}m | Priority: ${t.priority?.toUpperCase() || 'MEDIUM'}`
          ).join('\n')
        : '   (No tasks recorded)';

      const uploadEntries = Array.isArray(allUserData.uploadedResources) && allUserData.uploadedResources.length > 0
        ? allUserData.uploadedResources.map((u: any, idx: number) =>
            `   ${idx + 1}. "${u.title}" | File: ${u.fileName || 'note'} | Format: ${u.format} | Subject: ${u.subject} | Visibility: ${u.isPublic ? 'Public' : 'Private'}\n      Summary: ${u.summary || 'N/A'}\n      Topics: ${(u.topics || []).join(', ')}`
          ).join('\n')
        : '   (No uploaded materials recorded)';

      const pinnedEntries = Array.isArray(allUserData.pinnedResources) && allUserData.pinnedResources.length > 0
        ? allUserData.pinnedResources.map((p: any, idx: number) =>
            `   ${idx + 1}. [PINNED / SAVED] "${p.title}" | Subject: ${p.subject} | Format: ${p.format} | Summary: ${p.summary}`
          ).join('\n')
        : '   (No pinned items recorded)';

      const presetEntries = Array.isArray(allUserData.pinnedPresets) && allUserData.pinnedPresets.length > 0
        ? allUserData.pinnedPresets.map((pr: any) => `"${pr.label}" (${pr.minutes} mins)`).join(', ')
        : '5 mins, 15 mins, 30 mins, 60 mins';

      userEntriesBlock = `\n------------------------------------------------------------
USER'S COMPLETE AUTHORIZED ENTRIES & ACCESS PERMISSION GRANTED:
You have FULL, UNRESTRICTED PERMISSION to access, read, reference, schedule, and synthesize every detail of the user's personal entries below:

📋 1. USER'S STUDY TASKS (${allUserData.tasks?.length || 0} entries):
${taskEntries}

📁 2. USER'S UPLOADED FILES & STUDY MATERIALS (${allUserData.uploadedResources?.length || 0} entries):
${uploadEntries}

📌 3. USER'S PINNED & BOOKMARKED STUDY MATERIALS (${allUserData.pinnedResources?.length || 0} entries):
${pinnedEntries}

⏱️ 4. PINNED FOCUS TIMER PRESETS:
   ${presetEntries}
------------------------------------------------------------
PERMISSION INSTRUCTION:
Whenever the student asks about their tasks, schedule, uploaded notes, or pinned items, leverage these exact entries to provide direct, personalized, and actionable assistance with accurate titles, deadlines, priorities, and file details.`;
    }

    // Context enrichment from frontend state
    const contextualSystemPrompt = `${STUDY_SPACE_SYSTEM_INSTRUCTION}

CURRENT USER CONTEXT:
- Signed in as: ${currentUser || 'Guest (unauthenticated)'}
- Active Page: ${context?.currentPage || 'home'}
- Total Saved Resources: ${context?.savedCount ?? 0}
- Active Study Tasks: ${context?.tasksCount ?? 0}
${userEntriesBlock}
${ragGroundingBlock}`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Call Gemini with retry and fallback across 503 and 429 errors
    let replyText = '';
    let response: any = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const targetModel = attempts === 3 ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';
        response = await ai.models.generateContent({
          model: targetModel,
          contents,
          config: {
            systemInstruction: contextualSystemPrompt,
            temperature: 0.2,
          },
        });
        replyText = response?.text || '';
        break;
      } catch (apiErr: unknown) {
        const error = apiErr as Error;
        const isQuotaOrTransient =
          error.message?.includes('429') ||
          error.message?.includes('503') ||
          error.message?.includes('RESOURCE_EXHAUSTED') ||
          error.message?.includes('UNAVAILABLE') ||
          error.message?.includes('high demand') ||
          error.message?.includes('overloaded');

        if (isQuotaOrTransient && attempts < maxAttempts) {
          const waitTime = attempts * 1500;
          console.warn(`Gemini API busy (attempt ${attempts}), retrying after ${waitTime}ms...`);
          await new Promise((r) => setTimeout(r, waitTime));
        } else if (hasWebsiteSources) {
          // If Gemini service is overloaded, synthesize a direct fallback summary from retrieved materials
          replyText = `📚 **Retrieved from StudySpace Library (${retrievedResults.length} sources):**\n\n` +
            retrievedResults.map((r, i) => `**[Source ${i + 1}] ${r.chunk.title}** (${r.chunk.fileName}${r.chunk.pageNumber ? `, Page ${r.chunk.pageNumber}` : ''}):\n> ${r.chunk.content}`).join('\n\n') +
            `\n\n*(Note: Gemini cloud model is currently experiencing high demand; above passages were extracted directly from your verified library files.)*`;
          break;
        } else {
          replyText = `⚠️ **Library Search:** No matching study material was found in your StudySpace library for this query.\n\n*(Note: Gemini is currently experiencing high demand; please retry in a moment for general knowledge.)*`;
          break;
        }
      }
    }

    if (!replyText) {
      replyText = "I'm sorry, I couldn't generate a response. Please try asking again.";
    }

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
      citations,
      hasWebsiteSources,
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
