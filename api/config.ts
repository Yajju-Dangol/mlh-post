import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  AI_GATEWAY_URL,
  AI_GATEWAY_API_KEY,
  MODEL_NAME,
  DEFAULT_INTERNAL_PROMPT,
} from './_shared';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey =
    process.env.AI_GATEWAY_API_KEY ||
    process.env.MODEL_API_KEY ||
    process.env.OPENAI_API_KEY ||
    AI_GATEWAY_API_KEY;

  return res.json({
    status: 'ok',
    model: process.env.MODEL_NAME || process.env.MUSE_MODEL || MODEL_NAME,
    gatewayUrl: process.env.AI_GATEWAY_URL || AI_GATEWAY_URL,
    supabaseUrl: process.env.SUPABASE_URL || 'https://hhqjdlnhhgpddixnpuuw.supabase.co',
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    hasSupabase: true,
    internalPrompt: process.env.INTERNAL_PROMPT || DEFAULT_INTERNAL_PROMPT,
  });
}
