import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import createMDX from '@next/mdx';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  typescript: {
    // Type checking is handled by the separate CI type-check job.
    // The parent src/ files reference picocolors types from root node_modules
    // which aren't available in the site build context.
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint is handled separately — skip during build to avoid config conflicts
    ignoreDuringBuilds: true,
  },

  webpack: (config, { isServer }) => {
    // @core alias — points to the root src/ directory
    config.resolve.alias['@core'] = resolve(__dirname, '../src');

    // Browser parser swap — redirect the jsdom-based parser to the browser DOMParser adapter.
    // This mirrors the Vite alias in web/vite.config.ts and keeps jsdom out of client bundles.
    config.resolve.alias[resolve(__dirname, '../src/parser/html-parser.ts')] = resolve(
      __dirname,
      '../web/src/browser-parser.ts'
    );

    // .js → .ts extension resolution (core engine uses .js imports that resolve to .ts sources)
    if (!config.resolve.extensionAlias) {
      config.resolve.extensionAlias = {};
    }
    config.resolve.extensionAlias['.js'] = ['.ts', '.js'];

    // Resolve picocolors from site/node_modules when imported by parent src/ files
    config.resolve.alias['picocolors'] = resolve(__dirname, 'node_modules/picocolors');

    return config;
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {},
});

export default withMDX(nextConfig);
