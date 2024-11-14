import { randomUUID } from 'node:crypto';

import { getMetadata } from 'aws-metadata-utils';

import type {
  DynamicMetadataOutput,
  StaticMetadataConfigInput
} from '../interfaces/Metadata.js';
import type {
  HttpStatusCode,
  LogInput,
  LogOutput,
  Message,
  MikroLogInput
} from '../interfaces/MikroLog.js';

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
  private static metadataConfig:
    | StaticMetadataConfigInput
    | Record<string, any> = {};
  private static event: any = {};
  private static context: any = {};
  private static correlationId: string;
  private static debugSamplingLevel: number;
  private static isDebugLogSampled: boolean;
  private static isColdStart = true;
  private nextLogEnrichment: Record<string, any>;

  private constructor() {
    MikroLog.metadataConfig = {};
    MikroLog.event = {};
    MikroLog.context = {};
    MikroLog.correlationId = '';
    MikroLog.debugSamplingLevel = this.initDebugSampleLevel();
    MikroLog.isDebugLogSampled = true;
    this.nextLogEnrichment = {};
  }

  /**
   * @description This instantiates `MikroLog`. In order to be able
   * to "remember" event and context we use a singleton pattern to
   * reuse the same logical instance.
   *
   * If the `start` method receives any input, that input will
   * overwrite any existing metadata, event, and context.
   *
   * It will also, consequently, wipe the Lambda cold start state.
   *
   * If you want to "add" to these, you should instead call
   * `enrich()` and pass in your additional data there.
   */
  public static start(input?: MikroLogInput): MikroLog {
    if (!MikroLog.instance) MikroLog.instance = new MikroLog();
    MikroLog.metadataConfig = input?.metadataConfig || this.metadataConfig;
    MikroLog.event = input?.event || this.event;
    MikroLog.context = input?.context || this.context;
    MikroLog.context.isColdStart = MikroLog.getColdStart();
    MikroLog.correlationId =
      input?.correlationId ||
      this.correlationId ||
      process.env.CORRELATION_ID ||
      '';
    return MikroLog.instance;
  }

  /**
   * @description Is this a Lambda cold start?
   */
  private static getColdStart(): boolean {
    if (MikroLog.isColdStart) {
      MikroLog.isColdStart = false;
      return true;
    }

    return false;
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
    MikroLog.metadataConfig = Object.assign(
      MikroLog.metadataConfig,
      input.metadataConfig || {}
    );
    MikroLog.event = Object.assign(MikroLog.event, input.event || {});
    MikroLog.context = Object.assign(MikroLog.context, input.context || {});
    MikroLog.correlationId =
      input?.correlationId ||
      this.correlationId ||
      process.env.CORRELATION_ID ||
      '';
  }

  /**
   * @description If you want a one-time root-level enrichment, you can do:
   *
   * ```
   * const logger = MikroLog.start();
   * logger.enrichNext({ someId: '123456789abcdefghi' });
   * logger.info('Ping!'); // Enrichment is present on log
   * logger.info('Ping!'); // Enrichment is no longer present
   * ```
   *
   * You can also use nested objects:
   * ```
   * logger.enrichNext({ myObject: { myValue: 'Something here', otherValue: 'Something else' } });
   * ```
   */
  public enrichNext(input: Record<string, any>) {
    this.nextLogEnrichment = input;
  }

  /**
   * @description Set correlation ID manually, for example for use in cross-boundary calls.
   *
   * This value will be propagated to all future logs.
   */
  public setCorrelationId(correlationId: string): void {
    MikroLog.correlationId = correlationId;
  }

  /**
   * @description Set sampling rate of `DEBUG` logs.
   */
  public setDebugSamplingRate(samplingPercent: number): number {
    let fixedValue = samplingPercent;
    if (typeof samplingPercent !== 'number') return MikroLog.debugSamplingLevel;

    if (samplingPercent < 0) fixedValue = 0;
    if (samplingPercent > 100) fixedValue = 100;

    MikroLog.debugSamplingLevel = fixedValue;
    return fixedValue;
  }

  /**
   * @description Check if MikroLog has sampled the last log.
   * Will only return true value _after_ having output an actual `DEBUG` log.
   */
  public isDebugLogSampled() {
    return MikroLog.isDebugLogSampled;
  }

  /**
   * @description Output a `DEBUG` log. Message may be string or object.
   * This will respect whatever sampling rate is currently set.
   * @example logger.debug('My message!');
   */
  public debug(message: Message, httpStatusCode?: HttpStatusCode): LogOutput {
    const createdLog = this.createLog({
      message,
      level: 'DEBUG',
      httpStatusCode: httpStatusCode || 200
    });
    if (this.shouldSampleLog()) this.writeLog(createdLog);
    return createdLog;
  }

  /**
   * @description Alias for `Logger.log()`. Message may be string or object.
   * @example logger.info('My message!');
   */
  public info(message: Message, httpStatusCode?: HttpStatusCode): LogOutput {
    return this.log(message, httpStatusCode);
  }

  /**
   * @description Output an informational-level log. Message may be string or object.
   * @example logger.log('My message!');
   */
  public log(message: Message, httpStatusCode?: HttpStatusCode): LogOutput {
    const createdLog = this.createLog({
      message,
      level: 'INFO',
      httpStatusCode: httpStatusCode || 200
    });
    this.writeLog(createdLog);
    return createdLog;
  }

  /**
   * @description Output a warning-level log. Message may be string or object.
   * @example logger.warn('My message!');
   */
  public warn(message: Message, httpStatusCode?: HttpStatusCode): LogOutput {
    const createdLog = this.createLog({
      message,
      level: 'WARN',
      httpStatusCode: httpStatusCode || 200
    });
    this.writeLog(createdLog);
    return createdLog;
  }

  /**
   * @description Output an error-level log. Message may be string or object.
   * @example logger.error('My message!');
   */
  public error(message: Message, httpStatusCode?: HttpStatusCode): LogOutput {
    const createdLog = this.createLog({
      message,
      level: 'ERROR',
      httpStatusCode: httpStatusCode || 400
    });
    this.writeLog(createdLog);
    return createdLog;
  }

  /**
   * @description Initialize the debug sample rate.
   * Only accepts numbers or strings that can convert to numbers.
   * The default is to use all `DEBUG` logs (i.e. `100` percent).
   */
  private initDebugSampleLevel(): number {
    const envValue = process.env.MIKROLOG_SAMPLE_RATE;
    if (envValue) {
      const isNumeric =
        !Number.isNaN(envValue) && !Number.isNaN(Number.parseFloat(envValue));
      if (isNumeric) return Number.parseFloat(envValue);
    }
    return 100;
  }

  /**
   * @description Get dynamic metadata.
   */
  private produceDynamicMetadata(): DynamicMetadataOutput {
    const dynamicMetadata = this.getDynamicMetadata();

    const timeNow = Date.now();

    const metadata = {
      id: randomUUID(),
      timestamp: new Date(timeNow).toISOString(),
      timestampEpoch: `${timeNow}`,
      ...dynamicMetadata
    };

    return this.filterMetadata(metadata);
  }

  /**
   * @description Use `aws-metadata-utils` to get dynamic metadata.
   * Restore manually-set `correlationId` if we have one.
   */
  private getDynamicMetadata() {
    const metadata = getMetadata(MikroLog.event, MikroLog.context);

    return {
      ...metadata,
      correlationId: MikroLog.correlationId || metadata.correlationId
    };
  }

  /**
   * @description Filter metadata from empties.
   */
  private filterMetadata(metadata: Record<string, any>) {
    const filteredMetadata: any = {};

    Object.entries(metadata).forEach((entry: any) => {
      const [key, value] = entry;
      if (value || value === false || value === 0)
        filteredMetadata[key] = value;
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
    const logWillBeSampled = Math.random() * 100 <= MikroLog.debugSamplingLevel;
    MikroLog.isDebugLogSampled = logWillBeSampled;
    return logWillBeSampled;
  }

  /**
   * @description Call `STDOUT` to write the log.
   */
  private writeLog(createdLog: LogOutput) {
    process.stdout.write(`${JSON.stringify(createdLog)}\n`);
  }

  /**
   * @description Create the log envelope.
   */
  private createLog(log: LogInput): LogOutput {
    const staticMetadata: any = MikroLog.metadataConfig;
    const redactedKeys = staticMetadata.redactedKeys
      ? staticMetadata.redactedKeys
      : undefined;
    const maskedValues = staticMetadata.maskedValues
      ? staticMetadata.maskedValues
      : undefined;
    if (redactedKeys) delete staticMetadata.redactedKeys;
    if (maskedValues) delete staticMetadata.maskedValues;

    const dynamicMetadata = this.produceDynamicMetadata();

    const logOutput = (() => {
      const output = {
        ...dynamicMetadata,
        ...staticMetadata,
        message: log.message,
        error: log.level === 'ERROR',
        level: log.level,
        httpStatusCode: log.httpStatusCode,
        isColdStart: MikroLog.context.isColdStart
      };

      if (
        this.nextLogEnrichment &&
        JSON.stringify(this.nextLogEnrichment) !== '{}'
      )
        return Object.assign(output, this.nextLogEnrichment);

      return output;
    })();

    this.nextLogEnrichment = {};

    const filteredOutput = this.filterOutput(
      logOutput,
      redactedKeys,
      maskedValues
    );
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

      if (redactedKeys?.includes(key)) return;
      if (maskedValues?.includes(key)) {
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
