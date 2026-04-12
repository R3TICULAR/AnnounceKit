# Bugfix Requirements Document

## Introduction

Keyboard tab order is broken across several pages of the AnnounceKit site. The most critical issue is on the Docs pages: after tabbing through the main navigation links, focus jumps directly to the footer, completely skipping the sidebar navigation (`<aside>` with `hidden md:block`). The `hidden` utility applies `display: none` at mobile breakpoints, and while `md:block` restores visibility on desktop, the combination with `sticky` positioning and the DOM structure inside `<main>` causes the sidebar links to be unreachable via sequential keyboard navigation on some browsers/viewports. Additional tab order issues exist on other pages where positive `tabindex` values are absent but visual layout (CSS grid, flexbox order, sticky/fixed positioning) creates a mismatch between visual presentation and DOM source order.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a keyboard user tabs through the Docs page on desktop (≥768px) THEN the system skips all sidebar navigation links (API Reference, Usage Guide, Examples, CI/CD Integration) and the Core Modules links (Parser, Extractor, Renderers), jumping from the last main navigation link directly to the footer's Privacy Policy link

1.2 WHEN a keyboard user tabs through the Docs page on mobile (<768px) THEN the sidebar navigation links are completely inaccessible because the `<aside>` element uses `hidden md:block` which applies `display: none` at mobile, removing the sidebar from both visual display and the accessibility tree, with no alternative navigation provided

1.3 WHEN a keyboard user tabs through the Tool (Analyzer) page THEN the tab order within the control bar may not follow the expected left-to-right, top-to-bottom visual reading order due to flex-wrap layout causing the Upload button, screen reader select, CSS selector input, diff mode toggle, and Analyze button to reflow unpredictably across breakpoints

1.4 WHEN a keyboard user tabs through the Pricing page THEN the tab order traverses the three pricing tier cards in DOM order, but the visually-promoted "Recommended" Pro card (scaled via `md:scale-105` and `z-10`) appears elevated and centered, creating a visual emphasis that does not match the sequential DOM/tab order (Free → Pro → Enterprise)

1.5 WHEN a keyboard user uses the skip link ("Skip to main content") on the Docs page THEN focus moves to the `<main>` element, but the first focusable element inside `<main>` is still ambiguous because the sidebar `<aside>` is a child of the docs layout `<div>` inside `<main>`, and the content area follows it — the skip link does not reliably land the user in the docs content area past the sidebar

### Expected Behavior (Correct)

2.1 WHEN a keyboard user tabs through the Docs page on desktop (≥768px) THEN the system SHALL allow focus to move sequentially through the sidebar navigation links (API Reference, Usage Guide, Examples, CI/CD Integration) and Core Modules links (Parser, Extractor, Renderers) after the main navigation and before the main docs content area, following DOM source order

2.2 WHEN a keyboard user visits the Docs page on mobile (<768px) THEN the system SHALL provide an accessible mechanism to reach the documentation navigation links, either by making the sidebar visible and focusable, or by providing an alternative mobile navigation pattern (e.g., a collapsible menu or in-page navigation) that is keyboard-accessible

2.3 WHEN a keyboard user tabs through the Tool (Analyzer) page THEN the system SHALL ensure tab order follows a logical sequence matching the visual layout: HTML input textarea → (Before textarea if diff mode) → Upload button → Screen reader select → CSS selector input → Diff mode toggle → Analyze button → result tabs → result panel actions, regardless of viewport width

2.4 WHEN a keyboard user tabs through the Pricing page THEN the system SHALL maintain a logical tab order through all three pricing tier CTA buttons (Free → Pro → Enterprise) that matches the visual left-to-right presentation, without any focusable elements being skipped or reordered

2.5 WHEN a keyboard user activates the skip link on the Docs page THEN the system SHALL move focus to the beginning of the main documentation content area (past the sidebar), so the user can immediately begin reading or interacting with the page content

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a keyboard user tabs through the Landing page (Home) THEN the system SHALL CONTINUE TO allow sequential focus through: skip link → main nav links → hero CTA buttons (Try the Analyzer, View Documentation) → feature cards (no interactive elements) → enterprise section image → final CTA buttons (See Pricing, Read the Docs) → footer links

3.2 WHEN a keyboard user tabs through the Sign In page THEN the system SHALL CONTINUE TO allow sequential focus through: email input → password input → Forgot password button → Sign In button → Google OAuth button → GitHub OAuth button → Sign up link

3.3 WHEN a keyboard user tabs through the Sign Up page THEN the system SHALL CONTINUE TO allow sequential focus through: GitHub OAuth button → Google OAuth button → email input → password input → confirm password input → Create Account button → Sign in link

3.4 WHEN a keyboard user tabs through the Settings page THEN the system SHALL CONTINUE TO allow sequential focus through: Sign Out button → Manage Subscription / Upgrade to Pro button → support email link

3.5 WHEN a keyboard user tabs through the 404 page THEN the system SHALL CONTINUE TO allow sequential focus through: skip link → main nav links → Back to Home button → footer links

3.6 WHEN a keyboard user tabs through any page THEN the system SHALL CONTINUE TO present the skip link as the first focusable element, followed by the main navigation links, before any page-specific content

3.7 WHEN a keyboard user uses the mobile hamburger menu on any page THEN the system SHALL CONTINUE TO open the mobile nav, focus the first link, and close on Escape returning focus to the toggle button
