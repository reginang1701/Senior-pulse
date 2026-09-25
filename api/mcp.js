import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { searchPubMed } from '../lib/pubmed.js';
import { fetchNews } from '../lib/news.js';
import { getWhoDemographics } from '../lib/who.js';
import { getOecdDemographics } from '../lib/oecd.js';
import {
  SINGAPORE_EARLY_WARNING_INDICATORS,
  INTERNATIONAL_EXPANSION_LESSONS
} from '../lib/foresight-singapore.js';

export default async function handler(req, res) {
  // Set CORS headers for all MCP clients
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
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

  // Adjust Accept header for MCP Streamable HTTP / SSE transport compliance
  if (req.headers) {
    if (req.method === 'GET') {
      if (!req.headers.accept || !req.headers.accept.includes('text/event-stream')) {
        req.headers.accept = 'text/event-stream';
      }
    } else if (req.method === 'POST') {
      if (!req.headers.accept || !req.headers.accept.includes('text/event-stream')) {
        req.headers.accept = 'application/json, text/event-stream';
      }
    }
  }

  const server = new McpServer({
    name: 'Silver_Pulse-server',
    version: '1.0.0'
  });

  // Tool 1: PubMed Search
  server.registerTool(
    'silver_pulse_search_pubmed',
    {
      description:
        'Returns recent medical and geriatric research literature citations, study abstracts, authors, and journal publication metadata. Data is retrieved directly from the National Center for Biotechnology Information (NCBI) PubMed E-utilities engine. Agents should use this tool when answering medical research questions, exploring clinical trials on aging, or looking up evidence-based healthcare literature for elderly populations. This tool does not provide full-text PDF downloads or access to paid subscription articles.',
      inputSchema: {
        query: z
          .string()
          .describe('Search query string for PubMed medical literature and geriatric research'),
        max_results: z
          .number()
          .int()
          .min(1)
          .max(20)
          .optional()
          .describe('Maximum number of citations to return, between 1 and 20 (defaults to 10)')
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async ({ query, max_results }) => {
      try {
        const result = await searchPubMed({ query, limit: max_results || 10 });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (err) {
        const status = err.status || 500;
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `NCBI PubMed literature search failed with upstream status ${status}.`
            }
          ]
        };
      }
    }
  );

  // Tool 2: Senior Health & Policy News
  server.registerTool(
    'silver_pulse_fetch_news',
    {
      description:
        'Returns current global and regional health news and public policy articles concerning senior care, aging demographics, and elder healthcare services. Articles are retrieved directly from Google News RSS syndication feeds filtering for senior healthcare and geriatric policy. Agents should call this tool when researching recent developments, government policies, or trending healthcare stories affecting elderly citizens. It does not provide real-time financial market stock quotes or emergency medical dispatch alerts.',
      inputSchema: {
        topic: z
          .string()
          .optional()
          .describe(
            'Specific senior healthcare topic to search news for, such as dementia, long-term care, Alzheimer, or geriatrics'
          ),
        country: z
          .string()
          .length(2)
          .optional()
          .describe("Two-letter ISO country code for localized news coverage (e.g. 'US', 'GB', 'CA', 'AU')")
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async ({ topic, country }) => {
      try {
        const result = await fetchNews({ topic, country });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (err) {
        const status = err.status || 500;
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Senior care news retrieval failed with upstream status ${status}.`
            }
          ]
        };
      }
    }
  );

  // Tool 3: WHO Demographics
  server.registerTool(
    'silver_pulse_get_who_demographics',
    {
      description:
        'Returns demographic statistics, national life expectancies, healthy life expectancy metrics, and elderly population health indicators by country. Data is retrieved directly from the World Health Organization (WHO) Global Health Observatory Athena OData API. Agents should use this tool when comparing aging populations, cross-national life expectancies, or senior health outcomes across countries. This tool does not provide individual patient records or regional municipal hospital occupancy counts.',
      inputSchema: {
        country: z
          .string()
          .describe("Two- or three-letter ISO country code (e.g., 'USA', 'JPN', 'DEU', 'GBR')"),
        indicator: z
          .string()
          .optional()
          .describe(
            "WHO indicator code, such as 'WHOSIS_000001' (Life expectancy at birth), 'WHOSIS_000002' (Healthy life expectancy HALE), or 'WHOSIS_000015' (Life expectancy at age 60)"
          )
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async ({ country, indicator }) => {
      try {
        const result = await getWhoDemographics({ country, indicator });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (err) {
        const status = err.status || 500;
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `WHO demographics lookup failed with upstream status ${status}.`
            }
          ]
        };
      }
    }
  );

  // Tool 4: OECD Demographics & Aging Society Indicators
  server.registerTool(
    'silver_pulse_get_oecd_demographics',
    {
      description:
        'Returns macroeconomic demographic metrics, old-age dependency ratios, elder population percentages, and healthcare expenditures across OECD member states. Data is retrieved directly from OECD demographic indicators and World Bank Open Data feeds. Agents should use this tool when evaluating societal aging burdens, long-term care sustainability, or economic policy impacts on senior populations. This tool does not provide granular sub-national municipal data or private pension account valuations.',
      inputSchema: {
        country: z
          .string()
          .optional()
          .describe("Three-letter ISO code for an OECD country (e.g. 'USA', 'JPN', 'DEU', 'GBR') or 'OED' for OECD member aggregate"),
        indicator: z
          .string()
          .optional()
          .describe("OECD demographic indicator code such as 'SP.POP.DPND.OL' (Old-age dependency ratio), 'SP.POP.65UP.TO.ZS' (Population 65+ % of total), or 'SP.DYN.LE00.IN' (Life expectancy)")
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async ({ country, indicator }) => {
      try {
        const result = await getOecdDemographics({ country: country || 'OED', indicator: indicator || 'SP.POP.DPND.OL' });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (err) {
        const status = err.status || 500;
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `OECD demographic lookup failed with upstream status ${status}.`
            }
          ]
        };
      }
    }
  );

  // Tool 5: Singapore 2030-2035 Early Warning Indicators & International LTC Expansion Lessons
  server.registerTool(
    'silver_pulse_get_singapore_early_warning',
    {
      description:
        'Returns early warning demographic indicators, systemic healthcare utilization metrics, and international long-term care expansion lessons for Singapore’s 2030 to 2035 ageing population transition. Data is synthesized from Singapore Ministry of Health, AIC community care reports, and comparative OECD aging analyses. Agents should use this tool when evaluating ageing-in-place sustainability, early warning signals, or caregiver strain projections for Singapore. This tool does not provide individual identifiable patient health records or confidential ministerial cabinet papers.',
      inputSchema: {
        category: z
          .string()
          .optional()
          .describe("Optional category filter: 'Demographic Ratio', 'Healthcare Utilization', 'Caregiver Strain', or 'Social Vulnerability'")
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: true
      }
    },
    async ({ category }) => {
      try {
        let items = SINGAPORE_EARLY_WARNING_INDICATORS;
        if (category && typeof category === 'string') {
          items = items.filter((ind) => ind.category.toLowerCase().includes(category.toLowerCase()));
        }
        const result = {
          items: items.slice(0, 20),
          international_lessons: INTERNATIONAL_EXPANSION_LESSONS,
          source: 'Singapore Eldercare 2030-2035 Foresight Engine & International LTC Lessons',
          fetched_at: new Date().toISOString()
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result)
            }
          ]
        };
      } catch (err) {
        const status = err.status || 500;
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Singapore early warning indicator retrieval failed with upstream status ${status}.`
            }
          ]
        };
      }
    }
  );

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  res.on('close', () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
