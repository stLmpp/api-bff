import { z } from 'zod';

/**
 * @public
 */
export const ParamTypeSchema = z.union([
  z.literal('body'),
  z.literal('params'),
  z.literal('headers'),
  z.literal('query'),
]);

/**
 * @public
 */
export type ParamType = z.infer<typeof ParamTypeSchema>;
