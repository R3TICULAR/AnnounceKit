# Design Document — AnnounceKit Web

## Overview

AnnounceKit Web is a fully client-side single-page application (SPA) that exposes the existing `src/` analysis core in a browser UI. Users paste or upload HTML, configure options (screen reader, CSS selector, diff mode), trigger analysis, and view results across four output panels. No server is required; all computation runs in the browser tab.

The web app lives in a `web/` subdirectory alongside the existing CLI source. It imports the analysis core directly from `../src/` via TypeScript path aliases, replacing only the Node.js-specific `jsdom` parser with a thin `DOMParser` adapter.

### Key Design Decisions

- `web/` subdirectory keeps CLI and web concerns cleanly separated while sharing the `src/` core.
- A single `analyzer.ts` service layer owns all business logic; Lit components are pure view/input with no analysis knowledge.
- State lives exclusively in `<ak-app>` and flows down as properties; results flow up as custom events.
- The browser parser adapter is a drop-in replacement — same `ParseResult` interface, zero changes to the extractor.
- `SIZE_LIMIT_BYTES` is a named export constant in `web/src/constants.ts`, not a magic number anywhere.

---

## Architecture

```
web/
├── index.html                  # SPA entry point
├── vite.config.ts              # Vite build config
├── tsconfig.json               # TypeScript config (extends root)
└── src/
    ├── constants.ts            # SIZE_LIMIT_BYTES and other config constants
    ├── analyzer.ts             # Business logic service (no Lit dependency)
    ├── browser-parser.ts       # DOMParser adapter matching ParseResult interface
    ├── components/
    │   ├── ak-app.ts           # Root shell — owns all state
    │   ├── ak-html-input.ts    # Textarea + file upload
    │   ├── ak-options-bar.ts   # Screen reader selector + CSS selector + diff toggle
    │   ├── ak-analyze-button.ts
    │   ├── ak-results.ts       # Results container (tabbed panels)
    │   ├── ak-announcement-panel.ts
    │   ├── ak-audit-panel.ts
    │   ├── ak-model-panel.ts
    │   ├── ak-diff-panel.ts
    │   ├── ak-copy-button.ts
    │   └── ak-warnings-list.ts
    └── index.ts                # Registers all custom elements, mounts <ak-app>
```

### Data Flow

```
User interaction
      │
      ▼
  Lit component  ──(custom event)──▶  <ak-app>
                                          │
                                          ▼
                                    analyzer.ts
                                    (pure TS, no Lit)
                                          │
                                          ▼
                                    src/ core modules
                                    (parser, extractor,
                                     renderer, diff)
                                          │
                                          ▼
                                    AnalysisResult
                                          │
                                    <ak-app> sets
                                    reactive properties
                                          │
                                          ▼
                                  Child components re-render
```

---

## Components and Interfaces

### `<ak-app>` — Root Shell

Owns all application state. Listens for events from children and calls `analyzer.ts`. Passes results down as properties.

**Properties (reactive):**
```ts
html: string                    // primary HTML input
htmlBefore: string              // "before" HTML in diff mode
diffMode: boolean
screenReader: ScreenReaderOption  // 'NVDA' | 'JAWS' | 'VoiceOver' | 'All'
cssSelector: string
loading: boolean
result: AnalysisResult | null
error: string | null
```

**Listens for events:**
- `ak-html-change` → updates `html`
- `ak-html-before-change` → updates `htmlBefore`
- `ak-options-change` → updates `screenReader`, `cssSelector`, `diffMode`
- `ak-analyze` → calls `analyzer.run()`

---

### `<ak-html-input>`

Textarea for pasting HTML plus a file upload button. In diff mode, renders two instances (labelled "After" / "Before") controlled by the `label` property.

**Properties:**
```ts
value: string       // current HTML text
label: string       // "HTML Input" | "After" | "Before"
disabled: boolean   // true while analysis is running
```

**Events emitted:**
- `ak-html-change` — `detail: { value: string }`

**Behaviour:**
- File upload reads the file as text and fires `ak-html-change`.
- Files exceeding `SIZE_LIMIT_BYTES` fire `ak-html-change` with `detail.error` set instead.
- Validation message rendered inline when `value` is empty and analysis was attempted.

---

### `<ak-options-bar>`

Groups the screen reader selector, CSS selector input, and diff mode toggle.

**Properties:**
```ts
screenReader: ScreenReaderOption
cssSelector: string
diffMode: boolean
disabled: boolean
```

**Events emitted:**
- `ak-options-change` — `detail: { screenReader, cssSelector, diffMode }`

---

### `<ak-analyze-button>`

Single button that triggers analysis and shows a loading spinner.

**Properties:**
```ts
loading: boolean
disabled: boolean
```

**Events emitted:**
- `ak-analyze` (no detail)

---

### `<ak-results>`

Container that shows the four output panels. Hides `<ak-diff-panel>` when `diffMode` is false. Contains the ARIA live region that announces when results update.

**Properties:**
```ts
result: AnalysisResult | null
screenReader: ScreenReaderOption
diffMode: boolean
```

---

### `<ak-announcement-panel>`, `<ak-audit-panel>`, `<ak-model-panel>`, `<ak-diff-panel>`

Each panel receives pre-rendered text strings as properties and renders them in a `<pre>` block with a `<ak-copy-button>` and a download button.

**Shared properties:**
```ts
content: string       // pre-rendered text to display
label: string         // panel heading
empty: boolean        // true when no results yet
```

`<ak-announcement-panel>` additionally accepts:
```ts
screenReader: ScreenReaderOption
entries: AnnouncementEntry[]   // one per matched element
```

`<ak-diff-panel>` additionally accepts:
```ts
diff: SemanticDiff | null
```

---

### `<ak-copy-button>`

Reusable copy-to-clipboard button. Shows a brief "Copied!" confirmation.

**Properties:**
```ts
text: string          // text to copy
label: string         // aria-label for the button
```

---

### `<ak-warnings-list>`

Renders a list of `ParsingWarning | TreeBuildWarning` objects.

**Properties:**
```ts
warnings: Array<{ message: string }>
```

---

## Data Models

### `AnalysisResult`

The shape returned by `analyzer.ts` and stored in `<ak-app>`:

```ts
export interface AnalysisResult {
  /** One entry per matched element (or one for full-document analysis) */
  entries: AnalysisEntry[];
  /** All warnings collected during parse + tree build */
  warnings: Array<{ message: string }>;
  /** Diff result (only populated in diff mode) */
  diff?: SemanticDiff;
}

export interface AnalysisEntry {
  model: AnnouncementModel;
  /** Pre-rendered text for each screen reader */
  announcements: {
    nvda: string;
    jaws: string;
    voiceover: string;
  };
  /** Pre-rendered audit report text */
  audit: string;
  /** Pretty-printed JSON model */
  json: string;
}
```

### `ScreenReaderOption`

```ts
export type ScreenReaderOption = 'NVDA' | 'JAWS' | 'VoiceOver' | 'All';
```

### `SIZE_LIMIT_BYTES` constant

```ts
// web/src/constants.ts
export const SIZE_LIMIT_BYTES = 2 * 1024 * 1024; // 2 MB — increase here to raise the limit
```

---

## Browser Parser Adapter

`web/src/browser-parser.ts` is a drop-in replacement for `src/parser/html-parser.ts`. It exposes the same `parseHTML` function signature so the extractor requires zero changes.

```ts
import type { ParseResult, ParsingWarning } from '../../src/parser/html-parser.js';

export function parseHTML(html: string): ParseResult {
  const warnings: ParsingWarning[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // DOMParser never throws; check for parser error document
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    warnings.push({ message: `Parser error: ${parserError.textContent?.trim()}` });
  }

  if (!doc.documentElement) {
    warnings.push({ message: 'Document has no root element.' });
  }
  if (!doc.body) {
    warnings.push({ message: 'Document has no body element.' });
  }

  return { document: doc, warnings };
}
```

`ParsingError` and `validateHTMLNotEmpty` are re-exported from the original module unchanged.

---

## Analyzer Service

`web/src/analyzer.ts` is a plain TypeScript module (no Lit). It is the only file that imports from `src/`.

```ts
export async function runAnalysis(params: AnalysisParams): Promise<AnalysisResult>
export async function runDiffAnalysis(params: DiffAnalysisParams): Promise<AnalysisResult>
```

```ts
export interface AnalysisParams {
  html: string;
  cssSelector?: string;
}

export interface DiffAnalysisParams {
  htmlBefore: string;
  htmlAfter: string;
  cssSelector?: string;
}
```

Internally `runAnalysis`:
1. Calls `validateHTMLNotEmpty(html)` — throws `ParsingError` on empty input.
2. Calls `parseHTML(html)` from the browser adapter.
3. Calls `buildAccessibilityTree` or `buildAccessibilityTreeWithSelector` from `src/extractor`.
4. For each result entry, calls `renderNVDA`, `renderJAWS`, `renderVoiceOver`, `renderAuditReport`, and `serializeModel({ pretty: true })`.
5. Returns `AnalysisResult`.

`runDiffAnalysis` runs `runAnalysis` on both inputs then calls `diffAccessibilityTrees` from `src/diff`.

---

## Vite Build Configuration

```ts
// web/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: { outDir: 'dist', target: 'es2022' },
  resolve: {
    alias: {
      // Allow web/src to import from src/ without ../../ chains
      '@core': resolve(__dirname, '../src'),
    },
    // Vite needs to resolve .js extensions used in ESM imports
    extensionAlias: { '.js': ['.ts', '.js'] },
  },
});
```

`web/tsconfig.json` extends the root config and adds the `@core` path alias.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: HTML input size gate

*For any* HTML string whose UTF-8 byte length is less than or equal to `SIZE_LIMIT_BYTES`, the analyzer should accept it and return a result. *For any* HTML string whose byte length exceeds `SIZE_LIMIT_BYTES`, the app should reject it with an error and produce no result.

**Validates: Requirements 1.5, 1.6**

---

### Property 2: Analysis produces non-null result for any valid HTML

*For any* non-empty HTML string, calling `runAnalysis` should return an `AnalysisResult` with at least one entry whose `model` is non-null.

**Validates: Requirements 2.2, 2.4**

---

### Property 3: Fatal error preserves HTML input

*For any* HTML input that causes a fatal analysis error, the HTML textarea value in `<ak-app>` should remain unchanged after the error is reported.

**Validates: Requirements 2.5**

---

### Property 4: Warnings are surfaced when present

*For any* HTML input that causes the parser or tree builder to emit at least one warning, the `AnalysisResult.warnings` array should be non-empty and `<ak-warnings-list>` should render at least one item.

**Validates: Requirements 2.6**

---

### Property 5: CSS selector entry count

*For any* valid HTML and valid CSS selector that matches N elements (N ≥ 1), `runAnalysis` should return exactly N entries, and each output panel should render exactly N numbered items.

**Validates: Requirements 3.2, 5.4**

---

### Property 6: Invalid CSS selector is rejected before analysis

*For any* syntactically invalid CSS selector string, the app should display a validation error and `runAnalysis` should not be called.

**Validates: Requirements 3.4**

---

### Property 7: No selector analyzes full body

*For any* HTML string with no CSS selector provided, the result should be equivalent to calling `buildAccessibilityTree(document.body)` directly.

**Validates: Requirements 3.5**

---

### Property 8: Announcement panel matches renderer output

*For any* `AnalysisResult` and any `ScreenReaderOption`, the text displayed in `<ak-announcement-panel>` should equal the output of the corresponding renderer function (`renderNVDA`, `renderJAWS`, `renderVoiceOver`, or all three concatenated for "All") applied to the result's models.

**Validates: Requirements 4.2, 4.3**

---

### Property 9: Screen reader change updates panel without re-analysis

*For any* existing `AnalysisResult`, changing the `screenReader` property on `<ak-app>` should update `<ak-announcement-panel>` content without triggering a new call to `runAnalysis`.

**Validates: Requirements 4.5**

---

### Property 10: Model panel JSON round-trip

*For any* `AnnouncementModel`, the JSON string displayed in `<ak-model-panel>` should be valid JSON that, when deserialized via `deserializeModel`, produces a model equivalent to the original (as determined by `modelsEqual`).

**Validates: Requirements 5.3, 7.4**

---

### Property 11: Diff mode toggle shows/hides second textarea

*For any* app state, toggling `diffMode` from false to true should make the "Before" textarea visible, and toggling it back to false should hide it and the Diff_Panel.

**Validates: Requirements 6.2, 6.5**

---

### Property 12: Diff mode produces a SemanticDiff

*For any* two non-empty HTML strings in diff mode, `runDiffAnalysis` should return an `AnalysisResult` with a non-null `diff` field containing a `SemanticDiff`.

**Validates: Requirements 6.3**

---

### Property 13: Browser parser returns valid ParseResult for any HTML string

*For any* HTML string (including empty, malformed, or non-HTML content), `parseHTML` from the browser adapter should return an object with a `document` property (a `Document` instance) and a `warnings` array (possibly empty).

**Validates: Requirements 7.3**

---

### Property 14: Download buttons disabled when no result

*For any* app state where `result` is null, the "Download JSON" and "Download Audit" buttons should have the `disabled` attribute set.

**Validates: Requirements 8.4**

---

### Property 15: Form controls have associated labels

*For any* rendered instance of `<ak-html-input>` or `<ak-options-bar>`, every `<input>`, `<textarea>`, and `<select>` element in the shadow DOM should have an associated `<label>` (via `for`/`id` or `aria-label`).

**Validates: Requirements 9.2**

---

### Property 16: ARIA live region announces result updates

*For any* transition from `loading: true` to `loading: false` with a non-null result, the ARIA live region inside `<ak-results>` should have its text content updated to a non-empty announcement string.

**Validates: Requirements 9.3**

---

## Error Handling

| Scenario | Source | Handling |
|---|---|---|
| Empty HTML input | `validateHTMLNotEmpty` | Inline validation message in `<ak-html-input>`; analysis not triggered |
| File exceeds `SIZE_LIMIT_BYTES` | File upload handler | Error message shown; file rejected; textarea unchanged |
| Invalid CSS selector | `SelectorError` from extractor | Inline validation in `<ak-options-bar>`; analysis not triggered |
| CSS selector matches zero elements | `SelectorError` from extractor | Info message in results area; no panel content |
| Fatal parse/extraction error | `ParsingError` or uncaught `Error` | Error banner in `<ak-app>`; HTML textarea preserved |
| Diff mode with empty input | `<ak-app>` guard | Validation message; `runDiffAnalysis` not called |
| Clipboard API unavailable | `navigator.clipboard` rejection | `<ak-copy-button>` shows "Copy failed" instead of "Copied!" |
| Download with no result | Disabled button guard | Buttons are disabled; no action taken |

All errors from `analyzer.ts` are caught in `<ak-app>` and stored in the `error: string | null` reactive property. Components never catch errors themselves.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:

- **Unit tests** cover specific examples, integration points, and edge cases (empty input, file size boundary, zero selector matches, clipboard failure).
- **Property-based tests** verify universal properties across randomly generated inputs, catching edge cases that hand-written examples miss.

### Unit Test Coverage

- `browser-parser.ts`: empty string, valid HTML, malformed HTML, non-HTML content
- `analyzer.ts`: valid HTML → result shape, fatal error → error thrown, CSS selector → correct entry count
- `<ak-html-input>`: file upload populates textarea, oversized file shows error
- `<ak-options-bar>`: default screen reader is NVDA, invalid selector shows validation
- `<ak-app>`: error state preserves HTML, screen reader change does not re-run analysis
- `<ak-copy-button>`: clipboard write called with correct text, confirmation shown
- Download buttons: disabled when result is null, enabled when result is non-null

### Property-Based Testing

**Library:** [fast-check](https://fast-check.dev/) (TypeScript-native, works in browser and Node.js)

**Configuration:** minimum 100 runs per property (`{ numRuns: 100 }`)

**Tag format for each test:**
```
// Feature: announcekit-web, Property N: <property text>
```

| Property | Test description | Generators needed |
|---|---|---|
| P1 — Size gate | Arbitrary byte strings at/below/above limit | `fc.string()` with size control |
| P2 — Analysis produces result | Any non-empty HTML string | `fc.string({ minLength: 1 })` |
| P3 — Error preserves HTML | HTML strings that trigger errors | Crafted invalid inputs |
| P4 — Warnings surfaced | HTML that produces parser warnings | Malformed HTML generators |
| P5 — Selector entry count | HTML with N matching elements + selector | `fc.integer({ min: 1, max: 10 })` for N |
| P6 — Invalid selector rejected | Syntactically invalid CSS strings | `fc.string()` filtered to invalid selectors |
| P7 — No selector = full body | Any HTML string | `fc.string({ minLength: 1 })` |
| P8 — Announcement matches renderer | Any `AnnouncementModel` + `ScreenReaderOption` | Model arbitraries |
| P9 — SR change no re-analysis | Any result + SR option change | Model arbitraries |
| P10 — JSON round-trip | Any `AnnouncementModel` | Model arbitraries |
| P11 — Diff toggle | Any app state | Boolean toggle |
| P12 — Diff produces SemanticDiff | Any two non-empty HTML strings | `fc.string({ minLength: 1 })` pairs |
| P13 — Parser returns ParseResult | Any string | `fc.string()` |
| P14 — Download disabled when no result | App state with null result | State arbitraries |
| P15 — Form controls have labels | Any component render | Component render + DOM query |
| P16 — Live region updates | Any result transition | State transition arbitraries |

Each correctness property must be implemented by exactly one property-based test. Unit tests handle the specific examples and edge cases listed above.
