# Master Prompt & Architecture Specification Artifacts

This document records the master prompt instructions, architectural directives, and implementation patterns applied to build, configure, and maintain the **Silver Pulse** Model Context Protocol (MCP) server, API routes, and client integrations.

---

## 1. Master Prompt: MCP Server Architecture & Vercel Specification

The following master prompt specification was used to structure the stateless MCP server and enforce proper serverless layout conventions:

```markdown
MASTER PROMPT · Replace dead MCP server with an internal MCP server at /api/mcp

ROLE: You are a senior full-stack developer working in this Vite + React project. It has server.ts, which the AI Studio / local preview runs, and an api/ folder at the project root, which Vercel runs.

GOAL: Replace any remote or offline MCP server with a real, stateless MCP server inside this app at /api/mcp that serves the dataset, and ensure all screens and clients access data consistently through standardized JSON-RPC 2.0.

REQUIREMENTS & PATTERNS:
1) Dependencies:
   - Add @modelcontextprotocol/sdk at exactly version 1.30.1 and zod at ^4.6.5.
   - Use esbuild ^0.25.0 / ^0.27.0 with Vite.
   - Do not use mcp-handler or @modelcontextprotocol/server (they are built for Web Request handlers); use standard (req, res) handlers compatible with Express and Vercel.
   - Keep bun.lock as the primary lockfile; avoid adding package-lock.json when deploying with Bun on Vercel.

2) Vercel Serverless Folder Convention:
   - Move internal MCP engine and data helpers into `api/_lib/` (e.g. `api/_lib/mcp-server.js`).
   - Vercel automatically treats any file directly inside `api/` as a public serverless endpoint unless the file or directory starts with an underscore (`_`).

3) Strict Data Validation & Deterministic Lookups:
   - Make data reflect verified sources and explicit demo/live indicators.
   - Ensure tools return clean errors when queries are ambiguous, empty, or not found.

4) Server Implementation (`api/_lib/mcp-server.js`):
   - Export `MCP_PATH` ("/api/mcp"), `SERVER_INFO`, `DATASET`, and async function `mcpHandler(req, res)`.
   - Security: Validate Origin header against Host / X-Forwarded-Host if present; return 403 on untrusted origins.
   - GET without `text/event-stream`: Return 200 with JSON describing SERVER_INFO, tool names, DATASET, and transport instructions.
   - Other unsupported HTTP methods: Return 405 with `Allow: POST, GET` and JSON-RPC -32000 error.
   - POST: Safely parse JSON body. Handle parse failures with 400 and JSON-RPC code -32700.
   - Create `new McpServer(SERVER_INFO)` and `StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true })`.
   - Clean up on `res.on('close')`: close transport and server. Build fresh on every request (stateless architecture).

5) Tool Registrations with `server.registerTool`:
   - Register tools with descriptive docstrings detailing upstream sources, agent use-cases, and explicit limitations.
   - Validate inputs using Zod with character bounds and descriptions.
   - Set annotations: `{ readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false / true }`.
   - Return dual content: `{ content: [{ type: "text", text: JSON.stringify(payload) }], structuredContent: payload }`.
   - On error or missing data: return `{ isError: true, content: [...], structuredContent: payload }`.

6) Clean Route Exposing (`api/mcp.js` & `server.ts`):
   - `api/mcp.js` should be a clean 1-line re-export:
     `export { mcpHandler as default } from './_lib/mcp-server.js';`
   - In `server.ts`, mount `app.all('/api/mcp', mcpHandler)` above static middlewares.
   - Provide an `/api/health` endpoint reporting `MCP_PATH`, `SERVER_INFO`, and `DATASET`.
   - Add Express error handling for `/api` that transforms JSON parse errors into code -32700.

7) Client Integration:
   - Provide a client capable of sending `initialize`, `notifications/initialized`, and `tools/call`.
   - Set header `Accept: application/json, text/event-stream`.
   - Measure real browser round-trip latency.
```

---

## 2. Implementation in Silver Pulse

In accordance with the specification above, the following files and routes were implemented in this repository:

### File Structure
* **`api/_lib/mcp-server.js`**: Core MCP server engine, tool definitions, Zod validation, and transport handler.
* **`api/mcp.js`**: Public Vercel serverless entry point exporting `mcpHandler` from `_lib`.
* **`api/health.js`**: Public health check endpoint for Vercel.
* **`server.ts`**: Local and Cloud Run Express server routing `/api/mcp`, `/api/health`, and data proxies.
* **`smithery.yaml`**: Smithery.ai manifest for indexing with Claude Desktop, Cursor, and Smithery CLI.

### Registered MCP Tools
1. **`silver_pulse_search_pubmed`**: NCBI PubMed E-utilities medical literature citations and abstracts.
2. **`silver_pulse_fetch_news`**: Google News RSS senior healthcare policy syndication.
3. **`silver_pulse_get_who_demographics`**: World Health Organization (WHO) GHO Athena aging indicators.
4. **`silver_pulse_get_oecd_demographics`**: OECD and World Bank old-age dependency and demographic metrics.
5. **`silver_pulse_get_singapore_early_warning`**: Singapore 2030-2035 eldercare foresight indicators and international long-term care policy lessons.
