import { z } from 'zod';

/**
 * @public
 */
export const ParamTypeSchema = z.enum(['body', 'params', 'headers', 'query']);

/**
 * @public
 */
export type ParamType = z.infer<typeof ParamTypeSchema>;
