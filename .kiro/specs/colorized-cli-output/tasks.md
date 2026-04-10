# Implementation Plan: Colorized CLI Output

## Overview

Add ANSI color support to AnnounceKit's CLI output via a shared color utility module wrapping picocolors. Renderers gain an optional `colorize` parameter; the orchestrator handles TTY detection. The landing page enterprise section swaps its external image for a local screenshot asset.

## Tasks

- [x] 1. Install picocolors and create the color utility module
  - [x] 1.1 Add picocolors as a production dependency in `package.json`
    - Run `npm install picocolors`
    - Verify it appears under `dependencies` (not `devDependencies`)
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Create `src/cli/colors.ts` with `ColorFunctions` interface, `isColorEnabled`, and `createColors`
    - Export `isColorEnabled(stream)` returning `true` only when `stream.isTTY === true`
    - Export `createColors(enabled)` returning semantic color functions (error, warning, info, success, heading, title, dim, roleName, stateName, elementName, sectionHeader, description, bold) backed by picocolors when enabled, identity functions when disabled
    - Export the `ColorFunctions` interface
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 1.3 Write unit tests for `src/cli/colors.ts`
    - Create `tests/unit/cli/colors.test.ts`
    - Test `isColorEnabled` with `{ isTTY: true }`, `{ isTTY: false }`, `{}`, `undefined`
    - Test `createColors(true)` produces strings containing ANSI escape codes
    - Test `createColors(false)` produces identity (input === output)
    - _Requirements: 5.2, 5.3_

  - [ ]* 1.4 Write property test for TTY detection correctness
    - **Property 6: TTY detection correctness**
    - **Validates: Requirements 5.3**
    - Create `tests/property/colorized-output.test.ts`
    - Add `stripAnsi` helper to test file
    - For any stream object with boolean or absent `isTTY`, `isColorEnabled` returns `true` iff `isTTY === true`

- [x] 2. Colorize the audit renderer
  - [x] 2.1 Update `renderAuditReport` in `src/renderer/audit-renderer.ts` to accept optional `colorize` parameter
    - Add `colorize?: boolean` parameter to `renderAuditReport`
    - Pass it through to `formatAuditReport`
    - Import `createColors` from `../cli/colors.js`
    - Apply `heading()` to section headers, `title()` to banner, `error()` to error lines, `warning()` to warning lines, `info()` to info lines, `success()` to success indicators, `dim()` to timestamps and counts
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 2.2 Write property test for audit report color transparency
    - **Property 1: Color transparency — stripping ANSI yields identical plain output (audit renderer)**
    - **Validates: Requirements 2.3**
    - For any `AnnouncementModel`, `stripAnsi(renderAuditReport(model, true))` === `renderAuditReport(model, false)`

  - [ ]* 2.3 Write property test for audit report semantic color mapping
    - **Property 4: Audit report semantic color mapping**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
    - For any `AnnouncementModel` rendered with `colorize=true`, verify section headers contain cyan codes, errors contain red, warnings contain yellow, info contains blue, success contains green, title contains bold

- [x] 3. Colorize the screen reader renderers
  - [x] 3.1 Update `renderNVDA` in `src/renderer/nvda-renderer.ts` to accept optional `colorize` parameter
    - Add `colorize?: boolean` parameter
    - Import `createColors` from `../cli/colors.js`
    - Apply `elementName()` to `node.name`, `roleName()` to role text, `stateName()` to state text, `description()` to `node.description`
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 3.2 Update `renderJAWS` in `src/renderer/jaws-renderer.ts` to accept optional `colorize` parameter
    - Same color application pattern as NVDA renderer
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 3.3 Update `renderVoiceOver` in `src/renderer/voiceover-renderer.ts` to accept optional `colorize` parameter
    - Same color application pattern as NVDA renderer
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 3.4 Write property test for screen reader color transparency
    - **Property 1: Color transparency — stripping ANSI yields identical plain output (screen reader renderers)**
    - **Validates: Requirements 2.3**
    - For any `AnnouncementModel` and each renderer, `stripAnsi(render(model, true))` === `render(model, false)`

  - [ ]* 3.5 Write property test for screen reader semantic color mapping
    - **Property 5: Screen reader output semantic color mapping**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
    - For any `AnnouncementModel` with a node having name, role, and state, verify element names wrapped in bold codes, roles in cyan, states in yellow

- [x] 4. Checkpoint — Verify renderers
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Wire orchestrator TTY detection and color flag passing
  - [x] 5.1 Update `src/cli/orchestrator.ts` to determine `colorize` and pass it to renderers
    - Import `isColorEnabled` from `./colors.js`
    - Compute `colorize = isColorEnabled(process.stdout) && format !== 'json' && !options.output`
    - Pass `colorize` to `renderAuditReport`, `renderNVDA`, `renderJAWS`, `renderVoiceOver`
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 5.2 Colorize section headers in `formatScreenReaderOutput` and `formatWarnings`
    - Apply `sectionHeader()` to "=== NVDA ===" / "=== JAWS ===" / "=== VoiceOver ===" headers when colorize is true
    - Compute `colorizeStderr = isColorEnabled(process.stderr)` for warnings
    - Apply `warning()` + `bold()` to "=== Warnings ===" header and yellow to warning prefixes when stderr is TTY
    - _Requirements: 4.4, 6.1, 6.2, 6.3_

  - [ ]* 5.3 Write property test for disabled color producing zero ANSI codes
    - **Property 3: Disabled color produces zero ANSI codes**
    - **Validates: Requirements 2.2, 2.4**
    - For any `AnnouncementModel`, rendering with `colorize=false` produces output with zero `\x1b[` sequences

  - [ ]* 5.4 Write property test for colorized output containing ANSI codes
    - **Property 2: Colorized output contains ANSI escape codes**
    - **Validates: Requirements 2.1**
    - For any `AnnouncementModel` producing non-empty output, rendering with `colorize=true` contains at least one `\x1b[`

  - [ ]* 5.5 Write property test for warning colorization symmetry
    - **Property 7: Warning colorization symmetry**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - For any non-empty warning list, `stripAnsi(formatWarnings(warnings, true))` === `formatWarnings(warnings, false)`, and colorized version contains yellow ANSI codes

- [x] 6. Update landing page enterprise section image
  - [x] 6.1 Add a placeholder screenshot asset at `site/public/images/cli-audit-screenshot.png`
    - Create the `site/public/images/` directory if it doesn't exist
    - Place a screenshot image file (or placeholder) at the path
    - _Requirements: 7.1_

  - [x] 6.2 Update `site/app/page.tsx` enterprise section to use local image
    - Replace the external Google CDN `src` URL with `/images/cli-audit-screenshot.png`
    - Update the `alt` attribute to accurately describe the CLI audit output shown (e.g., "AnnounceKit CLI audit report showing colorized accessibility analysis with landmark structure, heading hierarchy, and issue severity indicators")
    - Preserve existing `className` with aspect ratio, rounded corners, gradient overlay, and hover opacity transition
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 7. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All renderer signature changes use optional parameters — no breaking changes to existing callers
