import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import mock, { restore } from 'mock-fs';

import { type ConfigCaching } from '../config/config-caching.schema.js';
import { defaultKeyComposer } from '../config/default-key-composer.js';
import { path_exists } from '../path-exists.js';

import { type CachingData } from './caching-data.schema.js';
import { FileCaching, RESERVED_FILENAMES } from './file-caching.js';

describe('file-caching', () => {
  let service: FileCaching;
  let config_caching: ConfigCaching;

  beforeEach(() => {
    service = new FileCaching();
    config_caching = {
      path: '__caching',
      strategy: service,
      keyComposer: defaultKeyComposer,
    };
  });

  afterEach(() => {
    restore();
  });

  it('should create instance', () => {
    expect(service).toBeDefined();
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
      let [__caching_exists, file1_exists, file2_exists] = await Promise.all([
        path_exists('__caching'),
        path_exists('__caching/file1.json'),
        path_exists('__caching/file2.json'),
      ]);
      expect(__caching_exists).toBe(true);
      expect(file1_exists).toBe(true);
      expect(file2_exists).toBe(true);
      await service.invalidateAll(config_caching);
      [__caching_exists, file1_exists, file2_exists] = await Promise.all([
        path_exists('__caching'),
        path_exists('__caching/file1.json'),
        path_exists('__caching/file2.json'),
      ]);
      expect(__caching_exists).toBe(false);
      expect(file1_exists).toBe(false);
      expect(file2_exists).toBe(false);
    });

    it('should invalidate one key', async () => {
      let [__caching_exists, file1_exists, file2_exists] = await Promise.all([
        path_exists('__caching'),
        path_exists('__caching/file1.json'),
        path_exists('__caching/file2.json'),
      ]);
      expect(__caching_exists).toBe(true);
      expect(file1_exists).toBe(true);
      expect(file2_exists).toBe(true);
      await service.invalidate('file1', config_caching);
      [__caching_exists, file1_exists, file2_exists] = await Promise.all([
        path_exists('__caching'),
        path_exists('__caching/file1.json'),
        path_exists('__caching/file2.json'),
      ]);
      expect(__caching_exists).toBe(true);
      expect(file1_exists).toBe(false);
      expect(file2_exists).toBe(true);
    });
  });

  describe('get', () => {
    beforeAll(async () => {
      await rm('__caching', { recursive: true, force: true });
      vi.useFakeTimers({
        now: new Date(2023, 0, 1, 0, 0, 0, 0),
      });
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    beforeEach(async () => {
      await mkdir('__caching');
      config_caching = {
        ...config_caching,
        ttl: 15_000,
      };
    });

    afterEach(async () => {
      await rm('__caching', { recursive: true, force: true });
      vi.useFakeTimers({
        now: new Date(2023, 0, 1, 0, 0, 0, 0),
      });
    });

    async function create_files(files: Record<string, string>): Promise<void> {
      await Promise.all(
        Object.entries(files).map(([key, value]) =>
          writeFile(join('__caching', key), value)
        )
      );
    }

    it('should get cache if exists', async () => {
      const data: CachingData = {
        value: {},
        date: new Date().getTime(),
      };
      await create_files({
        'file1.json': JSON.stringify(data),
      });
      const value = await service.get('file1', config_caching);
      expect(value).toEqual(data.value);
    });

    it('should return undefined if not exists', async () => {
      const value = await service.get('file_not_exists', config_caching);
      expect(value).toBeUndefined();
    });

    it('should return undefined if cache is expired', async () => {
      const data: CachingData = {
        value: {},
        date: new Date().getTime(),
      };
      await create_files({
        'file1.json': JSON.stringify(data),
      });
      const value = await service.get('file1', config_caching);
      expect(value).toEqual(data.value);
      vi.advanceTimersByTime(15_000);
      const value1 = await service.get('file1', config_caching);
      expect(value1).toEqual(data.value);
      vi.advanceTimersByTime(1);
      const value2 = await service.get('file1', config_caching);
      expect(value2).toBeUndefined();
    });

    it('should return not validate expiration date when ttl is falsy', async () => {
      const data: CachingData = {
        value: {},
        date: new Date().getTime(),
      };
      await create_files({
        'file1.json': JSON.stringify(data),
      });
      const value = await service.get('file1', {
        ...config_caching,
        ttl: undefined,
      });
      expect(value).toEqual(data.value);
    });

    it('should invalidate cache when JSON.parse fails', async () => {
      await create_files({
        'file1.json': '{ invalid ]',
      });
      const value = await service.get('file1', config_caching);
      expect(value).toBeUndefined();
      expect(await path_exists('__caching/file1.json')).toBe(false);
    });

    it('should invalidate cache when Schema parsing fails', async () => {
      await create_files({
        'file1.json': '{ "value": [], "date": "string" }',
      });
      const value = await service.get('file1', config_caching);
      expect(value).toBeUndefined();
      expect(await path_exists('__caching/file1.json')).toBe(false);
    });
  });

  describe('set', () => {
    beforeEach(() => {
      mock();
    });

    afterEach(() => {
      restore();
    });

    it('should create file', async () => {
      mock({ __caching: {} });
      await service.set('file1', {}, config_caching);
      expect(await path_exists('__caching/file1.json')).toBe(true);
    });

    it.each(RESERVED_FILENAMES)(
      'should throw when reserved filename "%s"',
      (filename) =>
        expect(() =>
          service.set(filename, {}, config_caching)
        ).rejects.toThrow()
    );

    it('should sanitize invalid characters', async () => {
      await service.set('/;\\;<;>;:;";|;?;*; ', {}, config_caching);
      expect(
        await path_exists('__caching/__;___;_-_;-_-;--;-_;_-;--_;__-;____.json')
      ).toBe(true);
    });
  });
});
