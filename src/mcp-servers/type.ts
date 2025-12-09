import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export type MCPServerConfig = {
  route: string;
  server: McpServer;
};

export interface McpRouterCreator {
  create: (server: MCPServerConfig) => express.Router;
}

export const MCP_ROUTES = {
  sse: 'sse',
  stream: 'stream',
} as const;
