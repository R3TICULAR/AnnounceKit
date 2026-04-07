# Implementation Plan: Core Engine Expansion

## Overview

Expand the AnnounceKit core engine to support 21 new accessible roles, text node capture, transparent traversal through role-less elements, shadow DOM traversal, CSS hidden state detection, and updated screen reader renderers. Changes are built bottom-up: types → role mapper → tree builder → renderers, ensuring each layer compiles and tests pass before the next.

## Tasks

- [x] 1. Extend model types with new roles
  - [x] 1.1 Add 21 new roles to `AccessibleRole` union type and `SUPPORTED_ROLES` array in `src/model/types.ts`
    - Add: `paragraph`, `blockquote`, `code`, `table`, `row`, `cell`, `columnheader`, `rowheader`, `term`, `definition`, `figure`, `caption`, `group`, `dialog`, `meter`, `progressbar`, `status`, `document`, `application`, `separator`, `staticText`
    - Keep all 22 existing roles unchanged
    - _Requirements: 2.28, 3.4_

  - [ ]* 1.2 Write property test for new role validation (Property 4)
    - **Property 4: All new roles are valid in SUPPORTED_ROLES and pass validation**
    - **Validates: Requirements 2.28, 3.4, 9.4**
    - Create `tests/property/role-expansion.test.ts`
    - For each role in the new set, assert it is in `SUPPORTED_ROLES` and `validateRole()` returns true

- [x] 2. Expand implicit role mappings in role mapper
  - [x] 2.1 Add new entries to `IMPLICIT_ROLE_MAP` in `src/extractor/role-mapper.ts`
    - Add all 19+ new element-to-role mappings: `p`→`paragraph`, `blockquote`→`blockquote`, `code`→`code`, `pre`→`code`, `table`→`table`, `tr`→`row`, `td`→`cell`, `th`→`columnheader`, `dl`→`list`, `dt`→`term`, `dd`→`definition`, `figure`→`figure`, `figcaption`→`caption`, `details`→`group`, `summary`→`button`, `dialog`→`dialog`, `meter`→`meter`, `progress`→`progressbar`, `output`→`status`, `fieldset`→`group`, `legend`→`caption`, `iframe`→`document`, `video`→`application`, `audio`→`application`, `hr`→`separator`, `caption`→`caption`, `abbr`→`text`
    - Add special case for `<th scope="row">` → `rowheader` in `computeImplicitRole`, similar to existing `<input>` type handling
    - _Requirements: 2.1–2.27_

  - [ ]* 2.2 Write unit tests for new role mappings
    - Add test cases to `tests/unit/extractor/role-mapper.test.ts` for all new IMPLICIT_ROLE_MAP entries
    - Include `<th scope="row">` → `rowheader` special case
    - _Requirements: 2.1–2.27_

- [x] 3. Checkpoint — Verify types and role mapper
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Revise tree builder for transparent traversal, text nodes, shadow DOM, and hidden state
  - [x] 4.1 Add `isHidden()` helper to `src/extractor/tree-builder.ts`
    - Check `aria-hidden="true"`, `display: none`, `visibility: hidden` via `getComputedStyle`
    - Gracefully skip CSS checks when `getComputedStyle` is unavailable
    - Call `isHidden()` before `isAccessible()` in traversal to short-circuit early
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.2 Add `processChildNode()` helper to handle Text nodes and Element nodes
    - For Text nodes (nodeType === 3): create `staticText` AccessibleNode with trimmed text as name; skip whitespace-only nodes
    - For Element nodes (nodeType === 1): check `isHidden`, then `isAccessible`; if role-less, do transparent traversal via `collectChildrenFromRolelessElement`
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 1.1, 1.2, 1.3_

  - [x] 4.3 Add `collectChildrenFromRolelessElement()` helper for transparent traversal
    - Traverse shadow DOM first (if `element.shadowRoot` exists), then light DOM `childNodes`
    - Use `processChildNode` for each child
    - Return flat array of AccessibleNodes to be merged into parent's children
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2, 4.3, 4.4_

  - [x] 4.4 Update `buildNodeRecursive()` to use new helpers
    - Call `isHidden()` first, return null if hidden
    - If `!isAccessible(element)`, call `collectChildrenFromRolelessElement` and return the array (change return type handling)
    - Replace `element.children` iteration with `element.childNodes` iteration using `processChildNode`
    - Handle shadow DOM: traverse `element.shadowRoot.childNodes` before light DOM `element.childNodes`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.5, 4.1, 4.3, 5.1, 5.5_

  - [x] 4.5 Update `createGenericContainer()` to use `childNodes` and `processChildNode`
    - Replace `element.children` iteration with `element.childNodes` iteration
    - _Requirements: 3.1, 3.5_

  - [ ]* 4.6 Write property tests for tree traversal (Properties 1, 2, 3, 5, 6)
    - **Property 1: Transparent traversal finds accessible descendants**
    - **Property 2: Role-less subtrees without content are pruned**
    - **Property 3: Parent-child nesting is preserved through role-less intermediaries**
    - **Property 5: Non-whitespace text nodes become staticText nodes**
    - **Property 6: Document order of text and element nodes is preserved**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.5**
    - Create `tests/property/tree-traversal-expansion.test.ts`

  - [ ]* 4.7 Write property test for shadow DOM traversal (Property 7)
    - **Property 7: Shadow DOM children are included and ordered before light DOM**
    - **Validates: Requirements 4.1, 4.3, 4.4**
    - Add to `tests/property/tree-traversal-expansion.test.ts`

  - [ ]* 4.8 Write property test for hidden state exclusion (Property 8)
    - **Property 8: Hidden ancestor exclusion**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - Add to `tests/property/tree-traversal-expansion.test.ts`

  - [ ]* 4.9 Write unit tests for tree builder changes
    - Add test cases to `tests/unit/extractor/tree-builder.test.ts` for: role-less traversal, text node capture, whitespace filtering, shadow DOM traversal, hidden state inheritance, CSS hidden checks
    - _Requirements: 1.1–1.4, 3.1–3.5, 4.1–4.4, 5.1–5.5_

- [x] 5. Checkpoint — Verify tree builder
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update NVDA renderer for new roles
  - [x] 6.1 Add new case branches to `formatRoleNVDA()` in `src/renderer/nvda-renderer.ts`
    - `staticText` → `''`, `paragraph` → `''`, `blockquote` → `'block quote'`, `code` → `'code'`, `table` → `'table'`, `row` → `'row'`, `cell` → `''`, `columnheader` → `'column header'`, `rowheader` → `'row header'`, `term` → `''`, `definition` → `''`, `figure` → `'figure'`, `caption` → `''`, `dialog` → `'dialog'`, `meter` → `'meter'`, `progressbar` → `'progress bar'`, `status` → `'status'`, `group` → `'grouping'` (only when node has name, else `''`), `document` → `'document'`, `application` → `'embedded object'`, `separator` → `'separator'`
    - _Requirements: 6.1–6.18_

  - [ ]* 6.2 Write unit tests for NVDA renderer new roles
    - Add test cases to `tests/unit/renderer/nvda-renderer.test.ts` for each new role's output format
    - _Requirements: 6.1–6.18_

- [x] 7. Update JAWS renderer for new roles
  - [x] 7.1 Add new case branches to `formatRoleJAWS()` in `src/renderer/jaws-renderer.ts`
    - `staticText` → `''`, `paragraph` → `''`, `blockquote` → `'block quote'`, `code` → `'code'`, `table` → `'table with N rows and M columns'` (count from children), `row` → `'row N'` (position index), `cell` → `'column N'` (position index), `columnheader` → `'column header'`, `rowheader` → `'row header'`, `term` → `''`, `definition` → `''`, `figure` → `'figure'`, `caption` → `''`, `dialog` → `'dialog'`, `meter` → `'meter'`, `progressbar` → `'progress bar'`, `status` → `'status'`, `group` → `'group'` (only when node has name), `document` → `'frame'`, `application` → `'embedded object'`, `separator` → `'separator'`
    - _Requirements: 8.1–8.18_

  - [ ]* 7.2 Write unit tests for JAWS renderer new roles
    - Add test cases to `tests/unit/renderer/jaws-renderer.test.ts` for each new role's output format, including table/row/cell counting
    - _Requirements: 8.1–8.18_

- [x] 8. Update VoiceOver renderer for new roles
  - [x] 8.1 Add new case branches to `formatRoleVoiceOver()` in `src/renderer/voiceover-renderer.ts`
    - `staticText` → `''`, `paragraph` → `''`, `blockquote` → `'blockquote'`, `code` → `'code'`, `table` → `'table, N rows, M columns'` (count from children), `row` → `'row'`, `cell` → `''`, `columnheader` → `'column header'`, `rowheader` → `'row header'`, `term` → `''`, `definition` → `''`, `figure` → `'figure'`, `caption` → `''`, `dialog` → `'web dialog'`, `meter` → `'level indicator'`, `progressbar` → `'progress indicator'`, `status` → `'status'`, `group` → `'group'` (only when node has name), `document` → `'frame'`, `application` → `'embedded object'`, `separator` → `'separator'`
    - Update `shouldAnnounceRoleFirst()` to include `blockquote`, `figure`, `dialog`, `group`, `document`
    - _Requirements: 7.1–7.18_

  - [ ]* 8.2 Write unit tests for VoiceOver renderer new roles
    - Add test cases to `tests/unit/renderer/voiceover-renderer.test.ts` for each new role's output format
    - _Requirements: 7.1–7.18_

- [x] 9. Checkpoint — Verify all renderers
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Serialization round-trip and backward compatibility verification
  - [ ]* 10.1 Write property test for serialization round-trip with new roles (Property 10)
    - **Property 10: Serialization round-trip for expanded models**
    - **Validates: Requirements 9.1, 9.2, 9.3**
    - Extend `tests/property/model-serialization.test.ts` with generators that produce AnnouncementModels containing new roles

  - [ ]* 10.2 Write property test for backward-compatible tree superset (Property 11)
    - **Property 11: Backward-compatible tree superset**
    - **Validates: Requirements 10.3**
    - Create `tests/property/backward-compatibility.test.ts`
    - For HTML with only pre-expansion elements, verify every node from old output is still present

  - [ ]* 10.3 Write property tests for renderer backward compatibility (Properties 9, 12)
    - **Property 9: Renderer output correctness for new roles**
    - **Property 12: Renderer backward compatibility for pre-expansion roles**
    - **Validates: Requirements 6.1–6.18, 7.1–7.18, 8.1–8.18, 10.4**
    - Create `tests/property/renderer-expansion.test.ts`

- [x] 11. Final checkpoint — Full regression verification
  - Ensure all 562 CLI tests and 77 web tests continue to pass
  - Ensure all new unit and property tests pass
  - Ask the user if questions arise.
  - _Requirements: 10.1, 10.2_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The build order (types → role mapper → tree builder → renderers) ensures each layer compiles before the next depends on it
