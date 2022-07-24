import { APIGatewayEvent, Context } from 'aws-lambda';
import { StaticMetadataConfigInput, DynamicMetadataOutput } from './Metadata';
export interface MikroLogInput {
    metadataConfig?: StaticMetadataConfigInput | Record<string, any>;
    event?: APIGatewayEvent | any;
    context?: Context | any;
}
export interface LogInput {
    readonly message: Message;
    readonly level: LogLevels;
    readonly httpStatusCode: HttpStatusCode;
}
export interface LogOutput extends StaticMetadataConfigInput, DynamicMetadataOutput {
    message: Message;
    level?: LogLevels;
    httpStatusCode: HttpStatusCode;
    error: boolean;
}
export declare type LogLevels = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
export declare type Message = string | Record<string, unknown>;
export declare type HttpStatusCode = 200 | 400 | 500 | number;
