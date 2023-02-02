import { StatusCodes } from 'http-status-codes';

import { ERROR_CODES } from './error-codes.js';
import { ErrorResponse } from './error-response.js';
import { type ErrorResponseErrorObject } from './error-response.schema.js';

export function get_provider_validation_error_response(
  errors: ErrorResponseErrorObject[]
): ErrorResponse {
  return new ErrorResponse({
    status: StatusCodes.MISDIRECTED_REQUEST,
    message: 'The response from the server has data validation errors',
    errors,
    code: ERROR_CODES.RESPONSE_VALIDATION_ERROR,
  });
}
