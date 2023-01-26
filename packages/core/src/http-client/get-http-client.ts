import { getConfig } from '../config/config.js';
import { type OrPromise } from '../or-promise.js';

import { HttpClientAxios } from './http-client-axios.js';
import { HttpClientFetch } from './http-client-fetch.js';
import { HttpClientGot } from './http-client-got.js';
import { type HttpClientType } from './http-client-type.schema.js';
import { type HttpClient } from './http-client.js';

function getErrorMessage(client: string): string {
  return `API BFF - "${client}" is not available as a http client, make sure you installed it`;
}

const factoryMap = {
  got: () =>
    import('got')
      .then((m) => new HttpClientGot(m.got))
      .catch((error) => {
        throw new Error(getErrorMessage('got'), { cause: error });
      }),
  axios: () =>
    import('axios')
      .then((m) => new HttpClientAxios(m.default))
      .catch((error) => {
        throw new Error(getErrorMessage('axios'), { cause: error });
      }),
  fetch: () => new HttpClientFetch(),
} satisfies Record<HttpClientType, () => OrPromise<HttpClient>>;

export async function getHttpClientConfig(
  type: HttpClientType | HttpClient
): Promise<HttpClient> {
  if (typeof type === 'string') {
    return factoryMap[type]();
  }
  return type;
}

export async function getHttpClient(): Promise<HttpClient> {
  const config = await getConfig();
  return config.httpClient;
}
