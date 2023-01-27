import { env } from './env.js';

describe('env', () => {
  it('should get environment variable', () => {
    process.env.NODE_ENV = 'production';
    const fn = env('NODE_ENV');
    expect(typeof fn).toBe('function');
    expect(fn()).toBe('production');
  });
});
