import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { pathExists } from 'fs-extra';

import { type ConfigCaching } from '../config/config-caching.schema.js';

import {
  type CachingData,
  caching_data_schema,
} from './caching-data.schema.js';
import { CachingStrategy } from './caching-strategy.js';

// prettier-ignore
export const RESERVED_FILENAMES = [
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
] as const;

/**
 * @public
 */
export class FileCaching extends CachingStrategy {
  private async create_folder(path: string): Promise<void> {
    const exists = await pathExists(path);
    if (exists) {
      return;
    }
    await mkdir(path);
  }

  private readonly character_replacements: ReadonlyMap<string, string> =
    new Map<string, string>()
      .set('/', '__')
      .set('\\', '___')
      .set('<', '_-_')
      .set('>', '-_-')
      .set(':', '--')
      .set('"', '-_')
      .set('|', '_-')
      .set('?', '--_')
      .set('*', '__-');

  private readonly reserved_names: ReadonlySet<string> = new Set(
    RESERVED_FILENAMES
  );

  private sanitize_key(key: string): string {
    for (const [character, replacement] of this.character_replacements) {
      key = key.replaceAll(character, replacement);
    }
    key = key.replace(/[.\s]$/, '____');
    if (this.reserved_names.has(key)) {
      throw new Error(
        `Key cannot be reserved names: ${[...this.reserved_names].join(', ')}`
      );
    }
    return key;
  }

  private get_file_path(path: string, key: string): string {
    return `${join(path, this.sanitize_key(key))}.json`;
  }

  async get(key: string, options: ConfigCaching): Promise<unknown> {
    const { path, ttl } = options;
    const file_path = this.get_file_path(path, key);
    const exists = await pathExists(file_path);
    if (!exists) {
      return;
    }
    const file = await readFile(file_path, { encoding: 'utf8' });
    let cached: CachingData;
    try {
      cached = JSON.parse(file);
      await caching_data_schema.parseAsync(cached);
    } catch {
      await this.invalidate(key, options);
      return;
    }
    const { date, value } = cached;
    if (!ttl) {
      return value;
    }
    const now = new Date().getTime();
    if (now > date + ttl) {
      await this.invalidate(key, options);
      return;
    }
    return value;
  }

  async set(
    key: string,
    value: unknown,
    { path }: ConfigCaching
  ): Promise<void> {
    const cache: CachingData = {
      value,
      date: new Date().getTime(),
    };
    await this.create_folder(path);
    await writeFile(this.get_file_path(path, key), JSON.stringify(cache));
  }

  async invalidate(key: string, { path }: ConfigCaching): Promise<void> {
    await rm(this.get_file_path(path, key));
  }

  async invalidateAll({ path }: ConfigCaching): Promise<void> {
    await rm(path, { recursive: true, force: true });
  }
}
