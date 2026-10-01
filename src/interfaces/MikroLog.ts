import type { DynamicMetadataOutput, StaticMetadataConfigInput } from "./Metadata.js";
import type { MetadataProvider } from "./MetadataProvider.js";

/**
 * @description Input when instantiating or enriching a MikroLog instance.
 */
export interface MikroLogInput {
  /**
   * Static metadata configuration object.
   */
  metadataConfig?: StaticMetadataConfigInput | Record<string, any>;
  /**
   * Event object forwarded to the metadata provider for dynamic metadata
   * extraction. In AWS Lambda this is the Lambda event; in other runtimes
   * it can be an HTTP request, message payload, or any relevant context.
   */
  event?: any;
  /**
   * Context object forwarded to the metadata provider for dynamic metadata
   * extraction. In AWS Lambda this is the Lambda context; in other runtimes
   * it can be any contextual information.
   */
  context?: any;
  /**
   * Manually set correlation ID.
   */
  correlationId?: string;
  /**
   * Pluggable metadata provider. Use `AwsLambdaMetadataProvider` for AWS
   * Lambda environments, or implement your own `MetadataProvider` for
   * other runtimes. When omitted, no dynamic metadata is extracted beyond
   * the core fields (id, timestamp, correlationId).
   */
  metadataProvider?: MetadataProvider;
}

/**
 * @description Interface for log messages.
 */
export interface LogInput {
  /**
   * @description Log message.
   */
  readonly message: Message;
  /**
   * @description Log level.
   */
  readonly level: LogLevels;
  /**
   * @description HTTP status that is related to this log.
   */
  readonly httpStatusCode: HttpStatusCode;
}

/**
 * @description Shape of final log output.
 */
export interface LogOutput extends StaticMetadataConfigInput, DynamicMetadataOutput {
  /**
   * @description Log message.
   */
  message: Message;
  /**
   * @description Log level.
   */
  level?: LogLevels;
  /**
   * @description HTTP status that is related to this log.
   */
  httpStatusCode: HttpStatusCode;
  /**
   * @description Was this is an error?
   */
  error: boolean;
}

/**
 * @description Valid log level names.
 */
export type LogLevels = "ERROR" | "WARN" | "INFO" | "DEBUG";

/**
 * @description The message to put in the log.
 */
export type Message = string | Record<string, unknown>;

/**
 * @description Valid HTTP statuses.
 */
export type HttpStatusCode = 200 | 400 | 500 | number;
