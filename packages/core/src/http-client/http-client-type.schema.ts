import { z } from 'zod';

/**
 * @public
 */
export const HttpClientTypeSchema = z.union([
  z.literal('axios'),
  z.literal('got'),
  z.literal('fetch'),
]);

/**
 * @public
 */
export type HttpClientType = z.infer<typeof HttpClientTypeSchema>;
