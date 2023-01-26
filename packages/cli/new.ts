import { mkdir, readFile } from 'node:fs/promises';

import { Command } from 'commander';
import fastGlob from 'fast-glob';
import { outputFile, pathExists } from 'fs-extra';
import inquirer from 'inquirer';

import packageJson from './package.json';

interface Params {
  projectName: string;
  cliVersion: string;
  coreVersion: string;
  prefix: string;
}

async function replaceFileWithParams(
  path: string,
  params: Params
): Promise<string> {
  let file = await readFile(path, { encoding: 'utf-8' });
  for (const [key, value] of Object.entries(params)) {
    file = file.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return file;
}

async function createFileFromTemplate(
  path: string,
  params: Params
): Promise<void> {
  const file = await replaceFileWithParams(path, params);
  const newPath = `${params.projectName}/${path
    .replace('templates/base', '')
    .replace('.template', '')}`;
  await outputFile(newPath, file);
}

export const newCommand = new Command('new')
  .description('Create a new applicaiton template')
  .argument('[name]', 'Name of the project', '')
  .option('--prefix', 'Prefix to all your end-points', 'api')
  .option('--package-manager', 'Package manager used by your application')
  .action(
    async (
      projectName: string,
      { prefix, packageManager }: { prefix: string; packageManager: string }
    ) => {
      if (!projectName) {
        const result = await inquirer.prompt([
          {
            name: 'projectName',
            type: 'input',
            message: () => `Project name: `,
            validate: (arg) =>
              /^[a-zA-Z_-]+(\d|[a-zA-Z_-])+?/.test(String(arg)) ||
              'Project name must start with a letter and only contain letters and numbers',
          },
        ]);
        projectName = result.projectName;
      }
      const exists = await pathExists(projectName);
      if (exists) {
        console.log(`Folder with "${projectName}" already exists.`);
        return;
      }
      // TODO install dependencies
      if (!packageManager) {
        const result = await inquirer.prompt([
          {
            name: 'packageManager',
            type: 'list',
            choices: () => ['npm', 'yarn', 'pnpm'],
            message: () => 'Choose your package manager',
          },
        ]);
        packageManager = result.packageManager;
      }
      // TODO add unit testing
      // TODO add eslint
      // TODO add prettier
      await mkdir(projectName);
      const templateFiles = await fastGlob('templates/base/**/*.template');
      await Promise.all(
        templateFiles.map((file) =>
          createFileFromTemplate(file, {
            cliVersion: packageJson.version,
            coreVersion: packageJson.version,
            projectName,
            prefix,
          })
        )
      );
    }
  );
