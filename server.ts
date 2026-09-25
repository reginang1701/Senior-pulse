import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mcpHandler from './api/mcp.js';
import { MCP_PATH, SERVER_INFO, DATASET } from './api/_lib/mcp-server.js';
import { searchPubMed } from './lib/pubmed.js';
import { fetchNews } from './lib/news.js';
import { getWhoDemographics } from './lib/who.js';
import { getOecdDemographics } from './lib/oecd.js';
import { CURRENT_SENIOR_SERVICES, HORIZON_SCAN_TRENDS } from './lib/services-catalog.js';
import {
  SINGAPORE_EARLY_WARNING_INDICATORS,
  INTERNATIONAL_EXPANSION_LESSONS,
  STAKEHOLDER_MATRIX,
  STRATEGIC_RISK_ANALYSIS
} from './lib/foresight-singapore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // For /api/mcp, normalize Content-Type and Accept headers to ensure complete client tolerance
  app.use('/api/mcp', (req, _res, next) => {
    if (req.method === 'POST') {
      const newRaw: string[] = [];
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        const k = req.rawHeaders[i].toLowerCase();
        if (k !== 'content-type' && k !== 'accept') {
          newRaw.push(req.rawHeaders[i], req.rawHeaders[i + 1]);
        }
      }
      newRaw.push('Content-Type', 'application/json');
      newRaw.push('Accept', 'application/json, text/event-stream');
      req.rawHeaders = newRaw;
      req.headers['content-type'] = 'application/json';
      req.headers['accept'] = 'application/json, text/event-stream';
    } else if (req.method === 'GET') {
      const newRaw: string[] = [];
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        const k = req.rawHeaders[i].toLowerCase();
        if (k !== 'accept') {
          newRaw.push(req.rawHeaders[i], req.rawHeaders[i + 1]);
        }
      }
      newRaw.push('Accept', 'text/event-stream');
      req.rawHeaders = newRaw;
      req.headers['accept'] = 'text/event-stream';
    }
    next();
  });

  app.use(express.json());

  // MCP Server Endpoint: supports GET (SSE stream), POST (JSON-RPC), OPTIONS (CORS), and DELETE
  app.all('/api/mcp', mcpHandler);

  // Existing Data Routes (calling shared functions directly)
  app.get('/api/pubmed', async (req, res) => {
    const { query, limit } = req.query;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    try {
      const result = await searchPubMed({
        query: query.trim(),
        limit: limit ? parseInt(limit as string, 10) : 10
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        error: err.message || 'PubMed search failed',
        status
      });
    }
  });

  app.get('/api/news', async (req, res) => {
    const { topic, country } = req.query;
    try {
      const result = await fetchNews({
        topic: typeof topic === 'string' ? topic : '',
        country: typeof country === 'string' ? country : 'US'
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        error: err.message || 'News fetch failed',
        status
      });
    }
  });

  app.get('/api/who-demographics', async (req, res) => {
    const { country, indicator } = req.query;
    try {
      const result = await getWhoDemographics({
        country: typeof country === 'string' ? country : 'USA',
        indicator: typeof indicator === 'string' ? indicator : 'WHOSIS_000001'
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        error: err.message || 'WHO demographics lookup failed',
        status
      });
    }
  });

  app.get('/api/oecd-demographics', async (req, res) => {
    const { country, indicator } = req.query;
    try {
      const result = await getOecdDemographics({
        country: typeof country === 'string' ? country : 'OED',
        indicator: typeof indicator === 'string' ? indicator : 'SP.POP.DPND.OL'
      });
      return res.status(200).json(result);
    } catch (err: any) {
      const status = err.status || 500;
      return res.status(status).json({
        error: err.message || 'OECD demographics lookup failed',
        status
      });
    }
  });

  app.get('/api/current-services', async (req, res) => {
    const { type, category } = req.query;
    if (type === 'trends') {
      return res.status(200).json({
        items: HORIZON_SCAN_TRENDS,
        source: 'Silver Pulse Horizon Scanning Matrix',
        fetched_at: new Date().toISOString()
      });
    }
    let filtered = CURRENT_SENIOR_SERVICES;
    if (category && typeof category === 'string') {
      filtered = filtered.filter((s) => s.category.toLowerCase().includes((category as string).toLowerCase()));
    }
    return res.status(200).json({
      items: filtered,
      total: filtered.length,
      source: 'Silver Pulse Senior Services Catalog',
      fetched_at: new Date().toISOString()
    });
  });

  app.get('/api/foresight', async (req, res) => {
    const { type, category } = req.query;
    if (type === 'lessons') {
      return res.status(200).json({
        items: INTERNATIONAL_EXPANSION_LESSONS,
        source: 'International Ageing-in-Place Expansion Lessons',
        fetched_at: new Date().toISOString()
      });
    }
    if (type === 'stakeholders') {
      return res.status(200).json({
        items: STAKEHOLDER_MATRIX,
        source: 'Singapore Eldercare Stakeholder Matrix',
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
      indicators = indicators.filter((ind) => ind.category.toLowerCase().includes((category as string).toLowerCase()));
    }
    return res.status(200).json({
      items: indicators,
      lessons: INTERNATIONAL_EXPANSION_LESSONS,
      stakeholders: STAKEHOLDER_MATRIX,
      risks: STRATEGIC_RISK_ANALYSIS,
      source: 'Silver Pulse Singapore 2030-2035 Eldercare Foresight Engine',
      fetched_at: new Date().toISOString()
    });
  });

  // Health check endpoint reporting MCP configuration and status
  app.get('/api/health', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      status: 'ok',
      mcp_path: MCP_PATH,
      server: SERVER_INFO,
      dataset: DATASET,
      timestamp: new Date().toISOString()
    });
  });

  // Error handler for /api converting JSON errors into JSON-RPC responses
  app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.setHeader('Content-Type', 'application/json');
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error: Invalid JSON payload' },
        id: null
      });
    }
    return res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: err?.message || 'Invalid Request' },
      id: null
    });
  });

  // Frontend integration: Vite middlewares in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Silver Pulse server running on http://0.0.0.0:${PORT}`);
    console.log(`MCP server active at http://0.0.0.0:${PORT}/api/mcp`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
