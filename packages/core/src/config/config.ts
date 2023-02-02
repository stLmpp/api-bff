import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { from_zod_error_to_error_response_objects } from '../zod-error-formatter.js';

import {
  type Config,
  type ConfigInput,
  config_schema,
} from './config.schema.js';

let _config: Config | null = null;
let _hash = 0;

async function parse_and_assert_config(config: unknown): Promise<Config> {
  const parsed = await config_schema.safeParseAsync(config);
  if (!parsed.success) {
    const errors = from_zod_error_to_error_response_objects(
      parsed.error,
      'body'
    );
    throw new Error(
      `API BFF Config is invalid.\n` +
        `Errors:\n` +
        `${errors
          .map((error) => `- "${error.path}" ${error.message}`)
          .join('\n')}`
    );
  }
  return parsed.data;
}

async function get_config(): Promise<Config> {
  const filename = pathToFileURL(join(process.cwd(), `dist/api-bff.config.js`));
  if (!PROD) {
    // Hash to invalidate the dynamic import caching
    // This is mostly done to help in unit testing
    filename.hash = String(_hash);
  }
  let file: { default?: unknown };
  try {
    file = await import(filename.toString());
  } catch (error) {
    throw new Error(`Could not find API BFF Config.\n${error.message}`);
  }
  if (!file.default) {
    throw new Error(
      'API BFF Config does not have a default export.\n' +
        'Please follow the template below\n\n' +
        `import { defineConfig } from 'api-bff';\n\n` +
        'export default defineConfig({}); // Your config here\n\n'
    );
  }
  return parse_and_assert_config(file.default);
}

/**
 * @public
 */
export async function getConfig(): Promise<Config> {
  if (!_config) {
    _config = await get_config();
  }
  return _config;
}

/**
 * @public
 */
export function defineConfig(config: ConfigInput): ConfigInput {
  return config;
}

export function reset_config_cache(): void {
  _config = null;
  if (!PROD) {
    _hash++;
  }
}
