import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import {
  supabase,
  AI_GATEWAY_URL,
  AI_GATEWAY_API_KEY,
  compilePromptPayload,
} from './_shared';

export const config = {
  maxDuration: 120, // Allow up to 120s for image generation
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { propertyType, location, price, highlights, ratio, referenceImage, branding } = req.body;

    if (!propertyType || !location) {
      return res.status(400).json({
        error: 'Missing required property details (propertyType, location).',
      });
    }

    const compiledPayload = compilePromptPayload(req.body);

    const apiKey =
      process.env.AI_GATEWAY_API_KEY ||
      process.env.MODEL_API_KEY ||
      process.env.OPENAI_API_KEY;

    let generatedImageUrl = '';
    let apiStatus = 'fallback_mock';
    let errorMessage = '';

    if (apiKey) {
      try {
        console.log(`[API] Dispatching generation to ${AI_GATEWAY_URL} for model ${compiledPayload.model}...`);
        const openai = new OpenAI({
          baseURL: AI_GATEWAY_URL,
          apiKey: apiKey,
          timeout: 120000,
          maxRetries: 0,
        });

        const result = await openai.images.generate({
          model: compiledPayload.model,
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
        console.error('Gateway error:', gatewayErr?.message || gatewayErr);
        errorMessage = gatewayErr?.message || 'Gateway call failed';
      }
    }

    // Fallback images
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
      model: compiledPayload.model,
      apiStatus,
      errorMessage: errorMessage || null,
      compiledPayload: {
        model: compiledPayload.model,
        size: compiledPayload.size,
        aspectRatio: compiledPayload.aspectRatio,
        compiledPrompt: compiledPayload.prompt,
        hasReferenceImage: compiledPayload.hasReferenceImage,
        hasBranding: compiledPayload.hasBranding,
      },
    });
  } catch (error: any) {
    console.error('API /api/generate error:', error);
    res.status(500).json({
      error: error.message || 'Internal generation server error',
    });
  }
}
