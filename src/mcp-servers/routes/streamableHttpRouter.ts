import * as express from 'express';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { raiseJSONRpcBadRequestError } from '../utils/requestHandler';
import { MCP_SESSION_ID } from '../utils/constant';
import { TransportFactory, TransportType } from '../utils/TransportFactory';
import { connect } from '../utils/serverConnector';
import { getTransport, getSessionId } from '../utils/sessionStore';
import type { MCPServerConfig, McpRouterCreator } from '../type';
import { MCP_ROUTES } from '../type';

export class StreamableHttpRouterCreator implements McpRouterCreator {
  create = (config) => {
    const server = config.server;
    const router = express.Router();

    // MCP endpoint - handle POST methods for streamable HTTP
    router.post(
      `/${MCP_ROUTES.stream}`,
      async (req: express.Request, res: express.Response) => {
        const sessionId = req.headers[MCP_SESSION_ID] as string | undefined;
        const shouldCreate = isInitializeRequest(req.body);
        let existingtransport = getTransport(sessionId);

        if (!existingtransport && shouldCreate) {
          existingtransport = TransportFactory.createTransport(
            TransportType.StreamableHTTP,
            {
              sessionIdGenerator: getSessionId,
            },
          );
          // Connect the MCP server to the new transport
          await connect(existingtransport, server);
        }

        if (!existingtransport) {
          console.log(req.path, 'bad post request');
          raiseJSONRpcBadRequestError(res);
          return;
        }

        (existingtransport as any).handleRequest(req, res, req.body);
      },
    );

    const handleStreamableSessionRequest = async (
      req: express.Request,
      res: express.Response,
    ) => {
      const sessionId = req.headers[MCP_SESSION_ID] as string | undefined;
      const transport = getTransport(sessionId);

      if (!sessionId || !transport) {
        console.log(req.path, 'bad request - missing session or transport');
        raiseJSONRpcBadRequestError(res);
        return;
      }

      // Check if transport has handleRequest method (StreamableHTTPServerTransport)
      if (
        'handleRequest' in transport &&
        typeof transport.handleRequest === 'function'
      ) {
        transport.handleRequest(req, res, req.body);
      } else {
        // For SSEServerTransport, we need different handling
        console.log(
          'SSE transport does not support handleRequest for this method',
        );
        raiseJSONRpcBadRequestError(res);
      }
    };

    // Handle GET requests for server-to-client notifications via streamable HTTP
    router.get(`/${MCP_ROUTES.stream}`, handleStreamableSessionRequest);

    // Handle DELETE requests for session termination via streamable HTTP
    router.delete(`/${MCP_ROUTES.stream}`, handleStreamableSessionRequest);

    return router;
  };
}

export function createStreamableHttpRouter(
  config: MCPServerConfig,
): express.Router {
  const router = express.Router();

  // MCP endpoint - handle POST methods for streamable HTTP
  router.post(
    `/${MCP_ROUTES.stream}`,
    async (req: express.Request, res: express.Response) => {
      const sessionId = req.headers[MCP_SESSION_ID] as string | undefined;
      const shouldCreate = isInitializeRequest(req.body);
      let existingtransport = getTransport(sessionId);

      if (!existingtransport && shouldCreate) {
        existingtransport = TransportFactory.createTransport(
          TransportType.StreamableHTTP,
          {
            sessionIdGenerator: getSessionId,
          },
        );
        // Connect the MCP server to the new transport
        await connect(existingtransport, config.server);
      }

      if (!existingtransport) {
        console.log(req.path, 'bad post request');
        raiseJSONRpcBadRequestError(res);
        return;
      }

      (existingtransport as any).handleRequest(req, res, req.body);
    },
  );

  const handleStreamableSessionRequest = async (
    req: express.Request,
    res: express.Response,
  ) => {
    const sessionId = req.headers[MCP_SESSION_ID] as string | undefined;
    const transport = getTransport(sessionId);

    if (!sessionId || !transport) {
      console.log(req.path, 'bad request - missing session or transport');
      raiseJSONRpcBadRequestError(res);
      return;
    }

    // Check if transport has handleRequest method (StreamableHTTPServerTransport)
    if (
      'handleRequest' in transport &&
      typeof transport.handleRequest === 'function'
    ) {
      transport.handleRequest(req, res, req.body);
    } else {
      // For SSEServerTransport, we need different handling
      console.log(
        'SSE transport does not support handleRequest for this method',
      );
      raiseJSONRpcBadRequestError(res);
    }
  };

  // Handle GET requests for server-to-client notifications via streamable HTTP
  router.get(`/${MCP_ROUTES.stream}`, handleStreamableSessionRequest);

  // Handle DELETE requests for session termination via streamable HTTP
  router.delete(`/${MCP_ROUTES.stream}`, handleStreamableSessionRequest);

  return router;
}
