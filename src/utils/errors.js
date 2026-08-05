export class AppError extends Error {
  constructor(message, { code, httpStatus = 500, isOperational = true } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || this.constructor.name;
    this.httpStatus = httpStatus;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, { code: 'VALIDATION_ERROR', httpStatus: 400 });
    this.details = details;
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, { code: 'SERVICE_UNAVAILABLE', httpStatus: 503 });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, { code: 'NOT_FOUND', httpStatus: 404 });
  }
}

export class ExternalServiceError extends AppError {
  constructor(message = 'External service failed', originalError = null) {
    super(message, { code: 'EXTERNAL_SERVICE_ERROR', httpStatus: 502, isOperational: true });
    this.originalError = originalError;
  }
}
