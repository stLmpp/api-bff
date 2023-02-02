import { StatusCodes } from 'http-status-codes';
import { type OperationObject } from 'openapi3-ts';

import { type ApiConfigInternal } from '../api-config/api-config.schema.js';
import { uniq } from '../uniq.js';

import { get_content_schema_openapi_from_zod } from './get-content-schema-from-zod.js';
import { get_error_schema_openapi } from './get-error-schema.js';
import { get_parameters } from './get-parameters.js';

export function get_operation_openapi(
  api_config: ApiConfigInternal
): OperationObject {
  const { request, response, description, summary } = api_config;
  const operation: OperationObject = {
    description,
    summary,
    responses: {},
    parameters: get_parameters(api_config),
    tags: api_config.tags,
  };
  if (request?.mapping?.body && typeof request.mapping.body === 'object') {
    operation.requestBody = {
      content: { 'application/json': { schema: { type: 'object' } } },
    };
  }
  if (request?.validation?.body) {
    operation.requestBody = get_content_schema_openapi_from_zod(
      request.validation.body
    );
  }
  if (response?.validation) {
    operation.responses[StatusCodes.OK] = get_content_schema_openapi_from_zod(
      response.validation
    );
  }
  const possible_errors = uniq([
    ...(response?.possibleErrors ?? []),
    StatusCodes.MISDIRECTED_REQUEST,
    StatusCodes.INTERNAL_SERVER_ERROR,
    StatusCodes.BAD_REQUEST,
  ]).sort((statusA, statusB) => statusA - statusB);
  for (const statusCode of possible_errors) {
    operation.responses[statusCode] = get_error_schema_openapi(statusCode);
  }

  return operation;
}
