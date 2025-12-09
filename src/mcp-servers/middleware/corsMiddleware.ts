import * as express from 'express';
import * as cors from 'cors';
import { MCP_SESSION_ID } from '../../mcp-servers/utils/constant';

const applyMiddleware = (app: express.Express) => {
  app.use(
    cors({
      origin: '*', // Configure appropriately for production, e.g., specific domains
      exposedHeaders: [MCP_SESSION_ID, 'Cache-Control', 'Connection'],
      allowedHeaders: [
        'Content-Type',
        MCP_SESSION_ID,
        'Accept',
        'Cache-Control',
        'Connection',
        'Authorization',
      ],
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );
  return app;
};

export default applyMiddleware;
