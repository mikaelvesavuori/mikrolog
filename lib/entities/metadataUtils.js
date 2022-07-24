"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produceRequestTimeEpoch = exports.produceAccountId = exports.produceViewerCountry = exports.produceStage = exports.produceUser = exports.produceRoute = exports.produceFunctionVersion = exports.produceFunctionMemorySize = exports.produceFunctionName = exports.produceRuntime = exports.produceRegion = exports.produceCorrelationId = exports.produceStartTime = void 0;
function produceStartTime() {
    return `${Date.now()}`;
}
exports.produceStartTime = produceStartTime;
function produceCorrelationId(event, context) {
    if (event &&
        event['detail'] &&
        event['detail']['metadata'] &&
        event['detail']['metadata']['correlationId'])
        return event['detail']['metadata']['correlationId'];
    else if (event && event['headers'] && event['headers']['x-correlation-id'])
        return event['headers']['x-correlation-id'];
    else if (context && context['awsRequestId'])
        return context['awsRequestId'];
    return '';
}
exports.produceCorrelationId = produceCorrelationId;
function produceRegion(context) {
    if (context && context['invokedFunctionArn'])
        return context['invokedFunctionArn'].split(':')[3];
    return process.env.AWS_REGION || '';
}
exports.produceRegion = produceRegion;
function produceRuntime() {
    return process.env.AWS_EXECUTION_ENV || '';
}
exports.produceRuntime = produceRuntime;
function produceFunctionName(context) {
    if (context && context['functionName'])
        return context['functionName'];
    return process.env.AWS_LAMBDA_FUNCTION_NAME || '';
}
exports.produceFunctionName = produceFunctionName;
function produceFunctionMemorySize(context) {
    if (context && context['memoryLimitInMB'])
        return context['memoryLimitInMB'];
    return process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || '';
}
exports.produceFunctionMemorySize = produceFunctionMemorySize;
function produceFunctionVersion(context) {
    if (context && context['functionVersion'])
        return context['functionVersion'];
    return process.env.AWS_LAMBDA_FUNCTION_VERSION || '';
}
exports.produceFunctionVersion = produceFunctionVersion;
function produceRoute(event) {
    if (event && event['detail-type'])
        return event['detail-type'];
    else if (event && event['path'])
        return event['path'];
    return '';
}
exports.produceRoute = produceRoute;
function produceUser(event) {
    if (event &&
        event['requestContext'] &&
        event['requestContext']['identity'] &&
        event['requestContext']['identity']['user'])
        return event['requestContext']['identity']['user'];
    return '';
}
exports.produceUser = produceUser;
function produceStage(event) {
    if (event && event['requestContext'] && event['requestContext']['stage'])
        return event['requestContext']['stage'];
    return '';
}
exports.produceStage = produceStage;
function produceViewerCountry(event) {
    if (event && event['headers'] && event['headers']['CloudFront-Viewer-Country'])
        return event['headers']['CloudFront-Viewer-Country'];
    return '';
}
exports.produceViewerCountry = produceViewerCountry;
function produceAccountId(event) {
    if (event && event['requestContext'] && event['requestContext']['accountId'])
        return event['requestContext']['accountId'];
    if (event && event['account'])
        return event['account'];
    return '';
}
exports.produceAccountId = produceAccountId;
function produceRequestTimeEpoch(event) {
    if (event && event['requestContext'] && event['requestContext']['requestTimeEpoch'])
        return event['requestContext']['requestTimeEpoch'].toString();
    return '';
}
exports.produceRequestTimeEpoch = produceRequestTimeEpoch;
//# sourceMappingURL=metadataUtils.js.map