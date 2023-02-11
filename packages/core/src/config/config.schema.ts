import { z } from 'zod';

import { get_http_client_config } from '../http-client/get-http-client.js';
import { HttpClientTypeSchema } from '../http-client/http-client-type.schema.js';
import { HttpClient } from '../http-client/http-client.js';

import { config_caching_schema } from './config-caching.schema.js';
import { config_logger_schema } from './config-logger.schema.js';
import { config_openapi_schema } from './config-openapi.schema.js';

export const config_schema = z.object(
  {
    prefix: z
      .string()
      .optional()
      .transform((prefix) => prefix?.replace(/^(?!\/)/, '/') ?? ''),
    caching: config_caching_schema.optional(),
    openapi: config_openapi_schema.optional(),
    httpClient: z
      .union([HttpClientTypeSchema, z.instanceof(HttpClient)])
      .optional()
      .default('fetch')
      .transform((type) => get_http_client_config(type)),
    logger: config_logger_schema.optional().default({}),
  },
  {
    required_error: 'API BFF Config file is required',
    invalid_type_error: 'API BFF Config must be an object',
  }
);
/**
 * @public
 */
export type ConfigInput = z.input<typeof config_schema>;

/**
 * @public
 */
export type Config = z.infer<typeof config_schema>;
