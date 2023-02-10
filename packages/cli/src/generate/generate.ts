import { Command } from 'commander';

import { generate_end_point_command } from './end-point.js';

export const generate_command = new Command('generate')
  .alias('g')
  .description('Generate templates')
  .addCommand(generate_end_point_command);
