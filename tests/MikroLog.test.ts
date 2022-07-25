import test from 'ava';

import { MikroLog } from '../src/entities/MikroLog';

import { metadataConfig } from '../testdata/config';

/**
 * POSITIVE TESTS
 */
test.serial('Starting MikroLog will set the instance to a new one', (t) => {
  const logger = MikroLog.start();

  const isInstance = logger instanceof MikroLog;
  const expected = true;

  t.is(isInstance, expected);
});

test.serial(
  'It should print out a structured log when given a string message but having no custom static metadata or process environment',
  (t) => {
    MikroLog.reset();
    const message = 'Hello World';

    const logger = MikroLog.start();
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
  }
);

test.serial('It should print out a structured log when given a string message', (t) => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
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

test.serial(
  'It should print out a structured informational log when given a string message',
  (t) => {
    MikroLog.reset();
    const message = 'Hello World';

    const logger = MikroLog.start({ metadataConfig });
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
  }
);

test.serial('It should print out a structured debug log when given a string message', (t) => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
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

test.serial('It should print out a structured warning log when given a string message', (t) => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
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

test.serial('It should print out a structured error log when given a string message', (t) => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start({ metadataConfig });
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

/**
 * NEGATIVE TESTS
 */
/*
test.serial('It should ASDF',  (t) => {
  const error = await t.throws( () => await slotAggregate.cancel(''));
   @ts-ignore
  t.is(error.name, 'MissingInputDataError');
});
*/

test.serial('It should redact keys when given a "redactedKeys" list', (t) => {
  MikroLog.reset();
  const message = 'Hello World';

  const _metadataConfig: any = JSON.parse(JSON.stringify(metadataConfig));
  _metadataConfig['redactedKeys'] = ['team', 'id'];

  const logger = MikroLog.start({ metadataConfig: _metadataConfig });
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
    level: 'ERROR',
    lifecycleStage: 'production',
    message: 'Hello World',
    owner: 'MyCompany',
    service: 'UserSignUp',
    system: 'ShowroomActivities',
    tags: [''],
    team: 'MASKED',
    version: 1
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

test.serial('It should be able to merge enrichment even if input is essentially empty', (t) => {
  MikroLog.reset();
  const message = 'Hello World';

  const logger = MikroLog.start();
  MikroLog.enrich({});
  const response: any = logger.info(message);

  const expected: any = {
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

  // @ts-ignore
  t.deepEqual(response, expected);
});
