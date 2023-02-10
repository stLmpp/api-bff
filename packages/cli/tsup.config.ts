import { spawnSync } from 'child_process';

import { type Plugin } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { copy } from 'esbuild-plugin-copy';
import { defineConfig } from 'tsup';

function npm_link_plugin(): Plugin {
  return {
    name: 'npm-link',
    setup: (build) => {
      build.onEnd(() => {
        spawnSync('npm', ['link'], { stdio: 'inherit' });
      });
    },
  };
}

export default defineConfig((options) => {
  const plugins = [
    nodeExternalsPlugin(),
    copy({
      assets: [{ from: './templates/**/*', to: './templates' }],
      globbyOptions: {
        dot: true,
      },
    }),
  ];
  if (options.watch) {
    plugins.push(npm_link_plugin());
    options.watch = ['**/*.{ts,template}'];
  }
  return {
    entry: ['cli.ts'],
    bundle: true,
    format: 'esm',
    platform: 'node',
    sourcemap: true,
    esbuildPlugins: plugins,
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: true,
    define: {
      PROD: 'true',
    },
    tsconfig: 'tsconfig.build.json',
  };
});
