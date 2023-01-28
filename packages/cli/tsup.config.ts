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
        console.log('on end');
        spawnSync('npm', ['link'], { stdio: 'inherit' });
      });
    },
  } satisfies Plugin);

// @ts-expect-error tsup has a different version of esbuild, so we get an error here,
// But there is no harm for now
export default defineConfig((options) => {
  const plugins = [
    nodeExternalsPlugin(),
    copy({
      assets: [
        { from: './templates/**/*', to: './templates' },
        {
          from: './templates/base/.prettierrc.template',
          to: './templates/base',
        },
      ],
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
