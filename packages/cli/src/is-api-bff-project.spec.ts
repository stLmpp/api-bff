import { join } from 'node:path';

import mock, { restore } from 'mock-fs';

import {
  get_api_bff_project_root,
  is_api_bff_project,
} from './is-api-bff-project.js';

describe('is-api-bff-project', () => {
  afterEach(() => {
    restore();
  });

  it('should get api bff project root path', async () => {
    mock({
      'api-bff.config.ts': '',
      src: {
        routes: {
          'GET.ts': '',
        },
      },
    });
    expect(
      await get_api_bff_project_root(join(process.cwd(), 'src/routes'))
    ).toBe(process.cwd());
  });

  it('should get null if non on api bff project', async () => {
    mock({ src: { routes: { 'GET.ts': '' } } });
    expect(
      await get_api_bff_project_root(join(process.cwd(), 'src/routes'))
    ).toBeNull();
  });

  it('should return if on a api bff project', async () => {
    mock({ 'api-bff.config.ts': '' });
    expect(await is_api_bff_project(process.cwd()));
  });
});
