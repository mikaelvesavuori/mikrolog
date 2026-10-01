# MikroLog

**A minimal, structured JSON logger for Node, with optional transports and pluggable metadata providers.**

_MikroLog is like serverless: There is still a logger ("server"), but you get to think a lot less about it and you get the full "It Just Works"™ experience._

![Build Status](https://github.com/mikaelvesavuori/mikrolog/workflows/main/badge.svg)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fmikrolog.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fmikrolog?ref=badge_shield)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=mikaelvesavuori_mikrolog&metric=alert_status)](https://sonarcloud.io/dashboard?id=mikaelvesavuori_mikrolog)

---

Loggers have become too opinionated, bloated and complicated. MikroLog provides an option that is:

- **Runtime-agnostic** — works in any Node.js context: Lambda, Express, CLI, workers, and more
- Gives you multi-level, clean and structured logs
- Easiest to grok logger that isn't pure `console.log()`
- Familiar syntax using `log()`, `info()`, `debug()`, `warn()` and `error()`
- Zero config and opinionated enough to still be awesome without any magic tricks
- Cuts out all the stuff you won't need in cloud/serverless like storing logs or creating file output
- None of the `pid` and other garbage fields you get from many other solutions
- Flexible for most needs by loading your own static metadata that gets used in all logs
- Logs carry across perfectly to observability solutions like Datadog, New Relic, Honeycomb...
- Has transport support (e.g. Axiom)
- **Pluggable metadata providers** — use `AwsLambdaMetadataProvider` for Lambda, or write your own for any runtime
- **Pluggable formatters** — use `JsonFormatter` (default) for production, `PrettyFormatter` for local dev
- Easy to redact or mask sensitive data
- Uses `process.stdout.write()` rather than `console.log()` so you can safely use it in Lambda
- Tiny (~2.4 KB gzipped, zero required dependencies)
- Has 100% test coverage

## Behavior

MikroLog is implemented using a singleton pattern, meaning the instance is reused rather than necessitating that you spawn new instances of it everywhere you need it. In the context of Lambda, where things in the global execution context (like imports and singletons) are reused across calls, you should be aware that the logger context may be reused. Read more in the `Security notes` section further down.

Logs will be sorted alphabetically by key.

MikroLog will throw away any fields that are undefined, null or empty.

You may pass either strings or objects into each logging method. Messages will show up in the `message` field.

MikroLog accepts certain static metadata from you (user input) and will produce dynamic metadata (id, timestamp, correlationId) on every log. To enrich logs with environment-specific metadata (AWS Lambda fields, HTTP request details, etc.), configure a metadata provider. See more in the [Metadata](#metadata) section.

## Usage

### Basic importing and usage

```typescript
// ES5 format
const { MikroLog } = require('mikrolog');
// ES6 format
import { MikroLog } from 'mikrolog';

const logger = MikroLog.start();

// String message
logger.log('Hello World!');

// Object message
logger.log({
  Hello: 'World!',
  statement: 'Objects work just as well!'
});
```

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

#### Setting a custom HTTP status code

By default you get status `200` for all logs except errors, which have status `400`.

If you wish to set a custom HTTP status code you can do like in the following example:

```typescript
logger.info('My message was created!', 201);
```

The second parameter can be passed in for all log types.

### Configuration

You may also optionally instantiate MikroLog using a custom metadata object. You can do this either when starting (setting up) a local logger or enriching it after the fact.

```typescript
const metadata = { service: 'MyService' };
const logger = MikroLog.start({ metadataConfig: metadata });
```

By default, unless you manually provide a correlation ID, if there is a value stored at `process.env.CORRELATION_ID`, then MikroLog will automatically use it.

You can set the correlation ID _manually_ as part of the `enrich()` call:

```typescript
MikroLog.enrich({ correlationId: 'abc123' });
```

Note how MikroLog, in this case, was enriched _after_ its initial start.

See more in the [Metadata](#metadata) section.

### Using in AWS Lambda

MikroLog ships with an `AwsLambdaMetadataProvider` that extracts dynamic metadata (function name, region, account ID, cold start, etc.) from the Lambda event and context objects.

```typescript
import { MikroLog, AwsLambdaMetadataProvider } from 'mikrolog';

const provider = new AwsLambdaMetadataProvider();

export async function handler(event: any, context: any) {
  const metadata = { service: 'MyService' };
  const logger = MikroLog.start({ metadataConfig: metadata, metadataProvider: provider });
  MikroLog.enrich({ event, context });
  logger.info('Hello from Lambda!');
  await logger.flushLogs();
}
```

### Using in Express / HTTP servers

MikroLog works anywhere. Here's an Express middleware example:

```typescript
import { MikroLog } from 'mikrolog';

const logger = MikroLog.start({ metadataConfig: { service: 'api' } });

app.use((req, res, next) => {
  MikroLog.enrich({
    correlationId: req.headers['x-request-id'] as string
  });
  next();
});

app.get('/', (req, res) => {
  logger.info('Request received');
  res.json({ ok: true });
});
```

### Using in a CLI or worker

```typescript
import { MikroLog, PrettyFormatter } from 'mikrolog';

const logger = MikroLog.start({ metadataConfig: { service: 'batch-job' } });
logger.setFormatter(new PrettyFormatter());

logger.info('Starting batch processing...');
logger.warn('Memory usage high');
logger.error('Failed to process item', 500);
```

### Setting the correlation ID manually after initialization

Setting the correlation ID manually makes sense for example during cross-boundary calls where you want to propagate this value:

```typescript
const logger = MikroLog.start();
logger.setCorrelationId('abc123');
```

### Setting the `DEBUG` sampling rate

You can set the sampling rate either manually or using an environment variable.

A "sampled" log means it is a log that gets written. An "unsampled" log is therefore one that is not written.

The sample rate uses the `0-100` scale. The default value is `100`, meaning you get _all_ `DEBUG` logs if you don't set this to something else.

You may use integers or floating point numbers.

#### Setting it with an environment variable

Set `MIKROLOG_SAMPLE_RATE` to a numeric or numerically-convertible value and it will be set when initializing MikroLog.

#### Setting it manually

You can also call MikroLog manually like so:

```typescript
const logger = MikroLog.start();
logger.setDebugSamplingRate(0.5); // 0.5% of all DEBUG logs will now be sampled.
logger.setDebugSamplingRate(25); // 25% of all DEBUG logs will now be sampled.
```

#### Checking if last `DEBUG` log was sampled

You can check if the last `DEBUG` log was sampled.

The true value of this will only exist _after_ having used the `debug()` method, as it gets recalculated every time that the method is run.

```typescript
logger.isDebugLogSampled();
```

If you want to "persist" the decision you can handle this manually after the first `DEBUG` log call:

```typescript
// If we get 'TRUE' here we can crank the sampling rate all the way up, else turn it off completely
logger.isDebugLogSampled(); ? logger.setDebugSamplingRate(100) : logger.setDebugSamplingRate(0);
```

#### Passing debug logging decision to other services

This is useful if you want to do more complex, cross-boundary debug logging on a call chain, as written about by [Yan Cui (The Burning Monk)](https://theburningmonk.com/2018/04/you-need-to-sample-debug-logs-in-production/).

For example you could make a solution like the below, passing the sampling decision in a header to a downstream service:

```typescript
const logger = MikroLog.start();
logger.setDebugSamplingRate(100); // Make sure you absolutely get all debug logs; remember that the default is that all DEBUG logs are preserved

logger.debug('This is some issue!');

await fetch('https://www.some-site.xyz', {
  headers: {
    'X-Log-Sampled': logger.isDebugLogSampled()
  }
});
```

Then, on their end they could simply do:

```typescript
const { headers } = incomingPayload; // Do whatever you need here
const logger = MikroLog.start();

// If we get 'TRUE' here we can crank the sampling rate all the way up, else turn it off completely
headers['X-Log-Sampled'] ? logger.setDebugSamplingRate(100) : logger.setDebugSamplingRate(0);

// Rest of code...
```

## Transports

A transport is a configuration that allows MikroLog to flush (i.e. send) logs to another service.

MikroLog supports [Axiom](https://axiom.co) out of the box. You can implement your own transport by implementing the `Transport` interface.

Transport support is based on a "log buffer" that keeps all logs in-memory. They are sent and removed from the buffer when flushed, which is done manually by you.

It's recommended to flush logs only in your clean-up phase, such as at the end of your handler, to avoid adding more latency and volatility than necessary.

### Using the Axiom transport

An example of using the Axiom transport could look like this:

```ts
const logger = MikroLog.start({ metadataConfig });
const transport = new AxiomTransport({
  auth: process.env.AXIOM_API_KEY,
  dataset: 'my_dataset'
});
logger.setTransport(transport);

logger.log('Hello');
logger.log('World');

await logger.flushLogs(); // Send the logs
```

## Formatters

MikroLog supports pluggable formatters to control how log records are serialized before being written to stdout.

- `JsonFormatter` (default) — outputs newline-delimited JSON. Best for production and log aggregation platforms.
- `PrettyFormatter` — outputs human-readable, colorized lines. Best for local development and CLI usage.

```typescript
import { MikroLog, PrettyFormatter } from 'mikrolog';

const logger = MikroLog.start();
logger.setFormatter(new PrettyFormatter());

logger.info('Hello World');
// INFO  2022-07-25T08:52:21.121Z  Hello World
```

You can disable colors by passing `{ colorize: false }`:

```typescript
logger.setFormatter(new PrettyFormatter({ colorize: false }));
```

You can also implement your own formatter by implementing the `Formatter` interface:

```typescript
import type { Formatter, LogOutput } from 'mikrolog';

class MyFormatter implements Formatter {
  format(log: LogOutput): string {
    return `[${log.level}] ${log.message}\n`;
  }
}

logger.setFormatter(new MyFormatter());
```

## Metadata providers

Metadata providers supply dynamic metadata to MikroLog. The core logger always produces `id`, `timestamp`, `timestampEpoch`, and `correlationId`. A metadata provider can add environment-specific fields.

### Built-in providers

- `AwsLambdaMetadataProvider` — extracts AWS Lambda fields from the event and context objects, including cold-start detection.

### Writing a custom metadata provider

Implement the `MetadataProvider` interface to extract metadata from any source:

```typescript
import type { MetadataProvider, MetadataProviderInput } from 'mikrolog';

class HttpMetadataProvider implements MetadataProvider {
  getMetadata(input: MetadataProviderInput): Record<string, unknown> {
    const req = input.event; // e.g. an Express Request
    return {
      resource: req?.path,
      user: req?.headers?.['x-user-id'],
      method: req?.method
    };
  }
}

const logger = MikroLog.start({
  metadataProvider: new HttpMetadataProvider()
});
```

## Metadata

### One-time root-level enrichment

If you want a one-time root-level enrichment, you can do:

```typescript
const logger = MikroLog.start();
logger.enrichNext({ someId: '123456789abcdefghi' });
logger.info('Ping!'); // Enrichment is present on log
logger.info('Ping!'); // Enrichment is no longer present
```

This works just as well on nested objects:

```typescript
const logger = MikroLog.start();
logger.enrichNext({ myObject: { myValue: 'Something here', otherValue: 'Something else' } });
logger.info('Ping!'); // Enrichment is present on log
logger.info('Ping!'); // Enrichment is no longer present
```

Note that only object input is allowed for this method.

### Static metadata

_Static metadata_ is the metadata that you may provide at the time of instantiation. These fields will then be used automatically in all subsequent logs.

Under the hood, MikroLog is built and tested around practically the same metadata format as seen in [catalogist](https://github.com/mikaelvesavuori/catalogist) which might look like:

```typescript
const metadataConfig = {
  version: 1,
  owner: 'MyCompany',
  hostPlatform: 'aws',
  domain: 'CustomerAcquisition',
  system: 'ShowroomActivities',
  service: 'UserSignUp',
  team: 'MyDemoTeam',
  tags: ['typescript', 'backend'],
  dataSensitivity: 'public'
};

const logger = MikroLog.start({ metadataConfig });
```

_However, you are free to use whatever static metadata you want._

Ideally you store this static metadata configuration in its own file and have unique ones for each service.

### Dynamic metadata

Dynamic metadata is produced on every log emission. The core logger always provides the following fields:

| Field            | Type   | Description                                              |
| ---------------- | ------ | ------------------------------------------------------- |
| `correlationId`  | string | Correlation ID for this function call.                  |
| `id`             | string | ID of the log.                                          |
| `timestamp`      | string | Timestamp of this message in ISO 8601 (RFC 3339) format. |
| `timestampEpoch` | string | Timestamp of this message in Unix epoch.               |
| `user`           | string | The user in this log context (if provided by a provider). |
| `resource`       | string | The resource (channel, URL path...) that is responding (if provided by a provider). |

When using the `AwsLambdaMetadataProvider`, the following additional fields are available:

| Field                | Type    | Description                                               |
| -------------------- | ------- | --------------------------------------------------------- |
| `accountId`          | string  | The AWS account ID that the system is running in.         |
| `functionMemorySize` | string  | Memory size of the current function.                      |
| `functionName`       | string  | The name of the function.                                 |
| `functionVersion`    | string  | The version of the function.                              |
| `isColdStart`        | boolean | Is this a Lambda cold start?                              |
| `region`             | string  | The region of the responding function/system.             |
| `runtime`            | string  | What runtime is used?                                     |
| `stage`              | string  | What AWS stage are we in?                                 |
| `timestampRequest`   | string  | Request time in Unix epoch of the incoming request.       |
| `viewerCountry`      | string  | Which country did AWS CloudFront infer the user to be in? |

If these values are not available, they will be dropped at the time of log output. In effect, this means you won't have to deal with them (being empty or otherwise) if you use MikroLog in another type of context.

## Redacting keys or masking values

In your static metadata you can add some extra security measures with two different string arrays:

- `redactedKeys`: Any items in this array will be completely removed from log output.
- `maskedValues`: Any items in this array will have `MASKED` as their value. Their keys will however remain untampered.

You can redact or mask nested values by using dot syntax, for example `user.auth.token`.

**Note**: These "meta" items will not themselves show up in your logs.

Example usage:

```typescript
const metadataConfig = {
  userId: 'Sam Person',
  secretValue: 'sj02jd-m3982',
  redactedKeys: ['userId'],
  maskedValues: ['secretValue']
};
const logger = MikroLog.start({ metadataConfig });
const log = logger.log('Checking...');

/**
 * The log will look something like:
{
  message: 'Checking...',
  secretValue: 'MASKED',
  { ...any other values }
}
*/
```

## Security notes

MikroLog is implemented using a singleton pattern, meaning the instance is reused rather than necessitating that you spawn new instances of it everywhere you need it. In the context of Lambda, where things in the global execution context (like imports and singletons) are reused across calls, you should be aware that the logger context may be reused.

This should not be a significant problem since Lambda is reused in the same _function scope_, which means that for example static metadata that is reused will most likely be the same anyway. This can be validated with a simple experiment:

- Build a basic Lambda function that uses MikroLog and can take in input via POST
- Call the Lambda with a payload that sets some static field (say `service`) to a custom value
- Run it a few times
- Call it again with an _empty_ payload (i.e. effectively not using any custom value)
- It should respond with the previous value for the service, even if you called it this time without any value

For dynamic metadata (which may be more sensitive than static metadata), such metadata is **always** recalculated and will therefore not leak between calls.

### Resetting the logger between calls

See below code for an example on how to wrap your implementation to always call `reset()` before closing and returning from the Lambda.

_**There are no promises that this type of reset will be effective!**_

```typescript
import { MikroLog, AwsLambdaMetadataProvider } from 'mikrolog';

import { metadataConfig } from './config/metadata';

const provider = new AwsLambdaMetadataProvider();

export async function handler(event: any, awsContext: any): Promise<any> {
  const result = await wrappedHandler(event, awsContext);
  MikroLog.reset();
  provider.reset();
  return result;
}

async function wrappedHandler(event: any, awsContext: any) {
  const body = event.body && typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  if (body && body.service) metadataConfig.service = body.service;

  const logger = MikroLog.start({ metadataConfig, metadataProvider: provider });
  MikroLog.enrich({ event, context: awsContext });
  const message = logger.info('info message');

  return {
    statusCode: 200,
    body: JSON.stringify(message)
  };
}
```

---

At the end of the day you might wonder if this solution (v2 vs v1) is better? I would say overall it is more standardized in its approach as well as (now) documented better. Just keep this in mind when you work with MikroLog or any other logger.

## Migrating to 3.0

MikroLog 3.0 decouples the core logger from AWS Lambda. The core is now zero-dependency and runtime-agnostic. AWS Lambda support is provided through an optional `AwsLambdaMetadataProvider` adapter.

### Breaking changes

1. **`isColdStart` and AWS-specific fields are no longer emitted by default.** To get `functionName`, `region`, `accountId`, `stage`, `isColdStart`, etc., configure an `AwsLambdaMetadataProvider`:

   ```typescript
   // Before (v2)
   const logger = MikroLog.start({ event, context });

   // After (v3)
   const provider = new AwsLambdaMetadataProvider();
   const logger = MikroLog.start({ metadataProvider: provider });
   MikroLog.enrich({ event, context });
   ```

2. **`aws-metadata-utils` is now an optional dependency.** It is installed by default but only loaded when `AwsLambdaMetadataProvider` is used. Non-Lambda users get a zero-dependency core.

3. **New public type exports.** All interfaces (`LogOutput`, `MikroLogInput`, `Transport`, `MetadataProvider`, `Formatter`, etc.) are now re-exported from the package entry point.

### New features

- **`setMetadataProvider(provider)`** — plug in any metadata provider.
- **`setFormatter(formatter)`** — plug in a formatter (`JsonFormatter`, `PrettyFormatter`, or your own).
- **`PrettyFormatter`** — human-readable, colorized output for local development.
- **`AwsLambdaMetadataProvider.reset()`** — reset cold-start state for testing.

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fmikrolog.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fmikrolog?ref=badge_large)
