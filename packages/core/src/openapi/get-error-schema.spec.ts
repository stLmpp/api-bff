import { StatusCodes } from 'http-status-codes';

import { get_error_schema_openapi } from './get-error-schema.js';

describe('get-error-schema', () => {
  it('should get error schema', () => {
    expect(get_error_schema_openapi(StatusCodes.BAD_REQUEST)).toEqual({
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: expect.objectContaining({
              status: {
                type: 'integer',
                example: 400,
              },
              statusText: expect.anything(),
              errors: expect.anything(),
              error: expect.anything(),
              code: expect.anything(),
              message: expect.anything(),
            }),
            required: expect.arrayContaining([
              'status',
              'statusText',
              'code',
              'message',
            ]),
          },
        },
      },
    });
  });
});
