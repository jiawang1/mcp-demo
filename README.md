# MCP Demo Server

A **stateless HTTP Streaming** server built with Model Context Protocol (MCP) and Express.

## 🌐 Live Demo

**Production URL**: `https://mcp-demo-d3cj.onrender.com/mcp`

Try it now:
```bash
curl -X POST https://mcp-demo-d3cj.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

## 📚 Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get started in 5 minutes
- **[HTTP Streaming Guide](./HTTP-STREAMING-GUIDE.md)** - Complete HTTP Streaming Transport guide
- **[Usage Examples](./EXAMPLES.md)** - Full code examples (Node.js, Python, Browser)
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions

## Features

- ✅ **Fully Stateless** - Each request is processed independently
- ✅ **HTTP Streaming** - Standard HTTP POST-based streaming transport
- ✅ **Easy to Scale** - No session management, horizontally scalable
- ✅ **Simple Deployment** - Perfect for serverless environments (Lambda, Cloud Functions)
- ✅ **Production Ready** - Live at https://mcp-demo-d3cj.onrender.com
- ✅ Two built-in tools:
  - `read_widget_resource`: Read widgetResource.md file
  - `read_page_resource`: Read pageResource.md file

## Installation

```bash
npm install
```

## Running Locally

```bash
# Production mode
npm start

# Development mode (with hot reload)
npm run dev

# Test with MCP Inspector
npm run test
```

Server runs on `http://localhost:3000` by default.

## Testing and Debugging

### Using Production Server

Test the live production server:

```bash
# List available tools
curl -X POST https://mcp-demo-d3cj.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Call read_widget_resource tool
curl -X POST https://mcp-demo-d3cj.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"read_widget_resource","arguments":{}}}'
```

### Using HTTP Streaming Test Client (Recommended)

```bash
# First start the server
npm start

# In another terminal, run the test client
npm run test-streaming
```

The test client will:
1. List all available tools
2. Call `read_widget_resource` tool
3. Call `read_page_resource` tool

### Using curl for Local Testing

```bash
# List available tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# Call read_widget_resource tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"read_widget_resource","arguments":{}}}'

# Check server health
curl http://localhost:3000/health

# Get server information
curl http://localhost:3000/
```

## API Endpoints

### HTTP Streaming Transport

#### 1. MCP Endpoint
- **Path**: `/mcp`
- **Method**: POST
- **Description**: HTTP streaming endpoint for MCP JSON-RPC requests
- **Features**: Fully stateless, each request is processed independently

### Other Endpoints

#### 2. Health Check
- **Path**: `/health`
- **Method**: GET
- **Description**: Check server status

#### 3. Root Path
- **Path**: `/`
- **Method**: GET
- **Description**: Get server information and available tools list

## Available Tools

### read_widget_resource
Reads the content of `src/resources/widgetResource.md` file.

**Input**: No parameters required

**Output**: File content as text

**Example**:
```bash
# Local
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"read_widget_resource","arguments":{}}}'

# Production
curl -X POST https://mcp-demo-d3cj.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"read_widget_resource","arguments":{}}}'
```

### read_page_resource
Reads the content of `src/resources/pageResource.md` file.

**Input**: No parameters required

**Output**: File content as text

**Example**:
```bash
# Local
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"read_page_resource","arguments":{}}}'

# Production
curl -X POST https://mcp-demo-d3cj.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"read_page_resource","arguments":{}}}'
```

## Usage Examples

### Check Server Health

```bash
# Local
curl http://localhost:3000/health

# Production
curl https://mcp-demo-d3cj.onrender.com/health
```

### Get Server Information

```bash
# Local
curl http://localhost:3000/

# Production
curl https://mcp-demo-d3cj.onrender.com/
```

## MCP Client Integration

To connect to this MCP server, your MCP client needs to:

1. Send HTTP POST requests to the `/mcp` endpoint
2. Use JSON-RPC 2.0 format
3. Include proper Accept headers: `application/json, text/event-stream`
4. Receive results through HTTP response

### Configuration Examples

#### Local Development
```json
{
  "mcpServers": {
    "mcp-demo-local": {
      "transport": {
        "type": "http",
        "url": "http://localhost:3000/mcp"
      }
    }
  }
}
```

#### Production
```json
{
  "mcpServers": {
    "mcp-demo": {
      "transport": {
        "type": "http",
        "url": "https://mcp-demo-d3cj.onrender.com/mcp"
      }
    }
  }
}
```

### Using MCP SDK

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const client = new Client({
  name: 'my-client',
  version: '1.0.0',
});

// Use production server
const transport = new StreamableHTTPClientTransport(
  new URL('https://mcp-demo-d3cj.onrender.com/mcp')
);

// Or use local server
// const transport = new StreamableHTTPClientTransport(
//   new URL('http://localhost:3000/mcp')
// );

await client.connect(transport);

// List tools
const tools = await client.listTools();

// Call tool
const result = await client.callTool({
  name: 'read_widget_resource',
  arguments: {},
});
```

## Tech Stack

- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **Express**: Web framework
- **CORS**: Cross-Origin Resource Sharing support
- **Node.js**: ES Modules

## Project Structure

```
mcp-demo/
├── src/
│   ├── index.js                 # Main server file
│   └── resources/
│       ├── widgetResource.md    # Widget resource file
│       └── pageResource.md      # Page resource file
├── test-http-streaming.js       # HTTP Streaming test client
├── package.json
├── README.md
└── LICENSE
```

## Environment Variables

- `PORT`: Server port (default: 3000)

```bash
PORT=8080 npm start
```

## Development

The server uses ES Modules and requires Node.js 14.0 or higher.

In development mode, use the `--watch` flag for automatic restarts:

```bash
npm run dev
```

## Deployment

This server is deployed on [Render](https://render.com) and available at:
**https://mcp-demo-d3cj.onrender.com/mcp**

You can deploy your own instance:
1. Fork this repository
2. Connect to Render/Vercel/Railway
3. Set environment variables if needed
4. Deploy!

## License

MIT
