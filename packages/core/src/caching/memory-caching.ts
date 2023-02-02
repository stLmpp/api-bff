import { type ConfigCaching } from '../config/config-caching.schema.js';

import { type CachingData } from './caching-data.schema.js';
import { CachingStrategy } from './caching-strategy.js';

/**
 * @public
 */
export class MemoryCaching extends CachingStrategy {
  private readonly _cache = new Map<string, CachingData>();

  async get(key: string, { ttl }: ConfigCaching): Promise<unknown | undefined> {
    const cached = this._cache.get(key);
    if (!cached) {
      return;
    }
    const { date, value } = cached;
    if (!ttl) {
      return value;
    }
    const now = new Date().getTime();
    if (now > date + ttl) {
      await this.invalidate(key);
      return;
    }
    return value;
  }

  async set(key: string, value: unknown): Promise<void> {
    this._cache.set(key, {
      date: new Date().getTime(),
      value,
    });
  }

  async invalidate(key: string): Promise<void> {
    this._cache.delete(key);
  }

  async invalidateAll(): Promise<void> {
    this._cache.clear();
  }
}
