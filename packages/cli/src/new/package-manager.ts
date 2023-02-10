import { exec } from 'child_process';

import { z } from 'zod';

export const package_manager_schema = z.enum(['pnpm', 'yarn', 'npm']);

type PackageManager = z.infer<typeof package_manager_schema>;

export function install_dependencies(
  path: string,
  package_manager: PackageManager
): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `${package_manager} install`,
      {
        cwd: path,
      },
      (error) => {
        if (error) {
          // TODO improve error message
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
}
