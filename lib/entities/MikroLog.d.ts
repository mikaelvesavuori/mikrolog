import { MikroLogInput, LogOutput, Message, HttpStatusCode } from '../interfaces/MikroLog';
export declare class MikroLog {
    private static instance;
    private static metadataConfig;
    private static event;
    private static context;
    private static debugSamplingLevel;
    private constructor();
    static start(input?: MikroLogInput): MikroLog;
    static reset(): void;
    static enrich(input: MikroLogInput): void;
    setDebugSamplingRate(samplingPercent: number): number;
    debug(message: Message, httpStatusCode?: HttpStatusCode): LogOutput;
    info(message: Message, httpStatusCode?: HttpStatusCode): LogOutput;
    log(message: Message, httpStatusCode?: HttpStatusCode): LogOutput;
    warn(message: Message, httpStatusCode?: HttpStatusCode): LogOutput;
    error(message: Message, httpStatusCode?: HttpStatusCode): LogOutput;
    private initDebugSampleLevel;
    private loadEnrichedEnvironment;
    private produceDynamicMetadata;
    private shouldSampleLog;
    private writeLog;
    private createLog;
    private filterOutput;
    private sortOutput;
}
