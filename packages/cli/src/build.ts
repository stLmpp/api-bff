import { Command } from 'commander';
import { build } from 'esbuild';
import ora from 'ora';
import { rimraf } from 'rimraf';

import { getDefaultOptions } from './get-default-esbuild-options.js';

export const buildCommand = new Command('build')
  .alias('b')
  .description('Build your application for production')
  .action(async () => {
    const spinner = ora().start('Building for production');
    const [defaultOptions] = await Promise.all([
      getDefaultOptions(),
      rimraf('dist'),
    ]);
    await build({
      ...defaultOptions,
    });
    spinner.stopAndPersist({
      prefixText: '✅',
      text: `Build finished`,
    });
  });
