import { type Method } from '../method.schema.js';

/**
 * @public
 */
export interface HttpClientRequestOptions {
  method: Method;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * @public
 */
export abstract class HttpClient {
  abstract request(
    url: URL,
    options: HttpClientRequestOptions
  ): Promise<Response>;

  // TODO add get, put, post, patch, delete
  // get<T extends ZodType>(
  //   url: URL | string,
  //   options: Omit<HttpClientRequestOptions, 'body' | 'method'> & {
  //     responseValidation?: T;
  //   }
  // ): Promise<{ status: number; data: z.infer<T>; success: boolean; }> {}
}
