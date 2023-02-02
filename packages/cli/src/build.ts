import { Command } from 'commander';
import { build } from 'esbuild';
import ora from 'ora';
import { rimraf } from 'rimraf';

import { get_default_esbuild_options } from './get-default-esbuild-options.js';

export const build_command = new Command('build')
  .alias('b')
  .description('Build your application for production')
  .action(async () => {
    const spinner = ora().start('Building for production');
    const [default_options] = await Promise.all([
      get_default_esbuild_options(),
      rimraf('dist'),
    ]);
    await build({
      ...default_options,
    });
    spinner.stopAndPersist({
      prefixText: '✅',
      text: `Build finished`,
    });
  });
