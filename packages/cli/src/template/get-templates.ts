import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import fastGlob from 'fast-glob';

import {
  type Template,
  type TemplateOptions,
  type TemplateType,
} from './template.type.js';

function is_not_nil<T>(template: T): template is NonNullable<T> {
  return template != null;
}

export async function get_templates(
  type: TemplateType,
  options: TemplateOptions
): Promise<Template[]> {
  const template_files = await fastGlob(`templates/${type}/**/*.template`, {
    cwd: fileURLToPath(new URL('.', import.meta.url)),
    dot: true,
  });
  const templates = await Promise.all(
    template_files.map(async (path) => {
      if (options.exclude?.(path)) {
        return null;
      }
      const full_path = fileURLToPath(new URL(path, import.meta.url));
      return {
        path: path
          .replace(new RegExp(`^/?templates/${type}/`), '')
          .replace(/\.template$/, ''),
        full_path,
        content: await readFile(full_path, {
          encoding: 'utf-8',
        }),
        type,
      };
    })
  );
  return templates.filter(is_not_nil);
}
