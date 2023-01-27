import { beforeEach } from 'vitest';

import { type ConfigCaching } from '../config/config-caching.schema.js';
import { defaultKeyComposer } from '../config/default-key-composer.js';

import { MemoryCaching } from './memory-caching.js';

describe('memory-caching', () => {
  let service: MemoryCaching;
  let config: ConfigCaching;

  beforeEach(() => {
    service = new MemoryCaching();
    config = {
      path: '',
      keyComposer: defaultKeyComposer,
      strategy: service,
    };
  });

  beforeEach(async () => {
    await service.set('url1', {}, config);
    await service.set('url2', { id: 1 }, config);
  });

  describe('invalidade', () => {
    it('should invalidate all cache', async () => {
      expect(await service.get('url1', config)).toEqual({});
      expect(await service.get('url2', config)).toEqual({ id: 1 });
      await service.invalidateAll();
      expect(await service.get('url1', config)).toBeUndefined();
      expect(await service.get('url2', config)).toBeUndefined();
    });

    it('should invalidate one key', async () => {
      expect(await service.get('url1', config)).toEqual({});
      expect(await service.get('url2', config)).toEqual({ id: 1 });
      await service.invalidate('url1');
      expect(await service.get('url1', config)).toBeUndefined();
      expect(await service.get('url2', config)).toEqual({ id: 1 });
    });
  });

  it('should set value', async () => {
    await service.set('url3', { id: 3 }, config);
    expect(await service.get('url3', config)).toEqual({ id: 3 });
  });

  it('should get value if exists', async () => {
    expect(await service.get('url2', config)).toEqual({ id: 1 });
  });

  it('should get undefined if not exists', async () => {
    expect(await service.get('NOT_EXISTS', config)).toBeUndefined();
  });

  it('should expire cache in x ms', async () => {
    vi.useFakeTimers({
      now: new Date(2023, 0, 27, 0, 0, 0, 0),
    });
    const newConfig = { ...config, ttl: 15_000 };
    await service.set('url4', { id: 4 }, newConfig);
    expect(await service.get('url4', newConfig)).toEqual({ id: 4 });
    vi.advanceTimersByTime(15_000);
    expect(await service.get('url4', newConfig)).toEqual({ id: 4 });
    vi.advanceTimersByTime(1);
    expect(await service.get('url4', newConfig)).toBeUndefined();
    vi.useRealTimers();
  });
});
