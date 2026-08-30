import type { Handler, HandlerEvent } from '@netlify/functions';
import {
  DEFAULT_HEADERS,
  AI_GATEWAY_URL,
  AI_GATEWAY_API_KEY,
  MODEL_NAME,
  DEFAULT_INTERNAL_PROMPT,
} from './_shared';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: '',
    };
  }

  const apiKey =
    process.env.AI_GATEWAY_API_KEY ||
    process.env.MODEL_API_KEY ||
    process.env.OPENAI_API_KEY ||
    AI_GATEWAY_API_KEY;

  return {
    statusCode: 200,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({
      status: 'ok',
      model: process.env.MODEL_NAME || process.env.MUSE_MODEL || MODEL_NAME,
      gatewayUrl: process.env.AI_GATEWAY_URL || AI_GATEWAY_URL,
      supabaseUrl: process.env.SUPABASE_URL || 'https://hhqjdlnhhgpddixnpuuw.supabase.co',
      hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
      hasSupabase: true,
      internalPrompt: process.env.INTERNAL_PROMPT || DEFAULT_INTERNAL_PROMPT,
    }),
  };
};
