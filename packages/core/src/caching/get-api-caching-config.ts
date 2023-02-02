import { type ApiConfigInternal } from '../api-config/api-config.schema.js';
import {
  CONFIG_CACHING_PATH_DEFAULT,
  type ConfigCaching,
} from '../config/config-caching.schema.js';
import { getConfig } from '../config/config.js';
import { defaultKeyComposer } from '../config/default-key-composer.js';

import { get_caching_strategy_config } from './caching-resolver.js';

export async function get_api_caching_config(apiConfig: ApiConfigInternal) {
  const config = await getConfig();
  const default_config = {
    path: CONFIG_CACHING_PATH_DEFAULT,
    keyComposer: defaultKeyComposer,
    strategy: get_caching_strategy_config('memory'),
  } satisfies ConfigCaching;
  const has_caching_config =
    apiConfig.caching !== false && (!!config.caching || !!apiConfig.caching);
  return {
    caching: has_caching_config
      ? ({
          ...default_config,
          ...config.caching,
          ...apiConfig.caching,
        } satisfies ConfigCaching)
      : default_config,
    has_caching_config,
  };
}
