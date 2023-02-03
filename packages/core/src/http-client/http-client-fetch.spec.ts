import { HttpClientFetch } from './http-client-fetch.js';

describe('http-client-fetch', () => {
  let http: HttpClientFetch;

  const fetchMock = vi.fn();

  vi.stubGlobal('fetch', fetchMock);

  const url = new URL('/', 'http://localhost');

  beforeEach(() => {
    http = new HttpClientFetch();
  });

  it('should create instance', () => {
    expect(http).toBeDefined();
  });

  it('should stringify body', async () => {
    await http.request(url, {
      method: 'POST',
      body: {},
    });
    expect(fetchMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        body: '{}',
      })
    );
  });

  it('should not stringify body', async () => {
    await http.request(url, {
      method: 'POST',
      body: '{}',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        body: '{}',
      })
    );
  });

  it('should return response from GET', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{}', {
        status: 200,
        headers: { header: '123' },
        statusText: 'OK',
      })
    );
    const response = await http.request(url, {
      method: 'GET',
    });
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');
    expect(await response.json()).toEqual({});
    expect(response.headers.get('header')).toBe('123');
  });
});
