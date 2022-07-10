import { LogOutput, Message } from '../interfaces/MikroLog';
import { StaticMetadataConfigInput } from '../interfaces/Metadata';
export declare class MikroLog {
    metadataConfig: any;
    constructor(metadataConfig?: StaticMetadataConfigInput | Record<string, any>);
    debug(message: Message): LogOutput;
    info(message: Message): LogOutput;
    log(message: Message): LogOutput;
    warn(message: Message): LogOutput;
    error(message: Message): LogOutput;
    private createLog;
    private filterOutput;
}
