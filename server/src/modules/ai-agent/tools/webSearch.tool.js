import { GoogleGenAI } from '@google/genai';
import { env } from '../../../config/env.js';
import { logger } from '../../../shared/logger/logger.js';

const GROUNDING_MODELS = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];

export const webSearchTool = {
  type: 'function',
  function: {
    name: 'web_search',
    description:
      'Search the live web for venue prices, contact details, reviews, or new sports facilities not yet in the DB. Use sparingly — prefer search_venues for catalog data.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language search query' },
      },
      required: ['query'],
    },
  },
};

function modelsToTry() {
  const primary = env.GEMINI_MODEL;
  return [...new Set([primary, ...GROUNDING_MODELS])];
}

function extractSources(response) {
  const meta = response?.candidates?.[0]?.groundingMetadata;
  const chunks = meta?.groundingChunks ?? [];
  return chunks
    .map((c) => ({ title: c.web?.title, uri: c.web?.uri }))
    .filter((s) => s.uri);
}

export async function runWebSearch(args) {
  if (!env.GEMINI_API_KEY?.trim()) {
    return { query: args.query, text: '', sources: [], error: 'Web search unavailable (no API key)' };
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  let lastErr;

  for (const model of modelsToTry()) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: args.query }] }],
        config: { tools: [{ googleSearch: {} }] },
      });
      return {
        query: args.query,
        text: response.text?.trim() || '',
        sources: extractSources(response),
        model,
      };
    } catch (err) {
      lastErr = err;
      logger.warn('web_search: model failed, trying next', { model, status: err.status, message: err.message });
    }
  }

  return {
    query: args.query,
    text: '',
    sources: [],
    error: lastErr?.message || 'Web search failed',
  };
}
