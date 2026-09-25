import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { searchPubMed } from '../../lib/pubmed.js';
import { fetchNews } from '../../lib/news.js';
import { getWhoDemographics } from '../../lib/who.js';
import { getOecdDemographics } from '../../lib/oecd.js';
import {
  SINGAPORE_EARLY_WARNING_INDICATORS,
  INTERNATIONAL_EXPANSION_LESSONS
} from '../../lib/foresight-singapore.js';

export const MCP_PATH = '/api/mcp';

export const SERVER_INFO = {
  name: 'silver-pulse-geriatric-mcp',
  title: 'Silver Pulse Geriatric & Longevity Intelligence MCP',
  version: '3.0.0'
};

export const DATASET = {
  indicators_count: SINGAPORE_EARLY_WARNING_INDICATORS.length,
  lessons_count: INTERNATIONAL_EXPANSION_LESSONS.length,
  external_connectors: ['NCBI PubMed E-Utilities', 'Google News RSS', 'WHO GHO Athena', 'World Bank OECD'],
  statement: 'Silver Pulse live and benchmarked geriatric intelligence dataset covering health literature, aging demographics, and long-term care foresight.'
};

const INSTRUCTIONS =
  'Silver Pulse Geriatric & Longevity Intelligence MCP provides medical literature search, global elderly policy news, WHO life expectancies, OECD demographic dependency indices, and Singapore 2030-2035 eldercare foresight indicators.';

export async function mcpHandler(req, res) {
  // CORS & Security headers
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, MCP-Protocol-Version, Authorization');
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(204).end();
    }
    res.writeHead(204);
    res.end();
    return;
  }

  // Origin security verification if header present
  const origin = req.headers?.origin;
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      const host = req.headers?.host;
      const xForwardedHost = (req.headers?.['x-forwarded-host'] || '').split(',')[0].trim();
      if (host && originHost !== host && originHost !== xForwardedHost && !originHost.includes('localhost') && !originHost.includes('run.app') && !originHost.includes('vercel.app')) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(403).json({
          jsonrpc: '2.0',
          error: { code: -32000, message: `Forbidden origin: ${origin}` },
          id: null
        });
      }
    } catch {
      // Ignored if URL parse fails
    }
  }

  // On GET without text/event-stream in Accept header: return JSON describing server and tools
  const acceptHeader = req.headers?.accept || '';
  if (req.method === 'GET' && !acceptHeader.includes('text/event-stream')) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      status: 'ok',
      server: SERVER_INFO,
      mcp_path: MCP_PATH,
      dataset: DATASET,
      tools: [
        'silver_pulse_search_pubmed',
        'silver_pulse_fetch_news',
        'silver_pulse_get_who_demographics',
        'silver_pulse_get_oecd_demographics',
        'silver_pulse_get_singapore_early_warning'
      ],
      connection: {
        transport: 'streamable-http',
        methods: ['POST', 'GET'],
        sse_endpoint: MCP_PATH,
        docs: 'Send JSON-RPC 2.0 requests via POST to /api/mcp with Accept: application/json, text/event-stream'
      }
    });
  }

  // Enforce method: only POST and GET (SSE) are allowed
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'POST, GET');
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method not allowed. Send MCP messages with POST.' },
      id: null
    });
  }

  // Handle body parsing
  let body = req.body;
  if (req.method === 'POST') {
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32700, message: 'Parse error: Malformed JSON' },
          id: null
        });
      }
    } else if (!body && req.readable) {
      try {
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const text = Buffer.concat(buffers).toString('utf-8');
        body = text.trim() ? JSON.parse(text) : {};
      } catch {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({
          jsonrpc: '2.0',
          error: { code: -32700, message: 'Parse error: Malformed JSON' },
          id: null
        });
      }
    }
  }

  // Ensure request headers have content-type and accept for StreamableHTTPServerTransport
  if (req.headers) {
    if (req.method === 'POST') {
      if (!req.headers['content-type']) req.headers['content-type'] = 'application/json';
      if (!req.headers.accept) req.headers.accept = 'application/json, text/event-stream';
    } else if (req.method === 'GET') {
      if (!req.headers.accept) req.headers.accept = 'text/event-stream';
    }
  }

  // Build fresh McpServer instance on every request (stateless)
  const server = new McpServer(SERVER_INFO, { instructions: INSTRUCTIONS });

  // Register Tool 1: PubMed Search
  server.registerTool(
    'silver_pulse_search_pubmed',
    {
      description:
        'Returns medical and geriatric research citations, study abstracts, authors, and journal metadata from NCBI PubMed E-utilities. Agents should call this tool when retrieving evidence-based healthcare literature, clinical geriatric trials, or longevity biomedical data. This tool does not provide full-text PDF downloads or subscription-locked publisher articles.',
      inputSchema: {
        query: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe('Search query string for PubMed medical literature and geriatric research'),
        max_results: z
          .number()
          .optional()
          .describe('Maximum number of citations to return, between 1 and 20 (defaults to 10)')
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ query, max_results }) => {
      try {
        const result = await searchPubMed({ query: query.trim(), limit: max_results || 10 });
        const payload = {
          found: (result.items || []).length > 0,
          source: 'NCBI PubMed E-Utilities',
          result
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(payload) }],
          structuredContent: payload
        };
      } catch (err) {
        const msg = err.message || 'PubMed query failed';
        const payload = { found: false, source: 'NCBI PubMed', message: msg };
        return {
          isError: true,
          content: [
            { type: 'text', text: msg },
            { type: 'text', text: JSON.stringify(payload) }
          ],
          structuredContent: payload
        };
      }
    }
  );

  // Register Tool 2: Senior Health & Policy News
  server.registerTool(
    'silver_pulse_fetch_news',
    {
      description:
        'Returns current global and regional health news and public policy articles concerning senior care, aging demographics, and elder healthcare services. Articles are retrieved from Google News RSS syndication feeds filtering for senior healthcare and geriatric policy. Agents should call this tool when researching recent developments or policy shifts. It does not provide real-time stock quotes or emergency dispatch feeds.',
      inputSchema: {
        topic: z
          .string()
          .trim()
          .max(200)
          .optional()
          .describe('Senior healthcare topic to search news for, such as dementia, long-term care, Alzheimer, or geriatrics'),
        country: z
          .string()
          .trim()
          .max(10)
          .optional()
          .describe("Two-letter ISO country code for localized news coverage (e.g. 'US', 'GB', 'CA', 'AU', 'SG')")
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ topic, country }) => {
      try {
        const result = await fetchNews({ topic, country });
        const payload = {
          found: (result.items || []).length > 0,
          source: 'Google News RSS Feed',
          result
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(payload) }],
          structuredContent: payload
        };
      } catch (err) {
        const msg = err.message || 'News fetch failed';
        const payload = { found: false, source: 'Google News RSS', message: msg };
        return {
          isError: true,
          content: [
            { type: 'text', text: msg },
            { type: 'text', text: JSON.stringify(payload) }
          ],
          structuredContent: payload
        };
      }
    }
  );

  // Register Tool 3: WHO Demographics
  server.registerTool(
    'silver_pulse_get_who_demographics',
    {
      description:
        'Returns national life expectancies, healthy life expectancy (HALE), and elderly population health indicators by country from the World Health Organization (WHO) Global Health Observatory Athena API. Agents should use this tool when comparing international aging trends and longevity metrics. This tool does not provide individual patient records or hospital bed occupancies.',
      inputSchema: {
        country: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe("Two- or three-letter ISO country code (e.g., 'USA', 'JPN', 'DEU', 'GBR', 'SGP')"),
        indicator: z
          .string()
          .trim()
          .max(100)
          .optional()
          .describe("WHO indicator code, such as 'WHOSIS_000001' (Life expectancy at birth) or 'WHOSIS_000002' (HALE)")
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ country, indicator }) => {
      try {
        const result = await getWhoDemographics({ country, indicator });
        const payload = {
          found: (result.items || []).length > 0,
          source: 'World Health Organization GHO Athena',
          result
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(payload) }],
          structuredContent: payload
        };
      } catch (err) {
        const msg = err.message || 'WHO lookup failed';
        const payload = { found: false, source: 'WHO Athena', message: msg };
        return {
          isError: true,
          content: [
            { type: 'text', text: msg },
            { type: 'text', text: JSON.stringify(payload) }
          ],
          structuredContent: payload
        };
      }
    }
  );

  // Register Tool 4: OECD Demographics
  server.registerTool(
    'silver_pulse_get_oecd_demographics',
    {
      description:
        'Returns macroeconomic aging indicators, old-age dependency ratios, and elder population percentages across OECD members from World Bank / OECD statistical repositories. Agents should use this tool to evaluate societal aging burdens and long-term care sustainability. This tool does not provide granular municipal census data or private pension balances.',
      inputSchema: {
        country: z
          .string()
          .trim()
          .max(200)
          .optional()
          .describe("Three-letter ISO code for an OECD country (e.g. 'USA', 'JPN', 'DEU', 'GBR') or 'OED' for OECD member aggregate"),
        indicator: z
          .string()
          .trim()
          .max(100)
          .optional()
          .describe("OECD indicator code such as 'SP.POP.DPND.OL' (Old-age dependency ratio) or 'SP.POP.65UP.TO.ZS' (% 65+)")
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async ({ country, indicator }) => {
      try {
        const result = await getOecdDemographics({
          country: country || 'OED',
          indicator: indicator || 'SP.POP.DPND.OL'
        });
        const payload = {
          found: (result.items || []).length > 0,
          source: 'OECD / World Bank Open Data',
          result
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(payload) }],
          structuredContent: payload
        };
      } catch (err) {
        const msg = err.message || 'OECD lookup failed';
        const payload = { found: false, source: 'OECD / World Bank', message: msg };
        return {
          isError: true,
          content: [
            { type: 'text', text: msg },
            { type: 'text', text: JSON.stringify(payload) }
          ],
          structuredContent: payload
        };
      }
    }
  );

  // Register Tool 5: Singapore Early Warning & LTC Foresight
  server.registerTool(
    'silver_pulse_get_singapore_early_warning',
    {
      description:
        'Returns early warning demographic indicators, healthcare utilization ratios, and international long-term care expansion lessons for Singapore’s 2030 to 2035 ageing population transition. Data is synthesized from Singapore Ministry of Health, AIC community care reports, and international LTC models. Agents should use this tool when evaluating ageing-in-place sustainability, early warning signals, or caregiver strain projections.',
      inputSchema: {
        category: z
          .string()
          .trim()
          .max(200)
          .optional()
          .describe("Optional category filter: 'Demographic Ratio', 'Healthcare Utilization', 'Caregiver Strain', or 'Social Vulnerability'")
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ category }) => {
      try {
        let items = SINGAPORE_EARLY_WARNING_INDICATORS;
        if (category && typeof category === 'string') {
          items = items.filter((ind) => ind.category.toLowerCase().includes(category.toLowerCase()));
        }
        const payload = {
          found: items.length > 0,
          source: 'Silver Pulse Singapore Eldercare 2030-2035 Foresight Engine',
          result: {
            items: items.slice(0, 20),
            international_lessons: INTERNATIONAL_EXPANSION_LESSONS,
            fetched_at: new Date().toISOString()
          }
        };
        return {
          content: [{ type: 'text', text: JSON.stringify(payload) }],
          structuredContent: payload
        };
      } catch (err) {
        const msg = err.message || 'Singapore foresight retrieval failed';
        const payload = { found: false, source: 'Singapore Foresight Engine', message: msg };
        return {
          isError: true,
          content: [
            { type: 'text', text: msg },
            { type: 'text', text: JSON.stringify(payload) }
          ],
          structuredContent: payload
        };
      }
    }
  );

  // Transport initialization
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  const cleanup = () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  };

  res.on('close', cleanup);
  res.on('finish', cleanup);

  await server.connect(transport);
  await transport.handleRequest(req, res, body);
}
