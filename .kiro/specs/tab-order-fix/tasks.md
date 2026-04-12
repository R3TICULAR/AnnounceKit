# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Tab Order Defects Across Docs, Tool, and Pricing Pages
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the five tab order defects
  - **Scoped PBT Approach**: Scope the property to the concrete failing cases for each defect condition
  - Write property-based tests in `site/__tests__/tab-order-bug-condition.test.tsx` using `@testing-library/react` and `userEvent.tab()`
  - **Defect 1 — Docs Desktop Sidebar Skipped**: Render `DocsLayout` at ≥768px viewport. Tab through all elements after main nav. Assert that sidebar links (API Reference, Usage Guide, Examples, CI/CD Integration) and Core Modules links (Parser, Extractor, Renderers) receive focus sequentially before the docs content area. Bug condition: `isBugCondition({ page: '/docs/*', viewport: 'desktop', action: 'tab' }) AND sidebarLinksSkippedDuringTab()`. Expected: sidebar links are reachable via Tab.
  - **Defect 2 — Docs Mobile Navigation Inaccessible**: Render `DocsLayout` at <768px viewport. Assert that some keyboard-accessible mechanism exists to reach docs navigation links. Bug condition: `isBugCondition({ page: '/docs/*', viewport: 'mobile', action: 'tab' }) AND noAlternativeDocsNavigation()`. Expected: a mobile docs nav mechanism is present and keyboard-operable.
  - **Defect 3 — Tool Page Control Bar Order**: Render `AnalyzerPage` at various viewport widths. Tab through the control bar and assert order is: Upload button → Screen reader select → CSS selector input → Diff mode toggle → Analyze button. Bug condition: `controlBarTabOrderDoesNotMatchVisualOrder()`. Expected: consistent left-to-right, top-to-bottom tab order.
  - **Defect 4 — Pricing Page Focus Indicators Obscured**: Render `PricingPage` at desktop viewport. Focus each CTA button and assert focus indicators are not clipped or obscured by the Pro card's `md:scale-105 z-10`. Bug condition: `visualEmphasisDoesNotMatchTabOrder()`. Expected: all CTA focus indicators are fully visible.
  - **Defect 5 — Docs Skip Link Lands Before Sidebar**: Render docs layout, activate skip link targeting `#main-content`. Assert that the next Tab press reaches a docs content element, NOT a sidebar link. Bug condition: `skipLinkLandsBeforeSidebar()`. Expected: skip link lands past the sidebar in the docs content area.
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found (e.g., "After last nav link, focus jumps to footer Privacy Policy instead of sidebar API Reference link")
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Unaffected Pages Tab Order and Global Navigation Patterns
  - **IMPORTANT**: Follow observation-first methodology
  - Write property-based tests in `site/__tests__/tab-order-preservation.test.tsx` using `@testing-library/react` and `userEvent.tab()`
  - **Observe on UNFIXED code first**, then encode observed behavior as assertions:
  - **Landing Page**: Observe tab order: skip link → nav links (Home, Pricing, Docs, Analyzer) → hero CTAs (Try the Analyzer, View Documentation) → final CTAs (See Pricing, Read the Docs) → footer links. Write property asserting this sequence is preserved.
  - **Sign In Page**: Observe tab order: email input → password input → Forgot password button → Sign In button → Google OAuth button → GitHub OAuth button → Sign up link. Write property asserting this sequence is preserved.
  - **Sign Up Page**: Observe tab order: GitHub OAuth button → Google OAuth button → email input → password input → confirm password input → Create Account button → Sign in link. Write property asserting this sequence is preserved.
  - **Settings Page**: Observe tab order: Sign Out button → Manage Subscription/Upgrade to Pro button → support email link. Write property asserting this sequence is preserved.
  - **404 Page**: Observe tab order: skip link → nav links → Back to Home button → footer links. Write property asserting this sequence is preserved.
  - **Global Skip Link First**: For all pages in {Landing, Sign In, Sign Up, Settings, 404, Docs, Tool, Pricing}, observe that the skip link is the first focusable element and main nav links follow immediately. Write property asserting this is preserved.
  - **Mobile Hamburger Menu**: Observe that the hamburger menu toggle opens the mobile nav, focuses the first link, and closes on Escape returning focus to the toggle button. Write property asserting this is preserved.
  - Verify all tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix tab order defects across Docs, Tool, and Pricing pages

  - [x] 3.1 Fix Docs desktop sidebar focusability in `site/app/docs/layout.tsx`
    - Replace `hidden md:block` on the `<aside>` with a responsive approach that keeps the sidebar in the accessibility tree and tab order at desktop viewports
    - Options: use `max-md:hidden` (which applies `display: none` only below `md`), or restructure so the sidebar is always focusable at ≥768px
    - Verify the sidebar `<aside>` with `sticky top-[73px]` and `overflow-y-auto` does not create a focus trap or skip — adjust if needed
    - Ensure sidebar links (API Reference, Usage Guide, Examples, CI/CD Integration, Parser, Extractor, Renderers) receive focus sequentially after main nav and before docs content
    - _Bug_Condition: isBugCondition({ page: '/docs/*', viewport: 'desktop', action: 'tab' }) AND sidebarLinksSkippedDuringTab()_
    - _Expected_Behavior: Sidebar links reachable via Tab in DOM order after main nav_
    - _Preservation: Landing, Sign In, Sign Up, Settings, 404 tab order unchanged_
    - _Requirements: 2.1_

  - [x] 3.2 Add mobile docs navigation in `site/app/docs/layout.tsx`
    - Add a collapsible/expandable docs navigation menu visible only at mobile viewports (`md:hidden`)
    - Use a `<button>` toggle (or `<details>`/`<summary>`) that reveals the same links as the desktop sidebar (DOCS_SECTIONS + CORE_MODULES)
    - Ensure the mobile docs nav is keyboard-operable: button is focusable, Enter/Space toggles, links inside are focusable when expanded
    - Hide the mobile docs nav at desktop (`hidden md:hidden` or equivalent) so it doesn't duplicate the sidebar
    - _Bug_Condition: isBugCondition({ page: '/docs/*', viewport: 'mobile', action: 'tab' }) AND noAlternativeDocsNavigation()_
    - _Expected_Behavior: Mobile users can reach all docs navigation links via keyboard_
    - _Preservation: Desktop sidebar behavior unchanged; mobile hamburger menu behavior unchanged_
    - _Requirements: 2.2_

  - [x] 3.3 Add docs content skip link target in `site/app/docs/layout.tsx`
    - Add `id="docs-content"` to the content `<div>` (currently `<div className="flex-1 px-8 py-12 lg:px-16 max-w-4xl">`)
    - Add `tabIndex={-1}` to make it a valid focus target for the skip link
    - Update the skip link in `site/app/layout.tsx` OR add a secondary docs-specific skip link in the docs layout that targets `#docs-content`
    - Preferred approach: add a docs-specific skip link inside `DocsLayout` (visible only on docs pages) that says "Skip to docs content" and targets `#docs-content`, so the global skip link remains unchanged for other pages
    - _Bug_Condition: isBugCondition({ page: '/docs/*', action: 'skip-link' }) AND skipLinkLandsBeforeSidebar()_
    - _Expected_Behavior: Skip link activation moves focus past sidebar to docs content area_
    - _Preservation: Global skip link behavior on non-docs pages unchanged_
    - _Requirements: 2.5_

  - [x] 3.4 Enforce Tool page control bar tab order in `site/app/tool/page.tsx`
    - Add explicit `order` CSS classes to control bar items within the `flex flex-wrap items-center gap-4` container
    - Assign `order-1` to Upload button, `order-2` to screen reader select wrapper, `order-3` to CSS selector input wrapper, `order-4` to diff mode toggle wrapper, `order-5` to Analyze button (move Analyze into the same flex row or give it explicit order)
    - Alternatively, restructure the control bar to use CSS Grid with explicit column placement to prevent reflow reordering
    - Ensure tab order matches: Upload → Screen reader select → CSS selector input → Diff mode toggle → Analyze at all viewport widths
    - _Bug_Condition: isBugCondition({ page: '/tool', action: 'tab' }) AND controlBarTabOrderDoesNotMatchVisualOrder()_
    - _Expected_Behavior: Control bar tab order is Upload → Select → Input → Toggle → Analyze regardless of viewport_
    - _Preservation: Tool page functionality and visual layout unchanged_
    - _Requirements: 2.3_

  - [x] 3.5 Fix Pricing page focus indicator visibility in `site/app/pricing/page.tsx`
    - Prevent the Pro card's `md:scale-105 z-10` from obscuring focus indicators on adjacent Free and Enterprise card CTA buttons
    - Add `focus-within:z-20` (or `focus-within:z-30`) to each card container so that when a CTA button inside is focused, the card rises above the Pro card's `z-10`
    - Alternatively, add sufficient gap between cards to account for the 5% scale, or replace `md:scale-105` with padding/border emphasis that doesn't cause overlap
    - Ensure all three CTA button focus rings (Free, Pro, Enterprise) are fully visible and not clipped
    - _Bug_Condition: isBugCondition({ page: '/pricing', action: 'tab' }) AND visualEmphasisDoesNotMatchTabOrder()_
    - _Expected_Behavior: All pricing CTA focus indicators fully visible, not obscured by adjacent card z-index/scale_
    - _Preservation: Pricing page visual design and card layout unchanged; tab order Free → Pro → Enterprise preserved_
    - _Requirements: 2.4_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Tab Order Defects Resolved
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior for all five defect conditions
    - When this test passes, it confirms the expected behavior is satisfied for all defects
    - Run bug condition exploration test from step 1 (`site/__tests__/tab-order-bug-condition.test.tsx`)
    - **EXPECTED OUTCOME**: Test PASSES (confirms all five tab order bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Unaffected Pages Tab Order and Global Navigation Patterns
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2 (`site/__tests__/tab-order-preservation.test.tsx`)
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions on Landing, Sign In, Sign Up, Settings, 404, skip link, mobile menu)
    - Confirm all preservation tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Run the full test suite to ensure no regressions
  - Verify bug condition tests pass (task 1 tests now passing)
  - Verify preservation tests pass (task 2 tests still passing)
  - Ensure all existing site tests continue to pass
  - Ask the user if questions arise
