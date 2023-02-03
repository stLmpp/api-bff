import { type Response } from 'got';
import { mock } from 'vitest-mock-extended';

import { HttpClientGot } from './http-client-got.js';

describe('http-client-got', () => {
  let http: HttpClientGot;

  const url = new URL('/', 'http://localhost');

  const gotDefaultMock = Object.assign(
    vi.fn().mockResolvedValue(
      mock<Response>({
        statusCode: 200,
        statusMessage: 'OK',
      })
    ),
    mock<typeof import('got').got>()
  );

  const gotMock = mock<typeof import('got')>({
    got: gotDefaultMock,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    http = new HttpClientGot(gotMock);
  });

  it('should create instance', () => {
    expect(http).toBeDefined();
  });

  it('should set body when body is a string', async () => {
    await http.request(url, {
      method: 'POST',
      body: '{}',
    });
    expect(gotDefaultMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        body: '{}',
      })
    );
  });

  it('should set json when body is not a string', async () => {
    await http.request(url, {
      method: 'POST',
      body: {},
    });
    expect(gotDefaultMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        json: {},
      })
    );
  });
});
