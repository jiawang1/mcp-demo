import {
  StreamableHTTPServerTransport,
  StreamableHTTPServerTransportOptions,
} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  SSEServerTransport,
  SSEServerTransportOptions,
} from '@modelcontextprotocol/sdk/server/sse.js';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';

import { setTransport, deleteTransport } from './sessionStore';
import * as express from 'express';

export enum TransportType {
  StreamableHTTP = 'streamable-http',
  Sse = 'sse',
}

type SSETransportOptions = SSEServerTransportOptions & {
  SSEendpoint?: string;
  response?: express.Response;
};

export type TransportOptions =
  | StreamableHTTPServerTransportOptions
  | SSETransportOptions;

type FactoryMap = {
  [TransportType.Sse]: {
    options: SSETransportOptions;
    return: SSEServerTransport;
  };
  [TransportType.StreamableHTTP]: {
    options: StreamableHTTPServerTransportOptions;
    return: StreamableHTTPServerTransport;
  };
};

export class TransportFactory {
  /**
   * add a close handler to the transport
   * @param transport
   */
  static onCloseTransport(transport: Transport) {
    if (transport) {
      transport.onclose = () => {
        if (transport.sessionId) {
          console.log(`Transport closed for session: ${transport.sessionId}`);
          deleteTransport(transport.sessionId);
        }
      };
    }
  }
  /**
   * Create a new StreamableHTTPServerTransport instance.
   * @returns {StreamableHTTPServerTransport | SSEServerTransport} A new transport instance.
   */
  static createTransport<T extends keyof FactoryMap>(
    type: T,
    options?: FactoryMap[T]['options'],
  ): FactoryMap[T]['return'] {
    if (type !== TransportType.StreamableHTTP && type !== TransportType.Sse) {
      throw new Error(`Unsupported transport type: ${type}`);
    }

    let transport: StreamableHTTPServerTransport | SSEServerTransport | null =
      null;

    /**
     * create streamable http transport
     */
    if (type === TransportType.StreamableHTTP) {
      const { sessionIdGenerator, onsessioninitialized, ...otherOps } =
        (options || {}) as StreamableHTTPServerTransportOptions;

      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: sessionIdGenerator || (() => crypto.randomUUID()),
        onsessioninitialized: (sessionId) => {
          console.log(`Session initialized: ${sessionId}`);
          setTransport(sessionId, transport!);
          onsessioninitialized && onsessioninitialized(sessionId);
        },
        ...otherOps,
      });
      console.log(
        `Creating streamable transport for session: ${transport.sessionId}`,
      );
    }

    if (type === TransportType.Sse) {
      const { SSEendpoint, response, ...ops } = (options ||
        {}) as SSETransportOptions;

      if (!SSEendpoint || !response) {
        throw new Error(
          'SSE endpoint and response are required for SSE transport',
        );
      }

      if (Object.keys(ops).length > 0) {
        const sseOptions = Object.assign(
          {
            enableDnsRebindingProtection: false,
          },
          ops,
        );
        transport = new SSEServerTransport(SSEendpoint, response, sseOptions);
      } else {
        transport = new SSEServerTransport(SSEendpoint, response);
      }
      console.log(`Creating SSE transport for session: ${transport.sessionId}`);
      setTransport(transport.sessionId, transport);
    }

    TransportFactory.onCloseTransport(transport!);

    return transport!;
  }
}
