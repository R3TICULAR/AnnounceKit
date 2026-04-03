# Requirements Document

## Introduction

AnnounceKit Site is a full product website for AnnounceKit — an accessibility analysis tool that predicts screen reader output across operating systems (NVDA, JAWS, VoiceOver). The site encompasses a marketing landing page, pricing page, documentation pages, the embedded analysis tool, and a settings/account area. The existing core engine (extractor, renderers, diff engine, model serialization) and browser parser adapter are integrated directly into the site. The site itself must be an exemplar of web accessibility, using accessible component primitives and following WCAG 2.2 AA throughout. A React/Next.js stack with an accessible component library (e.g., Radix UI, React Aria) is the recommended but not mandated framework choice.

## Glossary

- **Site**: The AnnounceKit product website application, including all pages and the embedded analysis tool
- **Landing_Page**: The marketing home page that communicates the AnnounceKit value proposition
- **Pricing_Page**: The page displaying subscription tiers and the freemium model structure
- **Docs_Pages**: The documentation section containing API reference, usage guides, and examples
- **Analysis_Tool**: The embedded interactive tool where users paste or upload HTML and view screen reader predictions, audit reports, JSON models, and semantic diffs
- **Settings_Area**: The account and settings section reserved for future authentication and subscription management
- **Core_Engine**: The existing TypeScript modules in `src/` (extractor, renderers, diff engine, model serialization) that power accessibility analysis
- **Browser_Parser**: The browser-compatible HTML parser adapter at `web/src/browser-parser.ts` that uses DOMParser instead of jsdom
- **Screen_Reader_Option**: One of NVDA, JAWS, VoiceOver, or All — the target screen reader for announcement rendering
- **Announcement_Model**: The canonical JSON representation of an accessibility tree produced by the Core_Engine
- **Semantic_Diff**: The structured comparison between two Announcement_Models showing added, removed, and changed nodes
- **Audit_Report**: A developer-friendly accessibility audit generated from an Announcement_Model
- **Router**: The client-side or server-side routing system that maps URL paths to pages
- **Navigation**: The persistent site-wide navigation component providing links to all top-level pages
- **Skip_Link**: A visually hidden link that becomes visible on focus and allows keyboard users to bypass repeated navigation
- **Focus_Management**: The practice of programmatically moving keyboard focus to appropriate elements during page transitions and dynamic content updates
- **Live_Region**: An ARIA live region that announces dynamic content changes to screen readers
- **CLI_Tool**: The existing Node.js command-line interface for AnnounceKit that can be installed via npm and integrated into CI/CD pipelines for automated accessibility regression testing

## Requirements

### Requirement 1: Site-Wide Accessibility Foundation

**User Story:** As a user with a disability, I want the AnnounceKit site to follow accessibility best practices throughout, so that I can use every feature with assistive technology.

#### Acceptance Criteria

1. THE Site SHALL render all pages as valid HTML5 with a single `<main>` landmark, at least one `<nav>` landmark, and appropriate landmark roles for all major sections
2. THE Site SHALL provide a Skip_Link as the first focusable element on every page that moves focus to the main content area
3. WHEN a user navigates between pages, THE Router SHALL move keyboard focus to the main content heading of the destination page
4. THE Site SHALL maintain a minimum color contrast ratio of 4.5:1 for normal text and 3:1 for large text across all pages
5. THE Site SHALL ensure all interactive elements are operable via keyboard alone, with a visible focus indicator on every focusable element
6. THE Site SHALL include a `lang` attribute on the root `<html>` element set to the appropriate language code
7. THE Site SHALL ensure all images have descriptive `alt` text, and decorative images use `alt=""`
8. WHEN the viewport width changes, THE Site SHALL reflow content without horizontal scrolling at widths down to 320 CSS pixels

### Requirement 2: Site Navigation and Routing

**User Story:** As a visitor, I want clear and consistent navigation across the site, so that I can find any page without confusion.

#### Acceptance Criteria

1. THE Navigation SHALL be rendered as a `<nav>` element with an `aria-label` of "Main navigation" and contain links to Landing_Page, Pricing_Page, Docs_Pages, Analysis_Tool, and Settings_Area
2. THE Navigation SHALL visually and programmatically indicate the currently active page using `aria-current="page"` on the active link
3. WHEN a user activates a Navigation link, THE Router SHALL load the destination page without a full-page reload
4. THE Navigation SHALL be responsive: on viewports narrower than 768 CSS pixels, THE Navigation SHALL collapse into a toggle-controlled menu with an accessible button labeled "Menu"
5. WHEN the mobile menu toggle is activated, THE Navigation SHALL expand the menu and move focus to the first menu link
6. WHEN the mobile menu is open and the user presses the Escape key, THE Navigation SHALL close the menu and return focus to the toggle button

### Requirement 3: Landing Page

**User Story:** As a prospective user, I want a landing page that clearly explains what AnnounceKit does and why it matters, so that I can decide whether to use the tool.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a hero section containing a heading (h1), a value proposition statement describing AnnounceKit as a tool that predicts screen reader output across NVDA, JAWS, and VoiceOver, and a primary call-to-action link to the Analysis_Tool
2. THE Landing_Page SHALL include a features section with at least four feature descriptions: cross-platform screen reader prediction, WCAG audit reporting, semantic diff comparison, and CI/CD pipeline integration via the CLI_Tool
3. THE Landing_Page SHALL include a section explaining the relevance of AnnounceKit for WCAG enforcement in large organizations, highlighting that the CLI_Tool enables automated accessibility regression testing in CI/CD pipelines
4. THE Landing_Page SHALL include a call-to-action section with a link to the Pricing_Page and a link to the Docs_Pages
5. THE Landing_Page SHALL structure content with a logical heading hierarchy (h1 followed by h2 subsections) with no skipped heading levels

### Requirement 4: Pricing Page

**User Story:** As a prospective customer, I want to see available subscription tiers, so that I can choose a plan that fits my needs.

#### Acceptance Criteria

1. THE Pricing_Page SHALL display a heading (h1) and three pricing tier cards: Free, Pro, and Team/Enterprise
2. THE Pricing_Page SHALL present the Free tier with a "Free" price indicator and the following included features: unlimited web tool usage (paste/upload HTML and view results), single-file CLI analysis, all three Screen_Reader_Options (NVDA, JAWS, VoiceOver), and audit report generation
3. THE Pricing_Page SHALL present the Pro tier with a price range of $15–25/month per seat and the following included features: everything in Free, batch processing (multiple files in one CLI run), CI/CD pipeline integration with JSON output and exit codes, semantic diff in CLI (compare before/after across builds), and priority support
4. THE Pricing_Page SHALL present the Team/Enterprise tier with "Custom pricing" and the following included features: everything in Pro, shared team dashboards and historical reports, custom rule configuration, SSO/SAML authentication, SLA and dedicated support, and volume pricing
5. THE Pricing_Page SHALL render tier cards as an accessible list or group with each card as a distinct, labeled region
6. THE Pricing_Page SHALL visually highlight the Pro tier as the recommended option
7. WHEN a user activates a tier call-to-action button, THE Pricing_Page SHALL navigate to the Settings_Area (placeholder for future subscription flow)
8. THE Pricing_Page SHALL include a note indicating that subscription management is coming soon

#### Pricing Strategy Notes

- The analysis itself (web tool) is free — this is the acquisition funnel. A restrictive free tier kills adoption.
- Monetization is on workflow and automation features (batch, CI/CD, diff, reporting), not on core analysis capabilities.
- Screen reader selection is never gated behind a paid tier. Restricting screen readers feels punitive for an a11y tool and undermines trust.
- The CI/CD integration is the strongest monetization lever. Enterprise teams already pay for pipeline tools like Axe and Lighthouse CI. AnnounceKit fills a gap none of those cover — actual screen reader output prediction.
- The Pro tier targets individual developers and small teams who need CI/CD regression protection on every PR.
- The Team/Enterprise tier targets organizations under WCAG compliance pressure who need dashboards, SSO, and SLAs.

### Requirement 5: Documentation Pages

**User Story:** As a developer, I want comprehensive documentation for the AnnounceKit API and usage patterns, so that I can integrate the tool into my workflow.

#### Acceptance Criteria

1. THE Docs_Pages SHALL include a sidebar navigation listing all documentation sections: API Reference, Usage Guide, and Examples
2. THE Docs_Pages sidebar navigation SHALL be rendered as a `<nav>` element with `aria-label` of "Documentation navigation"
3. WHEN a user selects a documentation section from the sidebar, THE Router SHALL display the corresponding content in the main area without a full-page reload
4. THE Docs_Pages SHALL render code examples in `<pre><code>` blocks with appropriate syntax highlighting and a copy-to-clipboard button
5. WHEN a user activates a copy-to-clipboard button, THE Docs_Pages SHALL copy the associated code block content to the clipboard and announce "Copied to clipboard" via a Live_Region
6. THE Docs_Pages API Reference section SHALL document the following modules: Parser, Extractor, Model (serialize, deserialize, validate), Renderer (NVDA, JAWS, VoiceOver, Audit), and Diff
7. THE Docs_Pages SHALL include a CI/CD Integration guide documenting how to install the CLI_Tool via npm, run it in GitHub Actions / GitLab CI / other pipeline environments, interpret exit codes and JSON output, and set up accessibility regression checks that fail a build when screen reader output changes unexpectedly

### Requirement 6: Analysis Tool Integration

**User Story:** As a user, I want to use the AnnounceKit analysis tool directly on the website, so that I can analyze HTML accessibility without installing anything.

#### Acceptance Criteria

1. THE Analysis_Tool page SHALL provide a text input area where users can paste or type HTML content
2. THE Analysis_Tool page SHALL provide a file upload control that accepts `.html` files and loads the file content into the text input area
3. WHEN a file is uploaded, THE Analysis_Tool SHALL validate that the file has an `.html` or `.htm` extension and reject other file types with an error message displayed in a Live_Region
4. THE Analysis_Tool page SHALL provide a Screen_Reader_Option selector allowing the user to choose NVDA, JAWS, VoiceOver, or All
5. THE Analysis_Tool page SHALL provide a CSS selector input field for filtering analysis to specific elements
6. THE Analysis_Tool page SHALL provide an analyze button that triggers analysis of the current HTML input
7. WHEN the user activates the analyze button with valid HTML input, THE Analysis_Tool SHALL invoke the Core_Engine via the Browser_Parser to produce an Announcement_Model and display results
8. THE Analysis_Tool SHALL display results in tabbed panels: Announcements, Audit_Report, JSON Model, and Semantic_Diff
9. THE Analysis_Tool tabbed panels SHALL use `role="tablist"`, `role="tab"`, and `role="tabpanel"` with appropriate `aria-selected`, `aria-controls`, and `aria-labelledby` attributes
10. WHEN the user selects a tab, THE Analysis_Tool SHALL display the corresponding panel and move focus into the panel content
11. THE Analysis_Tool Announcements panel SHALL display the rendered screen reader output for the selected Screen_Reader_Option
12. THE Analysis_Tool Audit_Report panel SHALL display the formatted Audit_Report text
13. THE Analysis_Tool JSON Model panel SHALL display the serialized Announcement_Model as formatted JSON in a `<pre><code>` block with a copy-to-clipboard button
14. THE Analysis_Tool SHALL provide a diff mode toggle that, when enabled, displays two HTML input areas (before and after) and computes a Semantic_Diff between them
15. WHEN diff mode is enabled and analysis is triggered, THE Analysis_Tool SHALL display the Semantic_Diff in the Semantic_Diff panel showing added, removed, and changed nodes
16. IF the HTML input is empty, THEN THE Analysis_Tool SHALL display an inline error message associated with the input field via `aria-describedby`
17. IF the HTML input exceeds the size limit (2 MB), THEN THE Analysis_Tool SHALL display an error message indicating the size limit via a Live_Region
18. IF the CSS selector is syntactically invalid or matches no elements, THEN THE Analysis_Tool SHALL display a descriptive error message via a Live_Region
19. WHILE analysis is in progress, THE Analysis_Tool SHALL display a loading indicator with `aria-busy="true"` on the results region and announce "Analyzing" via a Live_Region

### Requirement 7: Core Engine Browser Integration

**User Story:** As a developer maintaining the site, I want the existing core engine to work in the browser without modification, so that the web tool produces identical results to the CLI.

#### Acceptance Criteria

1. THE Site build system SHALL alias `src/parser/html-parser.ts` to the Browser_Parser at `web/src/browser-parser.ts` so that all Core_Engine imports resolve to the browser-compatible adapter
2. THE Site build system SHALL bundle the Core_Engine modules (extractor, renderer, diff, model) for browser execution without including jsdom or other Node.js-only dependencies
3. THE Analysis_Tool SHALL use the `runAnalysis` and `runDiffAnalysis` functions from the existing analyzer service to perform all analysis operations
4. FOR ALL valid HTML inputs, parsing then serializing then deserializing the Announcement_Model SHALL produce an equivalent model (round-trip property)

### Requirement 8: Settings and Account Area

**User Story:** As a returning user, I want a settings area where I can manage my account in the future, so that the site is ready for subscription features.

#### Acceptance Criteria

1. THE Settings_Area SHALL display a heading (h1) of "Settings" and a placeholder message indicating that account management and subscription features are coming soon
2. THE Settings_Area SHALL be accessible via the main Navigation
3. THE Settings_Area page structure SHALL include labeled sections for "Account" and "Subscription" as empty placeholder regions with descriptive text

### Requirement 9: Responsive Layout

**User Story:** As a mobile user, I want the site to work well on any screen size, so that I can use AnnounceKit on my phone or tablet.

#### Acceptance Criteria

1. THE Site SHALL use a responsive layout that adapts to viewport widths from 320 CSS pixels to 1920 CSS pixels without loss of content or functionality
2. WHEN the viewport is narrower than 768 CSS pixels, THE Analysis_Tool SHALL stack the HTML input area, options bar, and results panels vertically
3. WHEN the viewport is narrower than 768 CSS pixels, THE Docs_Pages sidebar navigation SHALL collapse into an expandable disclosure widget
4. THE Site SHALL ensure all touch targets are at least 44 by 44 CSS pixels on viewports narrower than 768 CSS pixels

### Requirement 10: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when something goes wrong, so that I can understand and recover from errors.

#### Acceptance Criteria

1. WHEN a navigation route does not match any known page, THE Router SHALL display a 404 error page with a heading, a descriptive message, and a link back to the Landing_Page
2. IF the Core_Engine throws an unexpected error during analysis, THEN THE Analysis_Tool SHALL display a generic error message "An unexpected error occurred. Please try again." in a Live_Region without exposing internal error details
3. WHEN an error message is displayed, THE Site SHALL associate the error with the relevant input field using `aria-describedby` or display the error in a `role="alert"` container
4. THE Site SHALL preserve user input (HTML content, selected options) when an error occurs so the user does not lose work
