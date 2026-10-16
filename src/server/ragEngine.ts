import { GoogleGenAI } from '@google/genai';
import JSZip from 'jszip';

// Dynamic import of pdf-parse v2 to handle both ESM and CJS environments safely
let PDFParseClass: any = null;
async function getPDFParser() {
  if (!PDFParseClass) {
    try {
      const pdfModule = (await import('pdf-parse')) as any;
      PDFParseClass = pdfModule.PDFParse || pdfModule.default?.PDFParse || pdfModule.default;
    } catch (e) {
      console.warn('Could not load pdf-parse:', e);
    }
  }
  return PDFParseClass;
}

export interface DocumentChunk {
  id: string;
  resourceId: string;
  title: string;
  subject: string;
  format: string;
  fileName: string;
  pageNumber?: number;
  chunkIndex: number;
  content: string;
  isPublic: boolean;
  ownerEmail?: string;
  topics: string[];
  embedding?: number[];
  storagePath?: string;
  updatedAt: string;
}

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

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
  matchType: 'semantic' | 'keyword' | 'hybrid';
}

// In-Memory Vector & Inverted Document Store
class RagKnowledgeStore {
  private chunks: Map<string, DocumentChunk> = new Map();
  private isInitialized = false;

  public getAllChunks(): DocumentChunk[] {
    return Array.from(this.chunks.values());
  }

  public getChunkCount(): number {
    return this.chunks.size;
  }

  public getResourceCount(): number {
    const resourceIds = new Set<string>();
    for (const chunk of this.chunks.values()) {
      resourceIds.add(chunk.resourceId);
    }
    return resourceIds.size;
  }

  public addChunks(chunks: DocumentChunk[]): void {
    for (const c of chunks) {
      this.chunks.set(c.id, c);
    }
  }

  public removeChunksByResourceId(resourceId: string): number {
    let count = 0;
    for (const [id, chunk] of this.chunks.entries()) {
      if (chunk.resourceId === resourceId) {
        this.chunks.delete(id);
        count++;
      }
    }
    return count;
  }

  public clear(): void {
    this.chunks.clear();
  }

  public markInitialized(): void {
    this.isInitialized = true;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

export const ragStore = new RagKnowledgeStore();

/**
 * Clean and normalize text
 */
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ \u00A0]+/g, ' ')
    .trim();
}

/**
 * Text extractor supporting PDF, DOCX, PPTX, CSV/TXT/MD, and multimodal OCR images
 */
export async function extractTextFromContent(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
  ai: GoogleGenAI | null
): Promise<{ text: string; pages: { pageNumber: number; text: string }[] }> {
  const pages: { pageNumber: number; text: string }[] = [];
  const lowerName = fileName.toLowerCase();

  // 1. PDF Documents
  if (mimeType.includes('pdf') || lowerName.endsWith('.pdf')) {
    try {
      const PDFClass = await getPDFParser();
      if (PDFClass) {
        const parser = new PDFClass({ data: buffer });
        const textResult = await parser.getText();
        const extracted = cleanText(textResult?.text || '');

        if (extracted.length > 50) {
          // If pages are available, attempt page-by-page mapping
          if (textResult?.total && textResult.total > 0) {
            for (let p = 1; p <= textResult.total; p++) {
              try {
                const pageText = await parser.getPageText(p);
                const pageClean = cleanText(pageText?.text || '');
                if (pageClean) {
                  pages.push({ pageNumber: p, text: pageClean });
                }
              } catch {
                // fallback to general text
              }
            }
          }
          if (pages.length === 0) {
            pages.push({ pageNumber: 1, text: extracted });
          }
          return { text: extracted, pages };
        }
      }
    } catch (pdfErr) {
      console.warn(`PDF parse error for ${fileName}:`, pdfErr);
    }

    // Fallback: If native PDF parsing returned minimal text (e.g. Scanned PDF), run OCR via Gemini
    if (ai) {
      try {
        console.log(`Running Gemini Multimodal OCR on scanned PDF: ${fileName}`);
        const base64Data = buffer.toString('base64');
        const ocrResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'application/pdf',
              },
            },
            {
              text: 'Extract and transcribe all readable academic text, headings, formulas, and diagrams from this document verbatim. Mark pages with "--- Page X ---" headers.',
            },
          ],
        });
        const ocrText = cleanText(ocrResponse.text || '');
        if (ocrText) {
          // Parse page markers
          const pageSplits = ocrText.split(/--- Page (\d+) ---/i);
          if (pageSplits.length > 1) {
            for (let i = 1; i < pageSplits.length; i += 2) {
              const pNum = parseInt(pageSplits[i], 10) || 1;
              const pContent = cleanText(pageSplits[i + 1] || '');
              if (pContent) pages.push({ pageNumber: pNum, text: pContent });
            }
          } else {
            pages.push({ pageNumber: 1, text: ocrText });
          }
          return { text: ocrText, pages };
        }
      } catch (ocrErr) {
        console.warn(`Gemini OCR failed for PDF ${fileName}:`, ocrErr);
      }
    }
  }

  // 2. Word Documents (.docx)
  if (
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('msword') ||
    lowerName.endsWith('.docx')
  ) {
    try {
      const zip = await JSZip.loadAsync(buffer);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        // Extract all text inside <w:t> tags
        const textMatches = docXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
        const extracted = textMatches
          .map((tag) => tag.replace(/<[^>]+>/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (extracted) {
          pages.push({ pageNumber: 1, text: extracted });
          return { text: extracted, pages };
        }
      }
    } catch (docxErr) {
      console.warn(`DOCX parse error for ${fileName}:`, docxErr);
    }
  }

  // 3. Presentation Slides (.pptx)
  if (
    mimeType.includes('presentationml') ||
    mimeType.includes('powerpoint') ||
    lowerName.endsWith('.pptx')
  ) {
    try {
      const zip = await JSZip.loadAsync(buffer);
      const slideFiles = Object.keys(zip.files).filter((name) =>
        name.match(/^ppt\/slides\/slide\d+\.xml$/)
      );

      // Sort slides by number
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)![0], 10);
        const numB = parseInt(b.match(/\d+/)![0], 10);
        return numA - numB;
      });

      let fullSlidesText = '';
      for (const [idx, slidePath] of slideFiles.entries()) {
        const slideXml = await zip.file(slidePath)?.async('text');
        if (slideXml) {
          const textMatches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
          const slideText = textMatches
            .map((tag) => tag.replace(/<[^>]+>/g, ''))
            .join(' ')
            .trim();
          if (slideText) {
            pages.push({ pageNumber: idx + 1, text: slideText });
            fullSlidesText += `\n[Slide ${idx + 1}] ${slideText}`;
          }
        }
      }

      if (fullSlidesText) {
        return { text: cleanText(fullSlidesText), pages };
      }
    } catch (pptxErr) {
      console.warn(`PPTX parse error for ${fileName}:`, pptxErr);
    }
  }

  // 4. Photos / Whiteboard Images (OCR via Gemini Vision)
  if (mimeType.startsWith('image/') || lowerName.match(/\.(png|jpe?g|webp)$/)) {
    if (ai) {
      try {
        console.log(`Running Gemini Vision OCR on image: ${fileName}`);
        const base64Data = buffer.toString('base64');
        const imgMime = mimeType || (lowerName.endsWith('.png') ? 'image/png' : 'image/jpeg');
        const ocrResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              inlineData: {
                data: base64Data,
                mimeType: imgMime,
              },
            },
            {
              text: 'Transcribe all handwritten formulas, diagrams, labels, and text from this student note / whiteboard photo accurately.',
            },
          ],
        });
        const ocrText = cleanText(ocrResponse.text || '');
        if (ocrText) {
          pages.push({ pageNumber: 1, text: ocrText });
          return { text: ocrText, pages };
        }
      } catch (imgErr) {
        console.warn(`Gemini Vision OCR failed for ${fileName}:`, imgErr);
      }
    }
  }

  // 5. Plain Text, Markdown, CSV, Spreadsheet Data
  try {
    const rawText = buffer.toString('utf-8');
    const cleaned = cleanText(rawText);
    if (cleaned.length > 0) {
      pages.push({ pageNumber: 1, text: cleaned });
      return { text: cleaned, pages };
    }
  } catch {
    // ignore
  }

  return { text: '', pages: [] };
}

/**
 * Split text into overlapping chunks for precise semantic and keyword retrieval
 */
export function splitIntoChunks(
  text: string,
  meta: {
    resourceId: string;
    title: string;
    subject: string;
    format: string;
    fileName: string;
    isPublic: boolean;
    ownerEmail?: string;
    topics: string[];
    storagePath?: string;
  },
  pages?: { pageNumber: number; text: string }[],
  targetChunkWords = 130,
  overlapWords = 35
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  let chunkCounter = 0;

  // If page-level text is provided, chunk each page with page number preservation
  if (pages && pages.length > 0) {
    for (const page of pages) {
      const pageWords = page.text.split(/\s+/).filter(Boolean);
      if (pageWords.length === 0) continue;

      if (pageWords.length <= targetChunkWords) {
        chunks.push({
          id: `${meta.resourceId}-p${page.pageNumber}-c${chunkCounter++}`,
          resourceId: meta.resourceId,
          title: meta.title,
          subject: meta.subject,
          format: meta.format,
          fileName: meta.fileName,
          pageNumber: page.pageNumber,
          chunkIndex: chunkCounter,
          content: pageWords.join(' '),
          isPublic: meta.isPublic,
          ownerEmail: meta.ownerEmail,
          topics: meta.topics,
          storagePath: meta.storagePath,
          updatedAt: new Date().toISOString(),
        });
      } else {
        let i = 0;
        while (i < pageWords.length) {
          const slice = pageWords.slice(i, i + targetChunkWords);
          chunks.push({
            id: `${meta.resourceId}-p${page.pageNumber}-c${chunkCounter++}`,
            resourceId: meta.resourceId,
            title: meta.title,
            subject: meta.subject,
            format: meta.format,
            fileName: meta.fileName,
            pageNumber: page.pageNumber,
            chunkIndex: chunkCounter,
            content: slice.join(' '),
            isPublic: meta.isPublic,
            ownerEmail: meta.ownerEmail,
            topics: meta.topics,
            storagePath: meta.storagePath,
            updatedAt: new Date().toISOString(),
          });
          i += targetChunkWords - overlapWords;
        }
      }
    }
    return chunks;
  }

  // Fallback chunking on general text
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= targetChunkWords) {
    chunks.push({
      id: `${meta.resourceId}-c0`,
      resourceId: meta.resourceId,
      title: meta.title,
      subject: meta.subject,
      format: meta.format,
      fileName: meta.fileName,
      pageNumber: 1,
      chunkIndex: 0,
      content: words.join(' '),
      isPublic: meta.isPublic,
      ownerEmail: meta.ownerEmail,
      topics: meta.topics,
      storagePath: meta.storagePath,
      updatedAt: new Date().toISOString(),
    });
    return chunks;
  }

  let i = 0;
  while (i < words.length) {
    const slice = words.slice(i, i + targetChunkWords);
    chunks.push({
      id: `${meta.resourceId}-c${chunkCounter++}`,
      resourceId: meta.resourceId,
      title: meta.title,
      subject: meta.subject,
      format: meta.format,
      fileName: meta.fileName,
      pageNumber: Math.floor(i / 250) + 1,
      chunkIndex: chunkCounter,
      content: slice.join(' '),
      isPublic: meta.isPublic,
      ownerEmail: meta.ownerEmail,
      topics: meta.topics,
      storagePath: meta.storagePath,
      updatedAt: new Date().toISOString(),
    });
    i += targetChunkWords - overlapWords;
  }

  return chunks;
}

/**
 * Cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate embedding using Gemini embedding model with error handling
 */
export async function getEmbedding(text: string, ai: GoogleGenAI | null): Promise<number[] | null> {
  if (!ai || !text.trim()) return null;
  try {
    const res = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: text.slice(0, 2048),
    });
    const embedding = (res as any).embedding?.values || (res as any).embeddings?.[0]?.values;
    if (Array.isArray(embedding)) {
      return embedding;
    }
  } catch (err: unknown) {
    const error = err as Error;
    // Log error cleanly without crashing
    console.warn('Gemini embedding warning:', error.message);
  }
  return null;
}

/**
 * High-precision lexical & BM25-style keyword relevance calculator
 */
export function calculateKeywordScore(query: string, chunk: DocumentChunk): number {
  const cleanQ = query.toLowerCase().trim();
  const qTokens = cleanQ.split(/[^a-z0-9_]+/).filter((t) => t.length > 2);
  if (qTokens.length === 0) return 0;

  const contentLower = chunk.content.toLowerCase();
  const titleLower = chunk.title.toLowerCase();
  const subjectLower = chunk.subject.toLowerCase();
  const topicsLower = chunk.topics.map((t) => t.toLowerCase()).join(' ');

  let score = 0;

  // Exact phrase match boost
  if (contentLower.includes(cleanQ)) {
    score += 0.45;
  }
  if (titleLower.includes(cleanQ)) {
    score += 0.55;
  }

  // Token matches
  let matchedTokens = 0;
  for (const token of qTokens) {
    let tokenFound = false;
    if (titleLower.includes(token)) {
      score += 0.25;
      tokenFound = true;
    }
    if (topicsLower.includes(token)) {
      score += 0.2;
      tokenFound = true;
    }
    if (subjectLower.includes(token)) {
      score += 0.15;
      tokenFound = true;
    }
    if (contentLower.includes(token)) {
      // count occurrences for term frequency
      const occurrences = (contentLower.match(new RegExp(`\\b${token}`, 'g')) || []).length;
      score += Math.min(0.2, occurrences * 0.05);
      tokenFound = true;
    }
    if (tokenFound) matchedTokens++;
  }

  const tokenCoverage = matchedTokens / qTokens.length;
  score = score * (0.5 + 0.5 * tokenCoverage);

  return Math.min(1.0, score);
}

/**
 * Check if the user is authorized to read a chunk:
 * - Public chunk: accessible to everyone (authenticated or guest)
 * - Private chunk: accessible ONLY if ownerEmail matches userEmail
 */
export function isUserAuthorized(chunk: DocumentChunk, userEmail?: string | null): boolean {
  if (chunk.isPublic) return true;
  if (!userEmail) return false;
  return Boolean(chunk.ownerEmail && chunk.ownerEmail.trim().toLowerCase() === userEmail.trim().toLowerCase());
}

/**
 * Hybrid retrieval engine combining semantic embeddings and keyword matching
 * filtered strictly by multi-user authorization.
 */
export async function searchKnowledgeBase(
  query: string,
  userEmail: string | null | undefined,
  ai: GoogleGenAI | null,
  limit = 5
): Promise<RetrievalResult[]> {
  const allChunks = ragStore.getAllChunks();
  // Multi-user security filter: Filter out unauthorized private resources
  const authorizedChunks = allChunks.filter((chunk) => isUserAuthorized(chunk, userEmail));

  if (authorizedChunks.length === 0) {
    return [];
  }

  // Generate query embedding if Gemini is available
  let queryEmbedding: number[] | null = null;
  if (ai) {
    try {
      queryEmbedding = await getEmbedding(query, ai);
    } catch {
      queryEmbedding = null;
    }
  }

  const results: RetrievalResult[] = [];

  for (const chunk of authorizedChunks) {
    let semanticScore = 0;
    if (queryEmbedding && chunk.embedding && chunk.embedding.length > 0) {
      semanticScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    }

    const keywordScore = calculateKeywordScore(query, chunk);

    let finalScore = 0;
    let matchType: 'semantic' | 'keyword' | 'hybrid' = 'keyword';

    if (queryEmbedding && chunk.embedding && chunk.embedding.length > 0) {
      // If there is zero keyword overlap and low semantic score, exclude unrelated material
      if (keywordScore === 0 && semanticScore < 0.62) {
        continue;
      }
      finalScore = semanticScore * 0.65 + keywordScore * 0.35;
      matchType = 'hybrid';
    } else {
      finalScore = keywordScore;
      matchType = 'keyword';
    }

    // Include only if it meets relevance threshold
    if (finalScore >= 0.36) {
      results.push({
        chunk,
        score: finalScore,
        matchType,
      });
    }
  }

  // Sort descending by relevance score
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/**
 * Converts a base64 or DataURL string to Buffer
 */
export function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  if (dataUrl.startsWith('data:')) {
    const commaIdx = dataUrl.indexOf(',');
    const header = dataUrl.substring(5, commaIdx);
    const mimeType = header.split(';')[0] || 'application/octet-stream';
    const base64Str = dataUrl.substring(commaIdx + 1);
    return {
      buffer: Buffer.from(base64Str, 'base64'),
      mimeType,
    };
  }
  return {
    buffer: Buffer.from(dataUrl, 'utf-8'),
    mimeType: 'text/plain',
  };
}
