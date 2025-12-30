# Using @ruralpulse-org/logger in Other Services

## Option 1: Local Reference (Development)

If you have multiple services in the same monorepo or folder structure:

```bash
# In your other service's package.json
{
  "dependencies": {
    "@ruralpulse-org/logger": "file:../logger-service"
  }
}
```

Then run `npm install` to link the local package.

## Option 2: Publish to NPM

After publishing to npm (requires npm account):

```bash
# In your other service's package.json
{
  "dependencies": {
    "@ruralpulse-org/logger": "^1.0.0"
  }
}
```

To publish:
```bash
npm login
npm publish
```

## Usage in Your Services

### Basic Logger

```javascript
const { logger, buildLogger } = require('@ruralpulse-org/logger');

// Use default logger
logger.info('service started');

// Or create a custom logger
const customLogger = buildLogger({
  serviceName: 'my-service',
  env: process.env.NODE_ENV,
  logLevel: 'debug'
});

customLogger.info('custom logger ready');
```

### Express Middleware

```javascript
const express = require('express');
const loggerMiddleware = require('@ruralpulse-org/logger/src/middleware');

const app = express();
app.use(loggerMiddleware);

app.get('/api/endpoint', (req, res) => {
  // req.log is already attached and includes all trace IDs
  req.log.info('handling request');
  res.json({ status: 'ok' });
});
```

### Fastify Integration

If you're using Fastify (like your onResponse hook), use the logger directly:

```javascript
const fastify = require('fastify');
const { logger } = require('@ruralpulse-org/logger');

const app = fastify();

app.addHook('onRequest', async (request, reply) => {
  request.log = logger.child({
    traceparent: request.headers['traceparent'],
    correlationId: request.headers['x-correlation-id'],
    requestId: request.headers['x-request-id']
  });
});

app.addHook('onResponse', async (request, reply) => {
  try {
    request.log.info({
      msg: 'request_done',
      status: reply.statusCode,
      t_ms: reply.getResponseTime(),
      traceparent: request.headers['traceparent'],
      correlationId: request.headers['x-correlation-id'],
      requestId: request.headers['x-request-id']
    });
  } catch (e) {
    logger.debug({ err: e }, 'request_done log failed');
  }
});
```

### Helper Functions

```javascript
const { makeTraceParent, ensureId } = require('@ruralpulse-org/logger');

// Generate a W3C traceparent header
const traceparent = makeTraceParent();

// Get or generate an ID
const requestId = ensureId(req.headers['x-request-id']);
```

## Pretty Logs in Development

Install `pino-pretty` for formatted output:

```bash
npm install --save-dev pino-pretty
```

Then run with `NODE_ENV=development`:

```bash
NODE_ENV=development npm start
```

## Sensitive Data Redaction

By default, the logger redacts:
- `req.headers.authorization`
- `req.headers.cookie`
- `headers.authorization`
- `headers.cookie`
- `body.password`
- `body.otp`
- `body.currentPassword`
- `body.newPassword`

To customize, extend the logger in your service or modify the redact paths in your own copy.

## Environment Variables

```bash
NODE_ENV=production      # Disables pino-pretty transport
LOG_LEVEL=debug          # Set minimum log level
SERVICE_NAME=my-service  # Service identifier
```

---

For more details, see [README.md](./README.md).
