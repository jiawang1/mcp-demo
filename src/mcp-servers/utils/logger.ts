import * as winston from 'winston';

const { combine, timestamp, json } = winston.format;

/**
 * Logger Utility - Centralized logging configuration for Luban MCP Server
 */
export class Logger {
  private static loggers: Map<string, winston.Logger> = new Map();

  /**
   * Get or create a logger instance for a specific service
   */
  static getLogger(serviceName: string): winston.Logger {
    if (this.loggers.has(serviceName)) {
      return this.loggers.get(serviceName)!;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const logger = winston.createLogger({
      level: 'info',
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
      defaultMeta: { service: serviceName },
      transports: [
        new winston.transports.File({ filename: 'server.log' }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });

    this.loggers.set(serviceName, logger);
    return logger;
  }

  /**
   * Get logger for MCP server main
   */
  static getMcpServerLogger(): winston.Logger {
    return this.getLogger('luban-mcp-server');
  }

  /**
   * Get logger for rules service
   */
  static getRulesServiceLogger(): winston.Logger {
    return this.getLogger('luban-rules-service');
  }

  /**
   * Get logger for validation service
   */
  static getValidationServiceLogger(): winston.Logger {
    return this.getLogger('luban-validation-service');
  }

  /**
   * Get logger for get-rules tool
   */
  static getRulesToolLogger(): winston.Logger {
    return this.getLogger('get-rules-tool');
  }

  /**
   * Get logger for validate tool
   */
  static getValidateToolLogger(): winston.Logger {
    return this.getLogger('validate-tool');
  }

  /**
   * Get logger for generate tool
   */
  static getGenerateToolLogger(): winston.Logger {
    return this.getLogger('generate-tool');
  }

  /**
   * Set log level for all loggers
   */
  static setLogLevel(level: string): void {
    this.loggers.forEach((logger) => {
      logger.level = level;
    });
  }

  /**
   * Clear all logger instances (useful for testing)
   */
  static clearLoggers(): void {
    this.loggers.clear();
  }
}

// Export default logger for backward compatibility
export const logger = Logger.getMcpServerLogger();
