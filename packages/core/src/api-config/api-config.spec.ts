import { apiConfig, type ApiConfig } from './api-config.js';

describe('api-config', () => {
  it('should return the same object', () => {
    const object: ApiConfig = {
      path: '',
      host: '',
    };
    expect(apiConfig(object)).toBe(object);
  });
});
