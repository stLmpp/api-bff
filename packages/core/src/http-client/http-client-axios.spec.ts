import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { mock } from 'vitest-mock-extended';

import { HttpClientAxios } from './http-client-axios.js';

describe('http-client-axios', () => {
  let http: HttpClientAxios;

  const defaultMock = mock<typeof import('axios').default>();

  const axiosMock = mock<typeof import('axios')>({
    default: defaultMock,
  });

  beforeEach(() => {
    http = new HttpClientAxios(axiosMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create instance', () => {
    expect(http).toBeDefined();
  });

  it('should make successful GET http request', async () => {
    defaultMock.request.mockResolvedValueOnce({
      headers: {},
      status: 200,
      data: { id: 1 },
      statusText: 'OK',
      config: mock(),
    } satisfies AxiosResponse);
    const response = await http.request(new URL('/', 'http://localhost'), {
      method: 'GET',
    });
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.statusText).toBe('OK');
    expect(response.ok).toBe(true);
    expect(await response.json()).toEqual({ id: 1 });
  });

  it('should not include body on GET request', async () => {
    defaultMock.request.mockResolvedValueOnce({
      headers: {},
      status: 200,
      data: { id: 1 },
      statusText: 'OK',
      config: mock(),
    } satisfies AxiosResponse);
    await http.request(new URL('/', 'http://localhost'), {
      method: 'GET',
      body: {},
    });
    expect(defaultMock.request).toHaveBeenCalledWith({
      url: 'http://localhost/',
      method: 'GET',
      headers: undefined,
    });
    expect(defaultMock.request).not.toHaveBeenCalledWith(
      expect.objectContaining({
        body: {},
      })
    );
  });

  it('should make successful POST http request', async () => {
    defaultMock.request.mockResolvedValueOnce({
      headers: {},
      status: 201,
      data: { id: 1 },
      statusText: 'Created',
      config: mock(),
    } satisfies AxiosResponse);
    const response = await http.request(new URL('/', 'http://localhost'), {
      method: 'POST',
      body: { id: 1 },
    });
    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(201);
    expect(response.statusText).toBe('Created');
    expect(response.ok).toBe(true);
    expect(await response.json()).toEqual({ id: 1 });
  });

  it('should return error response with data from axios error response', async () => {
    const error = AxiosError.from(
      new Error('Bad Request'),
      '400',
      mock<InternalAxiosRequestConfig>(),
      mock(),
      {
        status: 400,
        config: mock(),
        data: { error: 'This is bad', code: '123' },
        statusText: 'Bad Request',
        headers: { header: '123' },
      }
    );
    axiosMock.isAxiosError.mockReturnValueOnce(true);
    defaultMock.request.mockRejectedValueOnce(error);
    const response = await http.request(new URL('/', 'http://localhost'), {
      method: 'GET',
    });
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
    expect(await response.json()).toEqual({
      error: 'This is bad',
      code: '123',
    });
    expect(response.headers.get('header')).toBe('123');
  });

  it('should return error response with data from axios error', async () => {
    const error = {
      isAxiosError: true,
      config: mock<InternalAxiosRequestConfig>(),
      status: 400,
      code: '400',
      name: '',
      message: '',
      toJSON: vi.fn(),
    } satisfies AxiosError;
    axiosMock.isAxiosError.mockReturnValueOnce(true);
    defaultMock.request.mockRejectedValueOnce(error);
    const response = await http.request(new URL('/', 'http://localhost'), {
      method: 'GET',
    });
    expect(response.status).toBe(400);
    expect(response.statusText).toBe('Bad Request');
    expect(await response.json()).toBe(null);
  });

  it('should return error response with internal server error when axios error has no info', async () => {
    const error = {
      isAxiosError: true,
      config: mock<InternalAxiosRequestConfig>(),
      code: '400',
      name: '',
      message: '',
      toJSON: vi.fn(),
    } satisfies AxiosError;
    axiosMock.isAxiosError.mockReturnValueOnce(true);
    defaultMock.request.mockRejectedValueOnce(error);
    const response = await http.request(new URL('/', 'http://localhost'), {
      method: 'GET',
    });
    expect(response.status).toBe(500);
    expect(response.statusText).toBe('Internal Server Error');
    expect(await response.json()).toBe(null);
  });

  it('should return error response when unknown error', async () => {
    defaultMock.request.mockRejectedValueOnce(new Error('UNKNOWN'));
    const response = await http.request(new URL('/', 'http://localhost'), {
      method: 'GET',
    });
    expect(response.status).toBe(500);
    expect(response.statusText).toBe('Internal Server Error');
    expect(await response.json()).toBe(null);
  });
});
