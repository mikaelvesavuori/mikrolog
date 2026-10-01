import type { LogOutput } from './MikroLog.js';

/**
 * @description A pluggable formatter. Implement this interface to control
 * how each log record is serialized before being written to stdout.
 */
export interface Formatter {
  /**
   * @description Format a single log record into a string suitable for output.
   * The returned string should typically include a trailing newline.
   */
  format: (log: LogOutput) => string;
}

/**
 * @description Names of built-in formatters.
 */
export type FormatterName = 'json' | 'pretty';
