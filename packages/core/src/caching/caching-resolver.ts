import { type ConfigCachingStrategy } from '../config/config-caching.js';

import { type CachingStrategy } from './caching-strategy.js';
import { FileCaching } from './file-caching.js';
import { MemoryCaching } from './memory-caching.js';

const cachingInstances = Object.freeze({
  memory: new MemoryCaching(),
  file: new FileCaching(),
}) satisfies Record<ConfigCachingStrategy, CachingStrategy>;

export function getCachingStrategy(
  key: ConfigCachingStrategy
): CachingStrategy {
  return cachingInstances[key];
}

/**
 * @public
 */
export function getAllDefaultCachingStrategiesInstances(): CachingStrategy[] {
  return Object.values(cachingInstances);
}
