import { exec } from 'child_process';

import { z } from 'zod';

export const package_manager_schema = z.union([
  z.literal('pnpm'),
  z.literal('yarn'),
  z.literal('npm'),
]);

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
