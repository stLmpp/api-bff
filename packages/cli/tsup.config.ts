import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { copy } from 'esbuild-plugin-copy';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['cli.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  sourcemap: true,
  minify: false,
  esbuildPlugins: [
    nodeExternalsPlugin(),
    copy({
      assets: [{ from: './templates/**/*', to: './templates' }],
    }),
  ],
});
