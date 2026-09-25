import { searchPubMed } from '../lib/pubmed.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query, limit } = req.query || {};

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const result = await searchPubMed({
      query: query.trim(),
      limit: limit ? parseInt(limit, 10) : 10
    });
    return res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: err.message || 'PubMed search failed',
      status
    });
  }
}
