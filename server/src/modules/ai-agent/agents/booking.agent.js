import OpenAI from 'openai';
import { env } from '../../../config/env.js';
import { SPORTS_ASSISTANT_SYSTEM } from '../prompts/system.prompt.js';
import { searchFacilityTool, runSearchFacility } from '../tools/searchFacility.tool.js';
import { getSlotsTool, runGetSlots } from '../tools/getSlots.tool.js';
import { createBookingTool, runCreateBooking } from '../tools/booking.tool.js';
import { sendNotificationTool, runSendNotification } from '../tools/notification.tool.js';

const tools = [searchFacilityTool, getSlotsTool, createBookingTool, sendNotificationTool];

const toolRunners = {
  search_facility: runSearchFacility,
  get_slots: runGetSlots,
  create_booking: (args, ctx) => runCreateBooking(args, ctx.userId),
  send_notification: (args, ctx) => runSendNotification(args, ctx.userId),
};

export async function runBookingAgent({ message, userId, history = [] }) {
  if (!env.OPENAI_API_KEY) {
    return runFallbackAgent(message, userId);
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const messages = [
    { role: 'system', content: SPORTS_ASSISTANT_SYSTEM },
    ...history.slice(-8),
    { role: 'user', content: message },
  ];

  let response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    messages,
    tools,
    tool_choice: 'auto',
  });

  let assistantMessage = response.choices[0].message;
  const toolResults = [];

  for (let i = 0; i < 5 && assistantMessage.tool_calls?.length; i++) {
    messages.push(assistantMessage);

    for (const call of assistantMessage.tool_calls) {
      const args = JSON.parse(call.function.arguments);
      const runner = toolRunners[call.function.name];
      const result = runner ? await runner(args, { userId }) : { error: 'Unknown tool' };
      toolResults.push({ tool: call.function.name, result });
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }

    response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages,
      tools,
    });
    assistantMessage = response.choices[0].message;
  }

  return {
    reply: assistantMessage.content ?? 'Done. Let me know if you need anything else.',
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
        ? `Found ${facilities.length} options${areaMatch ? ` near ${areaMatch}` : ''}: ${facilities.map((f) => f.name).join(', ')}. Pick a court and say "book slot" with the slot ID, or add OPENAI_API_KEY for full conversational booking.`
        : 'No facilities matched. Try "badminton near Gomti Nagar under 500" or register facilities as an owner.',
    toolResults: [{ tool: 'search_facility', result: facilities }],
    userId,
  };
}
