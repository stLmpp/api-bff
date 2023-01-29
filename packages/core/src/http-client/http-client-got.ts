import { formatHeaders } from '../format-headers.js';

import { HttpClient, type HttpClientRequestOptions } from './http-client.js';
import { methodHasBody } from './method-has-body.js';
import { validateBody } from './validate-body.js';

export class HttpClientGot extends HttpClient {
  constructor(private readonly got: typeof import('got')) {
    super();
    this._http = got.got;
  }

  private readonly _http: import('got').Got;
  async request(
    url: URL,
    options: HttpClientRequestOptions
  ): Promise<Response> {
    const gotOptions: import('got').OptionsOfUnknownResponseBody = {
      method: options.method,
      headers: options.headers,
    };
    if (methodHasBody(options.method) && options.body != null) {
      if (typeof options.body === 'string') {
        gotOptions.body = options.body;
      } else {
        gotOptions.json = options.body;
      }
    }
    const response = await this._http(url, gotOptions);
    const body = validateBody(response.body);
    return new Response(body, {
      headers: formatHeaders(response.headers),
      status: response.statusCode,
      statusText: response.statusMessage,
    });
  }
}
