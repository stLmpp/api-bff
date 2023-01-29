import { join } from 'node:path';

import { outputFile } from 'fs-extra';
import handlebars from 'handlebars';

import { getTemplates } from './get-templates.js';
import {
  type Template,
  type TemplateOptions,
  type TemplateParams,
  type TemplateType,
} from './template.type.js';

async function replaceFileWithParams(
  file: string,
  params: TemplateParams
): Promise<string> {
  return handlebars.compile(file)(params);
}

export async function createFileFromTemplate(
  template: Template,
  params: TemplateParams
): Promise<void> {
  const file = await replaceFileWithParams(template.content, params);
  await outputFile(
    join(process.cwd(), params.projectName, template.path),
    file
  );
}

export async function createFilesFromTemplates(
  templates: Template[],
  params: TemplateParams
) {
  await Promise.all(
    templates.map((template) => createFileFromTemplate(template, params))
  );
}

export async function createTemplateFiles(
  type: TemplateType,
  params: TemplateParams,
  options: TemplateOptions = {}
) {
  const templates = await getTemplates(type, options);
  await createFilesFromTemplates(templates, params);
}
