const { logger, makeTraceParent, ensureId } = require('./logger');
const { runWithContext } = require('./async-context');

function loggerMiddleware(req, res, next) {
  const traceparent =
    req.headers['traceparent'] ||
    req.headers['trace-parent'] ||
    makeTraceParent();

  const parsedTraceId = traceparent.split('-')[1];

  const ids = {
    traceparent,
    correlationId: ensureId(
      req.headers['x-correlation-id'] ||
      req.headers['correlation-id'] ||
      parsedTraceId
    ),
    requestId: ensureId(
      req.headers['x-request-id'] ||
      req.headers['request-id']
    )
  };

  res.setHeader('traceparent', ids.traceparent);
  res.setHeader('x-correlation-id', ids.correlationId);
  res.setHeader('x-request-id', ids.requestId);

  const bindings = {
    method: req.method,
    url: req.originalUrl || req.url,
    sessionId:
      req.headers['x-session-id'] ||
      req.headers['session-id'] ||
      '',
    ...ids
  };

  const childLogger = logger.child(bindings);

  runWithContext({ ids }, () => {
    req.log = childLogger;
    req.ids = ids; // Attach ids to request for access in handlers

    const start = Date.now();

    res.on('finish', () => {
      try {
        req.log.info({
          msg: req.logMessage || 'request_done',
          status: res.statusCode,
          t_ms: Date.now() - start,
          traceparent: ids.traceparent,
          correlationId: ids.correlationId,
          requestId: ids.requestId,
          sessionId: bindings.sessionId
        });
      } catch (e) {
        logger.debug({ err: e }, 'request_done log failed');
      }
    });

    next();
  });
}

module.exports = loggerMiddleware;
