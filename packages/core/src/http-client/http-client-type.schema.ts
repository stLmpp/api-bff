import { z } from 'zod';

/**
 * @public
 */
export const HttpClientTypeSchema = z.enum(['fetch', 'got', 'axios']);

/**
 * @public
 */
export type HttpClientType = z.infer<typeof HttpClientTypeSchema>;
