# MikroLog

**The JSON logger you always wanted for Lambda**.

_MikroLog is like serverless: There is still a logger ("server"), but you get to think a lot less about it and you get the full "It Just Works"™ experience._

![Build Status](https://github.com/mikaelvesavuori/mikrolog/workflows/main/badge.svg)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fmikrolog.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fmikrolog?ref=badge_shield)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=mikaelvesavuori_mikrolog&metric=alert_status)](https://sonarcloud.io/dashboard?id=mikaelvesavuori_mikrolog)

[![codecov](https://codecov.io/gh/mikaelvesavuori/mikrolog/branch/main/graph/badge.svg?token=S7D3RM9TO7)](https://codecov.io/gh/mikaelvesavuori/mikrolog)

[![Maintainability](https://api.codeclimate.com/v1/badges/d960f299a99a79f781d3/maintainability)](https://codeclimate.com/github/mikaelvesavuori/mikrolog/maintainability)

---

Loggers have become too opinionated, bloated and complicated. MikroLog provides an option that is:

- Adapted out-of-the box for serverless Lambda environments (no requirement though!)
- Gives you multi-level, clean and structured logs
- Easiest to grok logger that isn't pure `console.log()`
- Familiar syntax using `log()`, `info()`, `debug()`, `warn()` and `error()`
- Zero config and opinionated enough to still be awesome without any magic tricks
- Cuts out all the stuff you won't need in cloud/serverless like storing logs or creating file output
- None of the `pid` and other garbage fields you get from many other solutions
- Flexible for most needs by loading your own static metadata that gets used in all logs
- Outside of AWS itself, logs carry across perfectly to observability solutions like Datadog, New Relic, Honeycomb...
- Easy to redact or mask sensitive data
- Uses `process.stdout.write()` rather than `console.log()` so you can safely use it in Lambda
- Tiny (~6 KB gzipped)
- Has zero dependencies
- Has 100% test coverage

## Behavior

MikroLog will throw away any fields that are undefined, null or empty.

You may pass either strings or objects into each logging method. Messages will show up in the `message` field.

MikroLog accepts certain static metadata from you (user input) and will infer dynamic metadata if you are in an AWS Lambda environment. See more in the [Metadata](#metadata) section.

## Usage

### Basic importing and usage

```typescript
// ES5 format
const { MikroLog } = require('mikrolog');
// ES6 format
import { MikroLog } from 'mikrolog';

const logger = new MikroLog();

// String message
logger.log('Hello World!');

// Object message
logger.log({
  Hello: 'World!',
  statement: 'Objects work just as well!'
});
```

### Configuration

You may also optionally instantiate MikroLog using a custom metadata object:

```typescript
const metadata = { service: 'MyService' };
const logger = new MikroLog({ metadataConfig: metadata });
```

To use the full set of features, including deriving dynamic metadata from AWS Lambda, you would add the `event` and `context` objects like so:

```typescript
// Your Lambda handler doing whatever it does
exports async function handler(event: any, context: any) {
  // {...}
  const metadata = { service: 'MyService' };
  const logger = new MikroLog({ metadataConfig: metadata, event, context });
  // {...}
}
```

See more in the [Metadata](#metadata) section.

### Logging

#### Informational logs

Output an informational-level log:

```typescript
logger.log('My message!');
```

This log type is also aliased under the `info()` method if you prefer that syntax:

```typescript
logger.info('My message!');
```

#### Warning logs

Output a warning-level log:

```typescript
logger.warn('My message!');
```

#### Error logs

Output an error-level log:

```typescript
logger.error('My message!');
```

#### Debug logs

Output a debug log:

```typescript
logger.debug('My message!');
```

## Metadata

### Static metadata

This is the metadata that you may provide at the time of instantiation. These fields will then be used automatically in all subsequent logs.

Under the hood, MikroLog is built and tested around practically the same metadata format as seen in [catalogist](https://github.com/mikaelvesavuori/catalogist) which might look like:

```typescript
const config = {
  version: 1,
  lifecycleStage: 'production',
  owner: 'MyCompany',
  hostPlatform: 'aws',
  domain: 'CustomerAcquisition',
  system: 'ShowroomActivities',
  service: 'UserSignUp',
  team: 'MyDemoTeam',
  tags: ['typescript', 'backend'],
  dataSensitivity: 'public'
};

const logger = new MikroLog(config);
```

_However, you are free to use whatever static metadata you want._

Ideally you store this static metadata configuration in its own file and have unique ones for each service.

### Dynamic metadata

The dynamic metadata fields are picked up automatically if you pass them in during instantiation. Most of those metadata fields will relate to unique value types available in AWS Lambda.

If these values are not available, they will be dropped at the time of log output. In effect, this means you won't have to deal with them (being empty or otherwise) if you use MikroLog in another type of context.

```typescript
/**
 * @description ID of the log.
 */
id: string;
/**
 * @description Timestamp of this message in Unix epoch.
 */
timestamp: string;
/**
 * @description Timestamp of this message in ISO 8601 format.
 */
timestampHuman: string;
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
 * @description The name of the funciton.
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
 * @description The AWS account ID that the system is running in.
 */
accountId: string;
/**
 * @description Request time in Unix epoch of the incoming request.
 */
requestTimeEpoch: string;
```

## Redacting keys or masking values

In your static metadata you can add some extra security measures with two different string arrays:

- `redactedKeys`: Any items in this array will be completely removed from log output.
- `maskedValues`: Any items in this array will have `MASKED` as their value. Their keys will however remain untampered.

These will only be able to redact or mask top-level fields, not nested items.

**Note**: These "meta" items will not themselves show up in your logs.

Example usage:

```typescript
const metadata = {
  userId: 'Sam Person',
  secretValue: 'sj02jd-m3982',
  redactedKeys: ['userId'],
  maskedValues: ['secretValue']
};
const logger = new MikroLog(metadata);
const log = logger.log('Checking...');

/**
 * The log will be similar to:
{
  secretValue: 'MASKED'
}
*/
```

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fmikrolog.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fmikrolog?ref=badge_large)
