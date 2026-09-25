import { fetchNews } from '../lib/news.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, country } = req.query || {};

  try {
    const result = await fetchNews({
      topic: typeof topic === 'string' ? topic : '',
      country: typeof country === 'string' ? country : 'US'
    });
    return res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: err.message || 'News fetch failed',
      status
    });
  }
}
