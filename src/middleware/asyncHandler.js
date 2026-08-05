/**
 * Wraps an async Express route handler so thrown/rejected errors
 * are forwarded to the centralized error-handling middleware.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
