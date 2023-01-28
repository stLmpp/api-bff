import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import fastGlob from 'fast-glob';

import {
  type Template,
  type TemplateOptions,
  type TemplateType,
} from './template.type.js';

function isNotNil<T>(template: T): template is NonNullable<T> {
  return template != null;
}

export async function getTemplates(
  type: TemplateType,
  options: TemplateOptions
): Promise<Template[]> {
  const templateFiles = await fastGlob(`templates/${type}/**/*.template`, {
    cwd: fileURLToPath(new URL('.', import.meta.url)),
    dot: true,
  });
  const templates = await Promise.all(
    templateFiles.map(async (path) => {
      if (options.exclude?.(path)) {
        return null;
      }
      const fullPath = fileURLToPath(new URL(path, import.meta.url));
      return {
        path: path
          .replace(new RegExp(`^/?templates/${type}/`), '')
          .replace(/\.template$/, ''),
        fullPath,
        content: await readFile(fullPath, {
          encoding: 'utf-8',
        }),
        type,
      };
    })
  );
  return templates.filter(isNotNil);
}
