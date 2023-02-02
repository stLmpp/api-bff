import { join } from 'node:path';

import { type RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { type PathItemObject } from 'openapi3-ts';
import { z, type ZodString } from 'zod';

import { api_config_schema } from './api-config/api-config.schema.js';
import { get_api_caching_config } from './caching/get-api-caching-config.js';
import { getConfig } from './config/config.js';
import { EXTENSION, ROUTES } from './constants.js';
import { ERROR_CODES } from './error-codes.js';
import { ErrorResponse } from './error-response.js';
import { format_headers } from './format-headers.js';
import { format_query } from './format-query.js';
import { get_provider_validation_error_response } from './get-provider-validation-error-response.js';
import { type HttpClientRequestOptions } from './http-client/http-client.js';
import { method_has_body } from './http-client/method-has-body.js';
import { map_request_body } from './map-request-body.js';
import { map_request_other_params } from './map-request-other-params.js';
import { map_request_params } from './map-request-params.js';
import { map_response_body } from './map-response-body.js';
import { MethodSchema } from './method.schema.js';
import { get_operation_openapi } from './openapi/get-operation.js';
import { validate_params } from './validate-params.js';
import { from_zod_error_to_error_response_objects } from './zod-error-formatter.js';

export interface InitApiConfigResultMeta {
  method: string;
  openapi?: PathItemObject | null;
}

export type InitApiConfigResult = [
  string,
  RequestHandler,
  InitApiConfigResultMeta
];

export async function init_api_config(
  path: string
): Promise<InitApiConfigResult> {
  const global_config = await getConfig();
  const path_without_dist = path.replace(ROUTES, '');
  const req_path = path_without_dist
    .split('/')
    .map((part) => part.replace('[', ':').replace(/]$/, ''));
  const regex_extension = new RegExp(`\\.${EXTENSION}$`);
  const method = MethodSchema.parse(
    req_path.pop()!.replace(regex_extension, '')
  );
  const path_without_extension = path_without_dist.replace(regex_extension, '');
  const file = await import(join('file://', process.cwd(), path));
  const unparsed_api_config = file.default;
  if (!unparsed_api_config) {
    throw new Error(
      `File ${path_without_extension} does not have a default export`
    );
  }
  const parsed_api_config = await api_config_schema.safeParseAsync(
    unparsed_api_config
  );
  if (!parsed_api_config.success) {
    const errors = from_zod_error_to_error_response_objects(
      parsed_api_config.error,
      'body'
    );
    throw new Error(
      `File ${path_without_extension} does not contain valid configuration.\n` +
        `Errors:\n` +
        `${errors
          .map((error) => `- "${error.path}" ${error.message}`)
          .join('\n')}`
    );
  }
  const api_config = parsed_api_config.data;
  const {
    host,
    path: pathname,
    request = {},
    response,
  } = parsed_api_config.data;
  const end_point = `${req_path.join('/')}/`;
  const operation = global_config.openapi
    ? get_operation_openapi(api_config)
    : null;
  const { caching, has_caching_config } = await get_api_caching_config(
    api_config
  );
  const should_cache = method === 'GET' && has_caching_config;
  request.validation ??= {};
  const param_schema: Record<string, ZodString> = {};
  const path_params: string[] = [];
  for (const param of req_path) {
    if (!param.startsWith(':')) {
      continue;
    }
    const param_name = param.replace(/^:/, '');
    path_params.push(param_name);
    param_schema[param_name] = z.string();
  }
  if (path_params.length) {
    request.validation.params = z
      .object(param_schema)
      .merge(request.validation.params ?? z.object({}));
  }
  return [
    end_point,
    async (req, res, next) => {
      if (req.method.toLowerCase() !== method.toLowerCase()) {
        next();
        return;
      }
      res.setHeader('x-api-bff', 'true');
      let params = await validate_params({
        data: req.params,
        schema: request.validation?.params,
        type: 'params',
      });
      if (request.mapping?.params) {
        params = await map_request_params(request.mapping.params, params, req);
      }
      const formatted_query = format_query(req.query);
      const parsed_query = await validate_params({
        data: formatted_query,
        type: 'query',
        schema: request.validation?.query,
      });
      let query: Record<string, string> = {};
      if (request.mapping?.query) {
        query = format_query(parsed_query);
        query = await map_request_other_params(
          request.mapping.query,
          format_query(parsed_query),
          req
        );
      }

      const formatted_headers = format_headers(req.headers);
      const parsed_headers = await validate_params({
        data: formatted_headers,
        type: 'headers',
        schema: request.validation?.headers,
      });
      let headers: Record<string, string> = {};
      if (request.mapping?.headers) {
        headers = await map_request_other_params(
          request.mapping.headers,
          format_headers(parsed_headers),
          req
        );
      }
      let body: unknown | null = null;
      if (method_has_body(method)) {
        const parsed_body = await validate_params({
          data: req.body,
          schema: request.validation?.body,
          type: 'body',
        });
        if (request.mapping?.body) {
          body = await map_request_body(request.mapping.body, parsed_body, req);
        }
      }
      let new_path_name = pathname;
      for (const param_key of path_params) {
        const param_value = params[param_key];
        new_path_name = new_path_name.replaceAll(param_key, param_value);
      }
      const request_options: HttpClientRequestOptions = {
        method,
        headers,
      };
      if (body) {
        request_options.body = body;
      }
      const url_search_params = new URLSearchParams(query);
      const url = new URL(new_path_name, `https://${host}`);
      console.log(`Sending request to ${url}`);
      url_search_params.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
      console.log('Request params: ', {
        ...request_options,
        query,
        params,
      });
      let cache_used = false;
      const cacheKey = caching.keyComposer({
        url,
        query,
        params,
        headers,
        body,
        method,
      });
      if (should_cache) {
        const cached_value = await caching.strategy
          .get(cacheKey, caching)
          .catch(() => null);
        if (cached_value != null) {
          console.log('Using cached value');
          res.status(StatusCodes.OK).send(cached_value);
          cache_used = true;
        }
      }
      const http_client = global_config.httpClient;
      const http_response = await http_client.request(url, request_options);
      if (!http_response.ok) {
        if (cache_used) {
          return;
        }
        const error = await http_response.json().catch(() => null);
        throw new ErrorResponse({
          status: http_response.status,
          code: ERROR_CODES.PROVIDER_ERROR,
          message: error?.message ?? error?.error ?? 'Provider internal error',
        });
      }
      let data = await http_response.json();
      if (response?.providerValidation) {
        const parsed_response =
          await response.providerValidation.safeParseAsync(data);
        if (!parsed_response.success) {
          throw get_provider_validation_error_response(
            from_zod_error_to_error_response_objects(
              parsed_response.error,
              'body'
            )
          );
        }
        data = parsed_response.data;
      }
      if (response?.mapping) {
        data = await map_response_body(response.mapping, data);
      }
      if (response?.validation) {
        const parsed_response = await response.validation.safeParseAsync(data);
        if (!parsed_response.success) {
          throw get_provider_validation_error_response(
            from_zod_error_to_error_response_objects(
              parsed_response.error,
              'body'
            )
          );
        }
        data = parsed_response.data;
      }
      if (should_cache) {
        caching.strategy.set(cacheKey, data, caching).catch(() => null);
        console.log('New value cached');
      }
      if (cache_used) {
        return;
      }
      res.status(StatusCodes.OK).send(data);
    },
    { method, openapi: { [method.toLowerCase()]: operation } },
  ];
}
