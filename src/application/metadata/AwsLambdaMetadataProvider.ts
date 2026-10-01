import { createRequire } from 'node:module';

import type {
  MetadataProvider,
  MetadataProviderInput
} from '../../interfaces/MetadataProvider.js';

const lazyRequire: (id: string) => any =
  typeof (globalThis as any).require === 'function'
    ? /* v8 ignore next */
      (globalThis as any).require
    : createRequire(import.meta.url);

/**
 * @description Metadata provider for AWS Lambda environments. Extracts
 * dynamic metadata from the Lambda event and context objects using
 * `aws-metadata-utils`, and tracks cold-start state.
 *
 * The `aws-metadata-utils` dependency is loaded lazily on the first
 * `getMetadata()` call, so importing this class does not require the
 * package to be installed unless the provider is actually used.
 *
 * Use this when running in AWS Lambda to get fields like `functionName`,
 * `region`, `accountId`, `isColdStart`, etc.
 *
 * @example
 * ```typescript
 * import { MikroLog, AwsLambdaMetadataProvider } from 'mikrolog';
 *
 * const provider = new AwsLambdaMetadataProvider();
 * const logger = MikroLog.start({ metadataProvider: provider });
 *
 * export async function handler(event, context) {
 *   MikroLog.enrich({ event, context });
 *   logger.info('Hello from Lambda!');
 * }
 * ```
 */
export class AwsLambdaMetadataProvider implements MetadataProvider {
  private isColdStart = true;
  private getMetadataFn:
    | ((event: unknown, context: unknown) => Record<string, unknown>)
    | null = null;

  private loadGetMetadata(): (
    event: unknown,
    context: unknown
  ) => Record<string, unknown> {
    if (this.getMetadataFn) return this.getMetadataFn;
    const mod = lazyRequire('aws-metadata-utils');
    const fn = mod.getMetadata as (
      event: unknown,
      context: unknown
    ) => Record<string, unknown>;
    this.getMetadataFn = fn;
    return fn;
  }

  /**
   * @description Extract dynamic metadata from the AWS Lambda event
   * and context. On the first call `isColdStart` is `true`; on all
   * subsequent calls it is `false`.
   *
   * @throws if `aws-metadata-utils` is not installed. Install it with
   * `npm install aws-metadata-utils` (it is listed as an optional
   * dependency of mikrolog).
   */
  public getMetadata(input: MetadataProviderInput): Record<string, unknown> {
    const coldStart = this.isColdStart;
    if (coldStart) this.isColdStart = false;

    const getMetadata = this.loadGetMetadata();
    const metadata = getMetadata(input.event, input.context);

    return {
      ...metadata,
      isColdStart: coldStart
    };
  }

  /**
   * @description Reset the cold-start state. Useful in test environments
   * or when you want to manually control cold-start detection.
   */
  public reset(): void {
    this.isColdStart = true;
  }
}
