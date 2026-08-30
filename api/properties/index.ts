import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, uploadImageToSupabaseStorage } from '../_shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/properties — Fetch all properties from Supabase
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] Fetch error:', error.message);
        return res.json({ success: true, items: [] });
      }

      return res.json({ success: true, items: data || [] });
    } catch (err: any) {
      console.error('[Supabase] GET error:', err);
      return res.json({ success: true, items: [] });
    }
  }

  // POST /api/properties — Save a property visual
  if (req.method === 'POST') {
    try {
      let item = req.body;
      if (typeof item === 'string') {
        try {
          item = JSON.parse(item);
        } catch (e) {
          item = {};
        }
      }
      item = item || {};

      if (!item || !item.id || !item.imageUrl) {
        return res.status(400).json({ error: 'Missing required property item data' });
      }

      // Upload image to Supabase Storage
      let permanentImageUrl = item.imageUrl || item.image_url;
      try {
        permanentImageUrl = await uploadImageToSupabaseStorage(item.id, permanentImageUrl);
      } catch (uploadErr) {
        console.warn('[Storage] Upload warning:', uploadErr);
      }

      // Insert into 'properties' table
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
        console.warn('[Supabase] Upsert error:', error.message);
        return res.status(500).json({ error: error.message, item: payload });
      }

      return res.json({ success: true, item: data?.[0] || payload, imageUrl: permanentImageUrl });
    } catch (err: any) {
      console.error('[Supabase] POST error:', err);
      return res.status(500).json({ error: err.message || 'Failed to save' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
