/**
 * @description Valid lifecycles stages.
 */
type LifecycleStage = 'production' | 'qa' | 'test' | 'development' | 'staging' | 'demo';

/**
 * @description Valid data sensitivity levels.
 */
type DataSensitivity = 'public' | 'sensitive' | 'proprietary' | 'secret';

/**
 * @description User-provided static metadata input.
 */
export interface StaticMetadataConfigInput {
  /**
   * @description The version of the logged service.
   */
  version: number;
  /**
   * @description Which lifecycle stage the logged service pertains to.
   */
  lifecycleStage: LifecycleStage;
  /**
   * @description The organization that owns this system.
   */
  owner: string;
  /**
   * @description The host platform or infrastructure that runs the system.
   */
  hostPlatform: string;
  /**
   * @description Domain of the producer system.
   */
  domain: string;
  /**
   * @description System of the producer.
   */
  system: string;
  /**
   * @description Service of the producer.
   */
  service: string;
  /**
   * @description Team responsible for emitting this log.
   */
  team: string;
  /**
   * @description Tags for the logged system.
   */
  tags?: string[];
  /**
   * @description Data sensitivity classification for the contents of this log.
   */
  dataSensitivity?: DataSensitivity;
  /**
   * @description What legal jurisdiction does this system fall into?
   * @example `EU`, `US`, `CN`
   */
  jurisdiction?: string;
}
/**
 * @description Dynamic metadata.
 */
export interface DynamicMetadataOutput {
  /**
   * @description ID of the log.
   */
  id: string;
  /**
   * @description Timestamp of this message in ISO 8601 (RFC 3339) format.
   */
  timestamp: string;
  /**
   * @description Timestamp of this message in Unix epoch.
   */
  timestampEpoch: string;
  /**
   * @description Request time in Unix epoch of the incoming request.
   */
  timestampRequest: string;
  /**
   * @description Correlation ID for this function call.
   */
  correlationId: string;
  /**
   * @description The user in this log context.
   */
  user: string;
  /**
   * @description The route that is responding. In EventBridge, this will be your detail type.
   * @example `/doSomething`
   */
  route: string;
  /**
   * @description The region of the responding function/system.
   */
  region: string;
  /**
   * @description What runtime is used?
   */
  runtime: string;
  /**
   * @description The name of the function.
   */
  functionName: string;
  /**
   * @description Memory size of the current function.
   */
  functionMemorySize: string;
  /**
   * @description The version of the function.
   */
  functionVersion: string;
  /**
   * @description What AWS stage are we in?
   */
  stage: string;
  /**
   * @description Which country did AWS CloudFront infer the user to be in?
   */
  viewerCountry: string;
  /**
   * @description The AWS account ID that the system is running in.
   */
  accountId: string;
}

/**
 * @description Full metadata set using both dynamic and static sets.
 */
export type FullMetadata = StaticMetadataConfigInput & DynamicMetadataOutput;
