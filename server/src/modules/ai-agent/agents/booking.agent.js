import { GoogleGenAI, FunctionCallingConfigMode } from '@google/genai';
import { env } from '../../../config/env.js';
import { SPORTS_ASSISTANT_SYSTEM } from '../prompts/system.prompt.js';
import { getGeminiToolDeclarations } from '../gemini/declarations.js';
import { runSearchFacility } from '../tools/searchFacility.tool.js';
import { runGetSlots } from '../tools/getSlots.tool.js';
import { runCreateBooking } from '../tools/booking.tool.js';
import { runSendNotification } from '../tools/notification.tool.js';

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

export async function runBookingAgent({ message, userId, history = [] }) {
  if (!env.GEMINI_API_KEY) {
    return runFallbackAgent(message, userId);
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const declarations = getGeminiToolDeclarations();
  let contents = buildContents(history, message);
  const toolResults = [];

  for (let step = 0; step < 5; step++) {
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
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

    const functionCalls = response.functionCalls;
    if (!functionCalls?.length) {
      return {
        reply: response.text?.trim() || 'Done. Let me know if you need anything else.',
        toolResults,
      };
    }

    const modelParts = response.candidates?.[0]?.content?.parts ?? functionCalls.map((fc) => ({ functionCall: fc }));

    contents = [
      ...contents,
      { role: 'model', parts: modelParts },
    ];

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
        ? `Found ${facilities.length} options${areaMatch ? ` near ${areaMatch}` : ''}: ${facilities.map((f) => f.name).join(', ')}. Pick a court and say "book slot" with the slot ID, or set GEMINI_API_KEY for full conversational booking.`
        : 'No facilities matched. Try "badminton near Gomti Nagar under 500" or register facilities as an owner.',
    toolResults: [{ tool: 'search_facility', result: facilities }],
    userId,
  };
}
