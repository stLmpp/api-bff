import { type z, type ZodType } from 'zod';

import { get_provider_validation_error_response } from '../get-provider-validation-error-response.js';
import { type Method } from '../method.schema.js';
import { from_zod_error_to_error_response_objects } from '../zod-error-formatter.js';

import { HttpClientResponse } from './http-client-reponse.js';

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

  async get<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method' | 'body'> & {
      validation: T;
    }
  ): Promise<HttpClientResponse<z.infer<T>>> {
    const url = new URL(_url);
    const response = await this.request(url, {
      method: 'GET',
      headers: options.headers,
    });
    const json = await response.json();
    const parsed = await options.validation.safeParseAsync(json);
    if (!parsed.success) {
      throw get_provider_validation_error_response(
        from_zod_error_to_error_response_objects(parsed.error, 'body')
      );
    }
    return new HttpClientResponse(JSON.stringify(json), {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  }

  async delete(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method' | 'body'>
  ): Promise<void>;
  async delete<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method' | 'body'> & {
      validation: T;
    }
  ): Promise<HttpClientResponse<z.infer<T>>>;
  async delete<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method' | 'body'> & {
      validation?: T;
    }
  ): Promise<unknown> {
    return this.internal_request(_url, { ...options, method: 'DELETE' });
  }

  async put(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'>
  ): Promise<void>;
  async put<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'> & {
      validation: T;
    }
  ): Promise<HttpClientResponse<z.infer<T>>>;
  async put<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'> & {
      validation?: T;
    }
  ): Promise<unknown> {
    return this.internal_request(_url, { ...options, method: 'PUT' });
  }

  async patch(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'>
  ): Promise<void>;
  async patch<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'> & {
      validation: T;
    }
  ): Promise<HttpClientResponse<z.infer<T>>>;
  async patch<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'> & {
      validation?: T;
    }
  ): Promise<unknown> {
    return this.internal_request(_url, { ...options, method: 'PATCH' });
  }

  async post(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'>
  ): Promise<void>;
  async post<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'> & {
      validation: T;
    }
  ): Promise<HttpClientResponse<z.infer<T>>>;
  async post<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'> & {
      validation?: T;
    }
  ): Promise<unknown> {
    return this.internal_request(_url, { ...options, method: 'POST' });
  }

  private async internal_request(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'> & {
      method: Exclude<Method, 'GET'>;
    }
  ): Promise<void>;
  private async internal_request<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'> & {
      validation: T;
      method: Exclude<Method, 'GET'>;
    }
  ): Promise<HttpClientResponse<z.infer<T>>>;
  private async internal_request<T extends ZodType>(
    _url: URL | string,
    options: Omit<HttpClientRequestOptions, 'method'> & {
      validation?: T;
      method: Exclude<Method, 'GET'>;
    }
  ): Promise<unknown> {
    const url = new URL(_url);
    const httpOptions: HttpClientRequestOptions = {
      method: options.method,
      headers: options.headers,
    };
    if (options.body) {
      httpOptions.body = options.body;
    }
    const response = await this.request(url, httpOptions);
    const responseClone = response.clone();
    if (options.validation) {
      const json = await response.json();
      const parsed = await options.validation.safeParseAsync(json);
      if (!parsed.success) {
        throw get_provider_validation_error_response(
          from_zod_error_to_error_response_objects(parsed.error, 'body')
        );
      }
    }
    return new HttpClientResponse(await responseClone.clone().text(), {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  }
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
