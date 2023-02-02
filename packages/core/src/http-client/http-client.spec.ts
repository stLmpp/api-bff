import { beforeEach } from 'vitest';

import { HttpClient } from './http-client.js';

describe('http-client', () => {
  class CustomHttpClient extends HttpClient {
    async request(): Promise<Response> {
      return new Response();
    }

    override validate_and_stringify_body(body: unknown): string {
      return super.validate_and_stringify_body(body);
    }
  }

  let http: CustomHttpClient;

  beforeEach(() => {
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
});
