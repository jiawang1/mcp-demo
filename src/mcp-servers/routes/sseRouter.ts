import * as express from 'express';
import * as path from 'path';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { raiseJSONRpcBadRequestError } from '../utils/requestHandler';
import { MCP_SESSION_ID } from '../utils/constant';
import { TransportFactory, TransportType } from '../utils/TransportFactory';
import { connect } from '../utils/serverConnector';
import { getTransport, deleteTransport } from '../utils/sessionStore';
import type { McpRouterCreator } from '../type';
import { MCP_ROUTES } from '../type';
import { MCP_ROOT_ROUTE } from '../../constant';

export class SseRouterCreator implements McpRouterCreator {
  create = (config) => {
    const { server, route } = config;
    const router = express.Router();

    // SSE endpoint - GET request establishes the SSE connection
    router.get(
      `/${MCP_ROUTES.sse}`,
      async (req: express.Request, res: express.Response) => {
        try {
          console.log('SSE GET request received');

          // Create SSE transport
          const transport = TransportFactory.createTransport(
            TransportType.Sse,
            {
              SSEendpoint: path.join(MCP_ROOT_ROUTE, route, 'messages'),
              response: res,
            },
          );

          const newSessionId = transport.sessionId;

          // Set the session ID in response header for client to use
          res.setHeader(MCP_SESSION_ID, newSessionId);

          // Connect the MCP server to the new transport
          await connect(transport, server);
        } catch (error) {
          console.error('Failed to initialize SSE transport:', error);
          res.status(500).json({ error: 'Failed to initialize SSE transport' });
        }
      },
    );

    // POST endpoint for sending messages to SSE transport
    router.post(
      `/messages`,
      async (req: express.Request, res: express.Response) => {
        console.log('SSE POST request received', {
          body: req.body,
          querySessionId: req.query.sessionId,
          headerSessionId: req.headers[MCP_SESSION_ID],
        });

        if (req.body && req.body.params) {
          if (req.body.params.clientInfo) {
            console.log('SSE client info: ', req.body.params.clientInfo);
          }

          if (req.body.params.capabilities) {
            console.log('SSE capability: ', req.body.params.capabilities);
          }
        }

        const sessionId =
          (req.query.sessionId as string) ||
          (req.headers[MCP_SESSION_ID] as string);

        if (!sessionId) {
          console.log('SSE POST: No session ID found', {
            sessionId,
            querySessionId: req.query.sessionId,
            headerSessionId: req.headers[MCP_SESSION_ID],
          });
          raiseJSONRpcBadRequestError(res);
          return;
        }

        const transport = getTransport(sessionId);

        if (!transport) {
          console.log('SSE POST: transport not found', {
            sessionId,
            hasTransport: !!transport,
            querySessionId: req.query.sessionId,
            headerSessionId: req.headers[MCP_SESSION_ID],
          });
          raiseJSONRpcBadRequestError(res, 'Session not found');
          return;
        }

        try {
          await (transport as SSEServerTransport).handlePostMessage(
            req,
            res,
            req.body,
          );
        } catch (error) {
          console.error('Error handling SSE POST request:', error);
          res.status(500).json({ error: 'Failed to process SSE request' });
        }
      },
    );

    // Handle DELETE requests for session termination
    router.delete(
      `/${MCP_ROUTES.sse}`,
      async (req: express.Request, res: express.Response) => {
        // Try to get session ID from query parameter first, then from headers
        const sessionId =
          (req.query.sessionId as string) ||
          (req.headers[MCP_SESSION_ID] as string);

        if (sessionId) {
          const transport = getTransport(sessionId);
          if (transport) {
            console.log(`Closing SSE transport for session: ${sessionId}`);
            deleteTransport(sessionId);
            await transport.close();
            res.status(200).json({ status: 'closed' });
          } else {
            res.status(404).json({ error: 'Session not found' });
          }
        } else {
          res.status(400).json({ error: 'Session ID required' });
        }
      },
    );

    return router;
  };
}
