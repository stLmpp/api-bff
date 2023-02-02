import { getHttpClient, get_http_client_config } from './get-http-client.js';
import { HttpClientAxios } from './http-client-axios.js';
import { HttpClientFetch } from './http-client-fetch.js';
import { HttpClientGot } from './http-client-got.js';
import { HttpClient } from './http-client.js';

vi.mock('got');
vi.mock('axios');
vi.mock('../config/config.js', () => ({
  ...vi.importActual('../config/config.js'),
  getConfig: async () => ({ httpClient: new HttpClientFetch() }),
}));

describe('get-http-client', () => {
  describe('getHttpClientConfig', () => {
    it('should get instance of HttpClientFetch', async () => {
      const http = await get_http_client_config('fetch');
      expect(http).toBeInstanceOf(HttpClient);
      expect(http).toBeDefined();
      expect(http).toBeInstanceOf(HttpClientFetch);
    });

    it('should get instance of HttpClientAxios', async () => {
      const http = await get_http_client_config('axios');
      expect(http).toBeDefined();
      expect(http).toBeInstanceOf(HttpClient);
      expect(http).toBeInstanceOf(HttpClientAxios);
    });

    it('should get instance of HttpClientGot', async () => {
      const http = await get_http_client_config('got');
      expect(http).toBeDefined();
      expect(http).toBeInstanceOf(HttpClient);
      expect(http).toBeInstanceOf(HttpClientGot);
    });

    it('should get instance of custom http client', async () => {
      class CustomHttpClient extends HttpClient {
        request = vi.fn();
      }
      const http = await get_http_client_config(new CustomHttpClient());
      expect(http).toBeDefined();
      expect(http).toBeInstanceOf(HttpClient);
      expect(http).toBeInstanceOf(CustomHttpClient);
    });
  });

  describe('getHttpClient', () => {
    it('should return the http client instance', async () => {
      const http = await getHttpClient();
      expect(http).toBeDefined();
      expect(http).toBeInstanceOf(HttpClientFetch);
    });
  });
});
