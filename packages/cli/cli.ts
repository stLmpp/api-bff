#!/usr/bin/env node
import { program } from 'commander';

import package_json from './package.json';
import { build_command } from './src/build.js';
import { dev_command } from './src/dev.js';
import { new_command } from './src/new/new.js';

program
  .name('Api BFF CLI')
  .description('CLI to help create new Api BFF applications')
  .version(package_json.version)
  .addCommand(new_command)
  .addCommand(dev_command)
  .addCommand(build_command)
  .parseAsync();
