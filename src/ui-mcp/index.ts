#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

// For CommonJS compatibility, use process.cwd() and relative paths
const __dirname = process.cwd();

const app = express();
const PORT = process.env.PORT || 3000;

// Session management for SSE connections
const sessions = new Map<string, { server: any; transport: any }>();

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['POST', 'OPTIONS', 'GET', 'DELETE'],
    allowedHeaders: [
      'mcp-session-id',
      'Content-Type',
      'Accept',
      'mcp-session-id',
      'mcp-protocol-version',
    ],
    exposedHeaders: ['mcp-session-id', 'mcp-protocol-version'],
    credentials: true,
  }),
);
app.use(express.json());

// Handle OPTIONS preflight for all routes
// app.options("*", cors());

// Resource paths
const WIDGET_RESOURCE_PATH = join(__dirname, 'resources', 'widgetResource.md');
const PAGE_RESOURCE_PATH = join(__dirname, 'resources', 'pageResource.md');

// Tool handlers
async function handleReadWidget() {
  try {
    const content = await readFile(WIDGET_RESOURCE_PATH, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error reading widget resource: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

async function handleReadPage() {
  try {
    const content = await readFile(PAGE_RESOURCE_PATH, 'utf-8');
    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error reading page resource: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

// Create MCP Server instance
function createMCPServer() {
  const server = new Server(
    {
      name: 'mcp-demo-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Register tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'read_widget_resource',
          description:
            'Reads the content of widgetResource.md file. This file contains widget-related information and documentation.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'read_page_resource',
          description:
            'Reads the content of pageResource.md file. This file contains page-related information and documentation.',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;

    switch (name) {
      case 'read_widget_resource':
        return await handleReadWidget();

      case 'read_page_resource':
        return await handleReadPage();

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  });

  return server;
}

// HTTP Streaming endpoint (stateless MCP)
app.post('/mcp', async (req, res) => {
  console.log('HTTP streaming request received');

  try {
    // Create a new MCP server instance for this request
    const server = createMCPServer();

    // Create HTTP streaming transport in stateless mode
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode
    });

    res.on('close', () => {
      transport.close();
    });

    // Connect server to transport
    await server.connect(transport);

    // Handle the request
    await transport.handleRequest(req, res, req.body);

    console.log('HTTP streaming request processed successfully');
  } catch (error) {
    console.error('Error in HTTP streaming endpoint:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// SSE endpoint (for MCP Inspector)
app.get('/sse', async (req, res) => {
  console.log('SSE connection established (for MCP Inspector)');

  try {
    // Create a new MCP server instance for this connection
    const server = createMCPServer();

    // Generate unique session ID
    const sessionId = Math.random().toString(36).substring(7);
    console.log(`Generated session ID: ${sessionId}`);

    // Create SSE transport with session-specific message endpoint
    const transport = new SSEServerTransport(
      `/message?sessionId=${sessionId}`,
      res,
    );

    // Store session before connecting
    sessions.set(sessionId, { server, transport });
    console.log(
      `Session ${sessionId} stored. Total sessions: ${sessions.size}`,
    );

    // Connect server to transport (this will set up SSE headers and send endpoint event)
    await server.connect(transport);

    console.log(`Session ${sessionId} connected and ready`);

    // Handle client disconnect
    req.on('close', () => {
      console.log(`SSE connection closed for session ${sessionId}`);
      sessions.delete(sessionId);
      console.log(
        `Session ${sessionId} removed. Remaining sessions: ${sessions.size}`,
      );
      server.close().catch(console.error);
    });
  } catch (error) {
    console.error('Error in SSE endpoint:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// POST endpoint for messages (used by SSE transport)
app.post('/message', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  console.log(`Received message for session: ${sessionId}`);
  console.log(`Available sessions: ${Array.from(sessions.keys()).join(', ')}`);

  // Validate session ID
  if (!sessionId) {
    console.error('Missing sessionId in request');
    return res.status(400).json({ error: 'Missing sessionId parameter' });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    console.error(`Session not found: ${sessionId}`);
    console.log(`Current sessions: ${Array.from(sessions.keys()).join(', ')}`);
    return res.status(404).json({ error: 'Session not found' });
  }

  console.log(`Processing message for session ${sessionId}`);

  // Let the transport handle the message
  try {
    await session.transport.handlePostMessage(req.body, res);
    console.log(`Message processed successfully for session ${sessionId}`);
  } catch (error) {
    console.error(`Error handling message for session ${sessionId}:`, error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    server: 'mcp-demo',
    version: '1.0.0',
    transports: ['http-streaming', 'sse'],
    endpoints: {
      mcp: '/mcp',
      sse: '/sse',
      message: '/message',
      health: '/health',
    },
  });
});

// Root endpoint with information
app.get('/', (req, res) => {
  res.json({
    name: 'MCP Demo Server',
    description: 'MCP Server with HTTP Streaming and SSE support',
    version: '1.0.0',
    transports: ['http-streaming', 'sse'],
    endpoints: {
      mcp: {
        path: '/mcp',
        method: 'POST',
        transport: 'http-streaming',
        description: 'HTTP streaming endpoint for stateless MCP communication',
      },
      sse: {
        path: '/sse',
        method: 'GET',
        transport: 'sse',
        description: 'SSE endpoint for MCP Inspector',
      },
      message: {
        path: '/message',
        method: 'POST',
        transport: 'sse',
        description: 'Message endpoint for SSE transport',
      },
      health: {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint',
      },
    },
    tools: [
      {
        name: 'read_widget_resource',
        description: 'Reads the content of widgetResource.md file',
      },
      {
        name: 'read_page_resource',
        description: 'Reads the content of pageResource.md file',
      },
    ],
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err instanceof Error ? err.message : String(err),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MCP Demo Server running on http://localhost:${PORT}`);
  console.log(`\n📡 Available Transports:`);
  console.log(`   1. HTTP Streaming (Stateless):`);
  console.log(`      - MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`\n   2. SSE (for MCP Inspector):`);
  console.log(`      - SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`      - Message endpoint: http://localhost:${PORT}/message`);
  console.log(`\n❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`\n🔧 Available tools:`);
  console.log(`   - read_widget_resource: Reads widgetResource.md`);
  console.log(`   - read_page_resource: Reads pageResource.md`);
  console.log(`\n💡 Quick Test:`);
  console.log(`   HTTP Streaming: npm run test-streaming`);
  console.log(`   MCP Inspector: npm run test`);
});

export default app;
