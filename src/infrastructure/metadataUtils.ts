/**
 * @note The unorthodox try-catch style for setting values is so that we get actual coverage for tests.
 * Using the pattern `event?.['something]` certainly looks nicer but will be deemed uncovered despite 100% coverage.
 */

/**
 * @description Set correlation ID.
 */
export function produceCorrelationId(event: any, context: any): string {
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
 * @description Set the AWS region.
 */
export function produceRegion(context: any): string {
  if (context && context['invokedFunctionArn']) return context['invokedFunctionArn'].split(':')[3];
  return process.env.AWS_REGION || '';
}

/**
 * @description Set the AWS Lambda runtime.
 */
export function produceRuntime(): string {
  return process.env.AWS_EXECUTION_ENV || '';
}

/**
 * @description Set the AWS Lambda function name.
 */
export function produceFunctionName(context: any): string {
  if (context && context['functionName']) return context['functionName'];
  return process.env.AWS_LAMBDA_FUNCTION_NAME || '';
}

/**
 * @description Set the AWS Lambda function memory size.
 */
export function produceFunctionMemorySize(context: any): string {
  if (context && context['memoryLimitInMB']) return context['memoryLimitInMB'];
  return process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || '';
}

/**
 * @description Set the AWS Lambda function version.
 */
export function produceFunctionVersion(context: any): string {
  if (context && context['functionVersion']) return context['functionVersion'];
  return process.env.AWS_LAMBDA_FUNCTION_VERSION || '';
}

/**
 * @description Set the route (Lambda) or `detail-type` (EventBridge).
 */
export function produceRoute(event: any): string {
  if (event && event['detail-type']) return event['detail-type'];
  else if (event && event['path']) return event['path'];
  return '';
}

/**
 * @description Set the active user in AWS Lambda scope.
 */
export function produceUser(event: any): string {
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
 * @description Set the current AWS stage.
 * @note Will be unknown in EventBridge case; use metadata object?
 */
export function produceStage(event: any): string {
  if (event && event['requestContext'] && event['requestContext']['stage'])
    return event['requestContext']['stage'];
  return '';
}

/**
 * @description Set the viewer country (via CloudFront, presumably).
 */
export function produceViewerCountry(event: any): string {
  if (event && event['headers'] && event['headers']['CloudFront-Viewer-Country'])
    return event['headers']['CloudFront-Viewer-Country'];
  return '';
}

/**
 * @description Set the AWS account we are currently in scope of.
 */
export function produceAccountId(event: any): string {
  // Typical Lambda case
  if (event && event['requestContext'] && event['requestContext']['accountId'])
    return event['requestContext']['accountId'];
  // EventBridge style
  if (event && event['account']) return event['account'];
  return '';
}

/**
 * @description Set the request time in Unix epoch format.
 * @note Will be unknown in called service
 */
export function produceTimestampRequest(event: any): string {
  if (event && event['requestContext'] && event['requestContext']['requestTimeEpoch'])
    return event['requestContext']['requestTimeEpoch'].toString();
  return '';
}
