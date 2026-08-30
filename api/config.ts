import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  AI_GATEWAY_URL,
  AI_GATEWAY_API_KEY,
  MODEL_NAME,
  DEFAULT_INTERNAL_PROMPT,
} from './_shared';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({
    status: 'ok',
    model: MODEL_NAME,
    gatewayUrl: AI_GATEWAY_URL,
    supabaseUrl: process.env.SUPABASE_URL || 'https://hhqjdlnhhgpddixnpuuw.supabase.co',
    hasApiKey: Boolean(AI_GATEWAY_API_KEY && AI_GATEWAY_API_KEY !== 'MY_GEMINI_API_KEY'),
    hasSupabase: true,
    internalPrompt: DEFAULT_INTERNAL_PROMPT,
  });
}
