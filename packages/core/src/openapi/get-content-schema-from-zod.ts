import { type SchemaObject } from 'openapi3-ts';
import { type ZodType } from 'zod';

import { get_schema_from_zod } from './get-schema-from-zod.js';

export function get_content_schema_openapi_from_zod(zodSchema: ZodType): {
  content: { 'application/json': { schema: SchemaObject } };
} {
  return {
    content: {
      'application/json': {
        schema: get_schema_from_zod(zodSchema),
      },
    },
  };
}
