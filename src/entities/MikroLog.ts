import { LogInput, LogOutput, Message, MikroLogInput } from '../interfaces/MikroLog';
import { StaticMetadataConfigInput } from '../interfaces/Metadata';

import { setMetadata, produceDynamicMetadata } from '../utils/metadataUtils';

/**
 * @description MikroLog is a Lambda-oriented lightweight JSON logger.
 *
 * @example
 * ```
// ES5 format
const { MikroLog } = require('mikrolog');
// ES6 format
import { MikroLog } from 'mikrolog';

const logger = new MikroLog();

// String message
logger.log('Hello World!');

// Object message
logger.log({
  Hello: 'World!',
  statement: 'Objects work just as well!'
});
```
 */
export class MikroLog {
  metadataConfig: StaticMetadataConfigInput | Record<string, any>;

  constructor(input?: MikroLogInput) {
    this.metadataConfig = input?.metadataConfig || {};
    const event = input?.event || {};
    const context = input?.context || {};
    setMetadata(event, context);
  }

  /**
   * @description Output a debug log. Message may be string or object.
   * @example logger.debug('My message!');
   */
  public debug(message: Message): LogOutput {
    const createdLog = this.createLog({ message, level: 'DEBUG', httpStatusCode: 200 });
    this.writeLog(createdLog);
    return createdLog;
  }

  /**
   * @description Alias for `Logger.log()`. Message may be string or object.
   * @example logger.info('My message!');
   */
  public info(message: Message): LogOutput {
    return this.log(message);
  }

  /**
   * @description Output an informational-level log. Message may be string or object.
   * @example logger.log('My message!');
   */
  public log(message: Message): LogOutput {
    const createdLog = this.createLog({ message, level: 'INFO', httpStatusCode: 200 });
    this.writeLog(createdLog);
    return createdLog;
  }

  /**
   * @description Output a warning-level log. Message may be string or object.
   * @example logger.warn('My message!');
   */
  public warn(message: Message): LogOutput {
    const createdLog = this.createLog({ message, level: 'WARN', httpStatusCode: 200 });
    this.writeLog(createdLog);
    return createdLog;
  }

  /**
   * @description Output an error-level log. Message may be string or object.
   * @example logger.error('My message!');
   */
  public error(message: Message): LogOutput {
    const createdLog = this.createLog({ message, level: 'ERROR', httpStatusCode: 400 });
    this.writeLog(createdLog);
    return createdLog;
  }

  /**
   * @description Call STDOUT to write the log.
   */
  private writeLog(createdLog: LogOutput) {
    process.stdout.write(JSON.stringify(createdLog) + '\n');
  }

  /**
   * @description Create the log envelope.
   */
  private createLog(log: LogInput): LogOutput {
    const {
      correlationId,
      user,
      route,
      region,
      runtime,
      functionName,
      functionMemorySize,
      functionVersion,
      stage,
      accountId,
      requestTimeEpoch,
      id,
      timestamp,
      timestampHuman
    } = produceDynamicMetadata();

    const metadataConfig: any = this.metadataConfig;
    const redactedKeys = metadataConfig['redactedKeys']
      ? metadataConfig['redactedKeys']
      : undefined;
    const maskedValues = metadataConfig['maskedValues']
      ? metadataConfig['maskedValues']
      : undefined;
    if (redactedKeys) delete metadataConfig['redactedKeys'];
    if (maskedValues) delete metadataConfig['maskedValues'];

    const logOutput = {
      // Static metadata
      ...metadataConfig,
      // Dynamic metadata
      message: log.message,
      error: log.level === 'ERROR',
      level: log.level,
      httpStatusCode: log.httpStatusCode,
      id,
      timestamp,
      timestampHuman,
      correlationId,
      user,
      route,
      region,
      runtime,
      functionName,
      functionMemorySize,
      functionVersion,
      stage,
      accountId,
      requestTimeEpoch
    };

    return this.filterOutput(logOutput, redactedKeys, maskedValues);
  }

  /**
   * @description This filters, redacts and masks the log prior to actual output.
   */
  private filterOutput(
    logOutput: LogOutput,
    redactedKeys?: string[],
    maskedValues?: string[]
  ): any {
    const filteredOutput: any = {};
    Object.entries(logOutput).forEach((entry: any) => {
      const [key, value] = entry;

      if (redactedKeys && redactedKeys.includes(key)) return;
      if (maskedValues && maskedValues.includes(key)) {
        filteredOutput[key] = 'MASKED';
        return;
      }

      /**
       * Only add key-value pairs that are not actually undefined, null or empty.
       * For example, since `error` is an actual boolean we will return it as-is.
       */
      if (value || value === 0 || value === false) filteredOutput[key] = value;
    });

    return filteredOutput;
  }
}
