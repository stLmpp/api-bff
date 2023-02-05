import { StatusCodes } from 'http-status-codes';
import { beforeEach } from 'vitest';
import { z } from 'zod';

import { HttpClientResponse } from './http-client-reponse.js';
import { HttpClient } from './http-client.js';

describe('http-client', () => {
  const requestMock = vi.fn().mockResolvedValue(new Response());

  class CustomHttpClient extends HttpClient {
    request = requestMock;

    override validate_and_stringify_body(body: unknown): string {
      return super.validate_and_stringify_body(body);
    }
  }

  let http: CustomHttpClient;

  const url = new URL('/', 'http://localhost');

  beforeEach(() => {
    vi.clearAllMocks();
    http = new CustomHttpClient();
  });

  it('should create instance', () => {
    expect(http).toBeDefined();
  });

  describe('validate_body', () => {
    it('should return null if body is null or undefined', () => {
      expect(http.validate_and_stringify_body(null)).toBe('null');
      expect(http.validate_and_stringify_body(undefined)).toBe('null');
    });

    it('should return string if body is Buffer', () => {
      const buffer = Buffer.from('{}');
      expect(http.validate_and_stringify_body(buffer)).toBe('{}');
    });

    it('should return string if body is a valid JSON string', () => {
      expect(http.validate_and_stringify_body('[]')).toBe('[]');
    });

    it('should return null if body is an invalid JSON string', () => {
      expect(http.validate_and_stringify_body('{ invalid json string ]')).toBe(
        'null'
      );
    });

    it('should return string if body is not a string', () => {
      expect(http.validate_and_stringify_body([{ id: 1 }])).toBe('[{"id":1}]');
    });

    it('should return null if JSON.parse throws', () => {
      const obj: Record<string, unknown> = {};
      obj.obj = obj;
      expect(http.validate_and_stringify_body(obj)).toBe('null');
    });
  });

  describe('GET', () => {
    it('should validate response', async () => {
      requestMock.mockResolvedValueOnce(new Response('{ "id": "123" }'));
      return expect(() =>
        http.get(url, { validation: z.object({ id: z.number() }) })
      ).rejects.toThrowError(
        expect.objectContaining({
          status: StatusCodes.MISDIRECTED_REQUEST,
        })
      );
    });

    it('should get successful response', async () => {
      requestMock.mockResolvedValue(new Response('{ "id": "123" }'));
      const response = await http.get(url, {
        validation: z.object({ id: z.string() }),
      });
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(HttpClientResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: '123' });
    });
  });

  describe('DELETE', () => {
    it('should validate response', async () => {
      requestMock.mockResolvedValueOnce(new Response('{ "id": "123" }'));
      return expect(() =>
        http.delete(url, { validation: z.object({ id: z.number() }) })
      ).rejects.toThrowError(
        expect.objectContaining({
          status: StatusCodes.MISDIRECTED_REQUEST,
        })
      );
    });

    it('should get successful response', async () => {
      requestMock.mockResolvedValue(new Response('{ "id": "123" }'));
      const response = await http.delete(url, {
        validation: z.object({ id: z.string() }),
      });
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(HttpClientResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: '123' });
    });

    it('should not include body', async () => {
      requestMock.mockResolvedValue(new Response('{ "id": "123" }'));
      const response = await http.delete(url, {
        validation: z.object({ id: z.string() }),
      });
      expect(requestMock).toHaveBeenCalledWith(
        url,
        expect.not.objectContaining({
          body: expect.anything(),
        })
      );
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(HttpClientResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: '123' });
    });
  });

  describe('POST', () => {
    it('should validate response', async () => {
      requestMock.mockResolvedValueOnce(new Response('{ "id": "123" }'));
      return expect(() =>
        http.post(url, { validation: z.object({ id: z.number() }) })
      ).rejects.toThrowError(
        expect.objectContaining({
          status: StatusCodes.MISDIRECTED_REQUEST,
        })
      );
    });

    it('should get successful response', async () => {
      requestMock.mockResolvedValue(new Response('{ "id": "123" }'));
      const response = await http.post(url, {
        validation: z.object({ id: z.string() }),
      });
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(HttpClientResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: '123' });
    });

    it('should include body', async () => {
      requestMock.mockResolvedValue(new Response('{ "id": "123" }'));
      const response = await http.post(url, {
        validation: z.object({ id: z.string() }),
        body: {},
      });
      expect(requestMock).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          body: {},
        })
      );
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(HttpClientResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: '123' });
    });
  });

  describe('PUT', () => {
    it('should validate response', async () => {
      requestMock.mockResolvedValueOnce(new Response('{ "id": "123" }'));
      return expect(() =>
        http.put(url, { validation: z.object({ id: z.number() }) })
      ).rejects.toThrowError(
        expect.objectContaining({
          status: StatusCodes.MISDIRECTED_REQUEST,
        })
      );
    });

    it('should get successful response', async () => {
      requestMock.mockResolvedValue(new Response('{ "id": "123" }'));
      const response = await http.put(url, {
        validation: z.object({ id: z.string() }),
      });
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(HttpClientResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: '123' });
    });

    it('should include body', async () => {
      requestMock.mockResolvedValue(new Response('{ "id": "123" }'));
      const response = await http.put(url, {
        validation: z.object({ id: z.string() }),
        body: {},
      });
      expect(requestMock).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          body: {},
        })
      );
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(HttpClientResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: '123' });
    });
  });

  describe('PATCH', () => {
    it('should validate response', async () => {
      requestMock.mockResolvedValueOnce(new Response('{ "id": "123" }'));
      return expect(() =>
        http.patch(url, { validation: z.object({ id: z.number() }) })
      ).rejects.toThrowError(
        expect.objectContaining({
          status: StatusCodes.MISDIRECTED_REQUEST,
        })
      );
    });

    it('should get successful response', async () => {
      requestMock.mockResolvedValue(new Response('{ "id": "123" }'));
      const response = await http.patch(url, {
        validation: z.object({ id: z.string() }),
      });
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(HttpClientResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: '123' });
    });

    it('should include body', async () => {
      requestMock.mockResolvedValue(new Response('{ "id": "123" }'));
      const response = await http.patch(url, {
        validation: z.object({ id: z.string() }),
        body: {},
      });
      expect(requestMock).toHaveBeenCalledWith(
        url,
        expect.objectContaining({
          body: {},
        })
      );
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(HttpClientResponse);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: '123' });
    });
  });
});
