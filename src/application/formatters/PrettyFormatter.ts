import type { Formatter } from '../../interfaces/Formatter.js';
import type { LogOutput } from '../../interfaces/MikroLog.js';

/**
 * @description Human-readable formatter for local development and CLI usage.
 * Produces a single-line, colorized output with the log level, timestamp,
 * message, and any additional fields.
 *
 * @example
 * ```typescript
 * import { MikroLog, PrettyFormatter } from 'mikrolog';
 *
 * const logger = MikroLog.start();
 * logger.setFormatter(new PrettyFormatter());
 * logger.info('Hello World');
 * // INFO  2022-07-25T08:52:21.121Z  Hello World
 * ```
 */
export class PrettyFormatter implements Formatter {
  private readonly colorize: boolean;

  constructor(options?: { colorize?: boolean }) {
    this.colorize = options?.colorize ?? true;
  }

  private color(level: string, text: string): string {
    if (!this.colorize) return text;

    const colors: Record<string, string> = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      DEBUG: '\x1b[90m'
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';

    return `${color}${text}${reset}`;
  }

  public format(log: LogOutput): string {
    const level = (log.level || 'INFO').padEnd(5);
    const timestamp = log.timestamp || '';
    const message =
      typeof log.message === 'string'
        ? log.message
        : JSON.stringify(log.message);

    const knownKeys = new Set([
      'level',
      'timestamp',
      'timestampEpoch',
      'message',
      'error',
      'httpStatusCode',
      'id'
    ]);

    const extras = Object.entries(log)
      .filter(([key]) => !knownKeys.has(key))
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ');

    const line = extras
      ? `${level}  ${timestamp}  ${message}  ${extras}`
      : `${level}  ${timestamp}  ${message}`;

    return `${this.color(log.level || 'INFO', line)}\n`;
  }
}
