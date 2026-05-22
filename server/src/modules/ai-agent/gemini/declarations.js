import { searchVenuesTool } from '../tools/searchVenues.tool.js';
import { checkAvailabilityTool } from '../tools/checkAvailability.tool.js';
import { bookSlotTool } from '../tools/bookSlot.tool.js';
import { cancelBookingTool } from '../tools/cancelBooking.tool.js';
import { webSearchTool } from '../tools/webSearch.tool.js';

const openAiStyleTools = [searchVenuesTool, checkAvailabilityTool, bookSlotTool, cancelBookingTool, webSearchTool];

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
