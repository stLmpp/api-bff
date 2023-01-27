import { spawnSync } from 'child_process';

import { type Plugin } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { copy } from 'esbuild-plugin-copy';
import { defineConfig } from 'tsup';

const npmLinkPlugin = () =>
  ({
    name: 'npm-link',
    setup: (build) => {
      build.onEnd(() => {
        spawnSync('npm', ['link']);
      });
    },
  } satisfies Plugin);

export default defineConfig((options) => {
  const plugins = [
    nodeExternalsPlugin(),
    copy({
      assets: [{ from: './templates/**/*', to: './templates' }],
    }),
  ];
  if (options.watch) {
    plugins.push(npmLinkPlugin());
  }
  return {
    entry: ['cli.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    sourcemap: true,
    minify: false,
    esbuildPlugins: plugins,
  };
});
