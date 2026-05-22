import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import { env } from '../../../config/env.js';
import { logger } from '../../../shared/logger/logger.js';
import { SPORTS_ASSISTANT_SYSTEM } from '../prompts/system.prompt.js';
import { getGeminiToolDeclarations } from '../gemini/declarations.js';
import { isGeminiRecoverableError, toAppError } from '../gemini/errors.js';
import { runSearchFacility } from '../tools/searchFacility.tool.js';
import { runGetSlots } from '../tools/getSlots.tool.js';
import { runCreateBooking } from '../tools/booking.tool.js';
import { runSendNotification } from '../tools/notification.tool.js';

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

const toolRunners = {
  search_facility: runSearchFacility,
  get_slots: runGetSlots,
  create_booking: (args, ctx) => runCreateBooking(args, ctx.userId),
  send_notification: (args, ctx) => runSendNotification(args, ctx.userId),
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

async function generateWithTools(ai, { contents, declarations }) {
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
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.AUTO,
            },
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

export async function runBookingAgent({ message, userId, history = [] }) {
  if (!env.GEMINI_API_KEY?.trim()) {
    return runFallbackAgent(message, userId);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const declarations = getGeminiToolDeclarations();
    let contents = buildContents(history, message);
    const toolResults = [];

    for (let step = 0; step < 5; step++) {
      const response = await generateWithTools(ai, { contents, declarations });

      const functionCalls = response.functionCalls;
      if (!functionCalls?.length) {
        return {
          reply: response.text?.trim() || 'Done. Let me know if you need anything else.',
          toolResults,
        };
      }

      const modelParts =
        response.candidates?.[0]?.content?.parts ?? functionCalls.map((fc) => ({ functionCall: fc }));

      contents = [...contents, { role: 'model', parts: modelParts }];

      const responseParts = [];
      for (const call of functionCalls) {
        const args = parseFunctionArgs(call);
        const runner = toolRunners[call.name];
        const result = runner ? await runner(args, { userId }) : { error: 'Unknown tool' };
        toolResults.push({ tool: call.name, result });
        responseParts.push({
          functionResponse: {
            name: call.name,
            response: result,
          },
        });
      }

      contents.push({ role: 'user', parts: responseParts });
    }

    return {
      reply: 'I found some options — tell me which venue or slot you prefer.',
      toolResults,
    };
  } catch (err) {
    logger.error('Gemini agent error', { message: err.message, status: err.status, name: err.name });
    if (isGeminiRecoverableError(err)) {
      const fallback = await runFallbackAgent(message, userId);
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

async function runFallbackAgent(message, userId) {
  const lower = message.toLowerCase();
  let sportType;
  if (lower.includes('badminton')) sportType = 'badminton';
  else if (lower.includes('football') || lower.includes('turf')) sportType = 'football';
  else if (lower.includes('cricket')) sportType = 'cricket';
  else if (lower.includes('swim')) sportType = 'swimming';

  const areas = ['gomti', 'chinhat', 'aliganj', 'hazratganj', 'indira', 'lohia', 'jankipuram', 'vikas', 'sai'];
  const areaMatch = areas.find((a) => lower.includes(a));

  const budgetMatch = message.match(/₹?\s*(\d+)/);
  const maxPrice = budgetMatch ? Number(budgetMatch[1]) : undefined;

  const facilities = await runSearchFacility({
    sportType,
    area: areaMatch ? areaMatch.charAt(0).toUpperCase() + areaMatch.slice(1) : undefined,
    maxPrice,
    limit: 3,
  });

  return {
    reply:
      facilities.length > 0
        ? `Found ${facilities.length} options${areaMatch ? ` near ${areaMatch}` : ''}: ${facilities.map((f) => f.name).join(', ')}. Open a venue to book a slot.`
        : 'No facilities matched. Try "badminton near Gomti Nagar under 500".',
    toolResults: [{ tool: 'search_facility', result: facilities }],
    userId,
  };
}
