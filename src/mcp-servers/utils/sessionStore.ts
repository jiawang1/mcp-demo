import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { randomUUID } from 'node:crypto';

type Transport = StreamableHTTPServerTransport | SSEServerTransport;
const sessionStore = new Map<string, Transport>();

export function getSessionId() {
  return randomUUID();
}

export function getTransport(sessionId?: string): Transport | undefined {
  return sessionId ? sessionStore.get(sessionId) : undefined;
}

export function setTransport(sessionId: string, transport: Transport) {
  sessionStore.set(sessionId, transport);
}

export function deleteTransport(sessionId: string) {
  sessionStore.delete(sessionId);
}

export function clearSessionStore() {
  sessionStore.clear();
}

export function hasTransport(sessionId: string): boolean {
  return sessionStore.has(sessionId);
}
export function getAllSessionIds(): string[] {
  return Array.from(sessionStore.keys());
}
export function getAllTransports(): Transport[] {
  return Array.from(sessionStore.values());
}
export function getTransportCount(): number {
  return sessionStore.size;
}
