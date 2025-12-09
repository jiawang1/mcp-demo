import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Logger } from '../mcp-servers/utils/logger';
import { getPageResource, getWidgetResource } from './tools/getUIResource';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const ROUTE = 'ui-resource-mcp';

// Logger setup
const logger = Logger.getMcpServerLogger();

// MCP Server
const mcpServer = new McpServer({
  name: 'plu-ui-resource-mcp-server',
  version: '1.0.0',
});

mcpServer.registerTool(
  'ui-page-resource',
  {
    title: 'Admin Web Page Resources',
    description:
      'Get page resources. Returns information about all available admin pages including their URLs, IDs, descriptions, and technical specifications.',
    inputSchema: {},
  },
  async () => {
    logger.info({
      message: 'MCP tool called: ui-page-resource',
    });
    const content = await getPageResource();
    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  },
);

mcpServer.registerTool(
  'ui-widget-resource',
  {
    title: 'Admin Widget Resources',
    description:
      'Get widget(page fragment) resources. Returns information about all available admin widgets including their names, paths, descriptions, and prerequisites.',
    inputSchema: {},
  },
  async () => {
    logger.info({
      message: 'MCP tool called: ui-widget-resource',
    });
    const content = await getWidgetResource();
    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  },
);

logger.info({
  message: 'UI Resource MCP Server initialized',
  version: '1.0.0',
  toolsCount: 2,
  route: ROUTE,
});

export default {
  route: ROUTE,
  server: mcpServer,
};
