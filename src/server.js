import 'dotenv/config';

import { config, validateConfig } from './config/index.js';
import app from './app.js';
import logger from './utils/logger.js';

// ── Config validation on startup ────────────────────────────────────────────
const warnings = validateConfig();
for (const warning of warnings) {
  logger.warn(warning);
}

// ── Graceful shutdown ───────────────────────────────────────────────────────
function gracefulShutdown(server, signal) {
  logger.info({ signal }, 'Received shutdown signal — starting graceful shutdown');

  if (server) {
    server.close((err) => {
      if (err) {
        logger.error({ err }, 'Error during server close');
        process.exit(1);
      }

      logger.info('Server closed successfully');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000).unref();
  } else {
    process.exit(0);
  }
}

// ── Start server ────────────────────────────────────────────────────────────
const server = app.listen(config.port, () => {
  logger.info(
    {
      port: config.port,
      env: config.nodeEnv,
      aiAvailable: config.openai.isConfigured,
      model: config.openai.isConfigured ? config.openai.model : null,
    },
    '🚀 Lyric Studio server started',
  );
});

process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));

// ── Unhandled rejections & exceptions ───────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled Promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception — exiting');
  process.exit(1);
});
