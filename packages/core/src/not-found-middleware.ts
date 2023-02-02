import { type RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ERROR_CODES } from './error-codes.js';
import { ErrorResponse } from './error-response.js';

export function not_found_middleware(): RequestHandler {
  return (_, __, next) => {
    next(
      new ErrorResponse({
        code: ERROR_CODES.NOT_FOUND,
        message: 'The end-point was not found',
        status: StatusCodes.NOT_FOUND,
      })
    );
  };
}
