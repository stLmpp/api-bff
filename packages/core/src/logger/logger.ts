import { noop } from 'rxjs';

import { getConfig } from '../config/config.js';
import { is_array } from '../is-array.js';

import {
  CONSOLE_METHODS,
  ConsoleColor,
  ConsoleLevelColor,
  consoleLogFactory,
  type ConsoleMethod,
} from './console.js';
import { LoggerFile } from './logger-file.js';

export enum LoggerLevel {
  log,
  warn,
  error,
}

function is_date(value: unknown): value is Date {
  return Object.prototype.toString.call(value) === '[object Date]';
}

function is_reg_exp(value: unknown): value is RegExp {
  return Object.prototype.toString.call(value) === '[object RegExp]';
}

const INDENT_JSON_STRINGIFY = 4;

export class Logger {
  private constructor(private readonly prefix?: string) {
    this._init();
  }

  private temporary_queue: [ConsoleMethod, unknown[]][] | null = [];
  private temporary_queue_factory:
    | ((
        type: ConsoleMethod
      ) => typeof console.log | typeof console.warn | typeof console.error)
    | null =
    (type) =>
    (...args) => {
      this.temporary_queue?.push([type, args]);
    };

  private async _init(): Promise<void> {
    const { logger } = await getConfig();
    const level = logger.level;
    for (const method of CONSOLE_METHODS) {
      const methodLevel = LoggerLevel[method];
      if (level > methodLevel) {
        this[method] = noop;
        continue;
      }
      const date = new Date();
      const dateString = date.toLocaleDateString('fr-CA');
      const timeString = date.toLocaleTimeString('pt-BR');
      this[method] = (...args: unknown[]) => {
        const prefixArgs = [
          `[${dateString} ${timeString}] ${ConsoleLevelColor[method]}${method}${ConsoleColor.Reset}`,
        ];
        if (this.prefix) {
          prefixArgs.push(
            ConsoleColor.FgMagenta,
            this.prefix,
            ConsoleColor.Reset
          );
        }
        const finalArgs = [
          ...prefixArgs,
          ConsoleLevelColor[method],
          ...args,
          ConsoleColor.Reset,
        ];
        Logger._persist(finalArgs);
        // eslint-disable-next-line no-console
        return console[method](...finalArgs);
      };
    }
    for (const [method, args] of this.temporary_queue ?? []) {
      this[method](...args);
    }
    this.temporary_queue = null;
    this.temporary_queue_factory = null;
  }

  log: typeof console.log = this.temporary_queue_factory!('log');
  warn: typeof console.warn = this.temporary_queue_factory!('warn');
  error: typeof console.error = this.temporary_queue_factory!('error');

  static log = consoleLogFactory('log');
  static warn = consoleLogFactory('warn');
  static error = consoleLogFactory('error');

  private static async _persist(args: unknown[]): Promise<void> {
    const { logger } = await getConfig();
    if (!logger.persistent) {
      return;
    }
    const content = args
      .reduce((acc: string, item) => {
        if (typeof item === 'string') {
          acc += item;
        } else if (
          ['number', 'symbol', 'boolean'].includes(typeof item) ||
          item == null
        ) {
          acc += String(item);
        } else if (is_date(item)) {
          acc += item.toISOString();
        } else if (is_reg_exp(item)) {
          acc += `/${item.source}/${String(item.flags)}`;
        } else if (is_array(item) || (typeof item === 'object' && item)) {
          acc += JSON.stringify(item, null, INDENT_JSON_STRINGIFY);
        }
        return acc;
      }, '')
      .replace(
        // eslint-disable-next-line no-control-regex -- remove all colors from log messages
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
        ' '
      );
    LoggerFile.instance.enqueue(content);
  }

  static create(prefix: unknown): Logger {
    let name: string | undefined;
    if (typeof prefix === 'string') {
      name = prefix;
    } else if (typeof prefix === 'function') {
      const descriptor = Object.getOwnPropertyDescriptor(prefix, 'prototype');
      if (prefix.name && descriptor?.writable) {
        name = prefix.name;
      } else {
        return this.create(prefix());
      }
      name = prefix.name;
    } else if (typeof prefix === 'object' && prefix) {
      name = Object.getPrototypeOf(prefix)?.constructor?.name;
    }
    return new Logger(name);
  }
}
