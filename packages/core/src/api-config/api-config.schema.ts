import {
  z,
  type ZodObject,
  type ZodOptional,
  type ZodString,
  type ZodType,
} from 'zod';

import { config_caching_schema } from '../config/config-caching.schema.js';
import { error_response_status_code_schema } from '../error-response.schema.js';

const api_config_validation_body_schema: ZodType<ZodType> = z.any();
const api_config_request_validation_params_schema: ZodType<
  ZodObject<Record<string, ZodString>>
> = z.any();
const api_config_request_validation_other_params_schema: ZodType<
  ZodObject<Record<string, ZodString | ZodOptional<ZodString>>>
> = z.any();
const any_promise_schema = z.union([z.any(), z.any().promise()]);
const key_schema = z.union([z.string(), z.number(), z.symbol()]);
const api_config_request_mapping_body_schema = z.union([
  z.function().args(z.any(), z.any()).returns(any_promise_schema),
  z.record(
    key_schema,
    z.union([
      z.function().args(z.any(), z.any()).returns(any_promise_schema),
      key_schema,
      z.union([
        z.object({
          body: z.union([
            key_schema,
            z.function().args(z.any(), z.any()).returns(any_promise_schema),
          ]),
        }),
        z.object({
          param: z.union([
            key_schema,
            z.function().args(z.any(), z.any()).returns(any_promise_schema),
          ]),
        }),
        z.object({
          query: z.union([
            key_schema,
            z.function().args(z.any(), z.any()).returns(any_promise_schema),
          ]),
        }),
        z.object({
          header: z.union([
            key_schema,
            z.function().args(z.any(), z.any()).returns(any_promise_schema),
          ]),
        }),
      ]),
    ])
  ),
]);
export type ApiConfigRequestMappingBody = z.infer<
  typeof api_config_request_mapping_body_schema
>;
const optional_string_promise_schema = z.union([
  z.string().optional(),
  z.string().optional().promise(),
]);
const string_promise_schema = z.union([z.string(), z.string().promise()]);
const api_config_request_mapping_params_schema = z.union([
  z.function().args(z.any(), z.any()).returns(any_promise_schema),
  z.record(
    key_schema,
    z.union([
      key_schema,
      z.function().args(z.any(), z.any()).returns(string_promise_schema),
      z.union([
        z.object({
          body: z.union([
            key_schema,
            z.function().args(z.any(), z.any()).returns(string_promise_schema),
          ]),
        }),
        z.object({
          param: z.union([
            key_schema,
            z.function().args(z.any(), z.any()).returns(string_promise_schema),
          ]),
        }),
        z.object({
          query: z.union([
            key_schema,
            z.function().args(z.any(), z.any()).returns(string_promise_schema),
          ]),
        }),
        z.object({
          header: z.union([
            key_schema,
            z
              .function()
              .args(z.any(), z.any())
              .returns(optional_string_promise_schema),
          ]),
        }),
      ]),
    ])
  ),
]);
export type ApiConfigRequestMappingParams = z.infer<
  typeof api_config_request_mapping_params_schema
>;
const api_config_request_mapping_other_params_schema = z.union([
  z.function().args(z.any(), z.any()),
  z.record(
    key_schema,
    z.union([
      z
        .function()
        .args(z.any(), z.any())
        .returns(optional_string_promise_schema),
      key_schema,
      z.object({
        body: z.union([
          key_schema,
          z
            .function()
            .args(z.any(), z.any())
            .returns(optional_string_promise_schema),
        ]),
      }),
      z.object({
        param: z.union([
          key_schema,
          z
            .function()
            .args(z.any(), z.any())
            .returns(optional_string_promise_schema),
        ]),
      }),
      z.object({
        query: z.union([
          key_schema,
          z
            .function()
            .args(z.any(), z.any())
            .returns(optional_string_promise_schema),
        ]),
      }),
      z.object({
        header: z.union([
          key_schema,
          z
            .function()
            .args(z.any(), z.any())
            .returns(optional_string_promise_schema),
        ]),
      }),
    ])
  ),
]);
export type ApiConfigRequestMappingOtherParams = z.infer<
  typeof api_config_request_mapping_other_params_schema
>;
const api_config_response_mapping_schema = z.union([
  z.function().args(z.any()).returns(any_promise_schema),
  z.record(
    key_schema,
    z.union([
      key_schema,
      z.function().args(z.any()).returns(any_promise_schema),
    ])
  ),
]);
export type ApiConfigResponseMapping = z.infer<
  typeof api_config_response_mapping_schema
>;
const api_config_request_mapping_schema = z.object({
  body: api_config_request_mapping_body_schema.optional(),
  params: api_config_request_mapping_params_schema.optional(),
  query: api_config_request_mapping_other_params_schema.optional(),
  headers: api_config_request_mapping_other_params_schema.optional(),
});
export type ApiConfigRequestMapping = z.infer<
  typeof api_config_request_mapping_schema
>;
const api_config_request_validation_schema = z.object({
  body: api_config_validation_body_schema.optional(),
  params: api_config_request_validation_params_schema.optional(),
  query: api_config_request_validation_other_params_schema.optional(),
  headers: api_config_request_validation_other_params_schema.optional(),
});
export type ApiConfigRequestValidation = z.infer<
  typeof api_config_request_validation_schema
>;
export const api_config_schema = z.object({
  host: z.string(),
  path: z.string(),
  request: z
    .object({
      validation: api_config_request_validation_schema.optional(),
      mapping: api_config_request_mapping_schema.optional(),
    })
    .optional(),
  response: z
    .object({
      providerValidation: api_config_validation_body_schema.optional(),
      mapping: api_config_response_mapping_schema.optional(),
      validation: api_config_validation_body_schema.optional(),
      possibleErrors: z.array(error_response_status_code_schema).optional(),
    })
    .optional(),
  caching: z
    .union([config_caching_schema.omit({ path: true }), z.literal(false)])
    .optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
export type ApiConfigInternal = z.infer<typeof api_config_schema>;
