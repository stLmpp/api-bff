import { format_headers } from '../format-headers.js';

import { HttpClient, type HttpClientRequestOptions } from './http-client.js';
import { method_has_body } from './method-has-body.js';

/**
 * @public
 */
export class HttpClientGot extends HttpClient {
  constructor(private readonly got: typeof import('got')) {
    super();
    this.http = got.got;
  }

  private readonly http: import('got').Got;
  async request(
    url: URL,
    options: HttpClientRequestOptions
  ): Promise<Response> {
    const got_options: import('got').OptionsOfUnknownResponseBody = {
      method: options.method,
      headers: options.headers,
    };
    if (method_has_body(options.method) && options.body != null) {
      if (typeof options.body === 'string') {
        got_options.body = options.body;
      } else {
        got_options.json = options.body;
      }
    }
    const response = await this.http(url, got_options);
    const body = this.validate_and_stringify_body(response.body);
    return new Response(body, {
      headers: format_headers(response.headers),
      status: response.statusCode,
      statusText: response.statusMessage,
    });
  }
}
