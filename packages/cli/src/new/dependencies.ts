import { type HttpClientType } from '@api-bff/core';

import CLIPackageJson from '../../package.json';

export interface Dependency {
  name: string;
  version: string;
}

export const DependencyMap: Readonly<Record<string, Dependency>> = {
  axios: { name: 'axios', version: '~1.2.6' },
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

export const HttpClientDependencies: Readonly<
  Record<
    HttpClientType,
    { dependencies: Dependency[]; devDependencies: Dependency[] } | null
  >
> = {
  axios: {
    dependencies: [DependencyMap.axios],
    devDependencies: [],
  },
  got: {
    dependencies: [DependencyMap.got],
    devDependencies: [],
  },
  fetch: null,
};
