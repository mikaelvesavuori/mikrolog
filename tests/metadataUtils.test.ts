import test from 'ava';

import { MikroLog } from '../src';

import event from '../testdata/event.json';
import context from '../testdata/context.json';

test.after(() => MikroLog.reset());

/**
 * POSITIVE TESTS
 */
test.serial('It should retain the existing context starting a new MikroLog', (t) => {
  MikroLog.reset();
  MikroLog.start({ event, context });
  const second = MikroLog.start();
  const correlationIdOfSecond = second.log('something').correlationId;
  const expected = '6c933bd2-9535-45a8-b09c-84d00b4f50cc';

  t.is(correlationIdOfSecond, expected);
});

test.serial('It should set correlation ID if given in detail metadata', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  const expected = 'asdf1234';

  const _event: any = JSON.parse(JSON.stringify(event));
  _event['detail'] = {
    metadata: {
      correlationId: expected
    }
  };
  const _context = JSON.parse(JSON.stringify(context));
  _context['awsRequestId'] = '';
  MikroLog.enrich({ event: _event, context: _context });

  const response = logger.log('something').correlationId;

  t.is(response, expected);
});

test.serial('It should set correlation ID if given in headers', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  const expected = 'asdf1234';

  const _event: any = JSON.parse(JSON.stringify(event));
  _event['headers'] = {
    'x-correlation-id': expected
  };
  const _context = JSON.parse(JSON.stringify(context));
  _context['awsRequestId'] = '';
  MikroLog.enrich({ event: _event, context: _context });

  const response = logger.log('something').correlationId;

  t.is(response, expected);
});

test.serial('It should set correlation ID if given in AWS request ID', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });

  const expected = '6c933bd2-9535-45a8-b09c-84d00b4f50cc';
  const response = logger.log('something').correlationId;

  t.is(response, expected);
});

test.serial('It should set region', (t) => {
  MikroLog.reset();
  process.env.AWS_REGION = 'eu-north-1';
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });

  const expected = process.env.AWS_REGION;
  const response = logger.log('something').region;

  t.is(response, expected);
  process.env.AWS_REGION = '';
});

test.serial('It should set runtime', (t) => {
  MikroLog.reset();
  process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodejs16';
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });

  const expected = process.env.AWS_EXECUTION_ENV;
  const response = logger.log('something').runtime;

  t.is(response, expected);
  process.env.AWS_EXECUTION_ENV = '';
});

test.serial('It should set function name ', (t) => {
  MikroLog.reset();
  process.env.AWS_LAMBDA_FUNCTION_NAME = 'somestack-FunctionName';
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });

  const expected = process.env.AWS_LAMBDA_FUNCTION_NAME;
  const response = logger.log('something').functionName;

  t.is(response, expected);
  process.env.AWS_LAMBDA_FUNCTION_NAME = '';
});

test.serial('It should set function memory size', (t) => {
  MikroLog.reset();
  process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '1024';
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });

  const expected = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE;
  const response = logger.log('something').functionMemorySize;

  t.is(response, expected);
  process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '';
});

test.serial('It should set function version', (t) => {
  MikroLog.reset();
  process.env.AWS_LAMBDA_FUNCTION_VERSION = '$LATEST';
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });

  const expected = process.env.AWS_LAMBDA_FUNCTION_VERSION;
  const response = logger.log('something').functionVersion;

  t.is(response, expected);
  process.env.AWS_LAMBDA_FUNCTION_VERSION = '';
});

test.serial('It should set route (or detail type) if given event path', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });
  const expected = '/functionName';
  const response = logger.log('something').route;

  t.is(response, expected);
});

test.serial('It should set route (or detail type) if given event detail-type', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  const _event: any = JSON.parse(JSON.stringify(event));
  _event['path'] = '';
  _event['detail-type'] = 'SomeDetail';
  MikroLog.enrich({ event: _event, context });
  const expected = 'SomeDetail';
  const response = logger.log('something').route;

  t.is(response, expected);
});

test.serial('It should not set user if given no event or context', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  const expected = undefined;
  const response = logger.log('something').user;

  // @ts-ignore
  t.is(response, expected);
});

test.serial('It should set user  if given it in requestContext', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });
  const expected = 'some user';
  const response = logger.log('something').user;

  t.is(response, expected);
});

test.serial('It should set stage', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });
  const expected = 'shared';
  const response = logger.log('something').stage;

  t.is(response, expected);
});

test.serial('It should set viewer country', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });
  const expected = 'SE';
  const response = logger.log('something').viewerCountry;

  t.is(response, expected);
});

test.serial('It should set account ID (from Lambda event)', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });
  const expected = '123412341234';
  const response = logger.log('something').accountId;

  t.is(response, expected);
});

test.serial('It should set account ID (from EventBridge object)', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  const expected = '123412341234';

  const _event = JSON.parse(JSON.stringify(event));
  _event['requestContext']['accountId'] = '';
  _event['account'] = expected;
  MikroLog.enrich({ event: _event, context });
  const response = logger.log('something').accountId;

  t.is(response, expected);
});

test.serial('It should set request time (in Unix epoch)', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });
  const response = logger.log('something').requestTimeEpoch;

  t.is(response?.length, 13);
});

test.serial('It should emit a full log and filter out any empty fields', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });

  const expected: any = {
    accountId: '123412341234',
    correlationId: '6c933bd2-9535-45a8-b09c-84d00b4f50cc',
    error: false,
    functionMemorySize: '1024',
    functionName: 'somestack-FunctionName',
    functionVersion: '$LATEST',
    httpStatusCode: 200,
    level: 'INFO',
    message: 'something',
    region: 'eu-north-1',
    id: 'a6b1caa3-8a8d-4dc0-8828-e10f63876f9f',
    requestTimeEpoch: '1657389598171',
    route: '/functionName',
    stage: 'shared',
    timestamp: '1657393943792',
    timestampHuman: '2022-07-09T19:12:23.792Z',
    user: 'some user',
    viewerCountry: 'SE'
  };
  const response: any = logger.log('something');

  // Check presence of dynamic fields
  t.true(response['id'] !== null);
  t.true(response['timestamp'] !== null);
  t.true(response['timestampHuman'] !== null);
  t.true(response['startTime'] !== null);

  // Drop dynamic fields for test validation
  delete response['id'];
  delete response['timestamp'];
  delete response['timestampHuman'];
  delete response['startTime'];
  delete expected['id'];
  delete expected['timestamp'];
  delete expected['timestampHuman'];
  delete expected['startTime'];

  t.deepEqual(response, expected);
});

test.serial('It should return an empty string for correlation ID if it is not set', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  const expected = undefined;
  const response = logger.log('something').correlationId;

  // @ts-ignore
  t.is(response, expected);
});

test.serial('It should get correlation ID', (t) => {
  MikroLog.reset();
  const logger = MikroLog.start();
  MikroLog.enrich({ event, context });
  const response = logger.log('something').correlationId;
  const expected = '6c933bd2-9535-45a8-b09c-84d00b4f50cc';

  t.is(response, expected);
});
