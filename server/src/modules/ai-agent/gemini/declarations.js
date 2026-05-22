import { searchFacilityTool } from '../tools/searchFacility.tool.js';
import { getSlotsTool } from '../tools/getSlots.tool.js';
import { createBookingTool } from '../tools/booking.tool.js';
import { sendNotificationTool } from '../tools/notification.tool.js';

const openAiStyleTools = [searchFacilityTool, getSlotsTool, createBookingTool, sendNotificationTool];

/** Convert OpenAI-style tool defs to Gemini functionDeclarations */
export function getGeminiToolDeclarations() {
  return openAiStyleTools.map((tool) => ({
    name: tool.function.name,
    description: tool.function.description,
    parametersJsonSchema: tool.function.parameters,
  }));
}

export const geminiToolNames = openAiStyleTools.map((t) => t.function.name);
