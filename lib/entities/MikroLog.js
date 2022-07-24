"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MikroLog = void 0;
const crypto_1 = require("crypto");
const metadataUtils_1 = require("./metadataUtils");
class MikroLog {
    static start(input) {
        if (!MikroLog.instance)
            MikroLog.instance = new MikroLog();
        if (input) {
            MikroLog.metadataConfig = input.metadataConfig || {};
            MikroLog.event = input.event || {};
            MikroLog.context = input.context || {};
        }
        return MikroLog.instance;
    }
    static enrich(input) {
        try {
            MikroLog.metadataConfig = Object.assign(MikroLog.metadataConfig, input.metadataConfig || {});
            const fixed = Object.assign(MikroLog.event, input.event || {});
            console.log('---->', fixed);
            MikroLog.event = fixed;
            MikroLog.context = Object.assign(MikroLog.context, input.context || {});
        }
        catch (error) {
            throw new Error('TODO error enriching', error.message);
        }
    }
    config() {
        console.log(MikroLog.metadataConfig);
        console.log(MikroLog.event);
        console.log(MikroLog.context);
    }
    static reset() {
        MikroLog.metadataConfig = {};
        MikroLog.event = {};
        MikroLog.context = {};
    }
    loadEnrichedEnvironment() {
        return {
            startTime: (0, metadataUtils_1.produceStartTime)(),
            region: (0, metadataUtils_1.produceRegion)(MikroLog.context),
            runtime: (0, metadataUtils_1.produceRuntime)(),
            functionName: (0, metadataUtils_1.produceFunctionName)(MikroLog.context),
            functionMemorySize: (0, metadataUtils_1.produceFunctionMemorySize)(MikroLog.context),
            functionVersion: (0, metadataUtils_1.produceFunctionVersion)(MikroLog.context),
            correlationId: (0, metadataUtils_1.produceCorrelationId)(MikroLog.event, MikroLog.context),
            route: (0, metadataUtils_1.produceRoute)(MikroLog.event),
            user: (0, metadataUtils_1.produceUser)(MikroLog.event),
            stage: (0, metadataUtils_1.produceStage)(MikroLog.event),
            viewerCountry: (0, metadataUtils_1.produceViewerCountry)(MikroLog.event),
            accountId: (0, metadataUtils_1.produceAccountId)(MikroLog.event),
            requestTimeEpoch: (0, metadataUtils_1.produceRequestTimeEpoch)(MikroLog.event)
        };
    }
    produceDynamicMetadata() {
        const timeNow = Date.now();
        const env = this.loadEnrichedEnvironment();
        const metadata = {
            id: (0, crypto_1.randomUUID)(),
            timestamp: `${timeNow}`,
            timestampHuman: new Date(timeNow).toISOString(),
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
    debug(message) {
        const createdLog = this.createLog({ message, level: 'DEBUG', httpStatusCode: 200 });
        this.writeLog(createdLog);
        return createdLog;
    }
    info(message) {
        return this.log(message);
    }
    log(message) {
        const createdLog = this.createLog({ message, level: 'INFO', httpStatusCode: 200 });
        this.writeLog(createdLog);
        return createdLog;
    }
    warn(message) {
        const createdLog = this.createLog({ message, level: 'WARN', httpStatusCode: 200 });
        this.writeLog(createdLog);
        return createdLog;
    }
    error(message) {
        const createdLog = this.createLog({ message, level: 'ERROR', httpStatusCode: 400 });
        this.writeLog(createdLog);
        return createdLog;
    }
    writeLog(createdLog) {
        process.stdout.write(JSON.stringify(createdLog) + '\n');
    }
    createLog(log) {
        try {
            const { correlationId, user, route, region, runtime, functionName, functionMemorySize, functionVersion, stage, viewerCountry, accountId, requestTimeEpoch, id, timestamp, timestampHuman } = this.produceDynamicMetadata();
            const metadataConfig = MikroLog.metadataConfig;
            const redactedKeys = metadataConfig['redactedKeys']
                ? metadataConfig['redactedKeys']
                : undefined;
            const maskedValues = metadataConfig['maskedValues']
                ? metadataConfig['maskedValues']
                : undefined;
            if (redactedKeys)
                delete metadataConfig['redactedKeys'];
            if (maskedValues)
                delete metadataConfig['maskedValues'];
            const logOutput = {
                ...metadataConfig,
                message: log.message,
                error: log.level === 'ERROR',
                level: log.level,
                httpStatusCode: log.httpStatusCode,
                id,
                timestamp,
                timestampHuman,
                correlationId,
                user,
                route,
                region,
                runtime,
                functionName,
                functionMemorySize,
                functionVersion,
                stage,
                viewerCountry,
                accountId,
                requestTimeEpoch
            };
            return this.filterOutput(logOutput, redactedKeys, maskedValues);
        }
        catch (error) {
            console.error(error);
            throw new Error('TODO custom error');
        }
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
}
exports.MikroLog = MikroLog;
MikroLog.metadataConfig = {};
MikroLog.event = {};
MikroLog.context = {};
//# sourceMappingURL=MikroLog.js.map