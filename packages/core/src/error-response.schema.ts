import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { ParamTypeSchema } from './param-type.schema.js';

export const error_response_error_object_schema = z.object({
  path: z.string(),
  message: z.string(),
  type: ParamTypeSchema,
});

const MIN_STATUS_CODE = StatusCodes.BAD_REQUEST; // 400
const MAX_STATUS_CODE = 599;

export const error_response_status_code_schema = z
  .number()
  .min(MIN_STATUS_CODE)
  .max(MAX_STATUS_CODE);

export const error_response_schema = z.object({
  status: error_response_status_code_schema,
  statusText: z.string(),
  errors: z.array(error_response_error_object_schema).optional(),
  error: z.string().optional(),
  code: z.string(),
  message: z.string(),
});

export type ErrorResponseInterface = Omit<
  z.infer<typeof error_response_schema>,
  'statusText'
>;
export type ErrorResponseErrorObject = z.infer<
  typeof error_response_error_object_schema
>;
