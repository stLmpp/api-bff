import {
  z,
  type ZodObject,
  type ZodOptional,
  type ZodString,
  type ZodType,
} from 'zod';

import { ConfigCachingSchema } from '../config/config-caching.schema.js';
import { ErrorResponseStatusCodeSchema } from '../error-response.schema.js';

const ApiConfigValidationBodySchema: ZodType<ZodType> = z.any();
const ApiConfigRequestValidationParamsSchema: ZodType<
  ZodObject<Record<string, ZodString>>
> = z.any();
const ApiConfigRequestValidationOtherParamsSchema: ZodType<
  ZodObject<Record<string, ZodString | ZodOptional<ZodString>>>
> = z.any();
const AnyPromiseSchema = z.union([z.any(), z.any().promise()]);
const KeySchema = z.union([z.string(), z.number(), z.symbol()]);
const ApiConfigRequestMappingBodySchema = z.union([
  z.function().args(z.any(), z.any()).returns(AnyPromiseSchema),
  z.record(
    KeySchema,
    z.union([
      z.function().args(z.any(), z.any()).returns(AnyPromiseSchema),
      KeySchema,
      z.union([
        z.object({
          body: z.union([
            KeySchema,
            z.function().args(z.any(), z.any()).returns(AnyPromiseSchema),
          ]),
        }),
        z.object({
          param: z.union([
            KeySchema,
            z.function().args(z.any(), z.any()).returns(AnyPromiseSchema),
          ]),
        }),
        z.object({
          query: z.union([
            KeySchema,
            z.function().args(z.any(), z.any()).returns(AnyPromiseSchema),
          ]),
        }),
        z.object({
          header: z.union([
            KeySchema,
            z.function().args(z.any(), z.any()).returns(AnyPromiseSchema),
          ]),
        }),
      ]),
    ])
  ),
]);
export type ApiConfigRequestMappingBody = z.infer<
  typeof ApiConfigRequestMappingBodySchema
>;
const OptionalStringPromiseSchema = z.union([
  z.string().optional(),
  z.string().optional().promise(),
]);
const StringPromiseSchema = z.union([z.string(), z.string().promise()]);
const ApiConfigRequestMappingParamsSchema = z.union([
  z.function().args(z.any(), z.any()).returns(AnyPromiseSchema),
  z.record(
    KeySchema,
    z.union([
      KeySchema,
      z.function().args(z.any(), z.any()).returns(StringPromiseSchema),
      z.union([
        z.object({
          body: z.union([
            KeySchema,
            z.function().args(z.any(), z.any()).returns(StringPromiseSchema),
          ]),
        }),
        z.object({
          param: z.union([
            KeySchema,
            z.function().args(z.any(), z.any()).returns(StringPromiseSchema),
          ]),
        }),
        z.object({
          query: z.union([
            KeySchema,
            z.function().args(z.any(), z.any()).returns(StringPromiseSchema),
          ]),
        }),
        z.object({
          header: z.union([
            KeySchema,
            z
              .function()
              .args(z.any(), z.any())
              .returns(OptionalStringPromiseSchema),
          ]),
        }),
      ]),
    ])
  ),
]);
export type ApiConfigRequestMappingParams = z.infer<
  typeof ApiConfigRequestMappingParamsSchema
>;
const ApiConfigRequestMappingOtherParamsSchema = z.union([
  z.function().args(z.any(), z.any()),
  z.record(
    KeySchema,
    z.union([
      z.function().args(z.any(), z.any()).returns(OptionalStringPromiseSchema),
      KeySchema,
      z.object({
        body: z.union([
          KeySchema,
          z
            .function()
            .args(z.any(), z.any())
            .returns(OptionalStringPromiseSchema),
        ]),
      }),
      z.object({
        param: z.union([
          KeySchema,
          z
            .function()
            .args(z.any(), z.any())
            .returns(OptionalStringPromiseSchema),
        ]),
      }),
      z.object({
        query: z.union([
          KeySchema,
          z
            .function()
            .args(z.any(), z.any())
            .returns(OptionalStringPromiseSchema),
        ]),
      }),
      z.object({
        header: z.union([
          KeySchema,
          z
            .function()
            .args(z.any(), z.any())
            .returns(OptionalStringPromiseSchema),
        ]),
      }),
    ])
  ),
]);
export type ApiConfigRequestMappingOtherParams = z.infer<
  typeof ApiConfigRequestMappingOtherParamsSchema
>;
const ApiConfigResponseMappingSchema = z.union([
  z.function().args(z.any()).returns(AnyPromiseSchema),
  z.record(
    KeySchema,
    z.union([KeySchema, z.function().args(z.any()).returns(AnyPromiseSchema)])
  ),
]);
export type ApiConfigResponseMapping = z.infer<
  typeof ApiConfigResponseMappingSchema
>;
const ApiConfigRequestMappingSchema = z.object({
  body: ApiConfigRequestMappingBodySchema.optional(),
  params: ApiConfigRequestMappingParamsSchema.optional(),
  query: ApiConfigRequestMappingOtherParamsSchema.optional(),
  headers: ApiConfigRequestMappingOtherParamsSchema.optional(),
});
export type ApiConfigRequestMapping = z.infer<
  typeof ApiConfigRequestMappingSchema
>;
const ApiConfigRequestValidationSchema = z.object({
  body: ApiConfigValidationBodySchema.optional(),
  params: ApiConfigRequestValidationParamsSchema.optional(),
  query: ApiConfigRequestValidationOtherParamsSchema.optional(),
  headers: ApiConfigRequestValidationOtherParamsSchema.optional(),
});
export type ApiConfigRequestValidation = z.infer<
  typeof ApiConfigRequestValidationSchema
>;
export const ApiConfigSchema = z.object({
  host: z.string(),
  path: z.string(),
  request: z
    .object({
      validation: ApiConfigRequestValidationSchema.optional(),
      mapping: ApiConfigRequestMappingSchema.optional(),
    })
    .optional(),
  response: z
    .object({
      providerValidation: ApiConfigValidationBodySchema.optional().optional(),
      mapping: ApiConfigResponseMappingSchema.optional(),
      validation: ApiConfigValidationBodySchema.optional().optional(),
      possibleErrors: z.array(ErrorResponseStatusCodeSchema).optional(),
    })
    .optional(),
  caching: z
    .union([ConfigCachingSchema.omit({ path: true }), z.literal(false)])
    .optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
export type ApiConfigInternal = z.infer<typeof ApiConfigSchema>;
