import { getReasonPhrase, StatusCodes } from 'http-status-codes';

import { format_headers } from '../format-headers.js';

import { HttpClient, type HttpClientRequestOptions } from './http-client.js';
import { method_has_body } from './method-has-body.js';

/**
 * @public
 */
export class HttpClientAxios extends HttpClient {
  constructor(private readonly axios: typeof import('axios')) {
    super();
    this.http = axios.default;
  }

  private readonly http: import('axios').Axios;

  async request(
    url: URL,
    options: HttpClientRequestOptions
  ): Promise<Response> {
    const axios_options: import('axios').RawAxiosRequestConfig = {
      url: url.toString(),
      method: options.method,
      headers: options.headers,
    };
    if (method_has_body(options.method) && options.body != null) {
      axios_options.data = options.body;
    }
    let response: Response;
    try {
      const axios_response = await this.http.request(axios_options);
      const body = this.validate_and_stringify_body(axios_response.data);
      response = new Response(body, {
        headers: format_headers(axios_response.headers),
        status: axios_response.status,
        statusText: axios_response.statusText,
      });
    } catch (error) {
      if (this.axios.isAxiosError(error)) {
        const status =
          error.response?.status ??
          error.status ??
          StatusCodes.INTERNAL_SERVER_ERROR;
        response = new Response(
          this.validate_and_stringify_body(error.response?.data),
          {
            headers: format_headers(error.response?.headers ?? {}),
            status,
            statusText: getReasonPhrase(status),
          }
        );
      } else {
        response = new Response('null', {
          headers: {},
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          statusText: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        });
      }
    }
    return response;
  }
}
