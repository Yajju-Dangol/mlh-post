import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_shared';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // DELETE /api/properties/:id
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Missing property id' });
      }

      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, deletedId: id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
