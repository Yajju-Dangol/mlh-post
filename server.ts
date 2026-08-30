import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsers with large limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://hhqjdlnhhgpddixnpuuw.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocWpkbG5oaGdwZGRpeG5wdXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTAzNTYsImV4cCI6MjEwMzY2NjM1Nn0.wp7B6kpCWiopxVq4Srh5qpnq9K66KyuPvRKioviLCZk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_BUCKET = 'properties';

/**
 * Uploads an image (base64 data URI or remote URL) to Supabase Storage bucket
 * Returns the permanent public URL, or falls back to original if bucket is not created
 */
async function uploadImageToSupabaseStorage(imageId: string, rawImageUrl: string): Promise<string> {
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
      // If it's already hosted on this supabase storage, keep it
      if (rawImageUrl.includes('.supabase.co/storage/v1/object/public/')) {
        return rawImageUrl;
      }
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
      } catch (fetchErr) {
        console.warn('[Storage] Remote image download failed, using direct URL:', fetchErr);
        return rawImageUrl;
      }
    } else {
      return rawImageUrl;
    }

    const filePath = `renders/${imageId}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn(`[Supabase Storage] Upload to bucket '${STORAGE_BUCKET}' failed (make sure bucket exists & is public):`, uploadError.message);
      return rawImageUrl;
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      console.log(`[Supabase Storage] Image successfully uploaded to bucket: ${publicUrlData.publicUrl}`);
      return publicUrlData.publicUrl;
    }

    return rawImageUrl;
  } catch (err: any) {
    console.warn('[Supabase Storage] Exception uploading image:', err?.message || err);
    return rawImageUrl;
  }
}

const DEFAULT_INTERNAL_PROMPT =
  process.env.INTERNAL_PROMPT ||
  'You are an expert high-end architectural photographer and luxury real estate art director. Generate an ultra-photorealistic, high-resolution 8k architectural render of the specified property. Ensure meticulous attention to materials (glass, Italian marble, warm wood, polished concrete), atmospheric natural lighting (warm golden hour or soft ambient evening lighting), landscaping (lush greenery, manicured lawns, pristine pools), and immaculate structural composition. If branding text, contact, or watermark information is specified, integrate them cleanly with elegant typography and high-end brochure aesthetic.';

const MODEL_NAME =
  process.env.MODEL_NAME ||
  process.env.MUSE_MODEL ||
  'bytedance/seedream-5.0-pro';
const AI_GATEWAY_URL =
  process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1';
const AI_GATEWAY_API_KEY =
  process.env.AI_GATEWAY_API_KEY ||
  process.env.MODEL_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  '';

// Map aspect ratio string to resolution string for SeaDream / Vercel AI Gateway
function mapRatioToDimensions(ratio: string): string {
  switch (ratio) {
    case '16:9':
      return '1792x1024';
    case '1:1':
      return '1024x1024';
    case '9:16':
      return '1024x1792';
    case '4:3':
      return '1408x1056';
    case '21:9':
      return '1792x768';
    default:
      return '1792x1024';
  }
}

function formatBrandingDetails(branding?: {
  logo?: string | null;
  contact?: string;
  watermarkText?: string;
}): string {
  if (!branding) return 'None';
  const parts: string[] = [];
  if (branding.watermarkText?.trim()) {
    parts.push(`Watermark: ${branding.watermarkText.trim()}`);
  }
  if (branding.contact?.trim()) {
    parts.push(`Contact: ${branding.contact.trim()}`);
  }
  if (branding.logo) {
    parts.push(`Logo attached`);
  }
  return parts.length > 0 ? parts.join(' | ') : 'None';
}

// Helper to compile all user parameters and the .env internal prompt into the required format:
// "main internal prompt" : details : "property &t type", "location", "price", "highlights" , "ratio" , "branding details"
function compilePromptPayload(body: {
  propertyType: string;
  location: string;
  price: string;
  highlights: string;
  ratio: string;
  referenceImage?: string | null;
  branding?: {
    logo?: string | null;
    contact?: string;
    watermarkText?: string;
  };
}) {
  const { propertyType, location, price, highlights, ratio, branding, referenceImage } = body;
  const dimensions = mapRatioToDimensions(ratio || '16:9');
  const mainInternalPrompt = process.env.INTERNAL_PROMPT || DEFAULT_INTERNAL_PROMPT;
  const brandingDetails = formatBrandingDetails(branding);
  const formattedRatio = ratio || '16:9';

  // Strict format: "main internal prompt" : details : "property &t type", "location", "price", "highlights" , "ratio" , "branding details"
  const finalCompiledPrompt = `"${mainInternalPrompt}" : details : "${propertyType || ''}", "${location || ''}", "${price || ''}", "${highlights || ''}" , "${formattedRatio}" , "${brandingDetails}"`;

  return {
    model: MODEL_NAME,
    prompt: finalCompiledPrompt,
    size: dimensions,
    aspectRatio: formattedRatio,
    response_format: 'b64_json',
    output_format: 'webp',
    hasReferenceImage: Boolean(referenceImage),
    hasBranding: Boolean(
      branding?.logo || branding?.contact?.trim() || branding?.watermarkText?.trim()
    ),
  };
}

// API Route: Config / Status
app.get('/api/config', (req, res) => {
  res.json({
    status: 'ok',
    model: MODEL_NAME,
    gatewayUrl: AI_GATEWAY_URL,
    supabaseUrl: SUPABASE_URL,
    hasApiKey: Boolean(AI_GATEWAY_API_KEY && AI_GATEWAY_API_KEY !== 'MY_GEMINI_API_KEY'),
    hasSupabase: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
    internalPrompt: DEFAULT_INTERNAL_PROMPT,
  });
});

// API Route: Get all properties from Supabase
app.get('/api/properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Server] Fetch error:', error.message);
      return res.json({ success: true, items: [] });
    }

    return res.json({ success: true, items: data || [] });
  } catch (err: any) {
    console.error('[Supabase Server] GET /api/properties error:', err);
    return res.json({ success: true, items: [] });
  }
});

// API Route: Save a property visual to Supabase (Uploads to bucket + inserts row)
app.post('/api/properties', async (req, res) => {
  try {
    const item = req.body;
    if (!item || !item.id || !item.imageUrl) {
      return res.status(400).json({ error: 'Missing required property item data' });
    }

    // 1. Upload image to Supabase Storage bucket 'properties'
    let permanentImageUrl = item.imageUrl || item.image_url;
    try {
      permanentImageUrl = await uploadImageToSupabaseStorage(item.id, permanentImageUrl);
    } catch (uploadErr) {
      console.warn('[Supabase Server] Storage upload step warning:', uploadErr);
    }

    // 2. Insert into 'properties' table with permanent image URL
    const payload = {
      id: item.id,
      number: item.number,
      title: item.title,
      property_type: item.propertyType || item.property_type,
      location: item.location,
      price: item.price,
      highlights: item.highlights,
      prompt: item.prompt || item.compiledPrompt || '',
      image_url: permanentImageUrl,
      ratio: item.ratio || '16:9',
      engine: item.engine || 'bytedance/seedream-5.0-pro',
      branding: item.branding || null,
      api_status: item.apiStatus || item.api_status || 'saved',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('properties')
      .upsert(payload)
      .select();

    if (error) {
      console.warn('[Supabase Server] Upsert error:', error.message);
      return res.status(500).json({ error: error.message, item: payload });
    }

    return res.json({ success: true, item: data?.[0] || payload, imageUrl: permanentImageUrl });
  } catch (err: any) {
    console.error('[Supabase Server] POST /api/properties error:', err);
    return res.status(500).json({ error: err.message || 'Failed to save to Supabase' });
  }
});

// API Route: Delete a property visual from Supabase
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ success: true, deletedId: id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// API Route: Generate Image with Vercel AI Gateway / ByteDance Seedream format
app.post('/api/generate', async (req, res) => {
  try {
    const { propertyType, location, price, highlights, ratio, referenceImage, branding } =
      req.body;

    if (!propertyType || !location) {
      return res.status(400).json({
        error: 'Missing required property details (propertyType, location).',
      });
    }

    // Compile payload
    const compiledPayload = compilePromptPayload(req.body);

    const apiKey =
      process.env.AI_GATEWAY_API_KEY ||
      process.env.MODEL_API_KEY ||
      process.env.OPENAI_API_KEY;

    let generatedImageUrl = '';
    let apiStatus = 'fallback_mock';
    let errorMessage = '';

    // If API Key is configured, attempt call to Vercel AI Gateway / ByteDance Seedream API (EXACTLY 1 request, NO retries)
    if (apiKey) {
      try {
        console.log(`[API] Dispatching single generation request to ${AI_GATEWAY_URL} for model ${compiledPayload.model}...`);
        const openai = new OpenAI({
          baseURL: AI_GATEWAY_URL,
          apiKey: apiKey,
          timeout: 120000, // 2-minute (120s) limit so slow generations are never prematurely aborted
          maxRetries: 0, // STRICTLY ZERO RETRIES: Never flood the gateway on rate-limits or errors
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
        console.error('Vercel AI Gateway error (single attempt):', gatewayErr?.message || gatewayErr);
        errorMessage = gatewayErr?.message || 'Gateway call failed';
      }
    }

    // High quality curated architectural fallback library if no key or gateway error
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
      apiStatus: apiStatus,
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
    console.error('API /api/generate server error:', error);
    res.status(500).json({
      error: error.message || 'Internal generation server error',
    });
  }
});

// Vite middleware and static serving
async function startServer() {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    !process.argv.some((arg) => arg.includes('server.ts'));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${isProduction ? 'Production' : 'Development'})`);
  });
}

startServer();
