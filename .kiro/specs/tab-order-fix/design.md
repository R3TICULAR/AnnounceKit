# Tab Order Fix — Bugfix Design

## Overview

Keyboard tab order is broken across several pages of the AnnounceKit site. The primary defect is on the Docs pages where the sidebar `<aside>` uses `hidden md:block`, causing sidebar links to be skipped on desktop and completely inaccessible on mobile. Secondary defects exist on the Tool page (flex-wrap scrambles control bar tab order across breakpoints), the Pricing page (visual emphasis on the Pro card doesn't match DOM/tab order), and the Docs skip link (doesn't land past the sidebar). The fix strategy is to restructure the Docs sidebar for proper focusability, add a mobile docs navigation mechanism, enforce logical `order` on the Tool page control bar, and adjust the skip link target on Docs pages.

## Glossary

- **Bug_Condition (C)**: The set of conditions under which keyboard tab order deviates from the expected logical reading order — sidebar links skipped, mobile sidebar inaccessible, control bar order scrambled, pricing card order mismatched, or skip link landing in the wrong place
- **Property (P)**: The desired behavior — keyboard focus moves through all interactive elements in a logical, visually-consistent sequence on every page and breakpoint
- **Preservation**: Existing tab order on Landing, Sign In, Sign Up, Settings, 404, and the global skip-link-first / nav-first pattern must remain unchanged
- **DocsLayout**: The component in `site/app/docs/layout.tsx` that renders the sidebar `<aside>` and content area
- **Navigation**: The component in `site/components/Navigation.tsx` that renders the fixed top nav with mobile hamburger menu
- **RootLayout**: The component in `site/app/layout.tsx` that renders the skip link, Navigation, `<main>`, and footer

## Bug Details

### Bug Condition

The bug manifests across five distinct conditions on the AnnounceKit site. The common thread is that CSS layout properties (`hidden md:block`, `flex-wrap`, `md:scale-105`, `sticky`) cause the visual presentation to diverge from the DOM source order, breaking keyboard navigation.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { page: string, viewport: 'mobile' | 'desktop', action: 'tab' | 'skip-link' }
  OUTPUT: boolean

  // Defect 1: Docs desktop sidebar skipped
  IF input.page == '/docs/*' AND input.viewport == 'desktop' AND input.action == 'tab'
    AND sidebarLinksSkippedDuringTab()
    RETURN true

  // Defect 2: Docs mobile sidebar inaccessible
  IF input.page == '/docs/*' AND input.viewport == 'mobile' AND input.action == 'tab'
    AND noAlternativeDocsNavigation()
    RETURN true

  // Defect 3: Tool page control bar order scrambled
  IF input.page == '/tool' AND input.action == 'tab'
    AND controlBarTabOrderDoesNotMatchVisualOrder()
    RETURN true

  // Defect 4: Pricing page visual/DOM order mismatch
  IF input.page == '/pricing' AND input.action == 'tab'
    AND visualEmphasisDoesNotMatchTabOrder()
    RETURN true

  // Defect 5: Docs skip link doesn't land past sidebar
  IF input.page == '/docs/*' AND input.action == 'skip-link'
    AND skipLinkLandsBeforeSidebar()
    RETURN true

  RETURN false
END FUNCTION
```

### Examples

- **Defect 1**: On `/docs` at 1024px width, pressing Tab after the last nav link ("Analyzer") — focus jumps to the footer "Privacy Policy" link, skipping all 7 sidebar links (API Reference, Usage Guide, Examples, CI/CD Integration, Parser, Extractor, Renderers). Expected: focus should reach "API Reference" sidebar link next.
- **Defect 2**: On `/docs` at 375px width, pressing Tab repeatedly — the sidebar is `display: none` so its links never receive focus, and no alternative mobile docs nav exists. Expected: a mobile-accessible mechanism (e.g., collapsible menu) should provide access to all docs navigation links.
- **Defect 3**: On `/tool` at 768px width, pressing Tab through the control bar — the Upload button, screen reader select, CSS selector input, diff mode toggle, and Analyze button may not follow left-to-right, top-to-bottom order when flex-wrap causes reflow. Expected: tab order should be Upload → Screen reader select → CSS selector → Diff mode toggle → Analyze, regardless of wrapping.
- **Defect 4**: On `/pricing` at 1024px width — the Pro card is visually elevated (`md:scale-105`, `z-10`, `border-2 border-blue-600`) and appears as the primary option, but tab order is Free → Pro → Enterprise (DOM order). The visual hierarchy suggests Pro should be encountered first or the visual emphasis should not create a misleading expectation. Expected: DOM order matches visual reading order (Free → Pro → Enterprise is acceptable since it reads left-to-right; the real issue is that `md:scale-105` with `z-10` can cause overlap that obscures focus indicators on adjacent cards).
- **Defect 5**: On `/docs`, activating "Skip to main content" — focus moves to `<main id="main-content">`, but the first focusable child inside the docs layout is the sidebar "API Reference" link, not the docs content. Expected: skip link should land the user in the docs content area, past the sidebar.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Landing page tab order: skip link → nav links → hero CTAs → final CTAs → footer links
- Sign In page tab order: email → password → Forgot password → Sign In → Google → GitHub → Sign up link
- Sign Up page tab order: GitHub → Google → email → password → confirm password → Create Account → Sign in link
- Settings page tab order: Sign Out → Manage Subscription/Upgrade → support email
- 404 page tab order: skip link → nav links → Back to Home → footer links
- Skip link is always the first focusable element on every page
- Main navigation links always follow the skip link
- Mobile hamburger menu opens, focuses first link, closes on Escape returning focus to toggle

**Scope:**
All inputs that do NOT involve the five defect conditions should be completely unaffected by this fix. This includes:
- Mouse/touch interactions on all pages
- Keyboard navigation on Landing, Sign In, Sign Up, Settings, and 404 pages
- Screen reader announcements and ARIA attributes on unaffected pages
- Visual layout and styling on unaffected pages

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Docs sidebar `hidden md:block` removes from tab order**: The `<aside>` in `site/app/docs/layout.tsx` uses `hidden md:block`. At mobile breakpoints, `hidden` applies `display: none`, removing the element from both visual display and the accessibility tree. At desktop, `md:block` restores visibility, but the combination with `sticky top-[73px]` positioning and the sidebar being a sibling of the content `<div>` inside a flex container may cause browsers to skip it during sequential tab navigation if the sticky positioning creates a new stacking context that confuses focus order.

2. **No mobile docs navigation alternative**: The docs layout provides no fallback navigation for mobile users. When the sidebar is hidden, there is simply no way to reach the docs section links via keyboard on mobile.

3. **Tool page flex-wrap without explicit order**: The control bar in `site/app/tool/page.tsx` uses `flex flex-wrap items-center gap-4` without explicit `order` properties. When the viewport is narrow enough to cause wrapping, the visual order of controls may differ from DOM order, creating a tab order mismatch.

4. **Pricing page `md:scale-105` and `z-10` on Pro card**: In `site/app/pricing/page.tsx`, the Pro card uses `md:scale-105 z-10` which causes it to visually overlap adjacent cards. This can obscure focus indicators on the Free and Enterprise cards' CTA buttons when they are focused, making it appear as though focus is lost or skipped.

5. **Skip link targets `#main-content` which contains the sidebar**: In `site/app/layout.tsx`, the skip link points to `<main id="main-content">`. On docs pages, the docs layout renders the sidebar as the first child inside `<main>`, so activating the skip link lands focus before the sidebar rather than after it.

## Correctness Properties

Property 1: Bug Condition - Docs Desktop Sidebar Reachable via Tab

_For any_ keyboard tab sequence on a Docs page at desktop viewport (≥768px), the fixed DocsLayout SHALL allow focus to reach all sidebar navigation links (API Reference, Usage Guide, Examples, CI/CD Integration) and Core Modules links (Parser, Extractor, Renderers) sequentially after the main navigation and before the main docs content area.

**Validates: Requirements 2.1**

Property 2: Bug Condition - Docs Mobile Navigation Accessible

_For any_ keyboard interaction on a Docs page at mobile viewport (<768px), the fixed DocsLayout SHALL provide an accessible, keyboard-operable mechanism to reach all documentation navigation links that are available in the desktop sidebar.

**Validates: Requirements 2.2**

Property 3: Bug Condition - Tool Page Logical Tab Order

_For any_ keyboard tab sequence on the Tool page at any viewport width, the fixed AnalyzerPage SHALL ensure tab order through the control bar follows: Upload button → Screen reader select → CSS selector input → Diff mode toggle → Analyze button, matching the visual layout regardless of flex-wrap reflow.

**Validates: Requirements 2.3**

Property 4: Bug Condition - Pricing Page Focus Indicators Not Obscured

_For any_ keyboard tab sequence on the Pricing page at desktop viewport, the fixed PricingPage SHALL ensure that focus indicators on all three tier CTA buttons (Free, Pro, Enterprise) are fully visible and not obscured by adjacent card scaling or z-index layering.

**Validates: Requirements 2.4**

Property 5: Bug Condition - Docs Skip Link Lands Past Sidebar

_For any_ activation of the skip link on a Docs page, the fixed layout SHALL move focus to the beginning of the docs content area (past the sidebar), so the next Tab press reaches the first interactive element in the docs content, not a sidebar link.

**Validates: Requirements 2.5**

Property 6: Preservation - Unaffected Pages Tab Order Unchanged

_For any_ keyboard tab sequence on Landing, Sign In, Sign Up, Settings, or 404 pages, the fixed code SHALL produce exactly the same tab order as the original code, preserving all existing keyboard navigation behavior on these pages.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

Property 7: Preservation - Global Navigation Patterns Unchanged

_For any_ page, the skip link SHALL remain the first focusable element, main navigation links SHALL follow immediately after, and the mobile hamburger menu SHALL continue to open/close with proper focus management.

**Validates: Requirements 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `site/app/docs/layout.tsx`

**Function**: `DocsLayout`

**Specific Changes**:
1. **Fix desktop sidebar focusability**: Replace `hidden md:block` with a responsive approach that doesn't use `display: none` at desktop. Use `max-md:hidden` or restructure so the sidebar is always in the DOM at desktop and properly participates in tab order. Alternatively, ensure the sidebar uses a CSS approach that keeps it in the accessibility tree at desktop (e.g., `invisible md:visible` won't work either since `invisible` sets `visibility: hidden`). The simplest fix: keep `hidden md:block` but verify it actually works — the real issue may be that `sticky` positioning combined with `overflow-y-auto` on the aside creates a scroll container that traps or skips focus. Test and potentially remove `overflow-y-auto` or adjust the sticky behavior.

2. **Add mobile docs navigation**: Add a collapsible/expandable docs navigation menu for mobile viewports. This could be a `<details>`/`<summary>` element or a button-toggled panel that appears above the content on mobile, containing the same links as the desktop sidebar. Show it only at `md:hidden` breakpoint.

3. **Add docs content skip target**: Add an `id` attribute (e.g., `id="docs-content"`) to the content `<div>` in the docs layout, and either:
   - Add a secondary skip link within the docs layout that targets `#docs-content`, or
   - On docs pages, have the main skip link target `#docs-content` instead of `#main-content`

**File**: `site/app/tool/page.tsx`

**Function**: `AnalyzerPage`

**Specific Changes**:
4. **Enforce control bar tab order**: Add explicit `order` CSS classes to the control bar items within the `flex flex-wrap` container to ensure consistent visual and DOM order across breakpoints. Alternatively, restructure the control bar markup so the DOM order matches the desired tab order at all breakpoints (Upload → Select → Input → Toggle → Analyze). Since the current DOM order already matches this sequence, the fix may be to prevent wrapping from creating a visual reorder — use `flex-wrap` with explicit `order-1`, `order-2`, etc. on each control, or switch to a grid layout that maintains order.

**File**: `site/app/pricing/page.tsx`

**Function**: `PricingPage`

**Specific Changes**:
5. **Prevent focus indicator obscuring**: Adjust the Pro card's `md:scale-105 z-10` so it doesn't overlap adjacent cards' focus indicators. Options:
   - Add sufficient `gap` or `padding` between cards to account for the scale
   - Ensure focused CTA buttons get a higher `z-index` than the Pro card's `z-10` (e.g., `focus-within:z-20` on card containers)
   - Or remove `md:scale-105` and achieve the "recommended" emphasis through other visual means (larger padding, colored background) that don't cause overlap

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that render each affected page component, simulate Tab key presses, and assert the focus order matches expectations. Use `@testing-library/react` with `userEvent.tab()` to walk through focus sequences. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Docs Desktop Sidebar Tab Test**: Render DocsLayout at ≥768px, tab through all elements, assert sidebar links receive focus after nav links (will fail on unfixed code)
2. **Docs Mobile Navigation Test**: Render DocsLayout at <768px, assert that docs navigation links are reachable via some keyboard mechanism (will fail on unfixed code)
3. **Tool Control Bar Order Test**: Render AnalyzerPage at various widths, tab through control bar, assert order is Upload → Select → Input → Toggle → Analyze (may fail on unfixed code at narrow widths)
4. **Pricing Focus Indicator Test**: Render PricingPage at desktop, focus each CTA button, assert focus indicator is not clipped or obscured (will fail on unfixed code)
5. **Docs Skip Link Target Test**: Render DocsLayout, activate skip link, assert next Tab reaches docs content not sidebar (will fail on unfixed code)

**Expected Counterexamples**:
- Sidebar links never appear in the tab sequence on desktop
- No docs navigation mechanism exists on mobile
- Skip link activation followed by Tab lands on sidebar "API Reference" link instead of docs content

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := renderAndTabThrough_fixed(input)
  ASSERT expectedTabOrder(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT tabOrder_original(input) = tabOrder_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for all unaffected pages (Landing, Sign In, Sign Up, Settings, 404), capture the exact tab order sequence, then write property-based tests that verify the same sequence after the fix.

**Test Cases**:
1. **Landing Page Preservation**: Observe that tab order on Landing page follows skip link → nav → hero CTAs → footer on unfixed code, then verify this continues after fix
2. **Sign In Page Preservation**: Observe that tab order on Sign In follows email → password → Forgot password → Sign In → OAuth → Sign up on unfixed code, then verify this continues after fix
3. **Sign Up Page Preservation**: Observe that tab order on Sign Up follows GitHub → Google → email → password → confirm → Create Account → Sign in on unfixed code, then verify this continues after fix
4. **Settings Page Preservation**: Observe that tab order on Settings follows Sign Out → Manage/Upgrade → support email on unfixed code, then verify this continues after fix
5. **404 Page Preservation**: Observe that tab order on 404 follows skip link → nav → Back to Home → footer on unfixed code, then verify this continues after fix
6. **Skip Link First Preservation**: Observe that skip link is first focusable element on every page on unfixed code, then verify this continues after fix
7. **Mobile Menu Preservation**: Observe that hamburger menu open/close/focus behavior works on unfixed code, then verify this continues after fix

### Unit Tests

- Test DocsLayout renders sidebar links that are focusable at desktop viewport
- Test DocsLayout renders mobile docs navigation at mobile viewport
- Test DocsLayout mobile docs nav is keyboard-operable (open/close, links focusable)
- Test AnalyzerPage control bar elements have correct tab order at multiple viewport widths
- Test PricingPage CTA buttons all receive visible focus indicators
- Test Docs skip link target resolves to docs content area, not sidebar

### Property-Based Tests

- Generate random viewport widths and verify Docs sidebar links are always reachable via keyboard (either desktop sidebar or mobile nav)
- Generate random viewport widths for Tool page and verify control bar tab order is always Upload → Select → Input → Toggle → Analyze
- Generate random page routes from the unaffected set and verify tab order matches the documented expected sequence

### Integration Tests

- Test full keyboard navigation flow on Docs page: skip link → nav → sidebar → content → footer
- Test full keyboard navigation flow on Tool page: nav → textarea → control bar → results → footer
- Test full keyboard navigation flow on Pricing page: nav → Free CTA → Pro CTA → Enterprise CTA → footer
- Test skip link on Docs page lands in content area and next Tab reaches first content interactive element
- Test mobile Docs page: nav → mobile docs menu → content → footer
