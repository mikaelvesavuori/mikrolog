import { test, expect } from 'vitest';

import { MikroLog } from '../src/entities/MikroLog.js';

/**
 * @note These tests should be separated as the cold start state
 * is (as intended) only set to `true` on the first call.
 */

test('It should get a "true" cold start status on the first run', () => {
  const expected = true;
  const logger = MikroLog.start();

  const response: any = logger.log('').isColdStart;

  expect(response).toEqual(expected);
});

test('It should get a "false" cold start status if run more than once', () => {
  MikroLog.reset();
  const expected = false;
  MikroLog.start();
  MikroLog.start();
  MikroLog.start();
  MikroLog.start();
  const logger = MikroLog.start();

  const response: any = logger.log('').isColdStart;

  expect(response).toEqual(expected);
});
