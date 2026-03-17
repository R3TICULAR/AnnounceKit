import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, '../src'),
      // Redirect the Node.js jsdom parser to the browser DOMParser adapter.
      // Any @core module that imports from html-parser gets this instead,
      // preventing jsdom from being bundled into the browser build.
      [resolve(__dirname, '../src/parser/html-parser.ts')]: resolve(__dirname, 'src/browser-parser.ts'),
    },
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
  test: {
    environment: 'jsdom',
  },
});
