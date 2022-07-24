'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getCorrelationId = exports.produceDynamicMetadata = exports.setMetadata = void 0;
const crypto_1 = require('crypto');
function setMetadata({ event, context }) {
  process.env.__STARTTIME__ = `${Date.now()}`;
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
  const region = process.env.AWS_REGION || '';
  process.env.__REGION__ = region;
  const runtime = process.env.AWS_EXECUTION_ENV || '';
  process.env.__RUNTIME__ = runtime;
  const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME || '';
  process.env.__FUNCTIONNAME__ = functionName;
  const functionMemorySize = process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || '';
  process.env.__FUNCTIONMEMSIZE__ = functionMemorySize;
  const functionVersion = process.env.AWS_LAMBDA_FUNCTION_VERSION || '';
  process.env.__FUNCTIONVERSION__ = functionVersion;
  const route = (() => {
    if (event && event['detail-type']) return event['detail-type'];
    else if (event && event['path']) return event['path'];
    return '';
  })();
  process.env.__ROUTE__ = route;
  const user = (() => {
    try {
      return event['requestContext']['identity']['user'];
    } catch (error) {
      return '';
    }
  })();
  process.env.__USER__ = user;
  const stage = (() => {
    try {
      return event['requestContext']['stage'];
    } catch (error) {
      return '';
    }
  })();
  process.env.__STAGE__ = stage;
  const viewerCountry = (() => {
    try {
      return event['headers']['CloudFront-Viewer-Country'];
    } catch (error) {
      return '';
    }
  })();
  process.env.__VIEWERCOUNTRY__ = viewerCountry;
  const accountId = (() => {
    if (event && event['requestContext'] && event['requestContext']['accountId'])
      return event['requestContext']['accountId'];
    else if (event && event['account']) return event['account'];
    return '';
  })();
  process.env.__ACCOUNTID__ = accountId;
  const requestTimeEpoch = (() => {
    try {
      return event['requestContext']['requestTimeEpoch'];
    } catch (error) {
      return '';
    }
  })();
  process.env.__REQTIMEEPOCH__ = requestTimeEpoch;
}
exports.setMetadata = setMetadata;
function produceDynamicMetadata() {
  const metadata = {
    id: (0, crypto_1.randomUUID)(),
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
  const filteredMetadata = {};
  Object.entries(metadata).forEach((entry) => {
    const [key, value] = entry;
    if (value) filteredMetadata[key] = value;
  });
  return filteredMetadata;
}
exports.produceDynamicMetadata = produceDynamicMetadata;
const getCorrelationId = () => process.env.__CORRELATIONID__ || '';
exports.getCorrelationId = getCorrelationId;
//# sourceMappingURL=metadataUtils.js.map
