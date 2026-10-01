/**
 * @description Input passed to a MetadataProvider. Contains any event/context
 * the user enriched the logger with, plus any additional fields.
 */
export interface MetadataProviderInput {
  event?: unknown;
  context?: unknown;
  [key: string]: unknown;
}

/**
 * @description A pluggable metadata provider. Implement this interface to
 * supply dynamic metadata to MikroLog from any source (AWS Lambda, HTTP
 * requests, message queues, etc.).
 *
 * The provider is called once per log emission. The returned record is merged
 * into the log output alongside statically-configured metadata.
 */
export interface MetadataProvider {
  /**
   * @description Extract dynamic metadata from the given input.
   * Should return a plain object whose keys will be merged into the log.
   */
  getMetadata: (input: MetadataProviderInput) => Record<string, unknown>;
}
