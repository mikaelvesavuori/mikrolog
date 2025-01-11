import type { LogOutput } from './MikroLog.js';

export interface Transport {
  flush: (logs: LogOutput[]) => Promise<void>;
}

export type TransportInput = {
  /**
   * The API key that will be used in the Authorization header.
   */
  auth: string;
  /**
   * The dataset to push logs to.
   */
  dataset: string;
};

/**
 * @description Names of supported transports.
 */
export type TransportName = 'axiom';
