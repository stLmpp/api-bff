import { z, type ZodType } from 'zod';

import { get_caching_strategy_config } from '../caching/caching-resolver.js';
import { CachingStrategy } from '../caching/caching-strategy.js';
import { MethodSchema } from '../method.schema.js';

const url_schema: ZodType<URL> = z.any();

const config_caching_strategy_schema = z.enum(['memory', 'file']);

/**
 * @public
 */
export type ConfigCachingStrategy = z.infer<
  typeof config_caching_strategy_schema
>;

export const CONFIG_CACHING_PATH_DEFAULT = '__caching';

const config_caching_key_composer_schema = z
  .function()
  .args(
    z.object({
      url: url_schema,
      query: z.record(z.string()),
      params: z.record(z.string()),
      headers: z.record(z.string()),
      body: z.unknown().optional(),
      method: MethodSchema,
    })
  )
  .returns(z.string());

/**
 * @public
 */
export type ConfigCachingKeyComposer = z.infer<
  typeof config_caching_key_composer_schema
>;

export const config_caching_schema = z.object({
  path: z.string().optional().default(CONFIG_CACHING_PATH_DEFAULT),
  ttl: z.number().optional(),
  keyComposer: config_caching_key_composer_schema.optional(),
  strategy: z
    .union([config_caching_strategy_schema, z.instanceof(CachingStrategy)])
    .transform((type) =>
      typeof type === 'string' ? get_caching_strategy_config(type) : type
    ),
});

/**
 * @public
 */
export type ConfigCaching = z.infer<typeof config_caching_schema>;
