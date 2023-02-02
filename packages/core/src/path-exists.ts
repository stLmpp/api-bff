import { access, constants } from 'node:fs/promises';

export function path_exists(path: string): Promise<boolean> {
  return access(path, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
