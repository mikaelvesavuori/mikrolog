"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MikroLog = void 0;
const metadataUtils_1 = require("../utils/metadataUtils");
class MikroLog {
    constructor(metadataConfig) {
        this.metadataConfig = metadataConfig || {};
    }
    debug(message) {
        const createdLog = this.createLog({ message, level: 'DEBUG', httpStatusCode: 200 });
        process.stdout.write(JSON.stringify(createdLog) + '\n');
        return createdLog;
    }
    info(message) {
        return this.log(message);
    }
    log(message) {
        const createdLog = this.createLog({ message, level: 'INFO', httpStatusCode: 200 });
        process.stdout.write(JSON.stringify(createdLog) + '\n');
        return createdLog;
    }
    warn(message) {
        const createdLog = this.createLog({ message, level: 'WARN', httpStatusCode: 200 });
        process.stdout.write(JSON.stringify(createdLog) + '\n');
        return createdLog;
    }
    error(message) {
        const createdLog = this.createLog({ message, level: 'ERROR', httpStatusCode: 400 });
        process.stdout.write(JSON.stringify(createdLog) + '\n');
        return createdLog;
    }
    createLog(log) {
        const { correlationId, user, route, region, runtime, functionName, functionMemorySize, functionVersion, stage, accountId, requestTimeEpoch, id, timestamp, timestampHuman } = (0, metadataUtils_1.produceDynamicMetadata)();
        const metadataConfig = this.metadataConfig;
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
            error: log.level === 'ERROR' ? true : false,
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
            accountId,
            requestTimeEpoch
        };
        return this.filterOutput(logOutput, redactedKeys, maskedValues);
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
            if (key === 'error') {
                filteredOutput[key] = value;
                return;
            }
            if (value)
                filteredOutput[key] = value;
        });
        return filteredOutput;
    }
}
exports.MikroLog = MikroLog;
//# sourceMappingURL=MikroLog.js.map