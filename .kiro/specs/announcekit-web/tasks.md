# Implementation Plan: AnnounceKit Web

## Overview

Build the web SPA bottom-up: infrastructure and config → browser parser adapter → analyzer service → Lit components → wiring and integration. Each step is independently testable before the next layer is added.

## Tasks

- [x] 1. Set up web/ project infrastructure
  - Create `web/` directory with `index.html`, `vite.config.ts`, `tsconfig.json`, and `web/src/constants.ts`
  - Configure `@core` path alias pointing to `../src/` in both Vite and TypeScript configs
  - Add `SIZE_LIMIT_BYTES` named export to `constants.ts`
  - Install dependencies: `lit`, `vite`, `typescript`, `fast-check` (dev)
  - _Requirements: 1.5, 7.1, 10.1_

- [x] 2. Implement browser parser adapter
  - [x] 2.1 Create `web/src/browser-parser.ts` implementing `parseHTML(html: string): ParseResult` using `DOMParser`
    - Re-export `ParsingError` and `validateHTMLNotEmpty` from the original module
    - Detect parser error documents and push to warnings array
    - _Requirements: 7.1, 7.2, 7.3_

  - [x]* 2.2 Write property test for browser parser (Property 13)
    - **Property 13: Browser parser returns valid ParseResult for any HTML string**
    - **Validates: Requirements 7.3**

  - [x]* 2.3 Write unit tests for browser-parser.ts
    - Cover: empty string, valid HTML, malformed HTML, non-HTML content
    - _Requirements: 7.3_

- [x] 3. Implement analyzer service
  - [x] 3.1 Create `web/src/analyzer.ts` with `runAnalysis` and `runDiffAnalysis` functions
    - Import from `@core` (extractor, renderers, diff, serializer)
    - Use browser-parser adapter for `parseHTML`
    - Build `AnalysisResult` and `AnalysisEntry` shapes as defined in design
    - _Requirements: 2.2, 3.2, 3.5, 6.3_

  - [x]* 3.2 Write property test for analysis produces result (Property 2)
    - **Property 2: Analysis produces non-null result for any valid HTML**
    - **Validates: Requirements 2.2, 2.4**

  - [x]* 3.3 Write property test for HTML size gate (Property 1)
    - **Property 1: HTML input size gate — inputs at/below limit accepted, above limit rejected**
    - **Validates: Requirements 1.5, 1.6**

  - [x]* 3.4 Write property test for CSS selector entry count (Property 5)
    - **Property 5: CSS selector entry count matches number of matched elements**
    - **Validates: Requirements 3.2, 5.4**

  - [x]* 3.5 Write property test for no selector analyzes full body (Property 7)
    - **Property 7: No selector analyzes full body**
    - **Validates: Requirements 3.5**

  - [x]* 3.6 Write property test for diff produces SemanticDiff (Property 12)
    - **Property 12: Diff mode produces a SemanticDiff for any two non-empty HTML strings**
    - **Validates: Requirements 6.3**

  - [x]* 3.7 Write property test for JSON round-trip (Property 10)
    - **Property 10: Model panel JSON round-trip**
    - **Validates: Requirements 5.3, 7.4**

  - [x]* 3.8 Write unit tests for analyzer.ts
    - Cover: valid HTML → result shape, fatal error → error thrown, CSS selector → correct entry count
    - _Requirements: 2.2, 3.2, 3.5_

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement input and options components
  - [x] 5.1 Create `web/src/components/ak-html-input.ts`
    - Textarea with `value`, `label`, `disabled` properties
    - File upload button accepting `.html`/`.htm`; reads file as text and fires `ak-html-change`
    - Reject files exceeding `SIZE_LIMIT_BYTES` with error detail
    - Inline validation message when value is empty and analysis was attempted
    - Associate all form controls with visible labels
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 9.2_

  - [ ]* 5.2 Write property test for form controls have labels (Property 15)
    - **Property 15: Form controls have associated labels in ak-html-input and ak-options-bar**
    - **Validates: Requirements 9.2**

  - [ ]* 5.3 Write unit tests for ak-html-input
    - Cover: file upload populates textarea, oversized file shows error
    - _Requirements: 1.3, 1.6_

  - [x] 5.4 Create `web/src/components/ak-options-bar.ts`
    - Screen reader selector (NVDA default), CSS selector input, diff mode toggle
    - `screenReader`, `cssSelector`, `diffMode`, `disabled` properties
    - Fires `ak-options-change` with all three values
    - Inline validation for invalid CSS selector
    - Associate all form controls with visible labels
    - _Requirements: 3.1, 3.4, 4.1, 4.4, 9.2_

  - [ ]* 5.5 Write property test for invalid CSS selector rejected (Property 6)
    - **Property 6: Invalid CSS selector is rejected before analysis**
    - **Validates: Requirements 3.4**

  - [ ]* 5.6 Write unit tests for ak-options-bar
    - Cover: default screen reader is NVDA, invalid selector shows validation
    - _Requirements: 3.4, 4.4_

  - [x] 5.7 Create `web/src/components/ak-analyze-button.ts`
    - `loading` and `disabled` properties; fires `ak-analyze` event
    - Shows loading spinner when `loading` is true
    - _Requirements: 2.1, 2.3_

- [x] 6. Implement output panel components
  - [x] 6.1 Create `web/src/components/ak-copy-button.ts`
    - `text` and `label` properties; writes to clipboard; shows "Copied!" confirmation
    - Shows "Copy failed" when Clipboard API is unavailable
    - _Requirements: 5.5, 5.6_

  - [ ]* 6.2 Write unit tests for ak-copy-button
    - Cover: clipboard write called with correct text, confirmation shown, failure fallback
    - _Requirements: 5.6_

  - [x] 6.3 Create `web/src/components/ak-warnings-list.ts`
    - Accepts `warnings: Array<{ message: string }>` and renders a list
    - _Requirements: 2.6_

  - [x] 6.4 Create `web/src/components/ak-announcement-panel.ts`, `ak-audit-panel.ts`, `ak-model-panel.ts`, `ak-diff-panel.ts`
    - Shared `content`, `label`, `empty` properties; render content in `<pre>` with copy and download buttons
    - Download buttons disabled when `empty` is true
    - `ak-announcement-panel` additionally accepts `screenReader` and `entries`
    - `ak-diff-panel` additionally accepts `diff: SemanticDiff | null`
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 6.5 Write property test for download buttons disabled when no result (Property 14)
    - **Property 14: Download buttons disabled when no result**
    - **Validates: Requirements 8.4**

  - [ ]* 6.6 Write unit tests for panel components
    - Cover: download buttons disabled when result is null, enabled when non-null
    - _Requirements: 8.4_

  - [x] 6.7 Create `web/src/components/ak-results.ts`
    - Accepts `result`, `screenReader`, `diffMode` properties
    - Hides `<ak-diff-panel>` when `diffMode` is false
    - Contains ARIA live region that announces when results update
    - _Requirements: 2.4, 6.5, 9.3_

  - [ ]* 6.8 Write property test for ARIA live region updates (Property 16)
    - **Property 16: ARIA live region announces result updates**
    - **Validates: Requirements 9.3**

  - [ ]* 6.9 Write property test for announcement panel matches renderer output (Property 8)
    - **Property 8: Announcement panel content matches renderer output for any ScreenReaderOption**
    - **Validates: Requirements 4.2, 4.3**

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement root shell and wire everything together
  - [x] 8.1 Create `web/src/components/ak-app.ts`
    - Owns all reactive state: `html`, `htmlBefore`, `diffMode`, `screenReader`, `cssSelector`, `loading`, `result`, `error`
    - Listens for `ak-html-change`, `ak-html-before-change`, `ak-options-change`, `ak-analyze`
    - Calls `runAnalysis` or `runDiffAnalysis` from `analyzer.ts`; catches all errors and stores in `error`
    - Preserves `html` value on fatal error
    - Renders two `<ak-html-input>` instances in diff mode (labelled "After" / "Before")
    - Validates both inputs non-empty before calling `runDiffAnalysis`
    - _Requirements: 2.3, 2.5, 4.5, 6.1, 6.2, 6.5, 6.6, 11.2_

  - [ ]* 8.2 Write property test for fatal error preserves HTML input (Property 3)
    - **Property 3: Fatal error preserves HTML input**
    - **Validates: Requirements 2.5**

  - [ ]* 8.3 Write property test for warnings surfaced when present (Property 4)
    - **Property 4: Warnings are surfaced when present**
    - **Validates: Requirements 2.6**

  - [ ]* 8.4 Write property test for screen reader change no re-analysis (Property 9)
    - **Property 9: Screen reader change updates panel without re-running analysis**
    - **Validates: Requirements 4.5**

  - [ ]* 8.5 Write property test for diff mode toggle shows/hides second textarea (Property 11)
    - **Property 11: Diff mode toggle shows/hides second textarea and Diff_Panel**
    - **Validates: Requirements 6.2, 6.5**

  - [ ]* 8.6 Write unit tests for ak-app
    - Cover: error state preserves HTML, screen reader change does not re-run analysis
    - _Requirements: 2.5, 4.5_

  - [x] 8.7 Create `web/src/index.ts`
    - Register all custom elements and mount `<ak-app>` into `index.html`
    - _Requirements: 10.1_

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with `{ numRuns: 100 }` minimum
- Tag format for each property test: `// Feature: announcekit-web, Property N: <property text>`
- All errors are caught in `<ak-app>` only — components never catch errors themselves
- Business logic lives exclusively in `analyzer.ts`; components are pure view/input
