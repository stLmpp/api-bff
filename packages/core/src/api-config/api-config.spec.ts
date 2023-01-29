import { apiConfig } from './api-config.js';

describe('api-config', () => {
  it('should return the same object', () => {
    expect(
      apiConfig({
        path: '',
        host: '',
      })
    ).toEqual({
      path: '',
      host: '',
    });
  });
});
