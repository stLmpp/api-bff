import { join } from 'node:path';

import { pathExists } from 'fs-extra';

export function is_api_bff_project(path: string): Promise<boolean> {
  return pathExists(join(path, 'api-bff.config.ts'));
}
