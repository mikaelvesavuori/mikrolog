import { randomUUID } from 'crypto';

import {
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
  produceTimestampRequest
} from '../infrastructure/metadataUtils';

import { MikroLogInput, LogInput, LogOutput, Message } from '../interfaces/MikroLog';
import { StaticMetadataConfigInput, DynamicMetadataOutput } from '../interfaces/Metadata';

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
  private static event: any = {};
  private static context: any = {};
  private static debugSamplingLevel: number;

  private constructor() {
    MikroLog.metadataConfig = {};
    MikroLog.event = {};
    MikroLog.context = {};
    MikroLog.debugSamplingLevel = this.initDebugSampleLevel();
  }

  /**
   * @description This instantiates `MikroLog`. In order to be able
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
   * @description An emergency mechanism if you absolutely need to
   * reset the instance to its empty default state.
   */
  public static reset() {
    MikroLog.instance = new MikroLog();
  }

  /**
   * @description Enrich MikroLog with metadata, AWS Lambda event and/or context.
   */
  public static enrich(input: MikroLogInput) {
    MikroLog.metadataConfig = Object.assign(MikroLog.metadataConfig, input.metadataConfig || {});
    MikroLog.event = Object.assign(MikroLog.event, input.event || {});
    MikroLog.context = Object.assign(MikroLog.context, input.context || {});
  }

  /**
   * @description Set sampling rate of `DEBUG` logs.
   */
  public setDebugSamplingRate(samplingPercent: number): number {
    if (typeof samplingPercent !== 'number') return MikroLog.debugSamplingLevel;

    if (samplingPercent < 0) samplingPercent = 0;
    if (samplingPercent > 100) samplingPercent = 100;

    MikroLog.debugSamplingLevel = samplingPercent;
    return samplingPercent;
  }

  /**
   * @description Output a `DEBUG` log. Message may be string or object.
   * This will respect whatever sampling rate is currently set.
   * @example logger.debug('My message!');
   */
  public debug(message: Message): LogOutput {
    const createdLog = this.createLog({ message, level: 'DEBUG', httpStatusCode: 200 });
    if (this.shouldSampleLog()) this.writeLog(createdLog);
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

  //
  // PRIVATE METHODS BELOW
  //

  /**
   * @description Initialize the debug sample rate.
   * Only accepts numbers or strings that can convert to numbers.
   * The default is to use all `DEBUG` logs (i.e. `100` percent).
   */
  private initDebugSampleLevel(): number {
    const envValue = process.env.MIKROLOG_SAMPLE_RATE;
    if (envValue) {
      const isNumeric = !Number.isNaN(envValue) && !Number.isNaN(parseFloat(envValue));
      if (isNumeric) return parseFloat(envValue);
    }
    return 100;
  }

  /**
   * @description Retrieve all stored data from process environment.
   */
  private loadEnrichedEnvironment() {
    return {
      timestampRequest: produceTimestampRequest(MikroLog.event),
      accountId: produceAccountId(MikroLog.event),
      region: produceRegion(MikroLog.context),
      runtime: produceRuntime(),
      functionName: produceFunctionName(MikroLog.context),
      functionMemorySize: produceFunctionMemorySize(MikroLog.context),
      functionVersion: produceFunctionVersion(MikroLog.context),
      correlationId: produceCorrelationId(MikroLog.event, MikroLog.context),
      route: produceRoute(MikroLog.event),
      user: produceUser(MikroLog.event),
      stage: produceStage(MikroLog.event),
      viewerCountry: produceViewerCountry(MikroLog.event)
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
      timestamp: new Date(timeNow).toISOString(),
      timestampEpoch: `${timeNow}`,
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
   * @description Utility to check if a log should be sampled (written) based
   * on the currently set `debugSamplingLevel`. This uses a 0-100 scale.
   *
   * If the random number is lower than (or equal to) the sampling level,
   * then we may sample the log.
   */
  private shouldSampleLog(): boolean {
    return Math.random() * 100 <= MikroLog.debugSamplingLevel;
  }

  /**
   * @description Call `STDOUT` to write the log.
   */
  private writeLog(createdLog: LogOutput) {
    process.stdout.write(JSON.stringify(createdLog) + '\n');
  }

  /**
   * @description Create the log envelope.
   */
  private createLog(log: LogInput): LogOutput {
    const staticMetadata: any = MikroLog.metadataConfig;
    const redactedKeys = staticMetadata['redactedKeys']
      ? staticMetadata['redactedKeys']
      : undefined;
    const maskedValues = staticMetadata['maskedValues']
      ? staticMetadata['maskedValues']
      : undefined;
    if (redactedKeys) delete staticMetadata['redactedKeys'];
    if (maskedValues) delete staticMetadata['maskedValues'];

    const dynamicMetadata = this.produceDynamicMetadata();

    const logOutput = {
      ...staticMetadata,
      ...dynamicMetadata,
      message: log.message,
      error: log.level === 'ERROR',
      level: log.level,
      httpStatusCode: log.httpStatusCode
    };

    const filteredOutput = this.filterOutput(logOutput, redactedKeys, maskedValues);
    return this.sortOutput(filteredOutput);
  }

  /**
   * @description This filters, redacts, and masks the log prior to actual output.
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

  /**
   * @description Alphabetically sort the fields in the log object.
   */
  private sortOutput(input: LogOutput) {
    const sortedOutput: any = {};

    Object.entries(input)
      .sort()
      .forEach(([key, value]) => (sortedOutput[key] = value));

    return sortedOutput;
  }
}
