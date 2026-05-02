/**
 * Speakable — Catalog Upload Script
 *
 * Uploads the product catalog CSV to Stripe's Agentic Commerce Suite
 * via the Product Catalog Import API.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_... npx tsx site/scripts/upload-catalog.ts
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = resolve(__dirname, '../data/speakable_product_catalog.csv');
const STRIPE_API_URL = 'https://api.stripe.com/v2/commerce/product_catalog/imports';
const STRIPE_VERSION = '2026-04-22.preview';

async function uploadCatalog(): Promise<void> {
  // Validate environment
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('Error: STRIPE_SECRET_KEY environment variable is not set.');
    process.exit(1);
  }

  // Validate CSV exists
  if (!existsSync(CSV_PATH)) {
    console.error(`Error: Catalog CSV not found at ${CSV_PATH}`);
    process.exit(1);
  }

  console.log('Reading catalog CSV...');
  const csvContent = readFileSync(CSV_PATH, 'utf-8');
  console.log(`CSV loaded (${csvContent.length} bytes)`);

  // Step 1: Create the import to get a presigned upload URL
  console.log('Creating catalog import...');
  const createResponse = await fetch(STRIPE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Stripe-Version': STRIPE_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      feed_type: 'product',
      mode: 'upsert',
      metadata: {
        file_name: 'speakable_product_catalog.csv',
      },
    }),
  });

  if (!createResponse.ok) {
    const errorBody = await createResponse.text();
    console.error(`Error creating import: HTTP ${createResponse.status}`);
    console.error(errorBody);
    process.exit(1);
  }

  const importData = await createResponse.json();
  const importId = importData.id;
  const uploadUrl = importData.status_details?.awaiting_upload?.upload_url?.url;

  if (!uploadUrl) {
    console.error('Error: No upload URL returned from Stripe.');
    console.error(JSON.stringify(importData, null, 2));
    process.exit(1);
  }

  console.log(`Import created: ${importId}`);
  console.log('Uploading CSV...');

  // Step 2: Upload the CSV to the presigned URL
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'text/csv',
    },
    body: csvContent,
  });

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.text();
    console.error(`Error uploading CSV: HTTP ${uploadResponse.status}`);
    console.error(errorBody);
    process.exit(1);
  }

  console.log('CSV uploaded successfully.');
  console.log(`Import ID: ${importId}`);
  console.log('');
  console.log('Monitor import status:');
  console.log(`  curl ${STRIPE_API_URL}/${importId} \\`);
  console.log(`    -H "Authorization: Bearer $STRIPE_SECRET_KEY" \\`);
  console.log(`    -H "Stripe-Version: ${STRIPE_VERSION}"`);
}

uploadCatalog().catch((err) => {
  console.error('Unexpected error:', err.message || err);
  process.exit(1);
});
