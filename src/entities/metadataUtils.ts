import { APIGatewayEvent, Context } from 'aws-lambda';

/**
 * @description Set environment variable for start time.
 */
export function produceStartTime() {
  return `${Date.now()}`;
}

/**
 * @description Set environment variable for correlation ID.
 * @note The unorthodox try-catch style for setting values is so that we get actual coverage for tests.
 * Using the pattern `event?.['something]` certainly looks nicer but will be deemed uncovered despite 100% coverage.
 * @todo FIX
 */
export function produceCorrelationId(event: APIGatewayEvent | any, context: Context) {
  // Check first if this is 1) via event, 2) via header (API), or 3) set new one from AWS request ID, else set as empty
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
  return '';
}

/**
 * @description Set environment variable for the AWS region.
 */
export function produceRegion(context: Context) {
  if (context && context['invokedFunctionArn']) return context['invokedFunctionArn'].split(':')[3];
  return process.env.AWS_REGION || '';
}

/**
 * @description Set environment variable for the AWS Lambda runtime.
 */
export function produceRuntime() {
  return process.env.AWS_EXECUTION_ENV || '';
}

/**
 * @description Set environment variable for the AWS Lambda function name.
 */
export function produceFunctionName(context: Context) {
  if (context && context['functionName']) return context['functionName'];
  return process.env.AWS_LAMBDA_FUNCTION_NAME || '';
}

/**
 * @description Set environment variable for the AWS Lambda function memory size.
 */
export function produceFunctionMemorySize(context: Context) {
  if (context && context['memoryLimitInMB']) return context['memoryLimitInMB'];
  return process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || '';
}

/**
 * @description Set environment variable for the AWS Lambda function version.
 */
export function produceFunctionVersion(context: Context) {
  if (context && context['functionVersion']) return context['functionVersion'];
  return process.env.AWS_LAMBDA_FUNCTION_VERSION || '';
}

/**
 * @description Set environment variable for the route (Lambda) or `detail-type` (EventBridge).
 * @todo FIX
 */
export function produceRoute(event: APIGatewayEvent | any) {
  if (event && event['detail-type']) return event['detail-type'];
  else if (event && event['path']) return event['path'];
  return '';
}

/**
 * @description Set environment variable for the active user in AWS Lambda scope.
 */
export function produceUser(event: APIGatewayEvent) {
  if (
    event &&
    event['requestContext'] &&
    event['requestContext']['identity'] &&
    event['requestContext']['identity']['user']
  )
    return event['requestContext']['identity']['user'];
  return '';
}

/**
 * @description Set environment variable for the current AWS stage.
 * @todo Will be unknown in EventBridge case; use metadata object?
 */
export function produceStage(event: APIGatewayEvent) {
  if (event && event['requestContext'] && event['requestContext']['stage'])
    return event['requestContext']['stage'];
  return '';
}

/**
 * @description Set environment variable for the viewer country (via CloudFront, presumably).
 */
export function produceViewerCountry(event: APIGatewayEvent) {
  if (event && event['headers'] && event['headers']['CloudFront-Viewer-Country'])
    return event['headers']['CloudFront-Viewer-Country'];
  return '';
}

/**
 * @description Set environment variable for the AWS account we are currently in scope of.
 */
export function produceAccountId(event: APIGatewayEvent | any) {
  // Typical Lambda case
  if (event && event['requestContext'] && event['requestContext']['accountId'])
    return event['requestContext']['accountId'];
  // EventBridge style
  if (event && event['account']) return event['account'];
  return '';
}

/**
 * @description Set environment variable for the request time in Unix epoch format.
 * @todo Will be unknown in called service
 */
export function produceRequestTimeEpoch(event: APIGatewayEvent) {
  if (event && event['requestContext'] && event['requestContext']['requestTimeEpoch'])
    return event['requestContext']['requestTimeEpoch'].toString();
  return '';
}
