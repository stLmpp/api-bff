import { join } from 'node:path';

import { outputFile } from 'fs-extra';
import handlebars from 'handlebars';

import { get_templates } from './get-templates.js';
import {
  type Template,
  type TemplateOptions,
  type TemplateParams,
  type TemplateType,
} from './template.type.js';

async function replace_file_with_params(
  file: string,
  params: TemplateParams
): Promise<string> {
  return handlebars.compile(file)(params);
}

async function create_file_from_template(
  template: Template,
  params: TemplateParams,
  options: TemplateOptions
): Promise<void> {
  const file = await replace_file_with_params(template.content, params);
  await outputFile(
    join(
      options.root ?? process.cwd(),
      params.projectName,
      options.path ?? '',
      template.path
    ),
    file
  );
}

async function create_files_from_templates(
  templates: Template[],
  params: TemplateParams,
  options: TemplateOptions
): Promise<void> {
  await Promise.all(
    templates.map((template) =>
      create_file_from_template(template, params, options)
    )
  );
}

export async function create_template_files(
  type: TemplateType,
  params: TemplateParams,
  options: TemplateOptions = {}
): Promise<void> {
  const templates = await get_templates(type, options);
  await create_files_from_templates(templates, params, options);
}
