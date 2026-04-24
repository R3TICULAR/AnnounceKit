# Speakable Browser Extension

Simulate how screen readers interpret any web page — directly from your browser.

## Development Setup

### 1. Load the extension locally

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `extension/` directory

### 2. Bundle the analyzer engine

The popup currently shows a scaffold/placeholder. To wire up the real analyzer:

```bash
# From the repo root, build the browser-compatible analyzer bundle
npx vite build --config extension.vite.config.ts
```

This bundles `web/src/analyzer.ts` (which uses the browser DOM parser instead of jsdom)
into a single file that the popup can import.

### 3. Test it

1. Navigate to any web page
2. Click the Speakable extension icon
3. Select a screen reader and format
4. Optionally enter a CSS selector
5. Click "Analyze This Page"

## File Structure

```
extension/
├── manifest.json      # Chrome Manifest V3 config
├── content.js         # Content script — captures page HTML
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic — orchestrates analysis
├── icons/             # Extension icons (16, 48, 128px)
└── README.md          # This file
```

## How It Works

1. User clicks the extension icon → popup opens
2. Popup sends a message to the content script: "give me the page HTML"
3. Content script reads `document.documentElement.outerHTML` and sends it back
4. Popup runs the Speakable analyzer on the HTML (same engine as CLI + web tool)
5. Results are displayed in the popup

## Permissions

- `activeTab` — Only accesses the current tab when the user clicks the extension icon. No background access, no browsing history, no data collection.

## Publishing to Chrome Web Store

1. Create icons at 16x16, 48x48, and 128x128 pixels
2. Take screenshots of the extension in action
3. Zip the `extension/` directory
4. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
5. Pay the $5 one-time registration fee
6. Upload the zip and fill in the listing details
7. Submit for review (typically 1-3 business days)

## Monetization (Optional)

The Chrome Web Store no longer supports built-in payments. To gate features:

1. User signs in via your site (Clerk auth)
2. Extension checks subscription status via an API call
3. Free tier: basic text output (single reader)
4. Pro tier: audit reports, all readers, diff mode

Store the auth token in `chrome.storage.local` after sign-in.
