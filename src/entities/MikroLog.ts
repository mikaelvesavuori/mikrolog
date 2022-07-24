import { APIGatewayEvent, Context } from 'aws-lambda';
import { randomUUID } from 'crypto';

import { MikroLogInput, LogInput, LogOutput, Message } from '../interfaces/MikroLog';
import { StaticMetadataConfigInput, DynamicMetadataOutput } from '../interfaces/Metadata';

import {
  produceStartTime,
  produceRegion,
  produceRuntime,
  produceFunctionName,
  produceFunctionMemorySize,
  produceFunctionVersion,
  produceCorrelationId,
  produceRoute,
  produceUser,
  produceStage,
  produceViewerCountry,
  produceAccountId,
  produceRequestTimeEpoch
} from './metadataUtils';

/**
 * @description MikroLog is a Lambda-oriented lightweight JSON logger.
 *
 * @example
 * ```
// ES5 format
const { MikroLog } = require('mikrolog');
// ES6 format
import { MikroLog } from 'mikrolog';

const logger = MikroLog.start();

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
  private static instance: MikroLog;
  private static metadataConfig: StaticMetadataConfigInput | Record<string, any> = {};
  // @ts-ignore
  private static event: APIGatewayEvent = {};
  // @ts-ignore
  private static context: Context = {};

  /**
   * @description This instantiates MikroLog. In order to be able
   * to "remember" event and context we use a singleton pattern to
   * reuse the same logical instance.
   *
   * If the `start` method receives any input, that input will
   * overwrite any existing metadata, event, and context.
   *
   * If you want to "add" to these, you should instead call
   * `enrich()` and pass in your additional data there.
   */
  public static start(input?: MikroLogInput): MikroLog {
    if (!MikroLog.instance) MikroLog.instance = new MikroLog();
    if (input) {
      MikroLog.metadataConfig = input.metadataConfig || {};
      MikroLog.event = input.event || {};
      MikroLog.context = input.context || {};
    }
    return MikroLog.instance;
  }

  /**
   * @description Enrich MikroLog with metadata, AWS Lambda event and/or context.
   * @todo Replace or merge intersections of input with existing data?
   */
  public static enrich(input: MikroLogInput) {
    try {
      MikroLog.metadataConfig = Object.assign(MikroLog.metadataConfig, input.metadataConfig || {});
      const fixed = Object.assign(MikroLog.event, input.event || {});
      console.log('---->', fixed);
      MikroLog.event = fixed;
      MikroLog.context = Object.assign(MikroLog.context, input.context || {});
    } catch (error: any) {
      throw new Error('TODO error enriching', error.message);
    }
  }

  /**
   * @description TODO
   */
  public config() {
    console.log(MikroLog.metadataConfig);
    console.log(MikroLog.event);
    console.log(MikroLog.context);
  }

  /**
   * @description An emergency mechanism if you absolutely need to
   * reset the instance to its empty default state.
   */
  public static reset() {
    MikroLog.metadataConfig = {};
    MikroLog.event = {} as any;
    MikroLog.context = {} as any;
  }

  /**
   * @description Retrieve all stored data from process environment.
   * @todo Perhaps store this stringified as one large blob instead?
   * @todo For security reasons perhaps a check needs to be done on
   * IP/country/viewer match before restoring?
   */
  private loadEnrichedEnvironment() {
    return {
      startTime: produceStartTime(),
      region: produceRegion(MikroLog.context),
      runtime: produceRuntime(),
      functionName: produceFunctionName(MikroLog.context),
      functionMemorySize: produceFunctionMemorySize(MikroLog.context),
      functionVersion: produceFunctionVersion(MikroLog.context),
      correlationId: produceCorrelationId(MikroLog.event, MikroLog.context),
      route: produceRoute(MikroLog.event),
      user: produceUser(MikroLog.event),
      stage: produceStage(MikroLog.event),
      viewerCountry: produceViewerCountry(MikroLog.event),
      accountId: produceAccountId(MikroLog.event),
      requestTimeEpoch: produceRequestTimeEpoch(MikroLog.event)
    };
  }

  /**
   * @description Get dynamic user metadata from process environment.
   */
  private produceDynamicMetadata(): DynamicMetadataOutput {
    const timeNow = Date.now();
    const env = this.loadEnrichedEnvironment();

    const metadata = {
      id: randomUUID(),
      timestamp: `${timeNow}`,
      timestampHuman: new Date(timeNow).toISOString(),
      ...env
    };

    const filteredMetadata: any = {};

    Object.entries(metadata).forEach((entry: any) => {
      const [key, value] = entry;
      if (value) filteredMetadata[key] = value;
    });

    return filteredMetadata;
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
    try {
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
        viewerCountry,
        accountId,
        requestTimeEpoch,
        id,
        timestamp,
        timestampHuman
      } = this.produceDynamicMetadata();

      const metadataConfig: any = MikroLog.metadataConfig;
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
        viewerCountry,
        accountId,
        requestTimeEpoch
      };

      return this.filterOutput(logOutput, redactedKeys, maskedValues);
    } catch (error) {
      console.error(error);
      throw new Error('TODO custom error');
    }
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
