import { readFile } from 'fs/promises';
import { join } from 'path';

import { outputFile, pathExists } from 'fs-extra';
import { auditTime, BehaviorSubject, concatMap, filter } from 'rxjs';

import { getConfig } from '../config/config.js';

const AUDIT_TIME_PERSISTENCE_MS = 2_500;

export class LoggerFile {
  private constructor() {
    this._init();
  }

  private readonly _queue$ = new BehaviorSubject<string[]>([]);

  private _init(): void {
    this._queue$
      .pipe(
        filter((contents) => !!contents.length),
        auditTime(AUDIT_TIME_PERSISTENCE_MS),
        concatMap((logContent) => {
          this._queue$.next([]);
          return this._saveContent(logContent);
        })
      )
      .subscribe();
  }

  private async get_file_path(): Promise<string> {
    const { logger } = await getConfig();
    return join(
      logger.persistencePath,
      `${new Date().toLocaleDateString('fr-CA')}.log`
    );
  }

  private async get_file(path: string): Promise<string> {
    let file = '';
    if (await pathExists(path)) {
      file = await readFile(path, { encoding: 'utf-8' });
    }
    return file;
  }

  private async _saveContent(contents: string[]): Promise<void> {
    try {
      const file_path = await this.get_file_path();
      const file = await this.get_file(file_path);
      await outputFile(file_path, `${file}${contents.join('\n')}\n`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Could not save log files', error);
    }
  }

  enqueue(content: string): void {
    this._queue$.next([...this._queue$.value, content]);
  }

  static readonly instance = new LoggerFile();
}
