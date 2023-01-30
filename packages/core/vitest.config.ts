import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    watch: false,
    coverage: {
      all: true,
      enabled: true,
      statements: 80,
      branches: 80,
      lines: 80,
      functions: 80,
      exclude: ['**/*.{schema,spec}.ts'],
      include: ['src/**/*.ts'],
      excludeNodeModules: true,
    },
    exclude: ['**/*.schema.ts', 'node_modules'],
    include: ['**/*.spec.ts'],
  },
  esbuild: {
    define: {
      PROD: 'false',
    },
  },
});
