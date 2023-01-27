import { z } from 'zod';

import { getHttpClientConfig } from '../http-client/get-http-client.js';
import { HttpClientTypeSchema } from '../http-client/http-client-type.schema.js';
import { HttpClient } from '../http-client/http-client.js';

import { ConfigCachingSchema } from './config-caching.schema.js';
import { ConfigOpenapiSchema } from './config-openapi.schema.js';

export const ConfigSchema = z.object(
  {
    prefix: z
      .string()
      .optional()
      .transform((prefix) => prefix?.replace(/^(?!\/)/, '/') ?? ''),
    caching: ConfigCachingSchema.optional(),
    openapi: ConfigOpenapiSchema.optional(),
    httpClient: z
      .union([HttpClientTypeSchema, z.instanceof(HttpClient)])
      .optional()
      .default('got')
      .transform((type) => getHttpClientConfig(type)),
  },
  {
    required_error: 'API BFF Config file is required',
    invalid_type_error: 'API BFF Config must be an object',
  }
);
export type ConfigInput = z.input<typeof ConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;
