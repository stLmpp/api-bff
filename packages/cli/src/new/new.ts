import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { HttpClientTypeSchema } from '@api-bff/core';
import { Command, Option } from 'commander';
import { pathExists } from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import { simpleGit } from 'simple-git';
import { z } from 'zod';

import { createTemplateFiles } from '../template/create-file-from-template.js';

import {
  type Dependency,
  DependencyMap,
  HttpClientDependencies,
} from './dependencies.js';
import {
  installDependencies,
  PackageManagerSchema,
} from './package-manager.js';

const PackageManagerChoices = PackageManagerSchema.options.map(
  (item) => item.value
);
const HttpClientChoices = HttpClientTypeSchema.options.map(
  (item) => item.value
);

const NewCommandOptionsSchema = z.object({
  prefix: z.string(),
  packageManager: PackageManagerSchema.optional(),
  prettier: z.boolean().optional(),
  eslint: z.boolean().optional(),
  httpClient: HttpClientTypeSchema.optional(),
  skipGit: z.boolean().optional().default(false),
  testing: z.boolean().optional(),
});

export const newCommand = new Command('new')
  .alias('n')
  .description('Create a new applicaiton template')
  .argument('[name]', 'Name of the project', '')
  .option('-p, --prefix <string>', 'Prefix to all your end-points', 'api')
  .addOption(
    new Option(
      '-m, --package-manager <string>',
      'Package manager used by your application'
    ).choices(PackageManagerChoices)
  )
  .option('--prettier [boolean]', 'Add prettier')
  .option('--eslint [boolean]', 'Add eslint')
  .option('--testing [boolean]', 'Add unit testing with Vitest')
  .option('--skip-git [boolean]', 'Skip git initialization')
  .addOption(
    new Option('--http-client <string>', 'Http client used in the BFF').choices(
      HttpClientChoices
    )
  )
  .action(async (projectName: string, unparsedOptions) => {
    const options = await NewCommandOptionsSchema.parseAsync(unparsedOptions);
    if (!projectName) {
      const { _projectName } = await inquirer.prompt({
        name: '_projectName',
        type: 'input',
        message: () => `Project name: `,
        validate: (arg) =>
          /^[a-zA-Z_-]+(\d|[a-zA-Z_-])+?/.test(String(arg)) ||
          'Project name must start with a letter and only contain letters and numbers',
      });
      projectName = _projectName;
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
    if (!options.packageManager) {
      const { packageManager } = await inquirer.prompt({
        name: 'packageManager',
        type: 'list',
        choices: () => PackageManagerChoices,
        message: () => 'Choose your package manager',
      });
      options.packageManager = PackageManagerSchema.parse(packageManager);
    }
    if (!options.httpClient) {
      const { httpClient } = await inquirer.prompt({
        name: 'httpClient',
        type: 'list',
        choices: () => HttpClientChoices,
        message: () => 'Choose the Http client used to make requests',
      });
      options.httpClient = HttpClientTypeSchema.parse(httpClient);
    }
    const excludedFiles: (string | RegExp)[] = [];
    const dependencies: Dependency[] = [
      DependencyMap['@api-bff/core'],
      DependencyMap.zod,
    ];
    const devDependencies: Dependency[] = [
      DependencyMap['@api-bff/cli'],
      DependencyMap.typescript,
    ];
    const httpClientDependencies = HttpClientDependencies[options.httpClient];
    if (httpClientDependencies) {
      dependencies.push(...httpClientDependencies.dependencies);
      devDependencies.push(...httpClientDependencies.devDependencies);
    }
    if (typeof options.prettier === 'undefined') {
      const { prettier } = await inquirer.prompt({
        name: 'prettier',
        type: 'confirm',
        message: () => 'Add prettier?',
      });
      options.prettier = prettier;
    }
    if (options.prettier) {
      devDependencies.push(DependencyMap.prettier);
    } else {
      excludedFiles.push('.prettierrc');
    }
    if (typeof options.eslint === 'undefined') {
      const { eslint } = await inquirer.prompt({
        name: 'eslint',
        type: 'confirm',
        message: () => 'Add eslint?',
      });
      options.eslint = eslint;
    }
    if (options.eslint) {
      devDependencies.push(
        DependencyMap.eslint,
        DependencyMap['@typescript-eslint/eslint-plugin'],
        DependencyMap['@typescript-eslint/parser']
      );
    } else {
      excludedFiles.push('.eslintrc.cjs');
    }
    if (typeof options.testing === 'undefined') {
      const { testing } = await inquirer.prompt({
        name: 'testing',
        type: 'confirm',
        message: () => 'Add unit testing? (Vitest)',
      });
      options.testing = testing;
    }
    if (options.testing) {
      devDependencies.push(
        DependencyMap.vitest,
        DependencyMap['@vitest/coverage-c8']
      );
    } else {
      excludedFiles.push('vitest.config.ts', /\.spec.ts.template$/);
    }
    if (options.skipGit) {
      excludedFiles.push('.gitignore');
    }
    spinner.start(`Creating your project`);
    await mkdir(projectName);
    await createTemplateFiles(
      'base',
      {
        projectName,
        dependencies: dependencies.sort((depA, depB) =>
          depA.name.localeCompare(depB.name)
        ),
        devDependencies: devDependencies.sort((depA, depB) =>
          depA.name.localeCompare(depB.name)
        ),
        prefix: options.prefix,
        testing: options.testing,
      },
      {
        exclude: (path) => {
          if (!excludedFiles.length) {
            return false;
          }
          return excludedFiles.some((file) =>
            typeof file === 'string' ? path.includes(file) : file.test(path)
          );
        },
      }
    );
    spinner.stopAndPersist({
      prefixText: '✅',
      text: 'Project created!',
    });
    spinner.start('Installing dependencies');
    await installDependencies(resolve(projectName), options.packageManager);
    if (!options.skipGit) {
      const git = simpleGit(projectName);
      try {
        await git.status();
        // Probably is a git repository already
      } catch {
        await git.init();
      }
    }

    spinner.stopAndPersist({
      prefixText: '✅',
      text: 'Dependencies installed',
    });
    console.log(
      `Next step:\n\n` +
        `cd ${projectName}\n` +
        `Serve your application: ${options.packageManager}${
          options.packageManager === 'npm' ? 'run' : ''
        } serve`
    );
  });
