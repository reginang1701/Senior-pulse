import { getOecdDemographics } from '../lib/oecd.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { country, indicator } = req.query || {};

  try {
    const result = await getOecdDemographics({
      country: typeof country === 'string' ? country : 'OED',
      indicator: typeof indicator === 'string' ? indicator : 'SP.POP.DPND.OL'
    });
    return res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: err.message || 'OECD demographics lookup failed',
      status
    });
  }
}
