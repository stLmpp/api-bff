import { getReasonPhrase, type StatusCodes } from 'http-status-codes';
import { type ResponseObject } from 'openapi3-ts';

import { error_response_schema } from '../error-response.schema.js';

import { get_content_schema_openapi_from_zod } from './get-content-schema-from-zod.js';

const error_schema = get_content_schema_openapi_from_zod(error_response_schema);

export function get_error_schema_openapi(status: StatusCodes): ResponseObject {
  return {
    ...error_schema,
    description: getReasonPhrase(status),
    content: {
      ...error_schema.content,
      'application/json': {
        ...error_schema.content['application/json'],
        schema: {
          ...error_schema.content['application/json'].schema,
          properties: {
            ...error_schema.content['application/json'].schema.properties,
            status: {
              type: 'integer',
              example: status,
            },
          },
        },
      },
    },
  };
}
