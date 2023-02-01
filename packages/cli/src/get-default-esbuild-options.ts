import { type BuildOptions } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fastGlob from 'fast-glob';
import { type SetRequired } from 'type-fest';

export async function getDefaultOptions(): Promise<
  SetRequired<BuildOptions, 'plugins'>
> {
  const files = await fastGlob(['src/routes/**/*.{ts,mts}']);
  return {
    entryPoints: ['src/main.ts', ...files, 'api-bff.config.ts'],
    platform: 'node',
    outdir: 'dist',
    format: 'esm',
    minify: true,
    bundle: true,
    plugins: [nodeExternalsPlugin()],
  };
}
