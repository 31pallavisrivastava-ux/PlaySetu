import { logger } from '../../../shared/logger/logger.js';

export const sendNotificationTool = {
  type: 'function',
  function: {
    name: 'send_notification',
    description: 'Queue a booking reminder or confirmation (stub — wire SMS/WhatsApp later)',
    parameters: {
      type: 'object',
      properties: {
        channel: { type: 'string', enum: ['email', 'sms', 'whatsapp', 'push'] },
        message: { type: 'string' },
      },
      required: ['channel', 'message'],
    },
  },
};

export async function runSendNotification(args, userId) {
  logger.info('AI notification queued', { userId, ...args });
  return { queued: true, channel: args.channel };
}
