import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

import { HttpClientTypeSchema } from '@api-bff/core';
import { Command, Option } from 'commander';
import { pathExists } from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import { simpleGit } from 'simple-git';
import { z } from 'zod';

import { create_template_files } from '../template/create-file-from-template.js';

import {
  type Dependency,
  DEPENDENCY_MAP,
  HTTP_CLIENT_DEPENDENCIES,
} from './dependencies.js';
import {
  install_dependencies,
  package_manager_schema,
} from './package-manager.js';

const package_manager_choices = package_manager_schema.options;
const http_client_choices = HttpClientTypeSchema.options;

const new_command_options_schema = z.object({
  prefix: z.string(),
  packageManager: package_manager_schema.optional(),
  prettier: z.boolean().optional(),
  eslint: z.boolean().optional(),
  httpClient: HttpClientTypeSchema.optional(),
  skipGit: z.boolean().optional().default(false),
  testing: z.boolean().optional(),
});

export const new_command = new Command('new')
  .alias('n')
  .description('Create a new applicaiton template')
  .argument('[name]', 'Name of the project', '')
  .option('-p, --prefix <string>', 'Prefix to all your end-points', 'api')
  .addOption(
    new Option(
      '-m, --package-manager <string>',
      'Package manager used by your application'
    ).choices(package_manager_choices)
  )
  .option('--prettier [boolean]', 'Add prettier')
  .option('--eslint [boolean]', 'Add eslint')
  .option('--testing [boolean]', 'Add unit testing with Vitest')
  .option('--skip-git [boolean]', 'Skip git initialization')
  .addOption(
    new Option('--http-client <string>', 'Http client used in the BFF').choices(
      http_client_choices
    )
  )
  .action(async (project_name: string, unparsed_options) => {
    const options = await new_command_options_schema.parseAsync(
      unparsed_options
    );
    if (!project_name) {
      const { _project_name } = await inquirer.prompt({
        name: '_project_name',
        type: 'input',
        message: () => `Project name: `,
        validate: (arg) =>
          /^[a-zA-Z_-]+(\d|[a-zA-Z_-])+?/.test(String(arg)) ||
          'Project name must start with a letter and only contain letters and numbers',
      });
      project_name = _project_name;
    }
    const spinner = ora();
    spinner.start(`Checking if folder "${project_name}" already exists`);
    const exists = await pathExists(project_name);
    if (exists) {
      await rm(project_name, { force: true, recursive: true }); // TODO remove
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
        choices: () => package_manager_choices,
        message: () => 'Choose your package manager',
      });
      options.packageManager = package_manager_schema.parse(packageManager);
    }
    if (!options.httpClient) {
      const { http_client } = await inquirer.prompt({
        name: 'http_client',
        type: 'list',
        choices: () => http_client_choices,
        message: () => 'Choose the Http client used to make requests',
      });
      options.httpClient = HttpClientTypeSchema.parse(http_client);
    }
    const excluded_template_files: (string | RegExp)[] = [];
    const dependencies: Dependency[] = [
      DEPENDENCY_MAP['@api-bff/core'],
      DEPENDENCY_MAP.zod,
    ];
    const dev_dependencies: Dependency[] = [
      DEPENDENCY_MAP['@api-bff/cli'],
      DEPENDENCY_MAP.typescript,
    ];
    const http_client_dependencies =
      HTTP_CLIENT_DEPENDENCIES[options.httpClient];
    if (http_client_dependencies) {
      dependencies.push(...http_client_dependencies.dependencies);
      dev_dependencies.push(...http_client_dependencies.dev_dependencies);
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
      dev_dependencies.push(DEPENDENCY_MAP.prettier);
    } else {
      excluded_template_files.push('.prettierrc');
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
      dev_dependencies.push(
        DEPENDENCY_MAP.eslint,
        DEPENDENCY_MAP['@typescript-eslint/eslint-plugin'],
        DEPENDENCY_MAP['@typescript-eslint/parser']
      );
    } else {
      excluded_template_files.push('.eslintrc.cjs');
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
      dev_dependencies.push(
        DEPENDENCY_MAP.vitest,
        DEPENDENCY_MAP['@vitest/coverage-c8']
      );
    } else {
      excluded_template_files.push('vitest.config.ts', /\.spec.ts.template$/);
    }
    if (options.skipGit) {
      excluded_template_files.push('.gitignore');
    }
    spinner.start(`Creating your project`);
    await mkdir(project_name);
    await create_template_files(
      'base',
      {
        projectName: project_name,
        dependencies: dependencies.sort((depA, depB) =>
          depA.name.localeCompare(depB.name)
        ),
        devDependencies: dev_dependencies.sort((depA, depB) =>
          depA.name.localeCompare(depB.name)
        ),
        prefix: options.prefix,
        testing: options.testing,
      },
      {
        exclude: (path) => {
          if (!excluded_template_files.length) {
            return false;
          }
          return excluded_template_files.some((file) =>
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
    await install_dependencies(resolve(project_name), options.packageManager);
    if (!options.skipGit) {
      const git = simpleGit(project_name);
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
        `cd ${project_name}\n` +
        `Serve your application: ${options.packageManager}${
          options.packageManager === 'npm' ? 'run' : ''
        } dev`
    );
  });
