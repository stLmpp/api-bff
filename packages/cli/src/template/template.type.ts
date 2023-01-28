export type TemplateType = 'base' | 'api';

export interface Template {
  path: string;
  content: string;
  type: TemplateType;
}

export type TemplateParams = { projectName: string } & Record<string, unknown>;

export interface TemplateOptions {
  exclude?: (path: string) => unknown;
}
