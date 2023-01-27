import { type ConfigCachingKeyComposer } from './config-caching.schema.js';

export const defaultKeyComposer: ConfigCachingKeyComposer = ({ url, method }) =>
  `${method}__${url.toString()}`;
