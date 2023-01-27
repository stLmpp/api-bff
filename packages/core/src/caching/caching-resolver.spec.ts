import {
  getAllDefaultCachingStrategiesInstances,
  getCachingStrategyConfig,
} from './caching-resolver.js';
import { CachingStrategy } from './caching-strategy.js';
import { FileCaching } from './file-caching.js';
import { MemoryCaching } from './memory-caching.js';

describe('caching-resolver', () => {
  describe('getCachingStrategyConfig', () => {
    it('should return memory caching', () => {
      const caching = getCachingStrategyConfig('memory');
      expect(caching).toBeInstanceOf(MemoryCaching);
      expect(caching).toBeInstanceOf(CachingStrategy);
    });

    it('should return file caching', () => {
      const caching = getCachingStrategyConfig('file');
      expect(caching).toBeInstanceOf(FileCaching);
      expect(caching).toBeInstanceOf(CachingStrategy);
    });
  });

  describe('getAllDefaultCachingStrategiesInstances', () => {
    it('should get all default caching strategies', () => {
      const instances = getAllDefaultCachingStrategiesInstances();
      expect(
        instances.every((instance) => instance instanceof CachingStrategy)
      ).toBe(true);
      expect(
        instances.some((instance) => instance instanceof MemoryCaching)
      ).toBe(true);
      expect(
        instances.some((instance) => instance instanceof FileCaching)
      ).toBe(true);
    });
  });
});
