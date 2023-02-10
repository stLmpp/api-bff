import { join } from 'node:path';

import { type Method, MethodSchema } from '@api-bff/core';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { z } from 'zod';

import {
  get_api_bff_project_root,
  is_api_bff_project,
} from '../is-api-bff-project.js';
import { create_template_files } from '../template/create-file-from-template.js';

const generate_command_options_schema = z.object({
  methods: z.array(MethodSchema).optional(),
  path: z.string().optional(),
  host: z.string().optional(),
});

const method_schema_choices = MethodSchema.options;

function normalize_path(path: string): string {
  return path
    .split('/')
    .map((item) => {
      if (item.startsWith('{')) {
        item = item.replace('{', '[').replace('}', ']');
      }
      if (item.startsWith(':')) {
        item = `[${item.slice(1)}]`;
      }
      return item;
    })
    .join('/');
}

export const generate_end_point_command = new Command('end-point')
  .alias('e')
  .argument('[module]', 'Module inside routes')
  .option('-h, --host <string>', 'End-point host')
  .option('-p, --path <string>', 'End-point path')
  .option('--methods <string>', 'Methods to include', (value) =>
    value
      .split(',')
      .map((item) => item.trim().toUpperCase())
      .filter((item) => method_schema_choices.includes(item as Method))
  )
  .action(async (moduleName: string | undefined, unparsed_options) => {
    const root_path =
      (await get_api_bff_project_root(process.cwd())) ?? process.cwd();
    const is_api_bff = await is_api_bff_project(root_path);
    if (!is_api_bff) {
      console.error('Not in a API BFF Project');
      return;
    }
    let { methods, host, path } =
      await generate_command_options_schema.parseAsync(unparsed_options);
    if (!methods?.length) {
      const { _methods } = await inquirer.prompt({
        name: '_methods',
        message: 'Choose the HTTP methods',
        choices: () => method_schema_choices,
        type: 'checkbox',
      });
      methods = _methods;
    }
    const excluded_template_files = method_schema_choices.filter(
      (method) => !methods!.includes(method)
    );
    if (!host) {
      const { _host } = await inquirer.prompt({
        name: '_host',
        message: () => 'What is the host?',
      });
      host = _host;
    }
    if (!path) {
      const { _path } = await inquirer.prompt({
        name: '_path',
        message: () => 'What is the path?',
      });
      path = _path;
    }
    await create_template_files(
      'end-point',
      {
        projectName: '',
        host,
        path,
      },
      {
        root: root_path,
        path: join('src/routes', normalize_path(moduleName ?? '')),
        exclude: (filePath) => {
          if (!excluded_template_files.length) {
            return false;
          }
          return excluded_template_files.some((file) =>
            filePath.includes(file)
          );
        },
      }
    );
  });
