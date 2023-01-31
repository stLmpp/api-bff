import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  bundle: true,
  dts: true,
  format: 'esm',
  platform: 'node',
  sourcemap: true,
  define: {
    PROD: 'true',
  },
  tsconfig: 'tsconfig.build.json',
  minifyIdentifiers: false,
  minifySyntax: true,
  minifyWhitespace: true,
});
