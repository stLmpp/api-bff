#!/usr/bin/env node
import { program } from 'commander';

import { buildCommand } from './build.js';
import { devCommand } from './dev.js';
import { newCommand } from './new.js';
import packageJson from './package.json';

program
  .name('Api BFF CLI')
  .description('CLI to help create new Api BFF applications')
  .version(packageJson.version)
  .addCommand(newCommand)
  .addCommand(devCommand)
  .addCommand(buildCommand);

program.parse();
