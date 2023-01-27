import mock, { restore } from 'mock-fs';
import { afterAll, afterEach, beforeAll, beforeEach, describe } from 'vitest';

import { type ConfigCaching } from '../config/config-caching.schema.js';
import { defaultKeyComposer } from '../config/default-key-composer.js';
import { pathExists } from '../path-exists.js';

import { type CachingData } from './caching-data.schema.js';
import { FileCaching } from './file-caching.js';

describe('file-caching', () => {
  let fileCaching: FileCaching;
  let configCaching: ConfigCaching;

  beforeEach(() => {
    fileCaching = new FileCaching();
    configCaching = {
      path: '__caching',
      strategy: fileCaching,
      keyComposer: defaultKeyComposer,
    };
  });

  afterEach(() => {
    restore();
  });

  it('should create instance', () => {
    expect(fileCaching).toBeDefined();
  });

  describe('invalidate', () => {
    beforeEach(() => {
      mock({
        __caching: {
          'file1.json': '{}',
          'file2.json': '{}',
        },
      });
    });

    it('should invalidate all cache', async () => {
      let [__cachingExists, file1Exists, file2Exists] = await Promise.all([
        pathExists('__caching'),
        pathExists('__caching/file1.json'),
        pathExists('__caching/file2.json'),
      ]);
      expect(__cachingExists).toBe(true);
      expect(file1Exists).toBe(true);
      expect(file2Exists).toBe(true);
      await fileCaching.invalidateAll(configCaching);
      [__cachingExists, file1Exists, file2Exists] = await Promise.all([
        pathExists('__caching'),
        pathExists('__caching/file1.json'),
        pathExists('__caching/file2.json'),
      ]);
      expect(__cachingExists).toBe(false);
      expect(file1Exists).toBe(false);
      expect(file2Exists).toBe(false);
    });

    it('should invalidate one key', async () => {
      let [__cachingExists, file1Exists, file2Exists] = await Promise.all([
        pathExists('__caching'),
        pathExists('__caching/file1.json'),
        pathExists('__caching/file2.json'),
      ]);
      expect(__cachingExists).toBe(true);
      expect(file1Exists).toBe(true);
      expect(file2Exists).toBe(true);
      await fileCaching.invalidate('file1', configCaching);
      [__cachingExists, file1Exists, file2Exists] = await Promise.all([
        pathExists('__caching'),
        pathExists('__caching/file1.json'),
        pathExists('__caching/file2.json'),
      ]);
      expect(__cachingExists).toBe(true);
      expect(file1Exists).toBe(false);
      expect(file2Exists).toBe(true);
    });
  });

  describe('get', () => {
    beforeAll(() => {
      vi.useFakeTimers({
        now: new Date(2023, 0, 27, 0, 0, 0, 0),
      });
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it.skip('should get cache if exists', async () => {
      // TODO timeout
      const data: CachingData = {
        value: {},
        expiry: new Date().getTime(),
      };
      mock({
        __caching: {
          'file1.json': '{}',
        },
      });
      const value = await fileCaching.get('file1', configCaching);
      expect(value).toEqual(data);
    });
  });
});
