import { MikroLogInput, LogOutput, Message } from '../interfaces/MikroLog';
export declare class MikroLog {
    private static instance;
    private static metadataConfig;
    private static event;
    private static context;
    static start(input?: MikroLogInput): MikroLog;
    static enrich(input: MikroLogInput): void;
    config(): void;
    static reset(): void;
    private loadEnrichedEnvironment;
    private produceDynamicMetadata;
    debug(message: Message): LogOutput;
    info(message: Message): LogOutput;
    log(message: Message): LogOutput;
    warn(message: Message): LogOutput;
    error(message: Message): LogOutput;
    private writeLog;
    private createLog;
    private filterOutput;
}
