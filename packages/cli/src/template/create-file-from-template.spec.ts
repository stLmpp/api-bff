import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pathExists } from 'fs-extra';
import mock, { restore } from 'mock-fs';

import { create_template_files } from './create-file-from-template.js';

vi.mock('handlebars', () => ({
  default: {
    compile: (file: string) => (params: Record<string, string>) => {
      for (const [key, value] of Object.entries(params)) {
        file = file.replaceAll(new RegExp(`{{ ?${key} ?}}`, 'g'), value);
      }
      return file;
    },
  },
}));

describe('create-file-from-template', () => {
  const templatesPath = fileURLToPath(new URL('templates', import.meta.url));

  afterEach(() => {
    restore();
  });

  it('should create files from templates', async () => {
    mock({
      [templatesPath]: {
        base: {
          'template1.ts.template': `export default { prefix: '{{ prefix }}' }`,
        },
      },
    });
    await create_template_files('base', {
      projectName: '',
      prefix: 'this-is-prefix',
    });
    expect(await pathExists(join(process.cwd(), 'template1.ts'))).toBe(true);
    expect(
      await readFile(join(process.cwd(), 'template1.ts'), { encoding: 'utf-8' })
    ).toBe(`export default { prefix: 'this-is-prefix' }`);
  });
});
