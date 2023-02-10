import { join, dirname } from 'node:path';

import { pathExists } from 'fs-extra';

const MAX_ITERATIONS = 50;

export async function is_api_bff_project(path: string): Promise<boolean> {
  const api_bff_root = await get_api_bff_project_root(path);
  return api_bff_root !== null;
}

export async function get_api_bff_project_root(
  path: string
): Promise<string | null> {
  let new_path = path;
  let iteration = 1;
  while (new_path) {
    if (iteration >= MAX_ITERATIONS) {
      break;
    }
    const exists = await pathExists(join(new_path, 'api-bff.config.ts'));
    if (exists) {
      return new_path;
    }
    new_path = dirname(new_path);
    iteration++;
  }
  return null;
}
