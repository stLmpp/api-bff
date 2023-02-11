import { z } from 'zod';

import { LoggerLevel } from '../logger/logger.js';

const logger_level_enum = z.enum(['LOG', 'WARN', 'ERROR']);

const logger_level_number_table: Record<
  z.infer<typeof logger_level_enum>,
  LoggerLevel
> = {
  LOG: LoggerLevel.log,
  WARN: LoggerLevel.warn,
  ERROR: LoggerLevel.error,
};

export const config_logger_schema = z.object({
  persistent: z.boolean().optional().default(true),
  persistencePath: z.string().optional().default('logs'),
  level: z
    .enum(['LOG', 'WARN', 'ERROR'])
    .optional()
    .default('LOG')
    .transform((level) => logger_level_number_table[level]),
});
