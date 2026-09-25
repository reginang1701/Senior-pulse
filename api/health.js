import {
  MCP_PATH,
  SERVER_INFO,
  DATASET
} from './_lib/mcp-server.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    status: 'ok',
    mcp_path: MCP_PATH,
    server: SERVER_INFO,
    dataset: DATASET,
    timestamp: new Date().toISOString()
  });
}
