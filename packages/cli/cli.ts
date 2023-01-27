#!/usr/bin/env node
import { program } from 'commander';

import packageJson from './package.json';
import { buildCommand } from './src/build.js';
import { newCommand } from './src/new/new.js';
import { devCommand } from './src/serve.js';

program
  .name('Api BFF CLI')
  .description('CLI to help create new Api BFF applications')
  .version(packageJson.version)
  .addCommand(newCommand)
  .addCommand(devCommand)
  .addCommand(buildCommand)
  .parse();
