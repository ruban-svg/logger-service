# @ruralpulse-org/logger

> Lightweight wrapper around `pino` with request middleware and async context IDs.

Features
- Zero-config `pino` logger with sensible defaults
- Express middleware that attaches a child logger to `req.log`
- Trace / correlation / request ID helpers and `AsyncLocalStorage` context
- Redacts common sensitive fields (authorization, cookies, passwords)

Install

This package expects `pino` as a dependency. For prettier output in development install `pino-pretty`.

```bash
npm install pino
# optional, for pretty dev output
npm install --save-dev pino-pretty
```

Usage (local)

```js
// require package (local development)
const { logger, buildLogger, makeTraceParent, ensureId } = require('./src');
const loggerMiddleware = require('./src/middleware');

// simple use
logger.info('service starting');

// create a configured logger
const l = buildLogger({ serviceName: 'my-service', env: process.env.NODE_ENV });
l.info('custom logger created');
```

Express middleware

```js
const express = require('express');
const loggerMiddleware = require('./src/middleware');

const app = express();
app.use(loggerMiddleware);

app.get('/', (req, res) => {
  req.log.info('handling root');
  res.send('ok');
});

app.listen(3000);
```

API
- `buildLogger(config)` — returns a configured `pino` instance. Config options:
  - `serviceName` (string)
  - `env` (string)
  - `logLevel` (string)
- `logger` — default logger instance created on import
- `makeTraceParent()` — helper to create a W3C `traceparent` header value
- `ensureId(value)` — return provided id or generate a stable random id
- `middleware` (Express) — attaches `req.log` and sets response headers

Notes
- The logger redacts common sensitive fields by default. Update `src/logger.js` if you need to customize redaction paths.
- For pretty-formatted logs in development, install `pino-pretty` and run with `NODE_ENV=development`.

Quick test

```bash
node -e "const { logger } = require('./src'); logger.info('logger initialized')"
```

License

MIT
