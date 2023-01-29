import { getReasonPhrase, StatusCodes } from 'http-status-codes';

import { formatHeaders } from '../format-headers.js';

import { HttpClient, type HttpClientRequestOptions } from './http-client.js';
import { methodHasBody } from './method-has-body.js';
import { validateBody } from './validate-body.js';

export class HttpClientAxios extends HttpClient {
  constructor(private readonly axios: typeof import('axios')) {
    super();
    this._http = axios.default;
  }

  private readonly _http: import('axios').Axios;

  async request(
    url: URL,
    options: HttpClientRequestOptions
  ): Promise<Response> {
    const axiosOptions: import('axios').RawAxiosRequestConfig = {
      url: url.toString(),
      method: options.method,
      headers: options.headers,
    };
    if (methodHasBody(options.method) && options.body != null) {
      axiosOptions.data = options.body;
    }
    let response: Response;
    try {
      const axiosResponse = await this._http.request(axiosOptions);
      const body = validateBody(axiosResponse.data);
      response = new Response(body, {
        headers: formatHeaders(axiosResponse.headers),
        status: axiosResponse.status,
        statusText: axiosResponse.statusText,
      });
    } catch (error) {
      if (error instanceof this.axios.AxiosError) {
        // TODO optimize import
        const statusCode =
          error.response?.status ??
          error.status ??
          StatusCodes.INTERNAL_SERVER_ERROR;
        response = new Response(error.response?.data ?? error.cause, {
          headers: formatHeaders(error.response?.headers ?? {}),
          status: statusCode,
          statusText: getReasonPhrase(statusCode),
        });
      } else {
        response = new Response(null, {
          headers: {},
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          statusText: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
        });
      }
    }
    return response;
  }
}
