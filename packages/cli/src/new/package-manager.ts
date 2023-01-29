import { exec } from 'child_process';

import { z } from 'zod';

export const PackageManagerSchema = z.union([
  z.literal('pnpm'),
  z.literal('yarn'),
  z.literal('npm'),
]);

type PackageManager = z.infer<typeof PackageManagerSchema>;

export function installDependencies(
  path: string,
  packageManager: PackageManager
): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `${packageManager} install`,
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
