import { z, type ZodType } from 'zod';

import { getCachingStrategy } from '../caching/caching-resolver.js';
import { CachingStrategy } from '../caching/caching-strategy.js';
import { MethodSchema } from '../method.js';

const URLSChema: ZodType<URL> = z.any();

const ConfigCachingStrategySchema = z.union([
  z.literal('memory'),
  z.literal('file'),
]);

export type ConfigCachingStrategy = z.infer<typeof ConfigCachingStrategySchema>;

export const CONFIG_CACHING_PATH_DEFAULT = '__caching';

const ConfigCachingKeyComposerSchema = z
  .function()
  .args(
    z.object({
      url: URLSChema,
      query: z.record(z.string()),
      params: z.record(z.string()),
      headers: z.record(z.string()),
      body: z.unknown().optional(),
      method: MethodSchema,
    })
  )
  .returns(z.string());

type ConfigCachingKeyComposer = z.infer<typeof ConfigCachingKeyComposerSchema>;

export const ConfigCachingSchema = z.object({
  path: z.string().optional().default(CONFIG_CACHING_PATH_DEFAULT),
  ttl: z.number().optional(),
  keyComposer: ConfigCachingKeyComposerSchema.optional(),
  strategy: z
    .union([ConfigCachingStrategySchema, z.instanceof(CachingStrategy)])
    .transform((type) =>
      typeof type === 'string' ? getCachingStrategy(type) : type
    ),
});

export type ConfigCaching = z.infer<typeof ConfigCachingSchema>;

export const defaultKeyComposer: ConfigCachingKeyComposer = ({ url, method }) =>
  `${method}__${url.toString()}`;
