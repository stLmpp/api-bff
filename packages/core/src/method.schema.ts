import { z } from 'zod';

/**
 * @public
 */
export const MethodSchema = z.union([
  z.literal('GET'),
  z.literal('POST'),
  z.literal('PUT'),
  z.literal('PATCH'),
  z.literal('DELETE'),
]);

/**
 * @public
 */
export type Method = z.infer<typeof MethodSchema>;
