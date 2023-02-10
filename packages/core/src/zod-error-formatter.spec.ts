import {
  type SafeParseError,
  type SafeParseReturnType,
  z,
  type ZodError,
} from 'zod';

import { from_zod_error_to_error_response_objects } from './zod-error-formatter.js';

function assertIsError(
  parse: SafeParseReturnType<unknown, unknown>
): asserts parse is SafeParseError<unknown> {
  if (parse.success) {
    throw new Error();
  }
}

describe('zod-error-formatted', () => {
  it('should format simple error', () => {
    const parsed = z.object({ id: z.number() }).safeParse({});
    assertIsError(parsed);
    const formattedErrors = from_zod_error_to_error_response_objects(
      parsed.error,
      'body'
    );
    expect(formattedErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'id',
          type: 'body',
        }),
      ])
    );
  });

  it('should format more complex errors', () => {
    const parsed = z
      .object({
        id: z.number(),
        array: z.array(
          z.object({ id: z.number(), object: z.object({ id: z.number() }) })
        ),
        union: z.enum(['a', 'b']),
      })
      .safeParse({
        array: [{ object: {} }],
        union: 'c',
      });
    assertIsError(parsed);
    const formattedErrors = from_zod_error_to_error_response_objects(
      parsed.error,
      'body'
    );
    expect(formattedErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'id' }),
        expect.objectContaining({ path: 'array[0].id' }),
        expect.objectContaining({ path: 'array[0].object.id' }),
        expect.objectContaining({ path: 'union' }),
      ])
    );
  });

  it('should format invalid arguments', () => {
    const fn = z
      .function()
      .args(z.string())
      .returns(z.void())
      .implement(() => {
        // Does nothing
      });
    let error: ZodError;
    try {
      fn(1 as unknown as string);
    } catch (err) {
      error = err;
    }
    const formattedErrors = from_zod_error_to_error_response_objects(
      error!,
      'body'
    );
    expect(formattedErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '' }),
        expect.objectContaining({ path: '[0]' }),
      ])
    );
  });

  it('should format invalid return type', () => {
    const fn = z
      .function()
      .args(z.string())
      .returns(z.string())
      .implement(() => 1 as unknown as string);
    let error: ZodError;
    try {
      fn('1');
    } catch (err) {
      error = err;
    }
    const formattedErrors = from_zod_error_to_error_response_objects(
      error!,
      'body'
    );
    expect(formattedErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '',
          message:
            'Invalid function return type | Expected string, received number',
        }),
      ])
    );
  });
});
