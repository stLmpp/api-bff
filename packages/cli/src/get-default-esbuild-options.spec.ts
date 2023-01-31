import mock, { restore } from 'mock-fs';
import { afterEach } from 'vitest';

import { getDefaultOptions } from './get-default-esbuild-options.js';

describe('get-default-esbuild-options', () => {
  afterEach(() => {
    restore();
  });

  it('should check if glob is correct for routes', async () => {
    mock({
      src: {
        'main.ts': '',
        routes: {
          'GET.ts': '',
          todos: {
            '[id]': {
              'GET.ts': '',
              delete: { 'DELETE.ts': '' },
            },
          },
        },
      },
      'api-bff.config.ts': '',
    });
    const defaultOptions = await getDefaultOptions();
    expect(defaultOptions).toEqual(
      expect.objectContaining({
        entryPoints: expect.arrayContaining([
          'src/main.ts',
          'src/routes/GET.ts',
          'src/routes/todos/[id]/GET.ts',
          'src/routes/todos/[id]/delete/DELETE.ts',
          'api-bff.config.ts',
        ]),
      })
    );
  });
});
