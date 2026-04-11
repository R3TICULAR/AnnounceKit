import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, '../src'),
      '@': resolve(__dirname, './src'),
      // Browser parser swap — same as next.config.js
      [resolve(__dirname, '../src/parser/html-parser.ts')]: resolve(
        __dirname,
        '../web/src/browser-parser.ts'
      ),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
  },
});
