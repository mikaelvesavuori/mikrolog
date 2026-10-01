import type { Formatter } from '../../interfaces/Formatter.js';
import type { LogOutput } from '../../interfaces/MikroLog.js';

/**
 * @description Default formatter. Outputs each log record as a
 * newline-delimited JSON string. This is the format expected by
 * most log aggregation and observability platforms.
 */
export class JsonFormatter implements Formatter {
  public format(log: LogOutput): string {
    return `${JSON.stringify(log)}\n`;
  }
}
