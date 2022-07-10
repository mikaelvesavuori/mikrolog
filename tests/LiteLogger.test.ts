import test from 'ava';

import { MikroLog } from '../src/entities/MikroLog';

import { metadataConfig } from '../testdata/config';

/**
 * Utilities for testing
 */
function setTestingProcessEnv() {
  process.env.__CORRELATIONID__ = 'SOME_VALUE';
  process.env.__USER__ = 'SOME_VALUE';
  process.env.__ROUTE__ = 'SOME_VALUE';
  process.env.__REGION__ = 'SOME_VALUE';
  process.env.__RUNTIME__ = 'SOME_VALUE';
  process.env.__FUNCTIONNAME__ = 'SOME_VALUE';
  process.env.__FUNCTIONMEMSIZE__ = 'SOME_VALUE';
  process.env.__FUNCTIONVERSION__ = 'SOME_VALUE';
  process.env.__STAGE__ = 'SOME_VALUE';
  process.env.__ACCOUNTID__ = 'SOME_VALUE';
  process.env.__REQTIMEEPOCH__ = 'SOME_VALUE';
}

function clearProcessEnv() {
  process.env.__CORRELATIONID__ = '';
  process.env.__USER__ = '';
  process.env.__ROUTE__ = '';
  process.env.__REGION__ = '';
  process.env.__RUNTIME__ = '';
  process.env.__FUNCTIONNAME__ = '';
  process.env.__FUNCTIONMEMSIZE__ = '';
  process.env.__FUNCTIONVERSION__ = '';
  process.env.__STAGE__ = '';
  process.env.__ACCOUNTID__ = '';
  process.env.__REQTIMEEPOCH__ = '';
}

/**
 * POSITIVE TESTS
 */
test('It should print out a structured log when given a string message but having no custom static metadata or process environment', async (t) => {
  const message = 'Hello World';

  const logger = new MikroLog();
  const response: any = logger.log(message);

  const expected: any = {
    message: 'Hello World',
    error: false,
    httpStatusCode: 200,
    level: 'INFO',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '1656438566041',
    timestampHuman: 'Tue Jun 28 2022 19:49:26 GMT+0200 (Central European Summer Time)'
  };

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];

  // @ts-ignore
  t.deepEqual(response, expected);
});

test('It should print out a structured log when given a string message', async (t) => {
  setTestingProcessEnv();
  const message = 'Hello World';

  const logger = new MikroLog(metadataConfig);
  const response: any = logger.log(message);

  const expected: any = {
    version: 1,
    lifecycleStage: 'production',
    owner: 'MyCompany',
    hostPlatform: 'aws',
    domain: 'CustomerAcquisition',
    system: 'ShowroomActivities',
    service: 'UserSignUp',
    team: 'MyDemoTeam',
    tags: [''],
    dataSensitivity: 'public',
    message: 'Hello World',
    error: false,
    httpStatusCode: 200,
    level: 'INFO',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '1656438566041',
    timestampHuman: 'Tue Jun 28 2022 19:49:26 GMT+0200 (Central European Summer Time)',
    correlationId: 'SOME_VALUE',
    user: 'SOME_VALUE',
    route: 'SOME_VALUE',
    region: 'SOME_VALUE',
    runtime: 'SOME_VALUE',
    functionName: 'SOME_VALUE',
    functionMemorySize: 'SOME_VALUE',
    functionVersion: 'SOME_VALUE',
    stage: 'SOME_VALUE',
    accountId: 'SOME_VALUE',
    requestTimeEpoch: 'SOME_VALUE'
  };

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];

  // @ts-ignore
  t.deepEqual(response, expected);
  clearProcessEnv();
});

test('It should print out a structured informational log when given a string message', async (t) => {
  setTestingProcessEnv();
  const message = 'Hello World';

  const logger = new MikroLog(metadataConfig);
  const response: any = logger.info(message);

  const expected: any = {
    version: 1,
    lifecycleStage: 'production',
    owner: 'MyCompany',
    hostPlatform: 'aws',
    domain: 'CustomerAcquisition',
    system: 'ShowroomActivities',
    service: 'UserSignUp',
    team: 'MyDemoTeam',
    tags: [''],
    dataSensitivity: 'public',
    message: 'Hello World',
    error: false,
    httpStatusCode: 200,
    level: 'INFO',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '1656438566041',
    timestampHuman: 'Tue Jun 28 2022 19:49:26 GMT+0200 (Central European Summer Time)',
    correlationId: 'SOME_VALUE',
    user: 'SOME_VALUE',
    route: 'SOME_VALUE',
    region: 'SOME_VALUE',
    runtime: 'SOME_VALUE',
    functionName: 'SOME_VALUE',
    functionMemorySize: 'SOME_VALUE',
    functionVersion: 'SOME_VALUE',
    stage: 'SOME_VALUE',
    accountId: 'SOME_VALUE',
    requestTimeEpoch: 'SOME_VALUE'
  };

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];

  // @ts-ignore
  t.deepEqual(response, expected);
  clearProcessEnv();
});

test('It should print out a structured debug log when given a string message', async (t) => {
  setTestingProcessEnv();
  const message = 'Hello World';

  const logger = new MikroLog(metadataConfig);
  const response: any = logger.debug(message);

  const expected: any = {
    version: 1,
    lifecycleStage: 'production',
    owner: 'MyCompany',
    hostPlatform: 'aws',
    domain: 'CustomerAcquisition',
    system: 'ShowroomActivities',
    service: 'UserSignUp',
    team: 'MyDemoTeam',
    tags: [''],
    dataSensitivity: 'public',
    message: 'Hello World',
    error: false,
    httpStatusCode: 200,
    level: 'DEBUG',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '1656438566041',
    timestampHuman: 'Tue Jun 28 2022 19:49:26 GMT+0200 (Central European Summer Time)',
    correlationId: 'SOME_VALUE',
    user: 'SOME_VALUE',
    route: 'SOME_VALUE',
    region: 'SOME_VALUE',
    runtime: 'SOME_VALUE',
    functionName: 'SOME_VALUE',
    functionMemorySize: 'SOME_VALUE',
    functionVersion: 'SOME_VALUE',
    stage: 'SOME_VALUE',
    accountId: 'SOME_VALUE',
    requestTimeEpoch: 'SOME_VALUE'
  };

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];

  // @ts-ignore
  t.deepEqual(response, expected);
  clearProcessEnv();
});

test('It should print out a structured warning log when given a string message', async (t) => {
  setTestingProcessEnv();
  const message = 'Hello World';

  const logger = new MikroLog(metadataConfig);
  const response: any = logger.warn(message);

  const expected: any = {
    version: 1,
    lifecycleStage: 'production',
    owner: 'MyCompany',
    hostPlatform: 'aws',
    domain: 'CustomerAcquisition',
    system: 'ShowroomActivities',
    service: 'UserSignUp',
    team: 'MyDemoTeam',
    tags: [''],
    dataSensitivity: 'public',
    message: 'Hello World',
    error: false,
    httpStatusCode: 200,
    level: 'WARN',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '1656438566041',
    timestampHuman: 'Tue Jun 28 2022 19:49:26 GMT+0200 (Central European Summer Time)',
    correlationId: 'SOME_VALUE',
    user: 'SOME_VALUE',
    route: 'SOME_VALUE',
    region: 'SOME_VALUE',
    runtime: 'SOME_VALUE',
    functionName: 'SOME_VALUE',
    functionMemorySize: 'SOME_VALUE',
    functionVersion: 'SOME_VALUE',
    stage: 'SOME_VALUE',
    accountId: 'SOME_VALUE',
    requestTimeEpoch: 'SOME_VALUE'
  };

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];

  // @ts-ignore
  t.deepEqual(response, expected);
  clearProcessEnv();
});

test('It should print out a structured error log when given a string message', async (t) => {
  setTestingProcessEnv();
  const message = 'Hello World';

  const logger = new MikroLog(metadataConfig);
  const response: any = logger.error(message);

  const expected: any = {
    version: 1,
    lifecycleStage: 'production',
    owner: 'MyCompany',
    hostPlatform: 'aws',
    domain: 'CustomerAcquisition',
    system: 'ShowroomActivities',
    service: 'UserSignUp',
    team: 'MyDemoTeam',
    tags: [''],
    dataSensitivity: 'public',
    message: 'Hello World',
    error: true,
    httpStatusCode: 400,
    level: 'ERROR',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '1656438566041',
    timestampHuman: 'Tue Jun 28 2022 19:49:26 GMT+0200 (Central European Summer Time)',
    correlationId: 'SOME_VALUE',
    user: 'SOME_VALUE',
    route: 'SOME_VALUE',
    region: 'SOME_VALUE',
    runtime: 'SOME_VALUE',
    functionName: 'SOME_VALUE',
    functionMemorySize: 'SOME_VALUE',
    functionVersion: 'SOME_VALUE',
    stage: 'SOME_VALUE',
    accountId: 'SOME_VALUE',
    requestTimeEpoch: 'SOME_VALUE'
  };

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];

  // @ts-ignore
  t.deepEqual(response, expected);
  clearProcessEnv();
});

/**
 * NEGATIVE TESTS
 */
/*
test('It should ASDF', async (t) => {
  const error = await t.throwsAsync(async () => await slotAggregate.cancel(''));
   @ts-ignore
  t.is(error.name, 'MissingInputDataError');
});
*/

test('It should redact keys when given a "redactedKeys" list', async (t) => {
  const message = 'Hello World';

  const _metadataConfig: any = metadataConfig;
  _metadataConfig['redactedKeys'] = ['team', 'id'];

  const logger = new MikroLog(_metadataConfig);
  const response: any = logger.error(message);

  const expected: any = {
    version: 1,
    lifecycleStage: 'production',
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
    level: 'ERROR',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '1656438566041',
    timestampHuman: 'Tue Jun 28 2022 19:49:26 GMT+0200 (Central European Summer Time)'
  };

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];

  // @ts-ignore
  t.deepEqual(response, expected);
});

test('It should mask values when given a "maskedValues" list', async (t) => {
  const message = 'Hello World';

  const _metadataConfig: any = metadataConfig;
  _metadataConfig['maskedValues'] = ['team', 'id'];

  const logger = new MikroLog(_metadataConfig);
  const response: any = logger.error(message);

  const expected: any = {
    version: 1,
    lifecycleStage: 'production',
    owner: 'MyCompany',
    hostPlatform: 'aws',
    domain: 'CustomerAcquisition',
    system: 'ShowroomActivities',
    service: 'UserSignUp',
    team: 'MASKED',
    tags: [''],
    dataSensitivity: 'public',
    message: 'Hello World',
    error: true,
    httpStatusCode: 400,
    level: 'ERROR',
    id: '1256767f-c875-4d82-813d-bc260bd0ba07',
    timestamp: '1656438566041',
    timestampHuman: 'Tue Jun 28 2022 19:49:26 GMT+0200 (Central European Summer Time)'
  };

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];

  // @ts-ignore
  t.deepEqual(response, expected);
});

test('It should accept a custom metadata configuration', async (t) => {
  const message = 'Hello World';

  const customMetadata = {
    myCustomFields: {
      something: 123,
      custom: 'Yep it works'
    }
  };

  const logger = new MikroLog(customMetadata);
  const response: any = logger.info(message);

  const expected: any = {
    myCustomFields: {
      something: 123,
      custom: 'Yep it works'
    },
    error: false,
    httpStatusCode: 200,
    level: 'INFO',
    message: 'Hello World'
  };

  // Ensure exactness of message field
  t.is(response['message'], message);

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];

  // @ts-ignore
  t.deepEqual(response, expected);
});

/**
 * NEGATIVE TESTS
 */
/*
test('It should ASDF', async (t) => {
  const error = await t.throwsAsync(async () => await slotAggregate.cancel(''));
   @ts-ignore
  t.is(error.name, 'MissingInputDataError');
});
*/
