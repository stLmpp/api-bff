import { HttpClient, type HttpClientRequestOptions } from './http-client.js';
import { method_has_body } from './method-has-body.js';

/**
 * @public
 */
export class HttpClientFetch extends HttpClient {
  request(url: URL, options: HttpClientRequestOptions): Promise<Response> {
    const fetch_options: RequestInit = {
      method: options.method,
      headers: options.headers,
    };
    // TODO handle errors
    if (method_has_body(options.method) && options.body) {
      if (typeof options.body === 'string') {
        fetch_options.body = options.body;
      } else {
        fetch_options.body = JSON.stringify(options.body);
      }
    }
    return fetch(url, fetch_options);
  }
}
