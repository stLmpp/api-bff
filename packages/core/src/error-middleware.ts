import { type ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ERROR_CODES } from './error-codes.js';
import { ErrorResponse } from './error-response.js';

export function error_middleware(): ErrorRequestHandler {
  return (error, req, res, next) => {
    let response: ErrorResponse;
    if (error instanceof ErrorResponse) {
      response = error;
    } else {
      response = new ErrorResponse({
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: error?.message ?? error?.error ?? 'Internal server error',
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    res.status(response.status).send(response);
    next(response);
  };
}
