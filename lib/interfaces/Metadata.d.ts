export declare type StaticMetadataConfigInput = {
    version: number;
    lifecycleStage: LifecycleStage;
    owner: string;
    hostPlatform: string;
    domain: string;
    system: string;
    service: string;
    team: string;
    tags?: string[];
    dataSensitivity?: DataSensitivity;
};
export declare type Metadata = StaticMetadataConfigInput & {
    id: string;
    correlationId: string;
    timestamp: string;
    timestampRequest: string;
    region: string;
    jurisdiction: string;
};
declare type LifecycleStage = 'production' | 'qa' | 'test' | 'development' | 'staging' | 'demo';
declare type DataSensitivity = 'public' | 'sensitive' | 'proprietary' | 'secret';
export declare type DynamicMetadataOutput = {
    id: string;
    timestamp: string;
    timestampHuman: string;
    correlationId: string;
    user: string;
    route: string;
    region: string;
    runtime: string;
    functionName: string;
    functionMemorySize: string;
    functionVersion: string;
    stage: string;
    accountId: string;
    requestTimeEpoch: string;
};
export {};
