import { type ApiConfigInternal } from '../api-config/api-config.schema.js';
import {
  CONFIG_CACHING_PATH_DEFAULT,
  type ConfigCaching,
} from '../config/config-caching.schema.js';
import { getConfig } from '../config/config.js';
import { defaultKeyComposer } from '../config/default-key-composer.js';

import { getCachingStrategyConfig } from './caching-resolver.js';

export async function getApiCachingConfig(apiConfig: ApiConfigInternal) {
  const config = await getConfig();
  const defaultConfig = {
    path: CONFIG_CACHING_PATH_DEFAULT,
    keyComposer: defaultKeyComposer,
    strategy: getCachingStrategyConfig('memory'),
  } satisfies ConfigCaching;
  const hasCachingConfig =
    apiConfig.caching !== false && (!!config.caching || !!apiConfig.caching);
  return {
    caching: hasCachingConfig
      ? ({
          ...defaultConfig,
          ...config.caching,
          ...apiConfig.caching,
        } satisfies ConfigCaching)
      : defaultConfig,
    hasCachingConfig,
  };
}
