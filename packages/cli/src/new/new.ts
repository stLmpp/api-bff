import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Command, Option } from 'commander';
import { pathExists } from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import { simpleGit } from 'simple-git';
import { z } from 'zod';

import BasePackageJson from '../../../../package.json';
import CLIPackageJson from '../../package.json';
import { createTemplateFiles } from '../template/create-file-from-template.js';

import {
  installDependencies,
  PackageManagerSchema,
} from './package-manager.js';

const HttpClientSchema = z.union([
  z.literal('fetch'),
  z.literal('axios'),
  z.literal('got'),
]);

const PackageManagerChoices = PackageManagerSchema.options.map(
  (item) => item.value
);
const HttpClientChoices = HttpClientSchema.options.map((item) => item.value);

const NewCommandOptionsSchema = z.object({
  prefix: z.string(),
  packageManager: PackageManagerSchema.optional(),
  prettier: z.boolean().optional(),
  eslint: z.boolean().optional(),
  httpClient: HttpClientSchema.optional(),
  skipGit: z.boolean().optional().default(false),
});

const httpClientDependency = {
  axios: {
    dependencies: [{ name: 'axios', version: '~1.2.6' }],
    devDependencies: [],
  },
  got: {
    dependencies: [{ name: 'got', version: '~12.5.3' }],
    devDependencies: [],
  },
  fetch: null,
} as const;

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
      options.httpClient = HttpClientSchema.parse(httpClient);
    }
    // TODO add unit testing
    // TODO add gitignore
    const excludedFiles: string[] = [];
    const dependencies = [
      { name: '@api-bff/core', version: `~${CLIPackageJson.version}` },
      { name: 'zod', version: CLIPackageJson.dependencies.zod },
    ];
    const devDependencies = [
      { name: '@api-bff/cli', version: `~${CLIPackageJson.version}` },
      {
        name: 'typescript',
        version: BasePackageJson.devDependencies.typescript,
      },
    ];
    const httpClientDependencies = httpClientDependency[options.httpClient];
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
      devDependencies.push({
        name: 'prettier',
        version: BasePackageJson.devDependencies.prettier,
      });
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
        {
          name: 'eslint',
          version: BasePackageJson.devDependencies.eslint,
        },
        {
          name: '@typescript-eslint/eslint-plugin',
          version:
            BasePackageJson.devDependencies['@typescript-eslint/eslint-plugin'],
        },
        {
          name: '@typescript-eslint/parser',
          version: BasePackageJson.devDependencies['@typescript-eslint/parser'],
        }
      );
    } else {
      excludedFiles.push('.eslintrc.js');
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
      },
      {
        exclude: (path) => {
          if (!excludedFiles.length) {
            return false;
          }
          return excludedFiles.some((file) => path.includes(file));
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
