import { z } from 'zod';

import { get_content_schema_openapi_from_zod } from './get-content-schema-from-zod.js';

describe('get-content-schema-from-zod', () => {
  it('should return content schema', () => {
    expect(
      get_content_schema_openapi_from_zod(
        z.object({
          id: z.number(),
        })
      )
    ).toEqual({
      content: {
        'application/json': {
          schema: expect.objectContaining({
            type: 'object',
            properties: expect.objectContaining({
              id: expect.objectContaining({
                type: 'number',
              }),
            }),
          }),
        },
      },
    });
  });
});
