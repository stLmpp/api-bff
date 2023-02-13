import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import mock, { restore } from 'mock-fs';

import { get_templates } from './get-templates.js';
import { type Template } from './template.type.js';

describe('get-templates', () => {
  const templatesPath = fileURLToPath(new URL('templates', import.meta.url));

  afterEach(() => {
    restore();
  });

  it('should get templates', async () => {
    mock({
      [templatesPath]: {
        base: {
          'template1.ts.template': 'export default {}',
        },
      },
    });
    const templates = await get_templates('base', {});
    const expected: Template[] = [
      {
        type: 'base',
        path: 'template1.ts',
        full_path: join(templatesPath, 'base', 'template1.ts.template'),
        content: 'export default {}',
      },
    ];
    expect(templates).toEqual(expected);
  });

  it('should exclude files with callback', async () => {
    mock({
      [templatesPath]: {
        base: {
          'template1.ts.template': 'export default {}',
          'not-this-template.ts.template': '',
        },
      },
    });
    const templates = await get_templates('base', {
      exclude: (path) => path.includes('not-this-template'),
    });
    const expected: Template[] = [
      {
        type: 'base',
        path: 'template1.ts',
        full_path: join(templatesPath, 'base', 'template1.ts.template'),
        content: 'export default {}',
      },
    ];
    expect(templates).toEqual(expected);
  });
});
