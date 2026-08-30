import type { Handler, HandlerEvent } from '@netlify/functions';
import {
  DEFAULT_HEADERS,
  supabase,
  uploadImageToSupabaseStorage,
} from './_shared';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: DEFAULT_HEADERS,
      body: '',
    };
  }

  // GET /api/properties — Fetch all properties from Supabase
  if (event.httpMethod === 'GET') {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase Netlify] Fetch error:', error.message);
        return {
          statusCode: 200,
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ success: true, items: [] }),
        };
      }

      return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ success: true, items: data || [] }),
      };
    } catch (err: any) {
      console.error('[Supabase Netlify] GET error:', err);
      return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ success: true, items: [] }),
      };
    }
  }

  // POST /api/properties — Save a property visual
  if (event.httpMethod === 'POST') {
    try {
      let item: any = {};
      if (event.body) {
        try {
          item = JSON.parse(event.body);
        } catch (e) {
          item = {};
        }
      }

      if (!item || !item.id || !item.imageUrl) {
        return {
          statusCode: 400,
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ error: 'Missing required property item data' }),
        };
      }

      // Upload image to Supabase Storage
      let permanentImageUrl = item.imageUrl || item.image_url;
      try {
        permanentImageUrl = await uploadImageToSupabaseStorage(item.id, permanentImageUrl);
      } catch (uploadErr) {
        console.warn('[Storage Netlify] Upload warning:', uploadErr);
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
        console.warn('[Supabase Netlify] Upsert error:', error.message);
        return {
          statusCode: 500,
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ error: error.message, item: payload }),
        };
      }

      return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ success: true, item: data?.[0] || payload, imageUrl: permanentImageUrl }),
      };
    } catch (err: any) {
      console.error('[Supabase Netlify] POST error:', err);
      return {
        statusCode: 500,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ error: err.message || 'Failed to save' }),
      };
    }
  }

  // DELETE /api/properties/:id
  if (event.httpMethod === 'DELETE') {
    try {
      const id =
        event.queryStringParameters?.id ||
        event.path.split('/').filter(Boolean).pop();

      if (!id) {
        return {
          statusCode: 400,
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ error: 'Missing property id' }),
        };
      }

      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) {
        return {
          statusCode: 500,
          headers: DEFAULT_HEADERS,
          body: JSON.stringify({ error: error.message }),
        };
      }

      return {
        statusCode: 200,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ success: true, deletedId: id }),
      };
    } catch (err: any) {
      return {
        statusCode: 500,
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ error: err.message }),
      };
    }
  }

  return {
    statusCode: 405,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
