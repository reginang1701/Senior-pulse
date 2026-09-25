import { getWhoDemographics } from '../lib/who.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { country, indicator } = req.query || {};

  try {
    const result = await getWhoDemographics({
      country: typeof country === 'string' ? country : 'USA',
      indicator: typeof indicator === 'string' ? indicator : 'WHOSIS_000001'
    });
    return res.status(200).json(result);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: err.message || 'WHO demographics lookup failed',
      status
    });
  }
}
