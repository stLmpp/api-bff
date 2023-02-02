import { generateSchema } from '@anatine/zod-openapi';
import { type SchemaObject } from 'openapi3-ts';
import { type ZodType } from 'zod';

export function get_schema_from_zod(zodSchema: ZodType): SchemaObject {
  return generateSchema(zodSchema);
}
