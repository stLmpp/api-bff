import { extendApi } from '@anatine/zod-openapi';

/**
 * @public
 * @param zod_schema
 * @param openapi_schema
 */
export const schema: typeof extendApi = (zod_schema, openapi_schema) =>
  extendApi(zod_schema, openapi_schema);
