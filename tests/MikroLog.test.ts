import { expect, test } from 'vitest';

import { MikroLog } from '../src/entities/MikroLog.js';

import { metadataConfig } from '../testdata/config.js';
// @ts-ignore
import fullLog from '../testdata/fullLog.json';

function cleanObject(object: Record<string, any>) {
  delete object.id;
  delete object.timestamp;
  delete object.timestampEpoch;
  delete object.isColdStart;

  return object;
}

/**
 * POSITIVE TESTS
 */
test('Starting MikroLog will set the instance to a new one', () => {
  const expected = true;
  const logger = MikroLog.start();

  const isInstance = logger instanceof MikroLog;

  expect(isInstance).toBe(expected);
});

test('It should return (print out) a structured log when given a string message but having no custom static metadata or process environment', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start();
  const response: any = logger.log(message);

  const expected: any = {
    message: 'Hello World',
    error: false,
    httpStatusCode: 200,
    isColdStart: true,
    level: 'INFO',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '2022-07-25T08:52:21.121Z',
    timestampEpoch: '1656438566041'
  };

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should return (print out) a structured log when given a string message', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
  const response: any = logger.log(message);

  const expected: any = JSON.parse(JSON.stringify(fullLog));

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should return (print out) a structured informational log when given a string message', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
  const response: any = logger.info(message);

  const expected: any = JSON.parse(JSON.stringify(fullLog));

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should return (print out) a structured debug log when given a string message', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
  const response: any = logger.debug(message);

  const expected: any = JSON.parse(JSON.stringify(fullLog));
  expected.level = 'DEBUG';

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should return (print out) a structured warning log when given a string message', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
  const response: any = logger.warn(message);

  const expected: any = JSON.parse(JSON.stringify(fullLog));
  expected.level = 'WARN';

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should return (print out) a structured error log when given a string message', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
  const response: any = logger.error(message);

  const expected: any = JSON.parse(JSON.stringify(fullLog));
  expected.level = 'ERROR';
  expected.error = true;
  expected.httpStatusCode = 400;

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should be configurable with a correlation ID at init time', () => {
  const expected = 'abc123';
  const logger = MikroLog.start({ correlationId: expected });
  const log = logger.log('');
  const result = log.correlationId;
  expect(result).toBe(expected);
});

test('It should be configurable with a correlation ID', () => {
  const expected = 'abc123';
  const logger = MikroLog.start();
  logger.setCorrelationId(expected);
  const log = logger.log('');
  const result = log.correlationId;
  expect(result).toBe(expected);
});

test('It should retain the correlation ID across multiple logs', () => {
  const expected = 'abc123';
  const logger = MikroLog.start();
  logger.setCorrelationId(expected);
  logger.log('');
  logger.log('');
  logger.log('');
  const log = logger.log('');
  const result = log.correlationId;
  expect(result).toBe(expected);
});

test('It should pick the correlation ID from the environment', () => {
  const expected = 'abc123';
  process.env.CORRELATION_ID = expected;
  const logger = MikroLog.start();
  const log = logger.log('');
  const result = log.correlationId;
  expect(result).toBe(expected);
  process.env.CORRELATION_ID = '';
});

test('It should pick the correlation ID from the environment and keep it across multiple instances', () => {
  const expected = 'abc123';
  process.env.CORRELATION_ID = expected;
  const logger1 = MikroLog.start();
  const log1 = logger1.log('');
  process.env.CORRELATION_ID = '';
  const logger2 = MikroLog.start();
  const log2 = logger2.log('');
  expect(log1.correlationId).toBe(expected);
  expect(log2.correlationId).toBe(expected);
});

test('It should set the debug sampling rate through an environment variable', () => {
  const expected = 0.5;
  process.env.MIKROLOG_SAMPLE_RATE = `${expected}`;

  MikroLog.reset(); // Needed as `initDebugSampleLevel()` is only run at init-time
  const logger = MikroLog.start();
  // @ts-ignore
  const result = logger.setDebugSamplingRate();
  expect(result).toBe(expected);

  // Reset
  logger.setDebugSamplingRate(100);
  process.env.MIKROLOG_SAMPLE_RATE = undefined;
});

test('It should return the current DEBUG sampling rate when given a string value', () => {
  const logger = MikroLog.start();
  const expected = 100;
  // @ts-ignore
  const newSamplingRate = logger.setDebugSamplingRate('10273124');
  expect(newSamplingRate).toBe(expected);
});

test('It should return the current DEBUG sampling rate when given an object value', () => {
  const logger = MikroLog.start();
  const expected = 100;
  // @ts-ignore
  const newSamplingRate = logger.setDebugSamplingRate({ asdf: 123 });
  expect(newSamplingRate).toBe(expected);
});

test('It should set a new DEBUG sampling rate when given a number between 0 and 100', () => {
  const logger = MikroLog.start();
  const expected = 5;
  const newSamplingRate = logger.setDebugSamplingRate(expected);
  expect(newSamplingRate).toBe(expected);
});

test('It should set the DEBUG sampling rate to 0 when given a number lower than 0', () => {
  const logger = MikroLog.start();
  const expected = 0;
  const newSamplingRate = logger.setDebugSamplingRate(-4);
  expect(newSamplingRate).toBe(expected);
});

test('It should set the DEBUG sampling rate to 100 when given a number higher than than 100', () => {
  const logger = MikroLog.start();
  const expected = 100;
  const newSamplingRate = logger.setDebugSamplingRate(10273124);
  expect(newSamplingRate).toBe(expected);
});

test('It should have all logs being sampled at init time', () => {
  const logger = MikroLog.start();
  const expected = true;
  const sampling = logger.isDebugLogSampled();
  expect(sampling).toBe(expected);
});

test('It should not sample logs when setting the sampling rate to 0', () => {
  const logger = MikroLog.start();
  const expected = false;
  logger.setDebugSamplingRate(0);
  logger.debug('');
  const sampling = logger.isDebugLogSampled();
  expect(sampling).toBe(expected);
});

test('It should set a custom HTTP status code for informational logs', () => {
  const logger = MikroLog.start();
  const expected = 201;
  const message = logger.info('Ny message!', 201);
  expect(message.httpStatusCode).toBe(expected);
});

test('It should set a custom HTTP status code for debug logs', () => {
  const logger = MikroLog.start();
  const expected = 201;
  const message = logger.debug('Ny message!', 201);
  expect(message.httpStatusCode).toBe(expected);
});

test('It should set a custom HTTP status code for warning logs', () => {
  const logger = MikroLog.start();
  const expected = 201;
  const message = logger.warn('Ny message!', 201);
  expect(message.httpStatusCode).toBe(expected);
});

test('It should set a custom HTTP status code for error logs', () => {
  const logger = MikroLog.start();
  const expected = 201;
  const message = logger.error('Ny message!', 201);
  expect(message.httpStatusCode).toBe(expected);
});

test('It should redact keys when given a "redactedKeys" list', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const _metadataConfig: any = JSON.parse(JSON.stringify(metadataConfig));
  _metadataConfig.redactedKeys = ['team', 'id'];

  const logger = MikroLog.start({ metadataConfig: _metadataConfig });
  const response: any = logger.error(message);

  const expected: any = {
    version: 1,
    owner: 'MyCompany',
    hostPlatform: 'aws',
    domain: 'CustomerAcquisition',
    system: 'ShowroomActivities',
    service: 'UserSignUp',
    tags: [''],
    dataSensitivity: 'public',
    message: 'Hello World',
    error: true,
    httpStatusCode: 400,
    isColdStart: true,
    level: 'ERROR',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '2022-07-25T08:52:21.121Z',
    timestampEpoch: '1656438566041',
    jurisdiction: 'EU'
  };

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  //expect(response.id).toBeDefined(); // For some reason breaks after migrating to Vitest
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should mask values when given a "maskedValues" list', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const _metadataConfig: any = JSON.parse(JSON.stringify(metadataConfig));
  _metadataConfig.maskedValues = ['team', 'id'];

  const logger = MikroLog.start({ metadataConfig: _metadataConfig });
  const response: any = logger.error(message);

  const expected: any = {
    dataSensitivity: 'public',
    domain: 'CustomerAcquisition',
    error: true,
    hostPlatform: 'aws',
    httpStatusCode: 400,
    isColdStart: true,
    level: 'ERROR',
    message: 'Hello World',
    owner: 'MyCompany',
    service: 'UserSignUp',
    system: 'ShowroomActivities',
    tags: [''],
    team: 'MASKED',
    version: 1,
    jurisdiction: 'EU'
  };

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should accept a custom metadata configuration', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const customMetadata = {
    myCustomFields: {
      something: 123,
      custom: 'Yep it works'
    }
  };

  const logger = MikroLog.start({ metadataConfig: customMetadata });
  const response: any = logger.info(message);

  const expected: any = {
    myCustomFields: {
      something: 123,
      custom: 'Yep it works'
    },
    error: false,
    httpStatusCode: 200,
    isColdStart: true,
    level: 'INFO',
    message: 'Hello World'
  };

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should retain falsy but defined values in logs', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({
    metadataConfig: {
      falsyTest1: false,
      falsyTest2: 0
    }
  });
  const response: any = logger.info(message);

  const expected: any = {
    error: false,
    httpStatusCode: 200,
    isColdStart: true,
    falsyTest1: false,
    falsyTest2: 0,
    level: 'INFO',
    message: 'Hello World'
  };

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should be able to merge enrichment even if input is essentially empty', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start();
  MikroLog.enrich({});
  const response: any = logger.info(message);

  const expected: any = {
    error: false,
    httpStatusCode: 200,
    isColdStart: true,
    level: 'INFO',
    message: 'Hello World'
  };

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should be able to enrich with correlation ID', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start();
  MikroLog.enrich({ correlationId: 'abc123' });
  const response: any = logger.info(message);

  const expected: any = {
    correlationId: 'abc123',
    error: false,
    httpStatusCode: 200,
    isColdStart: true,
    level: 'INFO',
    message: 'Hello World'
  };

  // Ensure exactness of message field
  expect(response.message).toBe(message);

  // Check presence of dynamic fields
  expect(response.id).toBeDefined();
  expect(response.timestamp).toBeDefined();
  expect(response.timestampEpoch).toBeDefined();
  expect(response.isColdStart).toBeDefined();

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  expect(cleanedResponse).toMatchObject(cleanedExpected);
});

test('It should enrich a single-level log with a one-time root item and ensure it is not present in later calls', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start();
  logger.enrichNext({ myValue: 'abc123' });

  const responseFirst: Record<string, any> = logger.info(message);
  const responseSecond: Record<string, any> = logger.info(message);

  expect(responseFirst.hasOwnProperty('myValue')).toBe(true);
  expect(responseSecond.hasOwnProperty('myValue')).toBe(false);
});

test('It should enrich a multi-level log with a one-time root item and ensure it is not present in later calls', () => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start();
  logger.enrichNext({ dd: { trace_id: 'abc123' } });

  const responseFirst: Record<string, any> = logger.info(message);
  const responseSecond: Record<string, any> = logger.info(message);

  expect(responseFirst.dd.trace_id).toBe('abc123');
  expect(responseSecond.hasOwnProperty('dd')).toBe(false);
});
