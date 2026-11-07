import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const als = new AsyncLocalStorage();

export function requestContext(req, _res, next) {
  const requestId = req.headers['x-request-id'] || randomUUID();

  als.run({ requestId, path: req.path, method: req.method }, () => {
    req.requestId = requestId;
    next();
  });
}
