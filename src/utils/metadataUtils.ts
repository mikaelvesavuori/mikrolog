/* eslint-disable complexity */

import { randomUUID } from 'crypto';

import { DynamicMetadataOutput } from '../interfaces/Metadata';

/**
 * @description Set some of the dynamic user metadata in process environment for portability.
 */
export function setMetadata(event: any, context: any) {
  produceStartTime();
  produceCorrelationId(event, context);
  produceRegion();
  produceRuntime();
  produceFunctionName();
  produceFunctionMemorySize();
  produceFunctionVersion();
  produceRoute(event);
  produceUser(event);
  produceStage(event);
  produceViewerCountry(event);
  produceAccountId(event);
  produceRequestTimeEpoch(event);
}

/**
 * @description Set environment variable for start time.
 */
function produceStartTime() {
  process.env.__STARTTIME__ = `${Date.now()}`;
}

/**
 * @description Set environment variable for correlation ID.
 * @note The unorthodox try-catch style for setting values is so that we get actual coverage for tests.
 * Using the pattern `event?.['something]` certainly looks nicer but will be deemed uncovered despite 100% coverage.
 */
function produceCorrelationId(event: any, context: any) {
  // Check first if this is 1) via event, 2) via header (API), or 3) set new one from AWS request ID, else set as empty
  const correlationId = (() => {
    if (
      event &&
      event['detail'] &&
      event['detail']['metadata'] &&
      event['detail']['metadata']['correlationId']
    )
      return event['detail']['metadata']['correlationId'];
    else if (event && event['headers'] && event['headers']['x-correlation-id'])
      return event['headers']['x-correlation-id'];
    else if (context && context['awsRequestId']) return context['awsRequestId'];
    else return '';
  })();
  process.env.__CORRELATIONID__ = correlationId;
}

/**
 * @description Set environment variable for the AWS region.
 */
function produceRegion() {
  const region = process.env.AWS_REGION || '';
  process.env.__REGION__ = region;
}

/**
 * @description Set environment variable for the AWS Lambda runtime.
 */
function produceRuntime() {
  const runtime = process.env.AWS_EXECUTION_ENV || '';
  process.env.__RUNTIME__ = runtime;
}

/**
 * @description Set environment variable for the AWS Lambda function name.
 */
function produceFunctionName() {
  const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME || '';
  process.env.__FUNCTIONNAME__ = functionName;
}

/**
 * @description Set environment variable for the AWS Lambda function memory size.
 */
function produceFunctionMemorySize() {
  const functionMemorySize = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || '';
  process.env.__FUNCTIONMEMSIZE__ = functionMemorySize;
}

/**
 * @description Set environment variable for the AWS Lambda function version.
 */
function produceFunctionVersion() {
  const functionVersion = process.env.AWS_LAMBDA_FUNCTION_VERSION || '';
  process.env.__FUNCTIONVERSION__ = functionVersion;
}

/**
 * @description Set environment variable for the route (Lambda) or `detail-type` (EventBridge).
 */
function produceRoute(event: any) {
  const route = (() => {
    if (event && event['detail-type']) return event['detail-type'];
    else if (event && event['path']) return event['path'];
    return '';
  })();
  process.env.__ROUTE__ = route;
}

/**
 * @description Set environment variable for the active user in AWS Lambda scope.
 */
function produceUser(event: any) {
  // TODO: Will be unknown in called service
  const user = (() => {
    try {
      return event['requestContext']['identity']['user'];
    } catch (error: any) {
      return '';
    }
  })();
  process.env.__USER__ = user;
}

/**
 * @description Set environment variable for the current AWS stage.
 */
function produceStage(event: any) {
  // TODO: Will be unknown in EventBridge case; use metadata object?
  const stage = (() => {
    try {
      return event['requestContext']['stage'];
    } catch (error: any) {
      return '';
    }
  })();
  process.env.__STAGE__ = stage; // TODO this is also set in static config...
}

/**
 * @description Set environment variable for the viewer country (via CloudFront, presumably).
 */
function produceViewerCountry(event: any) {
  const viewerCountry = (() => {
    try {
      return event['headers']['CloudFront-Viewer-Country'];
    } catch (error: any) {
      return '';
    }
  })();
  process.env.__VIEWERCOUNTRY__ = viewerCountry;
}

/**
 * @description Set environment variable for the AWS account we are currently in scope of.
 */
function produceAccountId(event: any) {
  const accountId = (() => {
    if (event && event['requestContext'] && event['requestContext']['accountId'])
      return event['requestContext']['accountId'];
    else if (event && event['account']) return event['account'];
    return '';
  })();
  process.env.__ACCOUNTID__ = accountId;
}

/**
 * @description Set environment variable for the request time in Unix epoch format.
 */
function produceRequestTimeEpoch(event: any) {
  // TODO: Will be unknown in called service
  const requestTimeEpoch = (() => {
    try {
      return event['requestContext']['requestTimeEpoch'];
    } catch (error: any) {
      return '';
    }
  })();
  process.env.__REQTIMEEPOCH__ = requestTimeEpoch;
}

/**
 * @description Get dynamic user metadata from process environment.
 */
export function produceDynamicMetadata(): DynamicMetadataOutput {
  const metadata = {
    id: randomUUID(),
    timestamp: `${Date.now()}`,
    timestampHuman: new Date().toISOString(),
    correlationId: process.env.__CORRELATIONID__ || '',
    user: process.env.__USER__ || '',
    route: process.env.__ROUTE__ || '',
    region: process.env.__REGION__ || '',
    runtime: process.env.__RUNTIME__ || '',
    functionName: process.env.__FUNCTIONNAME__ || '',
    functionMemorySize: process.env.__FUNCTIONMEMSIZE__ || '',
    functionVersion: process.env.__FUNCTIONVERSION__ || '',
    stage: process.env.__STAGE__ || '',
    accountId: process.env.__ACCOUNTID__ || '',
    requestTimeEpoch: process.env.__REQTIMEEPOCH__ || ''
  };

  const filteredMetadata: any = {};

  Object.entries(metadata).forEach((entry: any) => {
    const [key, value] = entry;
    if (value) filteredMetadata[key] = value;
  });

  return filteredMetadata;
}

/**
 * Utility to get correlation ID from environment.
 */
export const getCorrelationId = () => process.env.__CORRELATIONID__ || '';
