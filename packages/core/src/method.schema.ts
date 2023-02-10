import { z } from 'zod';

/**
 * @public
 */
export const MethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * @public
 */
export type Method = z.infer<typeof MethodSchema>;
