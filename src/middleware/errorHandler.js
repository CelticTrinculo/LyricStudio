import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    logger[err.httpStatus >= 500 ? 'error' : 'warn'](
      { err, code: err.code, httpStatus: err.httpStatus, path: req.path },
      'Operational error handled',
    );

    return res.status(err.httpStatus).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Catastrophic / unknown error — log and hide details from client
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  return res.status(500).json({
    error: 'An internal error occurred. Please try again later.',
  });
}
