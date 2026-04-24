#!/bin/bash
# Build the Speakable analyzer bundle for the browser extension.
# Run from the repo root: bash extension/build.sh

set -e

echo "Building extension analyzer bundle..."

# Use the web/ vite config as a base, output to extension/
npx vite build \
  --config web/vite.config.ts \
  --outDir ../extension/dist \
  --mode production \
  2>&1

echo "Bundle built at extension/dist/"
echo "Copy extension/dist/assets/*.js to extension/analyzer.bundle.js"
