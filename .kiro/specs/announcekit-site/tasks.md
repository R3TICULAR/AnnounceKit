# Implementation Plan: AnnounceKit Site

## Overview

Build the AnnounceKit product website bottom-up: Next.js project scaffold and build config first, then shared layout/accessibility infrastructure, then individual pages (Landing, Pricing, Docs, Analysis Tool, Settings, 404), then Stripe integration, then final wiring and testing. Marketing pages are SSG, the Analysis Tool is CSR. All components use Radix UI primitives and Tailwind CSS. The existing core engine is integrated via Webpack alias (same strategy as the Vite config in `web/`).

## Tasks

- [x] 1. Project scaffold and build configuration
  - [x] 1.1 Initialize Next.js App Router project in `site/` directory
    - Create `site/` with `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `package.json`
    - Install dependencies: `next`, `react`, `react-dom`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-tabs`, `@radix-ui/react-visually-hidden`, `@radix-ui/react-toggle`, `tailwindcss`, `postcss`, `autoprefixer`, `shiki`, `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `stripe`
    - Install dev dependencies: `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@types/react`, `@types/react-dom`, `typescript`
    - Configure Tailwind with custom color palette enforcing WCAG 4.5:1 / 3:1 contrast ratios
    - _Requirements: 1.4_

  - [x] 1.2 Configure Webpack alias for browser parser swap
    - In `next.config.js`, add `config.resolve.alias` mapping `src/parser/html-parser.ts` to `web/src/browser-parser.ts`
    - Add `@core` alias pointing to the root `src/` directory
    - Configure `.js` → `.ts` extension resolution
    - Verify jsdom is excluded from client bundles
    - _Requirements: 7.1, 7.2_

  - [x] 1.3 Configure MDX support for documentation pages
    - Set up `@next/mdx` in `next.config.js` with `rehype-pretty-code` or `shiki` for syntax highlighting
    - Create `mdx-components.tsx` with custom components for code blocks (with copy button)
    - _Requirements: 5.4_

  - [x] 1.4 Set up Vitest config for the site project
    - Create `site/vitest.config.ts` with jsdom environment, path aliases matching Next.js config
    - Configure fast-check and @testing-library/react
    - _Requirements: (testing infrastructure)_

- [x] 2. Shared layout shell and accessibility infrastructure
  - [x] 2.1 Create RootLayout with landmarks, lang attribute, and SkipLink
    - Create `site/app/layout.tsx` as the root server layout
    - Set `<html lang="en">` on the root element
    - Render `<SkipLink>` as the first child (server component: `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>`)
    - Render `<Navigation>` component
    - Render `<main id="main-content">` wrapping `{children}`
    - Render `<Footer>` with appropriate landmark
    - _Requirements: 1.1, 1.2, 1.5, 1.6_

  - [x] 2.2 Implement Navigation component with mobile menu
    - Create `site/components/Navigation.tsx` as a client component
    - Render `<nav aria-label="Main navigation">` with links to `/`, `/pricing`, `/docs`, `/tool`, `/settings`
    - Use `usePathname()` to set `aria-current="page"` on the active link
    - Below 768px: collapse to hamburger `<button aria-label="Menu">`
    - On mobile open: focus moves to first link
    - On Escape: close menu, return focus to toggle button
    - On route change: close mobile menu
    - All interactive elements keyboard-operable with visible focus indicators
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 1.5_

  - [ ]* 2.3 Write unit tests for Navigation component
    - Test `aria-current="page"` on active link
    - Test mobile menu toggle open/close
    - Test Escape key closes menu and returns focus
    - Test all links present and keyboard-accessible
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_

  - [x] 2.4 Implement RouteAnnouncer for focus management on navigation
    - Create `site/components/RouteAnnouncer.tsx` as a client component
    - On pathname change: find `<h1>` in main, set `tabindex="-1"`, call `.focus()`
    - Update ARIA live region with page title
    - _Requirements: 1.3_

  - [ ]* 2.5 Write unit tests for RouteAnnouncer
    - Test focus moves to h1 after simulated route change
    - Test live region updates with page title
    - _Requirements: 1.3_

  - [x] 2.6 Create CopyButton reusable component
    - Create `site/components/CopyButton.tsx` as a client component
    - Accept `text` and optional `label` props
    - On click: copy to clipboard, announce "Copied to clipboard" via live region
    - Handle clipboard API failure gracefully ("Copy failed")
    - _Requirements: 5.5, 6.13_

  - [x] 2.7 Create LiveRegion reusable component
    - Create `site/components/LiveRegion.tsx`
    - Render `<div role="status" aria-live="polite">` with dynamic message
    - _Requirements: 6.19, 10.2_

- [x] 3. Checkpoint — Verify layout shell and shared components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Marketing pages (SSG)
  - [x] 4.1 Implement Landing Page
    - Create `site/app/page.tsx` as a server component
    - Hero section: `<h1>`, value proposition (predicts screen reader output across NVDA, JAWS, VoiceOver), CTA link to `/tool`
    - Features section: four feature cards (cross-platform prediction, WCAG audit, semantic diff, CI/CD integration)
    - Enterprise/WCAG enforcement section explaining CLI_Tool for automated regression testing
    - CTA section with links to `/pricing` and `/docs`
    - Logical heading hierarchy: h1 → h2 subsections, no skipped levels
    - All images with descriptive `alt` or `alt=""` for decorative
    - Responsive layout reflowing at 320px without horizontal scroll
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 1.7, 1.8_

  - [ ]* 4.2 Write unit tests for Landing Page
    - Test h1 present with value proposition
    - Test four feature descriptions present
    - Test CTA links to `/tool`, `/pricing`, `/docs`
    - Test heading hierarchy (no skipped levels)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Implement Pricing Page
    - Create `site/app/pricing/page.tsx` as a server component
    - `<h1>Pricing</h1>` heading
    - Three tier cards (Free, Pro, Team/Enterprise) rendered as accessible list/group with labeled regions
    - Free tier: "Free" price, features per Requirement 4.2
    - Pro tier: "$15–25/mo per seat", features per Requirement 4.3, visually highlighted as recommended
    - Team/Enterprise tier: "Custom pricing", features per Requirement 4.4
    - CTA buttons: Free → `/tool`, Pro → `/settings` (placeholder), Team → `/settings` (placeholder)
    - "Coming soon" note for subscription management
    - Define `PRICING_TIERS` static data array as specified in design
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 4.4 Write unit tests for Pricing Page
    - Test three tier cards rendered with correct names and prices
    - Test Pro tier visually highlighted
    - Test each tier has correct feature list
    - Test accessible list/group structure with labeled regions
    - Test "coming soon" note present
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8_

  - [x] 4.5 Implement Settings Page (placeholder)
    - Create `site/app/settings/page.tsx` as a server component
    - `<h1>Settings</h1>` heading
    - Labeled sections for "Account" and "Subscription" with placeholder text ("Coming soon")
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 4.6 Write unit tests for Settings Page
    - Test h1 "Settings" present
    - Test "Account" and "Subscription" sections with placeholder text
    - _Requirements: 8.1, 8.3_

  - [x] 4.7 Implement 404 Page
    - Create `site/app/not-found.tsx`
    - `<h1>` heading, descriptive message, link back to `/`
    - Follows same layout shell (skip link, navigation, landmarks)
    - _Requirements: 10.1_

  - [ ]* 4.8 Write unit tests for 404 Page
    - Test heading, message, and home link present
    - _Requirements: 10.1_

- [x] 5. Documentation pages (SSG with MDX)
  - [x] 5.1 Create Docs layout with sidebar navigation
    - Create `site/app/docs/layout.tsx` with sidebar `<nav aria-label="Documentation navigation">`
    - Sidebar lists: API Reference, Usage Guide, Examples, CI/CD Integration
    - Below 768px: sidebar collapses into expandable disclosure widget
    - Main content area renders MDX children
    - _Requirements: 5.1, 5.2, 5.3, 9.3_

  - [x] 5.2 Create documentation MDX content files
    - Create `site/app/docs/api-reference/page.mdx` — document Parser, Extractor, Model, Renderer, Diff modules
    - Create `site/app/docs/usage-guide/page.mdx` — usage patterns and examples
    - Create `site/app/docs/examples/page.mdx` — code examples with syntax highlighting
    - Create `site/app/docs/cicd-integration/page.mdx` — npm install, GitHub Actions/GitLab CI setup, exit codes, JSON output, regression checks
    - All code blocks use `<pre><code>` with syntax highlighting and CopyButton
    - _Requirements: 5.4, 5.6, 5.7_

  - [ ]* 5.3 Write unit tests for Docs layout and sidebar
    - Test sidebar nav with `aria-label="Documentation navigation"`
    - Test all section links present
    - Test code blocks have copy buttons
    - Test mobile collapse behavior
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 9.3_

- [x] 6. Checkpoint — Verify all static pages render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Analysis Tool page (CSR)
  - [x] 7.1 Create Analysis Tool page shell with client directive
    - Create `site/app/tool/page.tsx` with `'use client'` directive
    - Set up `AnalysisToolState` with `useState` or `useReducer` (html, htmlBefore, diffMode, screenReader, cssSelector, loading, result, error)
    - Import `runAnalysis` and `runDiffAnalysis` from the analyzer service
    - _Requirements: 6.7, 7.3_

  - [x] 7.2 Implement HtmlInput component (textarea + file upload)
    - Create `site/components/tool/HtmlInput.tsx`
    - `<textarea aria-label="{label}" aria-describedby="html-error">` for HTML input
    - `<input type="file" accept=".html,.htm">` for file upload
    - Validate file extension on upload: reject non-.html/.htm with error in live region
    - Validate size limit (2 MB) with error in live region
    - Empty input error displayed inline via `aria-describedby`
    - _Requirements: 6.1, 6.2, 6.3, 6.16, 6.17_

  - [x] 7.3 Implement OptionsBar component
    - Create `site/components/tool/OptionsBar.tsx`
    - Screen reader selector (NVDA, JAWS, VoiceOver, All) using Radix Select or native `<select>`
    - CSS selector input: `<input type="text" aria-label="CSS selector">`
    - Diff mode toggle: `<button aria-pressed>` or Radix Toggle
    - _Requirements: 6.4, 6.5, 6.14_

  - [x] 7.4 Implement AnalyzeButton with loading state
    - Create analyze button that triggers `runAnalysis` or `runDiffAnalysis`
    - During analysis: set `aria-busy="true"` on results region, announce "Analyzing" via live region
    - On error: display error in `role="alert"` container, never expose internal details (stack traces, file paths)
    - Preserve user input on error (never clear state)
    - _Requirements: 6.6, 6.19, 10.2, 10.3, 10.4_

  - [x] 7.5 Implement ResultsTabs with Radix Tabs
    - Create `site/components/tool/ResultsTabs.tsx` using Radix Tabs
    - Tabs: Announcements, Audit Report, JSON Model, Semantic Diff (visible when diff mode on)
    - Proper ARIA: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`
    - On tab select: display corresponding panel, move focus into panel content
    - _Requirements: 6.8, 6.9, 6.10_

  - [x] 7.6 Implement result panel contents
    - Announcements panel: display rendered screen reader output for selected option (NVDA, JAWS, VoiceOver, or all three)
    - Audit Report panel: display formatted audit report text
    - JSON Model panel: `<pre><code>` with serialized model JSON + CopyButton
    - Semantic Diff panel: display diff with added/removed/changed nodes (visible only in diff mode)
    - _Requirements: 6.11, 6.12, 6.13, 6.15_

  - [x] 7.7 Implement diff mode with dual inputs
    - When diff mode toggled on: show two HtmlInput areas (before and after)
    - On analyze: call `runDiffAnalysis` with both inputs
    - Display SemanticDiff in the diff panel
    - _Requirements: 6.14, 6.15_

  - [ ]* 7.8 Write unit tests for Analysis Tool components
    - Test HtmlInput renders textarea and file upload
    - Test file extension validation (accept .html/.htm, reject others)
    - Test empty input error display with `aria-describedby`
    - Test size limit error display
    - Test OptionsBar renders all controls
    - Test AnalyzeButton loading state with `aria-busy`
    - Test ResultsTabs ARIA attributes
    - Test diff mode toggle shows dual inputs
    - Test error display uses `role="alert"` without internal details
    - Test user input preserved on error
    - _Requirements: 6.1–6.19, 10.2, 10.3, 10.4_

  - [x] 7.9 Implement CSS selector error handling
    - Display descriptive error via live region when selector is invalid or matches no elements
    - _Requirements: 6.18_

- [x] 8. Checkpoint — Verify Analysis Tool works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Stripe payment integration
  - [x] 9.1 Create Stripe Checkout API route
    - Create `site/app/api/checkout/route.ts`
    - Accept POST with tier ID, create Stripe Checkout Session with appropriate price ID
    - Redirect to Stripe hosted checkout
    - Free tier CTA skips Stripe, redirects to `/tool`
    - Team/Enterprise CTA redirects to contact/mailto
    - _Requirements: 4.7_

  - [x] 9.2 Create Stripe Customer Portal API route
    - Create `site/app/api/portal/route.ts`
    - Create Stripe portal session for existing customers
    - Redirect to Stripe Customer Portal for self-service management
    - _Requirements: 8.1 (future subscription management)_

  - [x] 9.3 Create Stripe webhook handler
    - Create `site/app/api/webhooks/stripe/route.ts`
    - Handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
    - Verify webhook signature
    - Store minimal subscription state (customer ID, tier, status)
    - _Requirements: 4.7_

  - [ ]* 9.4 Write unit tests for Stripe API routes
    - Test checkout session creation with correct price ID
    - Test webhook signature verification
    - Test subscription status updates
    - _Requirements: 4.7_

- [x] 10. Responsive layout and accessibility polish
  - [x] 10.1 Implement responsive breakpoints across all pages
    - Ensure content reflows without horizontal scroll at 320px–1920px
    - Analysis Tool: stack input, options, results vertically below 768px
    - Docs sidebar: collapse to disclosure widget below 768px
    - Touch targets: minimum 44×44px on mobile viewports
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 1.8_

  - [x] 10.2 Verify color contrast and focus indicators
    - Audit all text for 4.5:1 (normal) and 3:1 (large) contrast ratios
    - Ensure visible focus indicator on every focusable element
    - Verify all images have `alt` attributes
    - _Requirements: 1.4, 1.5, 1.7_

- [ ] 11. Property-based tests
  - [ ]* 11.1 Write property test for landmark structure (Property 1)
    - **Property 1: Landmark structure on all pages**
    - For each page route, render and assert exactly one `<main>` and at least one `<nav>`
    - **Validates: Requirements 1.1**

  - [ ]* 11.2 Write property test for skip link (Property 2)
    - **Property 2: Skip link is first focusable element**
    - For each page route, assert first focusable element is skip link targeting `#main-content`
    - **Validates: Requirements 1.2**

  - [ ]* 11.3 Write property test for focus on route change (Property 3)
    - **Property 3: Focus moves to heading on route change**
    - For random pairs of routes, simulate navigation and assert `document.activeElement` is the `<h1>`
    - **Validates: Requirements 1.3**

  - [ ]* 11.4 Write property test for image alt attributes (Property 4)
    - **Property 4: All images have alt attributes**
    - For each page route, assert every `<img>` has an `alt` attribute
    - **Validates: Requirements 1.7**

  - [ ]* 11.5 Write property test for active nav link (Property 5)
    - **Property 5: Active navigation link matches current route**
    - For each route, assert exactly one nav link has `aria-current="page"` matching the route
    - **Validates: Requirements 2.2**

  - [ ]* 11.6 Write property test for heading hierarchy (Property 6)
    - **Property 6: No skipped heading levels on any page**
    - For each page route, extract heading levels and assert no skips (e.g., h1→h3 without h2)
    - **Validates: Requirements 3.5**

  - [ ]* 11.7 Write property test for file extension validation (Property 7)
    - **Property 7: File upload extension validation**
    - Generate random filenames; assert `.html`/`.htm` accepted, all others rejected
    - **Validates: Requirements 6.3**

  - [ ]* 11.8 Write property test for valid HTML producing results (Property 8)
    - **Property 8: Valid HTML always produces analysis results**
    - Generate random non-empty HTML within size limit, call `runAnalysis`, assert non-null model, non-empty announcements, non-empty audit, valid JSON
    - **Validates: Requirements 6.7**

  - [ ]* 11.9 Write property test for tab pattern correctness (Property 9)
    - **Property 9: Tab pattern correctness**
    - Render results tabs, select each tab, assert `role="tab"`, `aria-controls` → valid `role="tabpanel"`, `aria-selected="true"`, panel visible
    - **Validates: Requirements 6.9, 6.10**

  - [ ]* 11.10 Write property test for result panel content (Property 10)
    - **Property 10: Result panels display correct analysis output**
    - Analyze random HTML with each screen reader option, assert Announcements panel matches renderer output, Audit panel matches `renderAuditReport`
    - **Validates: Requirements 6.11, 6.12**

  - [ ]* 11.11 Write property test for JSON model round-trip (Property 11)
    - **Property 11: JSON model panel round-trip**
    - Analyze random HTML, parse JSON from panel, deserialize, compare to original model
    - **Validates: Requirements 6.13**

  - [ ]* 11.12 Write property test for diff analysis (Property 12)
    - **Property 12: Diff analysis produces semantic diff**
    - Generate two random HTML strings, call `runDiffAnalysis`, assert non-null diff with numeric summary counts
    - **Validates: Requirements 6.15**

  - [ ]* 11.13 Write property test for model round-trip in browser context (Property 13)
    - **Property 13: Announcement model round-trip (browser context)**
    - Parse random HTML via browser parser, build tree, serialize, deserialize, compare models
    - **Validates: Requirements 7.4**

  - [ ]* 11.14 Write property test for error display (Property 14)
    - **Property 14: Accessible error display without internal details**
    - Trigger various errors, assert displayed message contains no stack traces/file paths/module names, and error is in `role="alert"` or linked via `aria-describedby`
    - **Validates: Requirements 10.2, 10.3**

  - [ ]* 11.15 Write property test for input preservation on error (Property 15)
    - **Property 15: User input preserved on error**
    - Set random input values, trigger error, assert all input fields and options unchanged
    - **Validates: Requirements 10.4**

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The existing `web/src/analyzer.ts` and `web/src/browser-parser.ts` are reused as-is — no modifications needed
- All Stripe API calls are server-side only (API routes); the secret key never reaches the client
