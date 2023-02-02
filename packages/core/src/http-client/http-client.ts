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

  protected validate_and_stringify_body(body: unknown): string {
    if (body == null) {
      return 'null';
    }
    if (Buffer.isBuffer(body)) {
      return this.validate_and_stringify_body(body.toString());
    }
    if (typeof body === 'string') {
      try {
        JSON.parse(body);
        return body;
      } catch {
        return 'null';
      }
    }
    try {
      return JSON.stringify(body);
    } catch {
      return 'null';
    }
  }
}
