import type { DocumentChunk } from './ragEngine.ts';

export interface SeedResourceData {
  id: string;
  title: string;
  fileName: string;
  subject: string;
  format: string;
  author: string;
  isPublic: boolean;
  ownerEmail?: string;
  topics: string[];
  pages: { pageNumber: number; text: string }[];
}

// Clean dataset: No sample or seeded documents in RAG knowledge store
export const SEED_RESOURCES_DATA: SeedResourceData[] = [];

/**
 * Initializes knowledge base with user documents only (starts empty)
 */
export function initializeSeedKnowledgeBase(): DocumentChunk[] {
  return [];
}
