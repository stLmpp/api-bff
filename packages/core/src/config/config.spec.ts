import { mkdir, rm, writeFile } from 'node:fs/promises';

import { afterAll, beforeAll, beforeEach, expect } from 'vitest';

import { defineConfig, getConfig, reset_config_cache } from './config.js';

describe('config', () => {
  beforeAll(async () => {
    await rm('dist', { recursive: true, force: true });
  });

  afterAll(async () => {
    await rm('dist', { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm('dist', { recursive: true, force: true });
    reset_config_cache();
  });

  beforeEach(async () => {
    await mkdir('dist');
  });

  describe('defineConfig', () => {
    it('should return the first argument', () => {
      expect(
        defineConfig({
          prefix: 'api',
        })
      ).toEqual({ prefix: 'api' });
    });
  });

  it('should get config parsed', async () => {
    await writeFile(
      'dist/api-bff.config.js',
      `export default { prefix: 'api', httpClient: 'fetch' };`
    );
    const config = await getConfig();
    expect(config).toBeDefined();
  });

  it('should get error if config does not have a default export', async () => {
    await writeFile('dist/api-bff.config.js', 'export const config = {};');
    return expect(() => getConfig()).rejects.toThrowError(
      expect.objectContaining({
        message: expect.stringContaining(
          'API BFF Config does not have a default export'
        ),
      })
    );
  });

  it('should get validation error if config is invalid', async () => {
    await writeFile(
      'dist/api-bff.config.js',
      `export default { openapi: 1, prefix: {}, caching: 'string' };`
    );
    return expect(() => getConfig()).rejects.toThrowError(
      expect.objectContaining({
        message: expect.stringContaining('API BFF Config is invalid'),
      })
    );
  });
});
