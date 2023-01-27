import { type ChildProcess, spawn } from 'child_process';

import { Command } from 'commander';
import { context, type Plugin } from 'esbuild';
import ora from 'ora';
import { rimraf } from 'rimraf';

import { typecheckingPlugin } from '../typechecking-plugin.js';

import { getDefaultOptions } from './get-default-esbuild-options.js';

const serverPlugin = () =>
  ({
    name: 'api-bff-serve',
    setup: (build) => {
      let nodeProgram: ChildProcess | null = null;
      const spinner = ora();
      const clearProgram = () => {
        if (nodeProgram) {
          nodeProgram.kill();
          nodeProgram = null;
        }
      };
      build.onEnd((buildResult) => {
        clearProgram();
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
        nodeProgram = spawn('node', ['dist/src/main.js'], {
          env: process.env,
          stdio: 'inherit',
        });
      });
      build.onDispose(() => {
        clearProgram();
      });
      let count = 0;
      build.onStart(() => {
        spinner.start(count ? 'Rebuilding...' : 'Building...');
        count++;
      });
    },
  } satisfies Plugin);

export const devCommand = new Command('serve')
  .alias('s')
  .description('Development server')
  .action(async () => {
    const [defaultOptions] = await Promise.all([
      getDefaultOptions(),
      rimraf('dist'),
    ]);
    defaultOptions.plugins.push(serverPlugin(), typecheckingPlugin());
    const result = await context({
      ...defaultOptions,
      sourcemap: true,
      minify: false,
    });
    await result.watch();
  });
