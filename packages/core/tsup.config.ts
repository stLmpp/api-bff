import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  bundle: true,
  dts: true,
  format: 'esm',
  platform: 'node',
  sourcemap: true,
  minify: true,
});
