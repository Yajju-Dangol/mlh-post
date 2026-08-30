import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Shared Supabase client
const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://hhqjdlnhhgpddixnpuuw.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocWpkbG5oaGdwZGRpeG5wdXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTAzNTYsImV4cCI6MjEwMzY2NjM1Nn0.wp7B6kpCWiopxVq4Srh5qpnq9K66KyuPvRKioviLCZk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const STORAGE_BUCKET = 'properties';

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Constants
export const DEFAULT_INTERNAL_PROMPT =
  process.env.INTERNAL_PROMPT ||
  'You are an expert high-end architectural photographer and luxury real estate art director. Generate an ultra-photorealistic, high-resolution 8k architectural render of the specified property. Ensure meticulous attention to materials (glass, Italian marble, warm wood, polished concrete), atmospheric natural lighting (warm golden hour or soft ambient evening lighting), landscaping (lush greenery, manicured lawns, pristine pools), and immaculate structural composition. If branding text, contact, or watermark information is specified, integrate them cleanly with elegant typography and high-end brochure aesthetic.';

export const MODEL_NAME =
  process.env.MODEL_NAME ||
  process.env.MUSE_MODEL ||
  'bytedance/seedream-5.0-pro';

export const AI_GATEWAY_URL =
  process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1';

export const AI_GATEWAY_API_KEY =
  process.env.AI_GATEWAY_API_KEY ||
  process.env.MODEL_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';

// Helpers
export function mapRatioToDimensions(ratio: string): string {
  switch (ratio) {
    case '16:9': return '1792x1024';
    case '1:1': return '1024x1024';
    case '9:16': return '1024x1792';
    case '4:3': return '1408x1056';
    case '21:9': return '1792x768';
    default: return '1792x1024';
  }
}

export function formatBrandingDetails(branding?: {
  logo?: string | null;
  contact?: string;
  watermarkText?: string;
}): string {
  if (!branding) return 'None';
  const parts: string[] = [];
  if (branding.watermarkText?.trim()) parts.push(`Watermark: ${branding.watermarkText.trim()}`);
  if (branding.contact?.trim()) parts.push(`Contact: ${branding.contact.trim()}`);
  if (branding.logo) parts.push(`Logo attached`);
  return parts.length > 0 ? parts.join(' | ') : 'None';
}

export function compilePromptPayload(body: {
  propertyType: string;
  location: string;
  price: string;
  highlights: string;
  ratio: string;
  referenceImage?: string | null;
  branding?: { logo?: string | null; contact?: string; watermarkText?: string };
}) {
  const { propertyType, location, price, highlights, ratio, branding, referenceImage } = body;
  const dimensions = mapRatioToDimensions(ratio || '16:9');
  const mainInternalPrompt = process.env.INTERNAL_PROMPT || DEFAULT_INTERNAL_PROMPT;
  const brandingDetails = formatBrandingDetails(branding);
  const formattedRatio = ratio || '16:9';

  const finalCompiledPrompt = `"${mainInternalPrompt}" : details : "${propertyType || ''}", "${location || ''}", "${price || ''}", "${highlights || ''}" , "${formattedRatio}" , "${brandingDetails}"`;

  return {
    model: MODEL_NAME,
    prompt: finalCompiledPrompt,
    size: dimensions,
    aspectRatio: formattedRatio,
    response_format: 'b64_json',
    output_format: 'webp',
    hasReferenceImage: Boolean(referenceImage),
    hasBranding: Boolean(branding?.logo || branding?.contact?.trim() || branding?.watermarkText?.trim()),
  };
}

export async function uploadImageToSupabaseStorage(imageId: string, rawImageUrl: string): Promise<string> {
  if (!rawImageUrl) return rawImageUrl;

  try {
    let fileBuffer: Buffer;
    let contentType = 'image/jpeg';
    let fileExt = 'jpg';

    if (rawImageUrl.startsWith('data:image/')) {
      const matches = rawImageUrl.match(/^data:(image\/([a-zA-Z0-9+.-]+));base64,(.+)$/);
      if (matches) {
        contentType = matches[1];
        fileExt = matches[2] === 'jpeg' ? 'jpg' : matches[2];
        fileBuffer = Buffer.from(matches[3], 'base64');
      } else {
        return rawImageUrl;
      }
    } else if (rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://')) {
      if (rawImageUrl.includes('.supabase.co/storage/v1/object/public/')) return rawImageUrl;
      try {
        const response = await fetch(rawImageUrl);
        if (!response.ok) return rawImageUrl;
        const arrayBuffer = await response.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
        const headerType = response.headers.get('content-type');
        if (headerType) {
          contentType = headerType;
          if (headerType.includes('png')) fileExt = 'png';
          else if (headerType.includes('webp')) fileExt = 'webp';
        }
      } catch {
        return rawImageUrl;
      }
    } else {
      return rawImageUrl;
    }

    const filePath = `renders/${imageId}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer!, { contentType, upsert: true });

    if (uploadError) {
      console.warn('[Storage] Upload failed:', uploadError.message);
      return rawImageUrl;
    }

    const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return publicUrlData?.publicUrl || rawImageUrl;
  } catch (err: any) {
    console.warn('[Storage] Exception:', err?.message || err);
    return rawImageUrl;
  }
}
