import * as express from 'express';

export const applyHealthRoutes = (app: express.Express) => {
  app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({
      status: 'healthy',
      server: 'luban-mcp-server',
      version: '2.1.0',
      timestamp: new Date().toISOString(),
    });
  });
};
