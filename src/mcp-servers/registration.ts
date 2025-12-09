import type { MCPServerConfig } from './type';
import uiMcpConfig from '../ui-resource-mcp/mcpServer';

export const getMcpConfig: () => MCPServerConfig[] = () => {
  return [uiMcpConfig];
};
