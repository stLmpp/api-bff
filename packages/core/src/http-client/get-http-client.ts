import { getConfig } from '../config/config.js';
import { type OrPromise } from '../or-promise.js';

import { HttpClientAxios } from './http-client-axios.js';
import { HttpClientFetch } from './http-client-fetch.js';
import { HttpClientGot } from './http-client-got.js';
import { type HttpClientType } from './http-client-type.schema.js';
import { type HttpClient } from './http-client.js';

function get_error_message(client: string): string {
  return `API BFF - "${client}" is not available as a http client, make sure you installed it`;
}

const factory_map = {
  got: async () =>
    new HttpClientGot(
      await import('got').catch((error) => {
        throw new Error(get_error_message('got'), { cause: error });
      })
    ),
  axios: async () =>
    new HttpClientAxios(
      await import('axios').catch((error) => {
        throw new Error(get_error_message('axios'), { cause: error });
      })
    ),
  fetch: () => new HttpClientFetch(),
} satisfies Record<HttpClientType, () => OrPromise<HttpClient>>;

export async function get_http_client_config(
  type: HttpClientType | HttpClient
): Promise<HttpClient> {
  if (typeof type === 'string') {
    return factory_map[type]();
  }
  return type;
}

/**
 * @public
 */
export async function getHttpClient(): Promise<HttpClient> {
  const config = await getConfig();
  return config.httpClient;
}
