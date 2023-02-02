import { type ConfigCachingStrategy } from '../config/config-caching.schema.js';

import { type CachingStrategy } from './caching-strategy.js';
import { FileCaching } from './file-caching.js';
import { MemoryCaching } from './memory-caching.js';

const caching_instances = Object.freeze({
  memory: new MemoryCaching(),
  file: new FileCaching(),
}) satisfies Record<ConfigCachingStrategy, CachingStrategy>;

export function get_caching_strategy_config(
  key: ConfigCachingStrategy
): CachingStrategy {
  return caching_instances[key];
}

/**
 * @public
 */
export function getAllDefaultCachingStrategiesInstances(): CachingStrategy[] {
  return Object.values(caching_instances);
}
