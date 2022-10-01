import { MikroLogInput, LogOutput, Message } from '../interfaces/MikroLog';
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
    debug(message: Message): LogOutput;
    info(message: Message): LogOutput;
    log(message: Message): LogOutput;
    warn(message: Message): LogOutput;
    error(message: Message): LogOutput;
    private initDebugSampleLevel;
    private loadEnrichedEnvironment;
    private produceDynamicMetadata;
    private shouldSampleLog;
    private writeLog;
    private createLog;
    private filterOutput;
    private sortOutput;
}
