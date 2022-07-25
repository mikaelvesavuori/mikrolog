declare type LifecycleStage = 'production' | 'qa' | 'test' | 'development' | 'staging' | 'demo';
declare type DataSensitivity = 'public' | 'sensitive' | 'proprietary' | 'secret';
export interface StaticMetadataConfigInput {
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
    jurisdiction?: string;
}
export interface DynamicMetadataOutput {
    id: string;
    timestamp: string;
    timestampEpoch: string;
    timestampRequest: string;
    correlationId: string;
    user: string;
    route: string;
    region: string;
    runtime: string;
    functionName: string;
    functionMemorySize: string;
    functionVersion: string;
    stage: string;
    viewerCountry: string;
    accountId: string;
}
export {};
