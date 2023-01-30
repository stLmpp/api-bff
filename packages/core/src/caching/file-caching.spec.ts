import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import mock, { restore } from 'mock-fs';

import { type ConfigCaching } from '../config/config-caching.schema.js';
import { defaultKeyComposer } from '../config/default-key-composer.js';
import { pathExists } from '../path-exists.js';

import { type CachingData } from './caching-data.schema.js';
import { FileCaching, RESERVED_FILENAMES } from './file-caching.js';

describe('file-caching', () => {
  let service: FileCaching;
  let configCaching: ConfigCaching;

  beforeEach(() => {
    service = new FileCaching();
    configCaching = {
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
      let [__cachingExists, file1Exists, file2Exists] = await Promise.all([
        pathExists('__caching'),
        pathExists('__caching/file1.json'),
        pathExists('__caching/file2.json'),
      ]);
      expect(__cachingExists).toBe(true);
      expect(file1Exists).toBe(true);
      expect(file2Exists).toBe(true);
      await service.invalidateAll(configCaching);
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
      await service.invalidate('file1', configCaching);
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
      configCaching = {
        ...configCaching,
        ttl: 15_000,
      };
    });

    afterEach(async () => {
      await rm('__caching', { recursive: true, force: true });
      vi.useFakeTimers({
        now: new Date(2023, 0, 1, 0, 0, 0, 0),
      });
    });

    async function createFiles(files: Record<string, string>) {
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
      await createFiles({
        'file1.json': JSON.stringify(data),
      });
      const value = await service.get('file1', configCaching);
      expect(value).toEqual(data.value);
    });

    it('should return undefined if not exists', async () => {
      const value = await service.get('file_not_exists', configCaching);
      expect(value).toBeUndefined();
    });

    it('should return undefined if cache is expired', async () => {
      const data: CachingData = {
        value: {},
        date: new Date().getTime(),
      };
      await createFiles({
        'file1.json': JSON.stringify(data),
      });
      const value = await service.get('file1', configCaching);
      expect(value).toEqual(data.value);
      vi.advanceTimersByTime(15_000);
      const value1 = await service.get('file1', configCaching);
      expect(value1).toEqual(data.value);
      vi.advanceTimersByTime(1);
      const value2 = await service.get('file1', configCaching);
      expect(value2).toBeUndefined();
    });

    it('should return not validate expiration date when ttl is falsy', async () => {
      const data: CachingData = {
        value: {},
        date: new Date().getTime(),
      };
      await createFiles({
        'file1.json': JSON.stringify(data),
      });
      const value = await service.get('file1', {
        ...configCaching,
        ttl: undefined,
      });
      expect(value).toEqual(data.value);
    });

    it('should invalidate cache when JSON.parse fails', async () => {
      await createFiles({
        'file1.json': '{ invalid ]',
      });
      const value = await service.get('file1', configCaching);
      expect(value).toBeUndefined();
      expect(await pathExists('__caching/file1.json')).toBe(false);
    });

    it('should invalidate cache when Schema parsing fails', async () => {
      await createFiles({
        'file1.json': '{ "value": [], "date": "string" }',
      });
      const value = await service.get('file1', configCaching);
      expect(value).toBeUndefined();
      expect(await pathExists('__caching/file1.json')).toBe(false);
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
      await service.set('file1', {}, configCaching);
      expect(await pathExists('__caching/file1.json')).toBe(true);
    });

    it.each(RESERVED_FILENAMES)(
      'should throw when reserved filename "%s"',
      (filename) =>
        expect(() => service.set(filename, {}, configCaching)).rejects.toThrow()
    );

    it('should sanitize invalid characters', async () => {
      await service.set('/;\\;<;>;:;";|;?;*; ', {}, configCaching);
      expect(
        await pathExists('__caching/__;___;_-_;-_-;--;-_;_-;--_;__-;____.json')
      ).toBe(true);
    });
  });
});
