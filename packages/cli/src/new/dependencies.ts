import { type HttpClientType } from '@api-bff/core';

import CLIPackageJson from '../../package.json';

export interface Dependency {
  name: string;
  version: string;
}

export const DEPENDENCY_MAP: Readonly<Record<string, Dependency>> = {
  axios: { name: 'axios', version: '~1.3.1' },
  got: { name: 'got', version: '~12.5.3' },
  typescript: { name: 'typescript', version: '~4.9.4' },
  vitest: { name: 'vitest', version: '~0.28.3' },
  '@vitest/coverage-c8': { name: '@vitest/coverage-c8', version: '~0.28.3' },
  zod: { name: 'zod', version: '~3.20.2' },
  prettier: { name: 'prettier', version: '~2.8.3' },
  eslint: { name: 'eslint', version: '~8.32.0' },
  '@typescript-eslint/eslint-plugin': {
    name: '@typescript-eslint/eslint-plugin',
    version: '~5.49.0',
  },
  '@typescript-eslint/parser': {
    name: '@typescript-eslint/parser',
    version: '~5.49.0',
  },
  '@api-bff/core': {
    name: '@api-bff/core',
    version: `~${CLIPackageJson.version}`,
  },
  '@api-bff/cli': {
    name: '@api-bff/cli',
    version: `~${CLIPackageJson.version}`,
  },
};

export const HTTP_CLIENT_DEPENDENCIES: Readonly<
  Record<
    HttpClientType,
    { dependencies: Dependency[]; dev_dependencies: Dependency[] } | null
  >
> = {
  axios: {
    dependencies: [DEPENDENCY_MAP.axios],
    dev_dependencies: [],
  },
  got: {
    dependencies: [DEPENDENCY_MAP.got],
    dev_dependencies: [],
  },
  fetch: null,
};
