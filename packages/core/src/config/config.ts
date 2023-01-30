import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { fromZodErrorToErrorResponseObjects } from '../zod-error-formatter.js';

import {
  type Config,
  type ConfigInput,
  ConfigSchema,
} from './config.schema.js';

let _config: Config | null = null;
let _hash = 0;

async function parseAndAssertConfig(config: unknown): Promise<Config> {
  const zodParsed = await ConfigSchema.safeParseAsync(config);
  if (!zodParsed.success) {
    const errors = fromZodErrorToErrorResponseObjects(zodParsed.error, 'body');
    throw new Error(
      `API BFF Config is invalid.\n` +
        `Errors:\n` +
        `${errors
          .map((error) => `- "${error.path}" ${error.message}`)
          .join('\n')}`
    );
  }
  return zodParsed.data;
}

async function _getConfig() {
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
  return parseAndAssertConfig(file.default);
}

export async function getConfig() {
  if (!_config) {
    _config = await _getConfig();
  }
  return _config;
}

export function defineConfig(config: ConfigInput) {
  return config;
}

export function resetConfigCache() {
  _config = null;
  if (!PROD) {
    _hash++;
  }
}
