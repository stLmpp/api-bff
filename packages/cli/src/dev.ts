import { type ChildProcess, spawn } from 'child_process';

import { Command } from 'commander';
import { context, type Plugin } from 'esbuild';
import ora from 'ora';
import { rimraf } from 'rimraf';

import { typechecking_plugin } from '../typechecking-plugin.js';

import { get_default_esbuild_options } from './get-default-esbuild-options.js';
import { is_api_bff_project } from './is-api-bff-project.js';

function dev_plugin(): Plugin {
  return {
    name: 'api-bff-serve',
    setup: (build) => {
      let nodeProgram: ChildProcess | null = null;
      const spinner = ora();
      const clear_program = (): void => {
        if (nodeProgram) {
          nodeProgram.kill();
          nodeProgram = null;
        }
      };
      build.onEnd((buildResult) => {
        clear_program();
        if (buildResult.errors.length) {
          spinner.stopAndPersist({
            prefixText: '❌',
            text: 'Error ocurred while building',
          });
          return;
        }
        spinner.stopAndPersist({
          prefixText: '✅',
          text: 'Build finished, starting program',
        });
        nodeProgram = spawn(
          'node',
          [
            '--enable-source-maps',
            '--title',
            'API BFF Dev mode',
            '--trace-warnings',
            'dist/src/main.js',
          ],
          {
            env: process.env,
            stdio: 'inherit',
          }
        );
      });
      build.onDispose(() => {
        clear_program();
      });
      let count = 0;
      build.onStart(() => {
        spinner.start(count ? 'Rebuilding...' : 'Building...');
        count++;
      });
    },
  };
}
export const dev_command = new Command('dev')
  .description('Development server')
  .action(async () => {
    const isApiBffProject = await is_api_bff_project(process.cwd());
    if (!isApiBffProject) {
      console.error('Not in a API BFF Project');
      return;
    }
    const [defaultOptions] = await Promise.all([
      get_default_esbuild_options(),
      rimraf('dist'),
    ]);
    defaultOptions.plugins.push(dev_plugin(), typechecking_plugin());
    const result = await context({
      ...defaultOptions,
      sourcemap: true,
      minify: false,
    });
    await result.watch();
  });
