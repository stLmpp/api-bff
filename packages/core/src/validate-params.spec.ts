import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { ERROR_CODES } from './error-codes.js';
import { validate_params } from './validate-params.js';

describe('validate-params', () => {
  it('should return parsed params if validated', async () => {
    expect(
      await validate_params({
        type: 'params',
        schema: z.object({
          id: z.string(),
        }),
        data: { id: '123' },
      })
    ).toEqual({
      id: '123',
    });
  });

  it('should throw error response when validation fails', () =>
    expect(() =>
      validate_params({
        type: 'params',
        schema: z.object({
          id: z.string(),
        }),
        data: {},
      })
    ).rejects.toThrow(
      expect.objectContaining({
        status: StatusCodes.BAD_REQUEST,
        errors: expect.arrayContaining([expect.anything()]),
        message: expect.stringContaining('Invalid input on'),
        code: ERROR_CODES.BAD_REQUEST,
      })
    ));

  it('should return unparsed data when schema is null or undefined', async () => {
    expect(
      await validate_params({ type: 'params', data: { id: '123' } })
    ).toEqual({ id: '123' });
  });
});
