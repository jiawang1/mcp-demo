#!/usr/bin/env node

/**
 * HTTP Streaming Test Client
 *
 * This script demonstrates how to use the HTTP streaming transport.
 * Run with: node test-http-streaming.js
 */

import fetch from "node-fetch";

const SERVER_URL = "http://localhost:3000/mcp";

async function callMCPMethod(method, params = {}) {
  console.log(`\n📤 Sending: ${method}`);
  console.log(`   Params:`, JSON.stringify(params, null, 2));

  const response = await fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream", // Required for StreamableHTTP
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: method,
      params: params,
    }),
  });

  console.log(`📥 Response status: ${response.status}`);
  console.log(
    `📥 Response content-type: ${response.headers.get("content-type")}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  // Read streaming response (SSE format)
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  // Parse SSE format: "event: message\ndata: {json}\n\n"
  const lines = result.split("\n");
  let jsonData = null;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("data: ")) {
      const dataContent = lines[i].substring(6); // Remove "data: " prefix
      jsonData = JSON.parse(dataContent);
      break;
    }
  }

  if (!jsonData) {
    throw new Error(`No JSON data found in SSE response: ${result}`);
  }

  console.log(`✅ Result received`);
  return jsonData;
}

async function main() {
  console.log("🚀 HTTP Streaming Test Client");
  console.log(`📡 Server: ${SERVER_URL}\n`);

  try {
    // Test 1: List tools
    console.log("═".repeat(60));
    console.log("Test 1: List available tools");
    console.log("═".repeat(60));
    const toolsList = await callMCPMethod("tools/list", {});
    console.log("\n📋 Available tools:");
    toolsList.result.tools.forEach((tool) => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 2: Call read_widget_resource
    console.log("\n" + "═".repeat(60));
    console.log("Test 2: Call read_widget_resource");
    console.log("═".repeat(60));
    const widgetResult = await callMCPMethod("tools/call", {
      name: "read_widget_resource",
      arguments: {},
    });
    const widgetContent = widgetResult.result.content[0].text;
    console.log(`\n📖 Widget content (first 200 chars):`);
    console.log(`   ${widgetContent.substring(0, 200)}...`);
    console.log(`\n   Total length: ${widgetContent.length} characters`);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 3: Call read_page_resource
    console.log("\n" + "═".repeat(60));
    console.log("Test 3: Call read_page_resource");
    console.log("═".repeat(60));
    const pageResult = await callMCPMethod("tools/call", {
      name: "read_page_resource",
      arguments: {},
    });
    const pageContent = pageResult.result.content[0].text;
    console.log(`\n📖 Page content (first 200 chars):`);
    console.log(`   ${pageContent.substring(0, 200)}...`);
    console.log(`\n   Total length: ${pageContent.length} characters`);

    // Success summary
    console.log("\n" + "═".repeat(60));
    console.log("✅ All tests completed successfully!");
    console.log("═".repeat(60));
    console.log("\n🎉 HTTP Streaming transport is working correctly!\n");
  } catch (error) {
    console.error("\n" + "═".repeat(60));
    console.error("❌ Test failed!");
    console.error("═".repeat(60));
    console.error("\nError:", error.message);
    console.error("\nTroubleshooting:");
    console.error("  1. Make sure the server is running: npm start");
    console.error("  2. Check the server URL:", SERVER_URL);
    console.error(
      "  3. Verify the server supports HTTP streaming on /mcp endpoint\n"
    );
    process.exit(1);
  }
}

main();
