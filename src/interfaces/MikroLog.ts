import { APIGatewayEvent, Context } from 'aws-lambda';

import { StaticMetadataConfigInput, DynamicMetadataOutput } from './Metadata';

/**
 * @description Input when instantiating a new MikroLog instance.
 */
export interface MikroLogInput {
  /**
   * Static metadata configuration object.
   */
  metadataConfig?: StaticMetadataConfigInput | Record<string, any>;
  /**
   * AWS Lambda event object. Used to gather dynamic metadata.
   */
  event?: APIGatewayEvent | any; // TODO
  /**
   * AWS Lambda context object. Used to gather dynamic metadata.
   */
  context?: Context | any; // TODO
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
export type LogLevels = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

/**
 * @description The message to put in the log.
 */
export type Message = string | Record<string, unknown>;

/**
 * @description Valid HTTP statuses.
 */
export type HttpStatusCode = 200 | 400 | 500 | number;
