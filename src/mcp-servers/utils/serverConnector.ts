import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export const connect = async (transport: Transport, server: McpServer) => {
  try {
    await server.connect(transport);
    console.log(
      `MCP server connected to new transport for session: ${
        transport.sessionId || 'new'
      }`,
    );
    return transport;
  } catch (error) {
    console.error('Failed to connect MCP server to transport:', error);
    return null;
  }
};
