import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import {
  AI_GATEWAY_URL,
  AI_GATEWAY_API_KEY,
  MODEL_NAME,
  compilePromptPayload,
} from './_shared';

export const config = {
  maxDuration: 60, // Standard max duration supported on Vercel Hobby plan
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const {
      propertyType = '',
      location = '',
      price = '',
      highlights = '',
      ratio = '16:9',
      referenceImage = null,
      branding = undefined,
    } = body;

    if (!propertyType || !location) {
      return res.status(400).json({
        error: 'Missing required property details (propertyType, location).',
      });
    }

    const compiledPayload = compilePromptPayload(body);

    const apiKey =
      process.env.AI_GATEWAY_API_KEY ||
      process.env.MODEL_API_KEY ||
      process.env.OPENAI_API_KEY ||
      AI_GATEWAY_API_KEY;

    const gatewayUrl =
      process.env.AI_GATEWAY_URL || AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1';

    const model =
      process.env.MODEL_NAME ||
      process.env.MUSE_MODEL ||
      compiledPayload.model ||
      'bytedance/seedream-5.0-pro';

    let generatedImageUrl = '';
    let apiStatus = 'fallback_mock';
    let errorMessage = '';

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        console.log(`[API] Calling ${gatewayUrl} with model ${model}...`);
        const openai = new OpenAI({
          baseURL: gatewayUrl,
          apiKey: apiKey,
          timeout: 50000,
          maxRetries: 0,
        });

        const result = await openai.images.generate({
          model: model,
          prompt: compiledPayload.prompt,
          size: compiledPayload.size as any,
          response_format: 'b64_json',
          n: 1,
        });

        const item = result.data?.[0];
        if (item?.b64_json) {
          generatedImageUrl = `data:image/webp;base64,${item.b64_json}`;
          apiStatus = 'gateway_success';
        } else if (item?.url) {
          generatedImageUrl = item.url;
          apiStatus = 'gateway_success';
        }
      } catch (gatewayErr: any) {
        console.error('Gateway error (falling back to architectural library):', gatewayErr?.message || gatewayErr);
        errorMessage = gatewayErr?.message || 'Gateway generation attempt failed';
      }
    }

    // High quality curated architectural fallback library
    const architecturalRenders = [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85',
    ];

    if (!generatedImageUrl) {
      generatedImageUrl =
        referenceImage ||
        architecturalRenders[Math.floor(Math.random() * architecturalRenders.length)];
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      model: model,
      apiStatus,
      errorMessage: errorMessage || null,
      compiledPayload: {
        model: model,
        size: compiledPayload.size,
        aspectRatio: compiledPayload.aspectRatio,
        compiledPrompt: compiledPayload.prompt,
        hasReferenceImage: compiledPayload.hasReferenceImage,
        hasBranding: compiledPayload.hasBranding,
      },
    });
  } catch (error: any) {
    console.error('API /api/generate unexpected error:', error);
    return res.status(500).json({
      error: error.message || 'Internal generation server error',
    });
  }
}
