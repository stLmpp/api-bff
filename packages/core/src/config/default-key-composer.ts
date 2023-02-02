import { type ConfigCachingKeyComposer } from './config-caching.schema.js';

/**
 * @public
 * @param url
 * @param method
 */
export const defaultKeyComposer: ConfigCachingKeyComposer = ({ url, method }) =>
  `${method}__${url.toString()}`;
