import { defineConfig } from 'tsup';

export default defineConfig([
  // CLI entry point with shebang
  {
    entry: ['src/cli.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: false,
    target: 'node18',
    shims: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // Library entry point without shebang
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: false,
    sourcemap: true,
    minify: false,
    target: 'node18',
    shims: true,
  },
]);
