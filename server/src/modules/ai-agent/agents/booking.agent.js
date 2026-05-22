import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import { env } from '../../../config/env.js';
import { logger } from '../../../shared/logger/logger.js';
import { SPORTS_ASSISTANT_SYSTEM } from '../prompts/system.prompt.js';
import { getGeminiToolDeclarations } from '../gemini/declarations.js';
import { isGeminiRecoverableError, toAppError } from '../gemini/errors.js';
import { runSearchVenues } from '../tools/searchVenues.tool.js';
import { runCheckAvailability } from '../tools/checkAvailability.tool.js';
import { runBookSlot } from '../tools/bookSlot.tool.js';
import { runCancelBooking } from '../tools/cancelBooking.tool.js';
import { runWebSearch } from '../tools/webSearch.tool.js';

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];
// Primary model comes from env.GEMINI_MODEL (default: gemini-3.5-flash)

const toolRunners = {
  search_venues: runSearchVenues,
  check_availability: runCheckAvailability,
  book_slot: runBookSlot,
  cancel_booking: runCancelBooking,
  web_search: runWebSearch,
};

function buildContents(history, userMessage) {
  const contents = [];
  for (const h of history.slice(-8)) {
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: userMessage }] });
  return contents;
}

function toFunctionResponse(result) {
  if (result && typeof result === 'object' && !Array.isArray(result)) return result;
  return { result };
}

function parseFunctionArgs(functionCall) {
  const raw = functionCall.args ?? functionCall.arguments;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

function modelsToTry() {
  const primary = env.GEMINI_MODEL;
  return [...new Set([primary, ...FALLBACK_MODELS])];
}

async function generateWithTools(ai, { contents, declarations, mode = FunctionCallingConfigMode.AUTO }) {
  let lastError;
  for (const model of modelsToTry()) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SPORTS_ASSISTANT_SYSTEM,
          tools: [{ functionDeclarations: declarations }],
          toolConfig: {
            functionCallingConfig: { mode },
          },
        },
      });
    } catch (err) {
      lastError = err;
      logger.warn('Gemini model failed, trying next', { model, status: err.status, message: err.message });
      if (!isGeminiRecoverableError(err)) throw err;
    }
  }
  throw lastError;
}

function summarizeToolResults(toolResults) {
  const venues = toolResults
    .filter((tr) => tr.tool === 'search_venues')
    .flatMap((tr) => (Array.isArray(tr.result) ? tr.result : []));
  if (venues.length === 0) return null;
  const names = venues.slice(0, 3).map((v) => v.name).join(', ');
  return `Here are some options I found: ${names}. Tell me which one you'd like to check availability for.`;
}

export async function runBookingAgent({ message, userId, history = [], location }) {
  if (!env.GEMINI_API_KEY?.trim()) {
    return runFallbackAgent(message, userId);
  }

  const ctx = { userId, lat: location?.lat, lng: location?.lng };

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const declarations = getGeminiToolDeclarations();
    let contents = buildContents(history, message);
    const toolResults = [];

    const MAX_STEPS = 8;
    for (let step = 0; step < MAX_STEPS; step++) {
      const response = await generateWithTools(ai, { contents, declarations });

      const functionCalls = response.functionCalls;
      if (!functionCalls?.length) {
        return {
          reply: response.text?.trim() || 'Done. Let me know if you need anything else.',
          toolResults,
        };
      }

      logger.info('agent step', {
        step,
        calls: functionCalls.map((c) => ({ name: c.name, args: parseFunctionArgs(c) })),
      });

      const modelParts =
        response.candidates?.[0]?.content?.parts ?? functionCalls.map((fc) => ({ functionCall: fc }));

      contents = [...contents, { role: 'model', parts: modelParts }];

      const responseParts = [];
      for (const call of functionCalls) {
        const args = parseFunctionArgs(call);
        const runner = toolRunners[call.name];
        const result = runner ? await runner(args, ctx) : { error: 'Unknown tool' };
        toolResults.push({ tool: call.name, result });
        responseParts.push({
          functionResponse: {
            name: call.name,
            response: toFunctionResponse(result),
          },
        });
      }

      contents.push({ role: 'user', parts: responseParts });
    }

    // Iteration cap hit — force a final text response so the model summarizes what it has.
    logger.warn('agent hit MAX_STEPS, forcing text response');
    try {
      const forced = await generateWithTools(ai, {
        contents,
        declarations,
        mode: FunctionCallingConfigMode.NONE,
      });
      const text = forced.text?.trim();
      if (text) return { reply: text, toolResults };
    } catch (err) {
      logger.warn('forced-text pass failed', { message: err.message });
    }

    return {
      reply: summarizeToolResults(toolResults) || 'I gathered some info but need a bit more from you — try narrowing the area or budget.',
      toolResults,
    };
  } catch (err) {
    logger.error('Gemini agent error', { message: err.message, status: err.status, name: err.name });
    if (isGeminiRecoverableError(err)) {
      const fallback = await runFallbackAgent(message, userId, ctx);
      const hint = geminiFailureHint(err);
      return {
        ...fallback,
        reply: hint ? `${fallback.reply}\n\n${hint}` : fallback.reply,
      };
    }
    throw toAppError(err);
  }
}

function geminiFailureHint(err) {
  const msg = (err?.message || '').toLowerCase();
  if (err?.status === 429 || msg.includes('resource_exhausted') || msg.includes('quota')) {
    return (
      'Gemini quota exhausted for this API key. Check https://ai.dev/rate-limit or wait for the per-minute quota to refresh. ' +
      'Showing local DB results in the meantime.'
    );
  }
  if (msg.includes('api key') || msg.includes('api_key')) {
    return (
      'Gemini rejected your API key (invalid or revoked). Create a new key at https://aistudio.google.com/apikey ' +
      'and set GEMINI_API_KEY in server/.env, then restart the server.'
    );
  }
  if (msg.includes('model') || msg.includes('not found')) {
    return `Gemini model "${env.GEMINI_MODEL}" is unavailable. Try GEMINI_MODEL=gemini-2.5-flash in server/.env.`;
  }
  return 'Gemini is temporarily unavailable; showing local search results.';
}

async function runFallbackAgent(message, userId, ctx = {}) {
  const lower = message.toLowerCase();
  let sport;
  if (lower.includes('badminton')) sport = 'badminton';
  else if (lower.includes('football') || lower.includes('turf')) sport = 'football';
  else if (lower.includes('cricket')) sport = 'cricket';
  else if (lower.includes('swim')) sport = 'swimming';

  const areas = ['gomti', 'chinhat', 'aliganj', 'hazratganj', 'indira', 'lohia', 'jankipuram', 'vikas', 'sai'];
  const areaMatch = areas.find((a) => lower.includes(a));

  const budgetMatch = message.match(/₹?\s*(\d+)/);
  const maxBudget = budgetMatch ? Number(budgetMatch[1]) : undefined;

  const venues = await runSearchVenues(
    {
      sport,
      area: areaMatch ? areaMatch.charAt(0).toUpperCase() + areaMatch.slice(1) : undefined,
      maxBudget,
      limit: 3,
    },
    ctx
  );

  return {
    reply:
      venues.length > 0
        ? `Found ${venues.length} options${areaMatch ? ` near ${areaMatch}` : ''}: ${venues.map((v) => v.name).join(', ')}. Open a venue to book a slot.`
        : 'No facilities matched. Try "badminton near Gomti Nagar under 500".',
    toolResults: [{ tool: 'search_venues', result: venues }],
    userId,
  };
}
