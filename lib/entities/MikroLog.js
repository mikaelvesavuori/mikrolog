"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MikroLog = void 0;
const crypto_1 = require("crypto");
const metadataUtils_1 = require("../infrastructure/metadataUtils");
class MikroLog {
    constructor() {
        MikroLog.metadataConfig = {};
        MikroLog.event = {};
        MikroLog.context = {};
        MikroLog.correlationId = '';
        MikroLog.debugSamplingLevel = this.initDebugSampleLevel();
        MikroLog.isDebugLogSampled = true;
    }
    static start(input) {
        if (!MikroLog.instance)
            MikroLog.instance = new MikroLog();
        if (input) {
            MikroLog.metadataConfig = input.metadataConfig || {};
            MikroLog.event = input.event || {};
            MikroLog.context = input.context || {};
            MikroLog.correlationId = input.correlationId || '';
        }
        return MikroLog.instance;
    }
    static reset() {
        MikroLog.instance = new MikroLog();
    }
    static enrich(input) {
        MikroLog.metadataConfig = Object.assign(MikroLog.metadataConfig, input.metadataConfig || {});
        MikroLog.event = Object.assign(MikroLog.event, input.event || {});
        MikroLog.context = Object.assign(MikroLog.context, input.context || {});
    }
    setCorrelationId(correlationId) {
        MikroLog.correlationId = correlationId;
    }
    setDebugSamplingRate(samplingPercent) {
        if (typeof samplingPercent !== 'number')
            return MikroLog.debugSamplingLevel;
        if (samplingPercent < 0)
            samplingPercent = 0;
        if (samplingPercent > 100)
            samplingPercent = 100;
        MikroLog.debugSamplingLevel = samplingPercent;
        return samplingPercent;
    }
    isDebugLogSampled() {
        return MikroLog.isDebugLogSampled;
    }
    debug(message, httpStatusCode) {
        const createdLog = this.createLog({
            message,
            level: 'DEBUG',
            httpStatusCode: httpStatusCode || 200
        });
        if (this.shouldSampleLog())
            this.writeLog(createdLog);
        return createdLog;
    }
    info(message, httpStatusCode) {
        return this.log(message, httpStatusCode);
    }
    log(message, httpStatusCode) {
        const createdLog = this.createLog({
            message,
            level: 'INFO',
            httpStatusCode: httpStatusCode || 200
        });
        this.writeLog(createdLog);
        return createdLog;
    }
    warn(message, httpStatusCode) {
        const createdLog = this.createLog({
            message,
            level: 'WARN',
            httpStatusCode: httpStatusCode || 200
        });
        this.writeLog(createdLog);
        return createdLog;
    }
    error(message, httpStatusCode) {
        const createdLog = this.createLog({
            message,
            level: 'ERROR',
            httpStatusCode: httpStatusCode || 400
        });
        this.writeLog(createdLog);
        return createdLog;
    }
    initDebugSampleLevel() {
        const envValue = process.env.MIKROLOG_SAMPLE_RATE;
        if (envValue) {
            const isNumeric = !Number.isNaN(envValue) && !Number.isNaN(parseFloat(envValue));
            if (isNumeric)
                return parseFloat(envValue);
        }
        return 100;
    }
    loadEnrichedEnvironment() {
        return {
            timestampRequest: (0, metadataUtils_1.produceTimestampRequest)(MikroLog.event),
            accountId: (0, metadataUtils_1.produceAccountId)(MikroLog.event),
            region: (0, metadataUtils_1.produceRegion)(MikroLog.context),
            runtime: (0, metadataUtils_1.produceRuntime)(),
            functionName: (0, metadataUtils_1.produceFunctionName)(MikroLog.context),
            functionMemorySize: (0, metadataUtils_1.produceFunctionMemorySize)(MikroLog.context),
            functionVersion: (0, metadataUtils_1.produceFunctionVersion)(MikroLog.context),
            correlationId: MikroLog.correlationId || (0, metadataUtils_1.produceCorrelationId)(MikroLog.event, MikroLog.context),
            route: (0, metadataUtils_1.produceRoute)(MikroLog.event),
            user: (0, metadataUtils_1.produceUser)(MikroLog.event),
            stage: (0, metadataUtils_1.produceStage)(MikroLog.event),
            viewerCountry: (0, metadataUtils_1.produceViewerCountry)(MikroLog.event)
        };
    }
    produceDynamicMetadata() {
        const timeNow = Date.now();
        const env = this.loadEnrichedEnvironment();
        const metadata = {
            id: (0, crypto_1.randomUUID)(),
            timestamp: new Date(timeNow).toISOString(),
            timestampEpoch: `${timeNow}`,
            ...env
        };
        const filteredMetadata = {};
        Object.entries(metadata).forEach((entry) => {
            const [key, value] = entry;
            if (value)
                filteredMetadata[key] = value;
        });
        return filteredMetadata;
    }
    shouldSampleLog() {
        const logWillBeSampled = Math.random() * 100 <= MikroLog.debugSamplingLevel;
        MikroLog.isDebugLogSampled = logWillBeSampled;
        return logWillBeSampled;
    }
    writeLog(createdLog) {
        process.stdout.write(JSON.stringify(createdLog) + '\n');
    }
    createLog(log) {
        const staticMetadata = MikroLog.metadataConfig;
        const redactedKeys = staticMetadata['redactedKeys']
            ? staticMetadata['redactedKeys']
            : undefined;
        const maskedValues = staticMetadata['maskedValues']
            ? staticMetadata['maskedValues']
            : undefined;
        if (redactedKeys)
            delete staticMetadata['redactedKeys'];
        if (maskedValues)
            delete staticMetadata['maskedValues'];
        const dynamicMetadata = this.produceDynamicMetadata();
        const logOutput = {
            ...staticMetadata,
            ...dynamicMetadata,
            message: log.message,
            error: log.level === 'ERROR',
            level: log.level,
            httpStatusCode: log.httpStatusCode
        };
        const filteredOutput = this.filterOutput(logOutput, redactedKeys, maskedValues);
        return this.sortOutput(filteredOutput);
    }
    filterOutput(logOutput, redactedKeys, maskedValues) {
        const filteredOutput = {};
        Object.entries(logOutput).forEach((entry) => {
            const [key, value] = entry;
            if (redactedKeys && redactedKeys.includes(key))
                return;
            if (maskedValues && maskedValues.includes(key)) {
                filteredOutput[key] = 'MASKED';
                return;
            }
            if (value || value === 0 || value === false)
                filteredOutput[key] = value;
        });
        return filteredOutput;
    }
    sortOutput(input) {
        const sortedOutput = {};
        Object.entries(input)
            .sort()
            .forEach(([key, value]) => (sortedOutput[key] = value));
        return sortedOutput;
    }
}
exports.MikroLog = MikroLog;
MikroLog.metadataConfig = {};
MikroLog.event = {};
MikroLog.context = {};
//# sourceMappingURL=MikroLog.js.map