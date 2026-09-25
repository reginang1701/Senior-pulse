import { CURRENT_SENIOR_SERVICES, HORIZON_SCAN_TRENDS } from '../lib/services-catalog.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { category, type } = req.query || {};

  if (type === 'trends') {
    return res.status(200).json({
      items: HORIZON_SCAN_TRENDS,
      source: 'Silver Pulse Horizon Scanning Matrix',
      fetched_at: new Date().toISOString()
    });
  }

  let filtered = CURRENT_SENIOR_SERVICES;
  if (category && typeof category === 'string') {
    filtered = filtered.filter((s) => s.category.toLowerCase().includes(category.toLowerCase()));
  }

  return res.status(200).json({
    items: filtered,
    total: filtered.length,
    source: 'Silver Pulse Senior Services Catalog',
    fetched_at: new Date().toISOString()
  });
}
