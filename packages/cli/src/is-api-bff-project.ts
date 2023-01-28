import { join } from 'node:path';

import { pathExists } from 'fs-extra';

export function isApiBffProject(path: string) {
  return pathExists(join(path, 'api-bff.config.ts'));
}
