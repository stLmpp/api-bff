import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Command } from 'commander';
import fastGlob from 'fast-glob';
import { pathExists } from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import { z } from 'zod';

import BasePackageJson from '../../../../package.json';
import CLIPackageJson from '../../package.json';

import {
  installDependencies,
  PackageManagerSchema,
} from './package-manager.js';
import { createFileFromTemplate } from './template.js';

const NewCommandOptionsSchema = z.object({
  prefix: z.string(),
  packageManager: PackageManagerSchema.optional(),
});

export const newCommand = new Command('new')
  .alias('n')
  .description('Create a new applicaiton template')
  .argument('[name]', 'Name of the project', '')
  .option('-p, --prefix <string>', 'Prefix to all your end-points', 'api')
  .option(
    '-m, --package-manager <string>',
    'Package manager used by your application'
  )
  .action(async (projectName: string, options) => {
    let { prefix, packageManager } = await NewCommandOptionsSchema.parseAsync(
      options
    );
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
    const spinner = ora();
    spinner.start(`Checking if folder "${projectName}" already exists`);
    const exists = await pathExists(projectName);
    if (exists) {
      await rm(projectName, { force: true, recursive: true }); // TODO remove
      // spinner.stopAndPersist({
      //   prefix: '❌'
      //   text: `Folder with "${projectName}" already exists.`,
      // });
      // return;
    }
    spinner.stop();
    if (!packageManager) {
      const result = await inquirer.prompt([
        {
          name: 'packageManager',
          type: 'list',
          choices: () => PackageManagerSchema.options.map((item) => item.value),
          message: () => 'Choose your package manager',
        },
      ]);
      packageManager = PackageManagerSchema.parse(result.packageManager);
    }
    // TODO add unit testing
    // TODO add eslint
    // TODO add prettier
    spinner.start(`Creating your project`);
    await mkdir(projectName);
    const url = new URL('templates/base/**/*.template', import.meta.url);
    const templateFiles = await fastGlob(url.pathname.replace(/^\//, ''));
    await Promise.all(
      templateFiles.map((file) =>
        createFileFromTemplate(file, {
          cliVersion: CLIPackageJson.version,
          coreVersion: CLIPackageJson.version,
          projectName,
          prefix,
          typescriptVersion: BasePackageJson.devDependencies.typescript,
          zodVersion: CLIPackageJson.dependencies.zod,
        })
      )
    );
    spinner.stopAndPersist({
      prefixText: '✅',
      text: 'Project created!',
    });
    spinner.start('Installing dependencies');
    await installDependencies(resolve(projectName), packageManager);
    spinner.stopAndPersist({
      prefixText: '✅',
      text: 'Dependencies installed',
    });
    console.log(
      `Next step:\n\n` +
        `cd ${projectName}\n` +
        `Serve your application: ${packageManager}${
          packageManager === 'npm' ? 'run' : ''
        } serve`
    );
  });
