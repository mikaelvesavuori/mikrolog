import test from 'ava';

import { setMetadata, getCorrelationId, produceDynamicMetadata } from '../src/utils/metadataUtils';

import event from '../testdata/event.json';
import context from '../testdata/context.json';

/**
 * POSITIVE TESTS
 */
test('It should respond with an empty correlation ID if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__CORRELATIONID__;
  t.is(response, '');
});

test('It should respond with an empty region if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__REGION__;
  t.is(response, '');
});

test('It should respond with an empty runtime if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__RUNTIME__;
  t.is(response, '');
});

test('It should respond with an empty function name if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__FUNCTIONNAME__;
  t.is(response, '');
});

test('It should respond with an empty function memory size if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__FUNCTIONMEMSIZE__;
  t.is(response, '');
});

test('It should respond with an empty function version if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__FUNCTIONVERSION__;
  t.is(response, '');
});

test('It should respond with an empty route if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__ROUTE__;
  t.is(response, '');
});

test('It should respond with an empty user if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__USER__;
  t.is(response, '');
});

test('It should respond with an empty stage if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__STAGE__;
  t.is(response, '');
});

test('It should respond with an empty viewer country if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__VIEWERCOUNTRY__;
  t.is(response, '');
});

test('It should respond with an empty account ID if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__ACCOUNTID__;
  t.is(response, '');
});

test('It should respond with an empty request time if given no event and context', async (t) => {
  setMetadata({}, {});
  const response = process.env.__REQTIMEEPOCH__;
  t.is(response, '');
});

test('It should set start time in process environment', async (t) => {
  setMetadata(event, context);
  const response = process.env.__STARTTIME__;
  t.is(response?.length, 13);
});

test('It should set correlation ID in process environment if given in detail metadata', async (t) => {
  const expected = 'asdf1234';

  const _event: any = JSON.parse(JSON.stringify(event));
  _event['detail'] = {
    metadata: {
      correlationId: expected
    }
  };
  const _context = JSON.parse(JSON.stringify(context));
  _context['awsRequestId'] = '';
  setMetadata(_event, _context);

  const response = process.env.__CORRELATIONID__;

  t.is(response, expected);
});

test('It should set correlation ID in process environment if given in headers', async (t) => {
  const expected = 'asdf1234';

  const _event: any = JSON.parse(JSON.stringify(event));
  _event['headers'] = {
    'x-correlation-id': expected
  };
  const _context = JSON.parse(JSON.stringify(context));
  _context['awsRequestId'] = '';
  setMetadata(_event, _context);

  const response = process.env.__CORRELATIONID__;

  t.is(response, expected);
});

test('It should set correlation ID in process environment if given in AWS request ID', async (t) => {
  setMetadata(event, context);

  const expected = '6c933bd2-9535-45a8-b09c-84d00b4f50cc';
  const response = process.env.__CORRELATIONID__;

  t.is(response, expected);
});

test('It should set region in process environment', async (t) => {
  process.env.AWS_REGION = 'eu-north-1';
  setMetadata(event, context);

  const expected = process.env.AWS_REGION;
  const response = process.env.__REGION__;

  t.is(response, expected);
  process.env.AWS_REGION = '';
});

test('It should set runtime in process environment', async (t) => {
  process.env.AWS_EXECUTION_ENV = 'AWS_Lambda_nodejs16';
  setMetadata(event, context);

  const expected = process.env.AWS_EXECUTION_ENV;
  const response = process.env.__RUNTIME__;

  t.is(response, expected);
  process.env.AWS_EXECUTION_ENV = '';
});

test('It should set function name in process environment', async (t) => {
  process.env.AWS_LAMBDA_FUNCTION_NAME = 'AWS_Lambda_nodejs16';
  setMetadata(event, context);

  const expected = process.env.AWS_LAMBDA_FUNCTION_NAME;
  const response = process.env.__FUNCTIONNAME__;

  t.is(response, expected);
  process.env.AWS_LAMBDA_FUNCTION_NAME = '';
});

test('It should set function memory size in process environment', async (t) => {
  process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '1024';
  setMetadata(event, context);

  const expected = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE;
  const response = process.env.__FUNCTIONMEMSIZE__;

  t.is(response, expected);
  process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE = '';
});

test('It should set function version in process environment', async (t) => {
  process.env.AWS_LAMBDA_FUNCTION_VERSION = '$LATEST';
  setMetadata(event, context);

  const expected = process.env.AWS_LAMBDA_FUNCTION_VERSION;
  const response = process.env.__FUNCTIONVERSION__;

  t.is(response, expected);
  process.env.AWS_LAMBDA_FUNCTION_VERSION = '';
});

test('It should set route (or detail type) in process environment if given event path', async (t) => {
  setMetadata(event, context);
  const expected = '/functionName';
  const response = process.env.__ROUTE__;

  t.is(response, expected);
});

test('It should set route (or detail type) in process environment if given event detail-type', async (t) => {
  const _event: any = JSON.parse(JSON.stringify(event));
  _event['path'] = '';
  _event['detail-type'] = 'SomeDetail';
  setMetadata(_event, context);
  const expected = 'SomeDetail';
  const response = process.env.__ROUTE__;

  t.is(response, expected);
});

test('It should set user to empty if given no event or context', async (t) => {
  setMetadata({}, {});
  const expected = '';
  const response = process.env.__USER__;

  t.is(response, expected);
});

test('It should set user in process environment if given it in requestContext', async (t) => {
  setMetadata(event, context);
  const expected = 'some user';
  const response = process.env.__USER__;

  t.is(response, expected);
});

test('It should set stage in process environment', async (t) => {
  setMetadata(event, context);
  const expected = 'shared';
  const response = process.env.__STAGE__; // TODO this is also set in static config...

  t.is(response, expected);
});

test('It should set viewer country in process environment', async (t) => {
  setMetadata(event, context);
  const expected = 'SE';
  const response = process.env.__VIEWERCOUNTRY__;

  t.is(response, expected);
});

test('It should set account ID (from Lambda event) in process environment', async (t) => {
  setMetadata(event, context);
  const expected = '123412341234';
  const response = process.env.__ACCOUNTID__;

  t.is(response, expected);
});

test('It should set account ID (from EventBridge object) in process environment', async (t) => {
  const expected = '123412341234';
  const _event = JSON.parse(JSON.stringify(event));
  _event['requestContext']['accountId'] = '';
  _event['account'] = expected;
  setMetadata(_event, context);
  const response = process.env.__ACCOUNTID__;

  t.is(response, expected);
});

test('It should set request time (in Unix epoch) in process environment', async (t) => {
  setMetadata(event, context);
  const response = process.env.__REQTIMEEPOCH__;

  t.is(response?.length, 13);
});

test('It should emit a full log and filter out any empty fields', async (t) => {
  const expected: any = {
    accountId: '123412341234',
    correlationId: '6c933bd2-9535-45a8-b09c-84d00b4f50cc',
    id: 'a6b1caa3-8a8d-4dc0-8828-e10f63876f9f',
    requestTimeEpoch: '1657389598171',
    route: '/functionName',
    stage: 'shared',
    timestamp: '1657393943792',
    timestampHuman: '2022-07-09T19:12:23.792Z',
    user: 'some user'
  };
  const response: any = produceDynamicMetadata();

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

  t.deepEqual(response, expected);
});

test('It should get an empty string from process environment if no correlation ID is set', async (t) => {
  process.env.__CORRELATIONID__ = '';
  const response = getCorrelationId();

  t.is(response, '');
});

test('It should get correlation ID from process environment', async (t) => {
  setMetadata(event, context);
  const response = getCorrelationId();
  const expected = '6c933bd2-9535-45a8-b09c-84d00b4f50cc';

  t.is(response, expected);
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
