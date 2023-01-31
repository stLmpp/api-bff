import { z } from 'zod';

export const DEFAULT_OPENAPI_VALUES = {
  path: '/help',
  title: 'Api BFF',
  version: '1',
} as const;

const ConfigOpenapiObjectExternalDocsSchema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
});

export const ConfigOpenapiObjectSchema = z.object({
  path: z
    .string()
    .optional()
    .default(DEFAULT_OPENAPI_VALUES.path)
    .transform((path) => path?.replace(/^(?!\/)/, '/')),
  title: z.string().optional().default(DEFAULT_OPENAPI_VALUES.title),
  version: z
    .union([z.string(), z.number().transform((item) => String(item))])
    .optional()
    .default(DEFAULT_OPENAPI_VALUES.version),
  description: z.string().optional(),
  contact: z
    .object({
      url: z.string().optional(),
      name: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  termsOfService: z.string().optional(),
  license: z
    .object({
      name: z.string(),
      url: z.string().optional(),
    })
    .optional(),
  tags: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        externalDocs: ConfigOpenapiObjectExternalDocsSchema.optional(),
      })
    )
    .optional(),
  externalDocs: ConfigOpenapiObjectExternalDocsSchema.optional(),
  security: z.array(z.record(z.string(), z.array(z.string()))).optional(),
  servers: z
    .array(
      z.object({
        url: z.string().url().or(z.literal('/')),
        description: z.string().optional(),
        variables: z
          .union([
            z.record(
              z.string(),
              z.object({
                enum: z
                  .union([
                    z.array(z.string()),
                    z.array(z.number()),
                    z.array(z.boolean()),
                  ])
                  .optional(),
                default: z.union([z.string(), z.number(), z.boolean()]),
                description: z.string().optional(),
              })
            ),
            z.record(z.string().startsWith('x-'), z.any()),
          ])
          .optional(),
      })
    )
    .optional(),
});

export type ConfigOpenapiObject = z.infer<typeof ConfigOpenapiObjectSchema>;

export const ConfigOpenapiSchema = z.union([
  z
    .boolean()
    .transform(
      (openapi) => openapi && (DEFAULT_OPENAPI_VALUES as ConfigOpenapiObject)
    ),
  ConfigOpenapiObjectSchema,
]);
