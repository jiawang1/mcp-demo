# MCP Demo Server

一个基于 Model Context Protocol (MCP) 和 Express 的**纯 HTTP Streaming** 无状态服务器。

## 📚 文档

- **[快速启动指南](./QUICKSTART.md)** - 5 分钟快速开始
- **[HTTP Streaming 指南](./HTTP-STREAMING-GUIDE.md)** - HTTP Streaming Transport 完整使用指南
- **[使用示例](./EXAMPLES.md)** - 完整的代码示例（Node.js、Python、浏览器）
- **[故障排除指南](./TROUBLESHOOTING.md)** - 常见问题解决方案

## 特性

- ✅ **完全无状态** - 每个请求独立处理
- ✅ **HTTP Streaming** - 基于标准 HTTP POST 的流式传输
- ✅ **易于扩展** - 无需会话管理，可水平扩展
- ✅ **简单部署** - 适合无服务器环境（Lambda、Cloud Functions）
- ✅ 两个内置工具：
  - `read_widget_resource`: 读取 widgetResource.md 文件
  - `read_page_resource`: 读取 pageResource.md 文件

## 安装

```bash
npm install
```

## 运行

```bash
# 生产模式
npm start

# 开发模式（支持热重载）
npm run dev

# 使用 MCP Inspector 测试
npm run test
```

服务器默认运行在 `http://localhost:3000`

## 测试和调试

### 使用 HTTP Streaming 测试客户端（推荐）

```bash
# 首先启动服务器
npm start

# 在另一个终端运行测试客户端
npm run test-streaming
```

测试客户端会：
1. 列出所有可用工具
2. 调用 `read_widget_resource` 工具
3. 调用 `read_page_resource` 工具

### 使用 curl 测试

```bash
# 列出可用工具
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 调用 read_widget_resource 工具
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"read_widget_resource","arguments":{}}}'

# 检查服务器状态
curl http://localhost:3000/health

# 获取服务器信息
curl http://localhost:3000/
```

## API 端点

### HTTP Streaming Transport

#### 1. MCP 端点
- **路径**: `/mcp`
- **方法**: POST
- **描述**: HTTP streaming 端点，处理 MCP JSON-RPC 请求
- **特点**: 完全无状态，每个请求独立处理
- **描述**: 接收来自客户端的消息（由 SSE transport 使用）

### 其他端点

#### 3. 健康检查
- **路径**: `/health`
- **方法**: GET
- **描述**: 检查服务器状态

#### 2. 健康检查
- **路径**: `/health`
- **方法**: GET
- **描述**: 检查服务器状态

#### 3. 根路径
- **路径**: `/`
- **方法**: GET
- **描述**: 获取服务器信息和可用工具列表

## 可用工具

### read_widget_resource
读取 `src/resources/widgetResource.md` 文件的内容。

**输入**: 无需参数

**输出**: 文件内容的文本

**示例**:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"read_widget_resource","arguments":{}}}'
```

### read_page_resource
读取 `src/resources/pageResource.md` 文件的内容。

**输入**: 无需参数

**输出**: 文件内容的文本

**示例**:
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"read_page_resource","arguments":{}}}'
```

## 使用示例

### 检查服务器健康状态

```bash
curl http://localhost:3000/health
```

### 获取服务器信息

```bash
curl http://localhost:3000/
```

## MCP 客户端集成

要连接到此 MCP 服务器，你的 MCP 客户端需要：

1. 发送 HTTP POST 请求到 `/mcp` 端点
2. 使用 JSON-RPC 2.0 格式
3. 通过 HTTP 响应接收结果

示例 MCP 客户端配置：

```json
{
  "mcpServers": {
    "mcp-demo": {
      "transport": {
        "type": "http-streaming",
        "url": "http://localhost:3000/mcp"
      }
    }
  }
}
```

使用 MCP SDK：

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const client = new Client({
  name: 'my-client',
  version: '1.0.0',
});

const transport = new StreamableHTTPClientTransport(
  new URL('http://localhost:3000/mcp')
);

await client.connect(transport);

// 列出工具
const tools = await client.listTools();

// 调用工具
const result = await client.callTool({
  name: 'read_widget_resource',
  arguments: {},
});
```

## 技术栈

- **@modelcontextprotocol/sdk**: MCP 协议实现
- **Express**: Web 框架
- **CORS**: 跨域资源共享支持
- **Node.js**: ES Modules

## 项目结构

```
mcp-demo/
├── src/
│   ├── index.js                 # 主服务器文件
│   └── resources/
│       ├── widgetResource.md    # Widget 资源文件
│       └── pageResource.md      # Page 资源文件
├── package.json
├── README.md
└── LICENSE
```

## 环境变量

- `PORT`: 服务器端口（默认: 3000）

```bash
PORT=8080 npm start
```

## 开发

服务器使用 ES Modules，需要 Node.js 14.0 或更高版本。

在开发模式下，可以使用 `--watch` 标志实现自动重启：

```bash
npm run dev
```

## 许可证

MIT
