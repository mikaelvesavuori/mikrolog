import { describe, expect, test } from 'vitest';

import { AwsLambdaMetadataProvider } from '../src/application/metadata/AwsLambdaMetadataProvider.js';
import { MikroLog } from '../src/domain/entities/MikroLog.js';

// @ts-ignore
import context from '../testdata/context.json';
// @ts-ignore
import event from '../testdata/event.json';

describe('AwsLambdaMetadataProvider', () => {
  test('It should report a cold start on the first call', () => {
    MikroLog.reset();
    const provider = new AwsLambdaMetadataProvider();

    const logger = MikroLog.start({ metadataProvider: provider });
    MikroLog.enrich({ event, context });

    const response: any = logger.info('Hello');

    expect(response.isColdStart).toBe(true);
  });

  test('It should report a non-cold start on subsequent calls', () => {
    MikroLog.reset();
    const provider = new AwsLambdaMetadataProvider();

    const logger = MikroLog.start({ metadataProvider: provider });
    MikroLog.enrich({ event, context });

    logger.info('First');
    const response: any = logger.info('Second');

    expect(response.isColdStart).toBe(false);
  });

  test('It should reset the cold start state', () => {
    MikroLog.reset();
    const provider = new AwsLambdaMetadataProvider();

    const logger = MikroLog.start({ metadataProvider: provider });
    MikroLog.enrich({ event, context });

    logger.info('First');
    provider.reset();
    const response: any = logger.info('After reset');

    expect(response.isColdStart).toBe(true);
  });

  test('It should extract AWS Lambda metadata fields from event and context', () => {
    MikroLog.reset();
    const provider = new AwsLambdaMetadataProvider();

    const logger = MikroLog.start({ metadataProvider: provider });
    MikroLog.enrich({ event, context });

    const response: any = logger.info('Hello from Lambda');

    expect(response.functionName).toBe('somestack-FunctionName');
    expect(response.functionVersion).toBe('$LATEST');
    expect(response.functionMemorySize).toBe('1024');
    expect(response.region).toBe('eu-north-1');
    expect(response.accountId).toBe('123412341234');
  });

  test('It should not emit AWS fields when no provider is configured', () => {
    MikroLog.reset();

    const logger = MikroLog.start();
    const response: any = logger.info('Hello');

    expect(response.isColdStart).toBeUndefined();
    expect(response.functionName).toBeUndefined();
    expect(response.region).toBeUndefined();
    expect(response.accountId).toBeUndefined();
  });

  test('It should support setMetadataProvider after start', () => {
    MikroLog.reset();
    const provider = new AwsLambdaMetadataProvider();

    const logger = MikroLog.start();
    logger.setMetadataProvider(provider);
    MikroLog.enrich({ event, context });

    const response: any = logger.info('Hello');

    expect(response.functionName).toBe('somestack-FunctionName');
    expect(response.isColdStart).toBe(true);
  });
});
