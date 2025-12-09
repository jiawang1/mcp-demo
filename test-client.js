#!/usr/bin/env node

/**
 * MCP Server Test Client
 * 
 * This script demonstrates how to connect to the MCP server and call tools.
 * Run with: node test-client.js
 */

import { EventSource } from 'eventsource';
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:3000';
let sessionId = null;

// Connect to SSE endpoint
console.log('🔌 Connecting to MCP server...');
const eventSource = new EventSource(`${SERVER_URL}/sse`);

eventSource.onopen = () => {
  console.log('✅ Connected to SSE endpoint');
};

eventSource.addEventListener('endpoint', (event) => {
  console.log('📨 Received endpoint event:', event.data);
  
  // Extract session ID from the endpoint URL
  const match = event.data.match(/sessionId=(\w+)/);
  if (match) {
    sessionId = match[1];
    console.log(`🔑 Session ID: ${sessionId}`);
    
    // Start testing after we have the session ID
    setTimeout(() => testMCPServer(), 1000);
  }
});

eventSource.addEventListener('message', (event) => {
  console.log('📩 Received message:', event.data);
  try {
    const data = JSON.parse(event.data);
    console.log('📦 Parsed message:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('📦 Raw message:', event.data);
  }
});

eventSource.onerror = (error) => {
  console.error('❌ SSE Error:', error);
  console.error('Error details:', {
    type: error.type,
    message: error.message,
    target: error.target?.url
  });
};

// Test the MCP server
async function testMCPServer() {
  if (!sessionId) {
    console.error('❌ No session ID available');
    return;
  }

  console.log('\n📋 Testing MCP Tools...\n');

  try {
    // Test 1: List available tools
    console.log('1️⃣ Listing available tools...');
    await sendMCPRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    });

    // Wait a bit before next test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Call read_widget_resource
    console.log('\n2️⃣ Calling read_widget_resource...');
    await sendMCPRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'read_widget_resource',
        arguments: {}
      }
    });

    // Wait a bit before next test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Call read_page_resource
    console.log('\n3️⃣ Calling read_page_resource...');
    await sendMCPRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'read_page_resource',
        arguments: {}
      }
    });

    // Close connection after tests
    setTimeout(() => {
      console.log('\n✅ Tests completed. Closing connection...');
      eventSource.close();
      process.exit(0);
    }, 5000);

  } catch (error) {
    console.error('❌ Test error:', error);
    eventSource.close();
    process.exit(1);
  }
}

async function sendMCPRequest(message) {
  try {
    const response = await fetch(`${SERVER_URL}/message?sessionId=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    console.log(`📤 Sent request: ${message.method}`);
    console.log(`📥 Response status: ${response.status}`);

    if (!response.ok) {
      const text = await response.text();
      console.error('Response body:', text);
    }
  } catch (error) {
    console.error('❌ Request error:', error);
    throw error;
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Closing connection...');
  eventSource.close();
  process.exit(0);
});

