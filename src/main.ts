import express from 'express';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { buildMcpApplication } from './mcp-servers/application';
import { API_ROUTE, MCP_ROOT_ROUTE } from './constant.js';

const port = process.argv[2] || 8080;

async function bootstrap() {
  const server = express(); // Express server instance

  // 1. Add MCP server FIRST to ensure it gets priority
  const mcpApp = await buildMcpApplication();
  server.use(MCP_ROOT_ROUTE, mcpApp);
  // 2. Create NestJS application using the same Express instance
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );
  nestApp.enableCors({
    origin: true, // Allow all origins, or specify specific origins like ['http://localhost:3001', 'http://localhost:3000']
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    credentials: true,
  });
  // Set global prefix for NestJS routes
  nestApp.setGlobalPrefix(API_ROUTE);
  await nestApp.init();

  // 3. Start the combined server
  server.listen(port, () => {
    console.log(`🚀 Combined server started on port ${port}`);
    console.log(`📡 NestJS LLM API available at: http://localhost:${port}/api`);
    console.log(`🔧 MCP Server available at: http://localhost:${port}/mcp`);
  });
}
bootstrap();
