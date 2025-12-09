/* eslint-disable @typescript-eslint/no-unused-vars */
import express, { Express, Router } from 'express';
import * as path from 'path';
import applyCors from './middleware/corsMiddleware';
import { applyHealthRoutes } from './routes/healthRoute';
import { StreamableHttpRouterCreator } from './routes/streamableHttpRouter';
import { SseRouterCreator } from './routes/sseRouter';
import { getMcpConfig } from './registration';
import type { MCPServerConfig } from './type';

const buildServer = (config: MCPServerConfig, app: Express | Router) => {
  // Create and use the streamable HTTP router
  const streamableHttpRouter = new StreamableHttpRouterCreator().create(config);
  app.use(streamableHttpRouter);
  // Create and use the SSE router
  const sseRouter = new SseRouterCreator().create(config);
  app.use(sseRouter);
};

const buildMcpRouter = (app: Express) => {
  const configurations = getMcpConfig();

  configurations.forEach((config) => {
    const router = express.Router();
    buildServer(config, router);
    app.use(path.join('/', config.route), router);
  });
};

//  MCP Application
// eslint-disable-next-line @typescript-eslint/require-await
export async function buildMcpApplication() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  applyCors(app);
  // Health check endpoint
  applyHealthRoutes(app);

  buildMcpRouter(app);

  app.use((req: express.Request, res: express.Response) => {
    res.status(404).send('No found mcp');
  });

  return app;
}
