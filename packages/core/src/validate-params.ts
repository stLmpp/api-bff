import { StatusCodes } from 'http-status-codes';
import { type z, type ZodType } from 'zod';

import { ERROR_CODES } from './error-codes.js';
import { ErrorResponse } from './error-response.js';
import { type ParamType } from './param-type.schema.js';
import { from_zod_error_to_error_response_objects } from './zod-error-formatter.js';

interface ValidateParamsArgs<T, Z extends ZodType> {
  data: T;
  schema?: Z;
  type: ParamType;
}

export async function validate_params<T, Z extends ZodType>({
  type,
  schema,
  data,
}: ValidateParamsArgs<T, Z>): Promise<T | z.infer<Z>> {
  if (!schema) {
    return data;
  }
  const parsed = await schema.safeParseAsync(data);
  if (!parsed.success) {
    throw new ErrorResponse({
      status: StatusCodes.BAD_REQUEST,
      errors: from_zod_error_to_error_response_objects(parsed.error, type),
      message: `Invalid input on ${type}`,
      code: ERROR_CODES.BAD_REQUEST,
    });
  }
  return parsed.data;
}
