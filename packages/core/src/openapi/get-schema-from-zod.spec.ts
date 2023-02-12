import { z } from 'zod';

import { get_schema_from_zod } from './get-schema-from-zod.js';

describe('get-schema-from-zod', () => {
  it('should transform zod schema to object schema', () => {
    expect(get_schema_from_zod(z.object({ id: z.number() }))).toEqual(
      expect.objectContaining({
        type: 'object',
        properties: expect.objectContaining({
          id: expect.objectContaining({
            type: 'number',
          }),
        }),
      })
    );
  });
});
