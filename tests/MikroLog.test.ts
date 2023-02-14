import test from 'ava';

import { MikroLog } from '../src/entities/MikroLog';

import { metadataConfig } from '../testdata/config';
import fullLog from '../testdata/fullLog.json';

function cleanObject(object: Record<string, any>) {
  delete object['id'];
  delete object['timestamp'];
  delete object['timestampEpoch'];
  delete object['isColdStart'];

  return object;
}

/**
 * POSITIVE TESTS
 */
test.serial('Starting MikroLog will set the instance to a new one', (t) => {
  const expected = true;
  const logger = MikroLog.start();

  const isInstance = logger instanceof MikroLog;

  t.is(isInstance, expected);
});

test.serial(
  'It should return (print out) a structured log when given a string message but having no custom static metadata or process environment',
  (t) => {
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
    t.is(response['message'], message);

    // Check presence of dynamic fields
    t.true(response['id'] !== null);
    t.true(response['timestamp'] !== null);
    t.true(response['timestampEpoch'] !== null);
    t.true(response['isColdStart'] !== null);

    // Drop dynamic fields for test validation
    const cleanedResponse = cleanObject(response);
    const cleanedExpected = cleanObject(expected);

    t.deepEqual(cleanedResponse, cleanedExpected);
  }
);

test.serial('It should return (print out) a structured log when given a string message', (t) => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
  const response: any = logger.log(message);

  const expected: any = JSON.parse(JSON.stringify(fullLog));

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampEpoch'] !== null);
  t.true(response['isColdStart'] !== null);

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  t.deepEqual(cleanedResponse, cleanedExpected);
});

test.serial(
  'It should return (print out) a structured informational log when given a string message',
  (t) => {
    MikroLog.reset();
    const message = 'Hello World';

    const logger = MikroLog.start({ metadataConfig });
    const response: any = logger.info(message);

    const expected: any = JSON.parse(JSON.stringify(fullLog));

    // Ensure exactness of message field
    t.is(response['message'], message);

    // Check presence of dynamic fields
    t.true(response['id'] !== null);
    t.true(response['timestamp'] !== null);
    t.true(response['timestampEpoch'] !== null);
    t.true(response['isColdStart'] !== null);

    // Drop dynamic fields for test validation
    const cleanedResponse = cleanObject(response);
    const cleanedExpected = cleanObject(expected);

    t.deepEqual(cleanedResponse, cleanedExpected);
  }
);

test.serial(
  'It should return (print out) a structured debug log when given a string message',
  (t) => {
    MikroLog.reset();
    const message = 'Hello World';

    const logger = MikroLog.start({ metadataConfig });
    const response: any = logger.debug(message);

    const expected: any = JSON.parse(JSON.stringify(fullLog));
    expected['level'] = 'DEBUG';

    // Ensure exactness of message field
    t.is(response['message'], message);

    // Check presence of dynamic fields
    t.true(response['id'] !== null);
    t.true(response['timestamp'] !== null);
    t.true(response['timestampEpoch'] !== null);
    t.true(response['isColdStart'] !== null);

    // Drop dynamic fields for test validation
    const cleanedResponse = cleanObject(response);
    const cleanedExpected = cleanObject(expected);

    t.deepEqual(cleanedResponse, cleanedExpected);
  }
);

test.serial(
  'It should return (print out) a structured warning log when given a string message',
  (t) => {
    MikroLog.reset();
    const message = 'Hello World';

    const logger = MikroLog.start({ metadataConfig });
    const response: any = logger.warn(message);

    const expected: any = JSON.parse(JSON.stringify(fullLog));
    expected['level'] = 'WARN';

    // Ensure exactness of message field
    t.is(response['message'], message);

    // Check presence of dynamic fields
    t.true(response['id'] !== null);
    t.true(response['timestamp'] !== null);
    t.true(response['timestampEpoch'] !== null);
    t.true(response['isColdStart'] !== null);

    // Drop dynamic fields for test validation
    const cleanedResponse = cleanObject(response);
    const cleanedExpected = cleanObject(expected);

    t.deepEqual(cleanedResponse, cleanedExpected);
  }
);

test.serial(
  'It should return (print out) a structured error log when given a string message',
  (t) => {
    MikroLog.reset();
    const message = 'Hello World';

    const logger = MikroLog.start({ metadataConfig });
    const response: any = logger.error(message);

    const expected: any = JSON.parse(JSON.stringify(fullLog));
    expected['level'] = 'ERROR';
    expected['error'] = true;
    expected['httpStatusCode'] = 400;

    // Ensure exactness of message field
    t.is(response['message'], message);

    // Check presence of dynamic fields
    t.true(response['id'] !== null);
    t.true(response['timestamp'] !== null);
    t.true(response['timestampEpoch'] !== null);
    t.true(response['isColdStart'] !== null);

    // Drop dynamic fields for test validation
    const cleanedResponse = cleanObject(response);
    const cleanedExpected = cleanObject(expected);

    t.deepEqual(cleanedResponse, cleanedExpected);
  }
);

test.serial('It should be configurable with a correlation ID at init time', (t) => {
  const expected = 'abc123';
  const logger = MikroLog.start({ correlationId: expected });
  const log = logger.log('');
  const result = log.correlationId;
  t.is(result, expected);
});

test.serial('It should be configurable with a correlation ID', (t) => {
  const expected = 'abc123';
  const logger = MikroLog.start();
  logger.setCorrelationId(expected);
  const log = logger.log('');
  const result = log.correlationId;
  t.is(result, expected);
});

test.serial('It should retain the correlation ID across multiple logs', (t) => {
  const expected = 'abc123';
  const logger = MikroLog.start();
  logger.setCorrelationId(expected);
  logger.log('');
  logger.log('');
  logger.log('');
  const log = logger.log('');
  const result = log.correlationId;
  t.is(result, expected);
});

test.serial('It should set the debug sampling rate through an environment variable', (t) => {
  const expected = 0.5;
  process.env.MIKROLOG_SAMPLE_RATE = `${expected}`;

  MikroLog.reset(); // Needed as `initDebugSampleLevel()` is only run at init-time
  const logger = MikroLog.start();
  // @ts-ignore
  const result = logger.setDebugSamplingRate();
  t.is(result, expected);

  // Reset
  logger.setDebugSamplingRate(100);
  process.env.MIKROLOG_SAMPLE_RATE = undefined;
});

test.serial('It should return the current DEBUG sampling rate when given a string value', (t) => {
  const logger = MikroLog.start();
  const expected = 100;
  // @ts-ignore
  const newSamplingRate = logger.setDebugSamplingRate('10273124');
  t.is(newSamplingRate, expected);
});

test.serial('It should return the current DEBUG sampling rate when given an object value', (t) => {
  const logger = MikroLog.start();
  const expected = 100;
  // @ts-ignore
  const newSamplingRate = logger.setDebugSamplingRate({ asdf: 123 });
  t.is(newSamplingRate, expected);
});

test.serial(
  'It should set a new DEBUG sampling rate when given a number between 0 and 100',
  (t) => {
    const logger = MikroLog.start();
    const expected = 5;
    const newSamplingRate = logger.setDebugSamplingRate(expected);
    t.is(newSamplingRate, expected);
  }
);

test.serial('It should set the DEBUG sampling rate to 0 when given a number lower than 0', (t) => {
  const logger = MikroLog.start();
  const expected = 0;
  const newSamplingRate = logger.setDebugSamplingRate(-4);
  t.is(newSamplingRate, expected);
});

test.serial(
  'It should set the DEBUG sampling rate to 100 when given a number higher than than 100',
  (t) => {
    const logger = MikroLog.start();
    const expected = 100;
    const newSamplingRate = logger.setDebugSamplingRate(10273124);
    t.is(newSamplingRate, expected);
  }
);

test.serial('It should have all logs being sampled at init time', (t) => {
  const logger = MikroLog.start();
  const expected = true;
  const sampling = logger.isDebugLogSampled();
  t.is(sampling, expected);
});

test.serial('It should not sample logs when setting the sampling rate to 0', (t) => {
  const logger = MikroLog.start();
  const expected = false;
  logger.setDebugSamplingRate(0);
  logger.debug('');
  const sampling = logger.isDebugLogSampled();
  t.is(sampling, expected);
});

test.serial('It should set a custom HTTP status code for informational logs', (t) => {
  const logger = MikroLog.start();
  const expected = 201;
  const message = logger.info('Ny message!', 201);
  t.is(message['httpStatusCode'], expected);
});

test.serial('It should set a custom HTTP status code for debug logs', (t) => {
  const logger = MikroLog.start();
  const expected = 201;
  const message = logger.debug('Ny message!', 201);
  t.is(message['httpStatusCode'], expected);
});

test.serial('It should set a custom HTTP status code for warning logs', (t) => {
  const logger = MikroLog.start();
  const expected = 201;
  const message = logger.warn('Ny message!', 201);
  t.is(message['httpStatusCode'], expected);
});

test.serial('It should set a custom HTTP status code for error logs', (t) => {
  const logger = MikroLog.start();
  const expected = 201;
  const message = logger.error('Ny message!', 201);
  t.is(message['httpStatusCode'], expected);
});

test.serial('It should redact keys when given a "redactedKeys" list', (t) => {
  MikroLog.reset();
  const message = 'Hello World';

  const _metadataConfig: any = JSON.parse(JSON.stringify(metadataConfig));
  _metadataConfig['redactedKeys'] = ['team', 'id'];

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
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampEpoch'] !== null);
  t.true(response['isColdStart'] !== null);

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  t.deepEqual(cleanedResponse, cleanedExpected);
});

test.serial('It should mask values when given a "maskedValues" list', (t) => {
  MikroLog.reset();
  const message = 'Hello World';

  const _metadataConfig: any = JSON.parse(JSON.stringify(metadataConfig));
  _metadataConfig['maskedValues'] = ['team', 'id'];

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
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampEpoch'] !== null);
  t.true(response['isColdStart'] !== null);

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  t.deepEqual(cleanedResponse, cleanedExpected);
});

test.serial('It should accept a custom metadata configuration', (t) => {
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
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampEpoch'] !== null);
  t.true(response['isColdStart'] !== null);

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  t.deepEqual(cleanedResponse, cleanedExpected);
});

test.serial('It should retain falsy but defined values in logs', (t) => {
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
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampEpoch'] !== null);
  t.true(response['isColdStart'] !== null);

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  t.deepEqual(cleanedResponse, cleanedExpected);
});

test.serial('It should be able to merge enrichment even if input is essentially empty', (t) => {
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
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampEpoch'] !== null);
  t.true(response['isColdStart'] !== null);

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  t.deepEqual(cleanedResponse, cleanedExpected);
});

test.serial('It should be able to enrich with correlation ID', (t) => {
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
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampEpoch'] !== null);
  t.true(response['isColdStart'] !== null);

  // Drop dynamic fields for test validation
  const cleanedResponse = cleanObject(response);
  const cleanedExpected = cleanObject(expected);

  t.deepEqual(cleanedResponse, cleanedExpected);
});

test.serial(
  'It should enrich a single-level log with a one-time root item and ensure it is not present in later calls',
  (t) => {
    MikroLog.reset();
    const message = 'Hello World';

    const logger = MikroLog.start();
    logger.enrichNext({ myValue: 'abc123' });

    const responseFirst: Record<string, any> = logger.info(message);
    const responseSecond: Record<string, any> = logger.info(message);

    t.is(responseFirst.hasOwnProperty('myValue'), true);
    t.is(responseSecond.hasOwnProperty('myValue'), false);
  }
);

test.serial(
  'It should enrich a multi-level log with a one-time root item and ensure it is not present in later calls',
  (t) => {
    MikroLog.reset();
    const message = 'Hello World';

    const logger = MikroLog.start();
    logger.enrichNext({ dd: { trace_id: 'abc123' } });

    const responseFirst: Record<string, any> = logger.info(message);
    const responseSecond: Record<string, any> = logger.info(message);

    t.is(responseFirst['dd']['trace_id'], 'abc123');
    t.is(responseSecond.hasOwnProperty('dd'), false);
  }
);
