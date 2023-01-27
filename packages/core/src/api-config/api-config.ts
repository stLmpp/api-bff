import { type Request } from 'express';
import { type StatusCodes } from 'http-status-codes';
import { type ConditionalKeys, type RequireExactlyOne } from 'type-fest';
import {
  type z,
  type ZodObject,
  type ZodOptional,
  type ZodString,
  type ZodType,
} from 'zod';

import { type OrPromise } from '../or-promise.js';

import { type ApiConfigInternal } from './api-config.schema.js';

type IsParameter<Part> = Part extends `:${infer ParamName}` ? ParamName : never;
type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}`
  ? IsParameter<PartA> | FilteredParts<PartB>
  : IsParameter<Path>;
type RouteParameters<Path> = {
  [Key in FilteredParts<Path>]: string;
};

type RequestValidationMappingOtherParams<T, Body, Params, Query, Headers> =
  | ((params: T, req: Request) => OrPromise<Record<string, string | undefined>>)
  | Record<
      string,
      | keyof T
      | ((params: T, req: Request) => OrPromise<string | undefined>)
      | RequireExactlyOne<{
          body:
            | ConditionalKeys<Body, string | undefined>
            | ((body: Body, req: Request) => OrPromise<string | undefined>);
          param:
            | keyof Params
            | ((params: Params, req: Request) => OrPromise<string | undefined>);
          query:
            | keyof Query
            | ((query: Query, req: Request) => OrPromise<string | undefined>);
          header:
            | keyof Headers
            | ((
                headers: Headers,
                req: Request
              ) => OrPromise<string | undefined>);
        }>
    >;

type RequestValidationMappingParams<RouteParams, Params, Body, Query, Headers> =

    | ((params: Params, req: Request) => OrPromise<RouteParams>)
    | Record<
        keyof RouteParams,
        | keyof Params
        | ((params: Params, req: Request) => OrPromise<string>)
        | RequireExactlyOne<{
            body:
              | ConditionalKeys<Body, string>
              | ((body: Body, req: Request) => OrPromise<string>);
            param:
              | keyof Params
              | ((params: Params, req: Request) => OrPromise<string>);
            query:
              | keyof Query
              | ((query: Query, req: Request) => OrPromise<string>);
            header:
              | keyof Headers
              | ((headers: Headers, req: Request) => OrPromise<string>);
          }>
      >;

type RequestValidationMappingBody<Body, Params, Query, Headers> =
  | ((body: Body, req: Request) => OrPromise<unknown>)
  | Record<
      string,
      | keyof Body
      | ((body: Body, req: Request) => OrPromise<unknown>)
      | RequireExactlyOne<{
          body: keyof Body | ((body: Body, req: Request) => OrPromise<unknown>);
          param:
            | keyof Params
            | ((params: Params, req: Request) => OrPromise<unknown>);
          query:
            | keyof Query
            | ((query: Query, req: Request) => OrPromise<unknown>);
          header:
            | keyof Headers
            | ((headers: Headers, req: Request) => OrPromise<unknown>);
        }>
    >;

type ResponseMapping<Body, OpenapiBody> =
  | ((body: Body) => OpenapiBody)
  | {
      [K in keyof OpenapiBody]:
        | ConditionalKeys<Body, OpenapiBody[K]>
        | ((body: Body) => OpenapiBody[K]);
    };

export function apiConfig<
  Route extends string,
  RequestValidationBody extends ZodType,
  RequestValidationParams extends ZodObject<Record<string, ZodString>>,
  RequestValidationQuery extends ZodObject<
    Record<string, ZodString | ZodOptional<ZodString>>
  >,
  RequestValidationHeaders extends ZodObject<
    Record<string, ZodString | ZodOptional<ZodString>>
  >,
  ResponseProviderValidation extends ZodType,
  ResponseValidation extends ZodType
>(
  config: Omit<ApiConfigInternal, 'path' | 'request' | 'response'> & {
    path: Route;
    request?: {
      validation?: {
        body?: RequestValidationBody;
        params?: RequestValidationParams;
        query?: RequestValidationQuery;
        headers?: RequestValidationHeaders;
      };
      mapping?: {
        body?: RequestValidationMappingBody<
          z.infer<RequestValidationBody>,
          z.infer<RequestValidationParams>,
          z.infer<RequestValidationQuery>,
          z.infer<RequestValidationHeaders>
        >;
        params?: RequestValidationMappingParams<
          RouteParameters<Route>,
          z.infer<RequestValidationParams>,
          z.infer<RequestValidationBody>,
          z.infer<RequestValidationQuery>,
          z.infer<RequestValidationHeaders>
        >;
        query?: RequestValidationMappingOtherParams<
          z.infer<RequestValidationQuery>,
          z.infer<RequestValidationBody>,
          z.infer<RequestValidationParams>,
          z.infer<RequestValidationQuery>,
          z.infer<RequestValidationHeaders>
        >;
        headers?: RequestValidationMappingOtherParams<
          z.infer<RequestValidationHeaders>,
          z.infer<RequestValidationBody>,
          z.infer<RequestValidationParams>,
          z.infer<RequestValidationQuery>,
          z.infer<RequestValidationHeaders>
        >;
      };
    };
    response?: {
      providerValidation?: ResponseProviderValidation;
      mapping?: ResponseMapping<
        z.infer<ResponseProviderValidation>,
        z.infer<ResponseValidation>
      >;
      validation?: ResponseValidation;
      possibleErrors?: StatusCodes[];
    };
  }
): ApiConfigInternal {
  return config;
}

export type ApiConfig = Parameters<typeof apiConfig>[0];
