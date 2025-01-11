import type { LogOutput } from '../../interfaces/MikroLog.js';
import type { Transport, TransportInput } from '../../interfaces/Transport.js';

import { TransportError } from '../errors/TransportError.js';

/**
 * @description The Axiom transport for MikroLog allows you to
 * send MikroLog-formatted logs directly to Axiom via their Ingest API.
 * @see https://axiom.co/docs/restapi/ingest
 */
export class AxiomTransport implements Transport {
  private readonly auth: string;
  private readonly dataset: string;

  constructor(input: TransportInput) {
    if (!input?.auth || !input?.dataset)
      throw new TransportError('Missing required one or more required inputs');

    this.auth = input.auth;
    this.dataset = input.dataset;
  }

  /**
   * @description Flush ("send") logs to Axiom.
   */
  async flush(logs: LogOutput[]) {
    const url = process.env.TRANSPORT_ENDPOINT
      ? /* v8 ignore next */
        process.env.TRANSPORT_ENDPOINT
      : /* v8 ignore next */
        `https://api.axiom.co/v1/datasets/${this.dataset}/ingest`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.auth}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(logs)
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      throw new TransportError(
        `Failed to flush logs: ${response.status} ${response.statusText} - ${errorDetails}`
      );
    }
  }
}
