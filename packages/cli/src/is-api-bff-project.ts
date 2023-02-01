import { join } from 'node:path';

import { pathExists } from 'fs-extra';

export function isApiBffProject(path: string): Promise<boolean> {
  return pathExists(join(path, 'api-bff.config.ts'));
}
