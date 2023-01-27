import { readFile } from 'node:fs/promises';

import { outputFile } from 'fs-extra';

interface Params {
  projectName: string;
  cliVersion: string;
  coreVersion: string;
  prefix: string;
  typescriptVersion: string;
  zodVersion: string;
}

async function replaceFileWithParams(
  path: string,
  params: Params
): Promise<string> {
  let file = await readFile(path, { encoding: 'utf-8' });
  for (const [key, value] of Object.entries(params)) {
    file = file.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return file;
}

export async function createFileFromTemplate(
  path: string,
  params: Params
): Promise<void> {
  const file = await replaceFileWithParams(path, params);
  const newPath = `${params.projectName}/${path
    .replace(new URL('.', import.meta.url).pathname.replace(/^\//, ''), '')
    .replace('templates/base', '')
    .replace('.template', '')}`;
  await outputFile(newPath, file);
}
