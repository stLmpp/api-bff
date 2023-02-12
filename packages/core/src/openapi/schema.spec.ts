import { type SchemaObject } from 'openapi3-ts';
import { z, ZodNumber, ZodObject } from 'zod';

import { schema } from './schema.js';

describe('schema', () => {
  it('should create zod schema with extended properties', () => {
    const my_schema = schema(z.object({ id: z.number() }), { description: 'Test' });
    expect(my_schema).toBeInstanceOf(ZodObject);
    expect(my_schema.shape.id).toBeInstanceOf(ZodNumber);
    expect((my_schema as typeof my_schema & { metaOpenApi: SchemaObject }).metaOpenApi.description).toBe('Test');
  });
})