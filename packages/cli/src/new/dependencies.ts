import { type HttpClientType } from '@api-bff/core';

import CLIPackageJson from '../../package.json';

import DEPENDENCIES_JSON from './dependencies.json';

export interface Dependency {
  name: string;
  version: string;
}

export const DEPENDENCY_MAP: Readonly<Record<string, Dependency>> =
  Object.entries({
    ...DEPENDENCIES_JSON,
    '@api-bff/cli': `~${CLIPackageJson.version}`,
    '@api-bff/core': `~${CLIPackageJson.dependencies['@api-bff/core']}`,
  }).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: { name: key, version: value } }),
    {}
  );

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
