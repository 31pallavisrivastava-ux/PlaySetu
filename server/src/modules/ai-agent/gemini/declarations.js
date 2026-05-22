import { searchFacilityTool } from '../tools/searchFacility.tool.js';
import { getSlotsTool } from '../tools/getSlots.tool.js';
import { createBookingTool } from '../tools/booking.tool.js';
import { sendNotificationTool } from '../tools/notification.tool.js';

const openAiStyleTools = [searchFacilityTool, getSlotsTool, createBookingTool, sendNotificationTool];

/** Strip fields Gemini JSON schema rejects (e.g. default) */
function sanitizeSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  const { default: _d, ...rest } = schema;
  const out = { ...rest };
  if (out.properties && typeof out.properties === 'object') {
    out.properties = Object.fromEntries(
      Object.entries(out.properties).map(([k, v]) => [k, sanitizeSchema(v)])
    );
  }
  return out;
}

export function getGeminiToolDeclarations() {
  return openAiStyleTools.map((tool) => ({
    name: tool.function.name,
    description: tool.function.description,
    parametersJsonSchema: sanitizeSchema(tool.function.parameters),
  }));
}
