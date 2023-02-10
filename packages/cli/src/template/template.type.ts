export type TemplateType = 'base' | 'end-point';

export interface Template {
  path: string;
  content: string;
  type: TemplateType;
  full_path: string;
}

export type TemplateParams = { projectName: string } & Record<string, unknown>;

export interface TemplateOptions {
  exclude?: (path: string) => unknown;
  path?: string;
  root?: string;
}
