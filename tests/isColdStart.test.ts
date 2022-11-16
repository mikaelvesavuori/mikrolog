import test from 'ava';

import { MikroLog } from '../src/entities/MikroLog';

/**
 * @note These tests should be separated as the cold start state
 * is (as intended) only set to `true` on the first call.
 */

test.serial('It should get a "true" cold start status on the first run', (t) => {
  const expected = true;
  const logger = MikroLog.start();

  const response: any = logger.log('').isColdStart;

  t.is(response, expected);
});

test.serial('It should get a "false" cold start status if run more than once', (t) => {
  MikroLog.reset();
  const expected = false;
  MikroLog.start();
  MikroLog.start();
  MikroLog.start();
  MikroLog.start();
  const logger = MikroLog.start();

  const response: any = logger.log('').isColdStart;

  t.is(response, expected);
});
