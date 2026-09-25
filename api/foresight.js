import {
  SINGAPORE_EARLY_WARNING_INDICATORS,
  INTERNATIONAL_EXPANSION_LESSONS,
  STAKEHOLDER_MATRIX,
  STRATEGIC_RISK_ANALYSIS
} from '../lib/foresight-singapore.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, category } = req.query || {};

  if (type === 'lessons') {
    return res.status(200).json({
      items: INTERNATIONAL_EXPANSION_LESSONS,
      source: 'International Ageing-in-Place Expansion Lessons (Japan, UK, Germany, Nordics)',
      fetched_at: new Date().toISOString()
    });
  }

  if (type === 'stakeholders') {
    return res.status(200).json({
      items: STAKEHOLDER_MATRIX,
      source: 'Singapore Eldercare Stakeholder Matrix (MOH, AIC, CCOs, Planning Teams)',
      fetched_at: new Date().toISOString()
    });
  }

  if (type === 'risks') {
    return res.status(200).json({
      items: STRATEGIC_RISK_ANALYSIS,
      source: 'Strategic Risk & Mitigation Analysis',
      fetched_at: new Date().toISOString()
    });
  }

  let indicators = SINGAPORE_EARLY_WARNING_INDICATORS;
  if (category && typeof category === 'string') {
    indicators = indicators.filter((ind) => ind.category.toLowerCase().includes(category.toLowerCase()));
  }

  return res.status(200).json({
    items: indicators,
    lessons: INTERNATIONAL_EXPANSION_LESSONS,
    stakeholders: STAKEHOLDER_MATRIX,
    risks: STRATEGIC_RISK_ANALYSIS,
    source: 'Silver Pulse Singapore 2030-2035 Eldercare Foresight Engine',
    fetched_at: new Date().toISOString()
  });
}
