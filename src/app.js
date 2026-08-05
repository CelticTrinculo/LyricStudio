import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestContext } from './middleware/requestContext.js';
import healthRoutes from './routes/health.js';
import assistRoutes from './routes/assist.js';
import streamRoutes from './routes/stream.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust the reverse proxy (Cloudflare / nginx) so rate-limiting uses the real client IP
app.set('trust proxy', 1);

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // allow inline styles for a self-contained SPA
}));
app.disable('x-powered-by');

// ── Rate limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: config.bodyLimit }));

// ── Request context (correlation IDs) ───────────────────────────────────────
app.use(requestContext);

// ── Static files ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', healthRoutes);
app.use('/api', assistRoutes);
app.use('/api', streamRoutes);

// ── Centralized error handling (must be last) ───────────────────────────────
app.use(errorHandler);

export default app;
