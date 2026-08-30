import { createClient } from '@supabase/supabase-js';
import { GenerationItem } from '../types';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://hhqjdlnhhgpddixnpuuw.supabase.co';

export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocWpkbG5oaGdwZGRpeG5wdXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTAzNTYsImV4cCI6MjEwMzY2NjM1Nn0.wp7B6kpCWiopxVq4Srh5qpnq9K66KyuPvRKioviLCZk';


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch all properties from Supabase 'properties' table
 */
export async function fetchPropertiesFromSupabase(): Promise<GenerationItem[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] fetch error (table may not be created yet):', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      number: row.number || `#${row.id.slice(-4)}`,
      title: row.title || row.property_type || 'Property Visual',
      propertyType: row.property_type,
      location: row.location,
      price: row.price,
      highlights: row.highlights,
      prompt: row.prompt || '',
      imageUrl: row.image_url,
      engine: row.engine || 'bytedance/seedream-5.0-pro',
      ratio: row.ratio || '16:9',
      branding: row.branding || undefined,
      apiStatus: row.api_status || 'saved',
      badge: row.api_status === 'gateway_success' ? 'SEEDREAM 5.0' : 'ARCHITECTURAL AI',
      createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Recent',
      tags: [
        { label: 'SAVED IN SUPABASE', bg: '#ecfdf5', text: '#059669' },
      ],
    }));
  } catch (err: any) {
    console.warn('[Supabase] unexpected fetch error:', err.message);
    return [];
  }
}

/**
 * Insert a generated property visual into Supabase 'properties' table
 */
export async function savePropertyToSupabase(item: GenerationItem): Promise<boolean> {
  try {
    const payload = {
      id: item.id,
      number: item.number,
      title: item.title,
      property_type: item.propertyType,
      location: item.location,
      price: item.price,
      highlights: item.highlights,
      prompt: item.prompt || item.compiledPrompt || '',
      image_url: item.imageUrl,
      ratio: item.ratio || '16:9',
      engine: item.engine || 'bytedance/seedream-5.0-pro',
      branding: item.branding || null,
      api_status: item.apiStatus || 'gateway_success',
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('properties').upsert(payload);

    if (error) {
      console.warn('[Supabase] insert error:', error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.warn('[Supabase] unexpected save error:', err.message);
    return false;
  }
}

/**
 * Delete a property visual from Supabase
 */
export async function deletePropertyFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase] delete error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[Supabase] unexpected delete error:', err.message);
    return false;
  }
}
