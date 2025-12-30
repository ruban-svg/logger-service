const pino = require('pino');
const crypto = require('crypto');
const { getContext } = require('./async-context');

const redactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'headers.authorization',
  'headers.cookie',
  'body.password',
  'body.otp',
  'body.currentPassword',
  'body.newPassword'
];

function buildLogger(config = {}) {
  const isDev = config.env !== 'production';

  return pino({
    level: config.logLevel || 'info',
    base: {
      service: config.serviceName || 'requested_one',
      env: config.env
    },
    redact: { paths: redactPaths, censor: '***' },
    transport: isDev
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
    mixin() {
      const ctx = getContext();
      return ctx.ids || {};
    }
  });
}

const logger = buildLogger();

/* ---------- helpers ---------- */

function makeTraceParent() {
  const version = '00';
  const traceId = crypto.randomBytes(16).toString('hex');
  const spanId = crypto.randomBytes(8).toString('hex');
  const flags = '01';
  return `${version}-${traceId}-${spanId}-${flags}`;
}

function ensureId(value) {
  if (value) return value;
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return crypto.randomBytes(16).toString('hex');
}

module.exports = {
  logger,
  buildLogger,
  makeTraceParent,
  ensureId
};
