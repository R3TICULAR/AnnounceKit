# Requirements Document

## Introduction

AnnounceKit Web is a browser-based interface for the existing AnnounceKit CLI tool. It allows developers to paste or upload HTML and receive accessibility analysis results — including screen reader announcements, audit reports, semantic diffs, and the canonical JSON model — without installing any CLI tooling. The web app reuses the existing TypeScript analysis core (`src/`) and replaces the Node.js-specific `jsdom` parser with a browser-native DOM parser.

The web app is a standalone single-page application (SPA) with no backend required. All analysis runs client-side in the browser.

## Glossary

- **Web_App**: The AnnounceKit browser-based single-page application
- **Analyzer**: The client-side analysis engine that wraps the existing `src/` core modules
- **HTML_Input**: Raw HTML text provided by the user via paste or file upload
- **Canonical_Model**: The `AnnouncementModel` JSON structure produced by the extractor
- **Announcement_Panel**: The UI section displaying screen reader announcement text
- **Audit_Panel**: The UI section displaying the developer-friendly audit report
- **Diff_Panel**: The UI section displaying the semantic diff between two HTML versions
- **Model_Panel**: The UI section displaying the raw Canonical_Model JSON
- **Screen_Reader**: One of NVDA, JAWS, or VoiceOver
- **CSS_Selector**: A valid CSS selector string used to filter elements for analysis
- **Diff_Mode**: A mode in which the user provides two HTML inputs for semantic comparison
- **Parser**: The browser-native `DOMParser` used in place of jsdom for HTML parsing
- **Pretty_Printer**: The serializer that formats the Canonical_Model as indented JSON

---

## Requirements

### Requirement 1: HTML Input

**User Story:** As a developer, I want to paste or upload HTML into the web app, so that I can analyze its accessibility without using the CLI.

#### Acceptance Criteria

1. THE Web_App SHALL provide a text area where users can paste raw HTML.
2. THE Web_App SHALL provide a file upload control that accepts `.html` and `.htm` files.
3. WHEN a file is uploaded, THE Web_App SHALL populate the HTML text area with the file's text content.
4. WHEN the HTML text area is empty and analysis is triggered, THE Web_App SHALL display an inline validation message indicating that HTML input is required.
5. THE Web_App SHALL accept HTML inputs up to 2 MB in size. *(The 2 MB limit is a configurable constant, not a hardcoded magic number, to allow future increases without code changes.)*
6. IF an uploaded file exceeds 2 MB, THEN THE Web_App SHALL display an error message stating the file size limit and reject the file. *(The size threshold is read from the same configurable constant as criterion 5.)*

---

### Requirement 2: Analysis Execution

**User Story:** As a developer, I want to trigger analysis of my HTML and see results immediately, so that I can iterate quickly on accessibility fixes.

#### Acceptance Criteria

1. THE Web_App SHALL provide an "Analyze" button that triggers analysis of the current HTML_Input.
2. WHEN the "Analyze" button is activated, THE Analyzer SHALL parse the HTML_Input using the Parser and build the Canonical_Model using the existing extractor module.
3. WHEN analysis is running, THE Web_App SHALL display a loading indicator and disable the "Analyze" button.
4. WHEN analysis completes successfully, THE Web_App SHALL display results in the Announcement_Panel, Audit_Panel, and Model_Panel.
5. IF the Analyzer encounters a fatal error during analysis, THEN THE Web_App SHALL display a descriptive error message and preserve the HTML_Input in the text area.
6. WHEN analysis produces warnings, THE Web_App SHALL display the warnings alongside the results.

---

### Requirement 3: CSS Selector Filtering

**User Story:** As a developer, I want to filter analysis to specific elements using a CSS selector, so that I can focus on a particular component.

#### Acceptance Criteria

1. THE Web_App SHALL provide a CSS selector input field.
2. WHEN a CSS_Selector is provided and analysis is triggered, THE Analyzer SHALL apply the selector to the parsed document and build Canonical_Models only for matching elements.
3. WHEN a CSS_Selector matches zero elements, THE Web_App SHALL display a message stating that no elements matched the selector.
4. IF a CSS_Selector is syntactically invalid, THEN THE Web_App SHALL display an inline validation error before triggering analysis.
5. WHEN no CSS_Selector is provided, THE Analyzer SHALL analyze the full document body.

---

### Requirement 4: Screen Reader Selection

**User Story:** As a developer, I want to choose which screen reader's announcement style to view, so that I can test for my target platform.

#### Acceptance Criteria

1. THE Web_App SHALL provide a control to select the active Screen_Reader from the options: NVDA, JAWS, VoiceOver, and All.
2. WHEN a Screen_Reader is selected and results are displayed, THE Announcement_Panel SHALL show announcement text rendered by the corresponding renderer module.
3. WHEN "All" is selected, THE Announcement_Panel SHALL display announcement text for NVDA, JAWS, and VoiceOver in clearly labelled sections.
4. THE Web_App SHALL default the Screen_Reader selection to NVDA.
5. WHEN the Screen_Reader selection changes after analysis has run, THE Announcement_Panel SHALL update immediately without re-running analysis.

---

### Requirement 5: Output Panels

**User Story:** As a developer, I want to view the announcement text, audit report, and raw JSON model in separate panels, so that I can inspect each output type independently.

#### Acceptance Criteria

1. THE Web_App SHALL display the Announcement_Panel showing screen reader announcement text for the selected Screen_Reader.
2. THE Web_App SHALL display the Audit_Panel showing the formatted audit report produced by the audit renderer module.
3. THE Web_App SHALL display the Model_Panel showing the Canonical_Model serialized as indented JSON by the Pretty_Printer.
4. WHEN multiple elements match a CSS_Selector, THE Web_App SHALL display results for each matched element in a numbered list within each panel.
5. THE Web_App SHALL provide a copy-to-clipboard button for each panel's content.
6. WHEN a copy-to-clipboard button is activated, THE Web_App SHALL copy the panel's text content to the system clipboard and display a brief confirmation message.

---

### Requirement 6: Semantic Diff Mode

**User Story:** As a developer, I want to compare the accessibility semantics of two HTML versions, so that I can detect regressions introduced by code changes.

#### Acceptance Criteria

1. THE Web_App SHALL provide a toggle to enable Diff_Mode.
2. WHEN Diff_Mode is enabled, THE Web_App SHALL display a second HTML text area labelled "Before" alongside the primary text area labelled "After".
3. WHEN Diff_Mode is enabled and analysis is triggered, THE Analyzer SHALL compute a semantic diff between the Canonical_Model of the "Before" HTML and the Canonical_Model of the "After" HTML using the existing diff module.
4. WHEN Diff_Mode is enabled and analysis completes, THE Web_App SHALL display the diff results in the Diff_Panel, showing added nodes, removed nodes, and changed properties.
5. WHEN Diff_Mode is disabled, THE Web_App SHALL hide the Diff_Panel and the "Before" text area.
6. WHEN Diff_Mode is enabled and either HTML text area is empty, THE Web_App SHALL display a validation message indicating both inputs are required.

---

### Requirement 7: Browser-Compatible Parsing

**User Story:** As a developer, I want the web app to parse HTML accurately in the browser, so that analysis results are consistent with the CLI tool.

#### Acceptance Criteria

1. THE Parser SHALL use the browser's native `DOMParser` API to parse HTML strings into a `Document` object.
2. THE Parser SHALL expose the same interface as the existing CLI parser module so that the extractor module requires no modification.
3. WHEN the Parser receives an HTML string, THE Parser SHALL return a `ParseResult` containing the parsed `Document` and any warnings.
4. FOR ALL valid HTML strings, parsing with THE Parser then serializing the Canonical_Model then parsing the serialized JSON SHALL produce an equivalent Canonical_Model (round-trip property).

---

### Requirement 8: Result Export

**User Story:** As a developer, I want to download analysis results as files, so that I can save them for documentation or CI comparison.

#### Acceptance Criteria

1. THE Web_App SHALL provide a "Download JSON" button that triggers a download of the Canonical_Model as a `.json` file.
2. THE Web_App SHALL provide a "Download Audit" button that triggers a download of the audit report as a `.txt` file.
3. WHEN a download button is activated, THE Web_App SHALL generate the file client-side and initiate a browser download without a server request.
4. WHEN no analysis results are available, THE Web_App SHALL disable the download buttons.

---

### Requirement 9: Accessibility of the Web App Itself

**User Story:** As a developer using assistive technology, I want the web app to be accessible, so that I can use it with a screen reader or keyboard.

#### Acceptance Criteria

1. THE Web_App SHALL be fully operable using keyboard navigation alone.
2. THE Web_App SHALL associate all form controls with visible labels using standard HTML label associations.
3. WHEN analysis results are updated, THE Web_App SHALL announce the update to screen reader users using an ARIA live region.
4. THE Web_App SHALL maintain a logical focus order that follows the visual layout of the page.
5. THE Web_App SHALL provide sufficient color contrast for all text and interactive elements meeting WCAG 2.1 AA contrast ratios.

---

### Requirement 10: UI Framework — Lit Web Components

**User Story:** As a developer, I want the web app built with Lit web components, so that the UI is standards-based, encapsulated, and portable.

#### Acceptance Criteria

1. THE Web_App SHALL implement all UI components as Lit web components using the Lit library (https://lit.dev).
2. THE Web_App SHALL NOT use any third-party component library for v1; all Lit components SHALL be authored within this repository.
3. A future task SHALL port v1 components to components sourced from an external shared component library repo. *(This is a known planned migration; the v1 components are intentionally temporary.)*

---

### Requirement 11: Component Replaceability

**User Story:** As a developer, I want the architecture to make it straightforward to swap v1 Lit components for components from an external library, so that the future migration is low-risk.

#### Acceptance Criteria

1. THE Web_App SHALL define each UI component as a self-contained Lit element with a documented public property and event interface.
2. THE Web_App SHALL NOT allow business logic or analysis state to be embedded inside component implementations; components SHALL communicate via properties and events only.
3. WHEN a v1 component is replaced by an external library component, THE replacement SHALL require changes only to the component's registration and import, not to the consuming page or parent components.
