# Requirements Document

## Introduction

AnnounceKit's CLI currently produces plain-text output for all formats (json, text, audit, both). This feature adds ANSI color to the human-readable output formats (text and audit) so terminal users get a visually rich experience, while piped/redirected output stays clean. Additionally, the landing page's enterprise section replaces a blurry stock image with a local screenshot asset showing real colorized CLI output.

## Glossary

- **CLI**: The `announcekit` command-line interface defined in `src/cli.ts`
- **Audit_Renderer**: The module (`src/renderer/audit-renderer.ts`) that produces the human-readable audit report
- **Screen_Reader_Renderer**: Any of the three screen reader renderers (NVDA, JAWS, VoiceOver) that produce announcement text
- **Orchestrator**: The module (`src/cli/orchestrator.ts`) that wires parsing, extraction, rendering, and output together
- **Color_Library**: A lightweight npm package (e.g., picocolors, chalk, kleur) used to emit ANSI escape codes
- **TTY**: A terminal device; `process.stdout.isTTY` is `true` when output goes to an interactive terminal
- **Landing_Page**: The Next.js page at `site/app/page.tsx` serving the AnnounceKit marketing site
- **Enterprise_Section**: The "Built for WCAG compliance at scale" section of the Landing_Page that currently displays a blurry stock image
- **Screenshot_Asset**: A local image file stored in the site's `public/` directory showing real colorized CLI output

## Requirements

### Requirement 1: Install a Color Library

**User Story:** As a developer, I want a lightweight color library added to the project dependencies, so that renderers can emit ANSI color codes without hand-rolling escape sequences.

#### Acceptance Criteria

1. THE CLI SHALL depend on a color library that supports automatic TTY detection and has zero dependencies
2. WHEN the color library is installed, THE CLI SHALL list the color library as a production dependency in `package.json`

### Requirement 2: TTY-Aware Color Output

**User Story:** As a CLI user, I want colors to appear only when I'm using an interactive terminal, so that piped or redirected output remains free of ANSI escape codes.

#### Acceptance Criteria

1. WHILE the output destination is a TTY, THE CLI SHALL emit ANSI color codes in human-readable output formats (text, audit, both)
2. WHILE the output destination is not a TTY (pipe, file redirect, or `-o` flag targeting a file), THE CLI SHALL emit plain text without ANSI escape codes
3. THE CLI SHALL produce identical textual content (ignoring ANSI codes) regardless of whether colors are enabled or disabled
4. WHEN the output format is `json`, THE CLI SHALL produce plain uncolored JSON regardless of TTY status

### Requirement 3: Colorized Audit Report

**User Story:** As a developer reviewing an audit report in the terminal, I want color-coded sections and severity indicators, so that I can quickly scan the report and identify issues.

#### Acceptance Criteria

1. WHEN rendering an audit report to a TTY, THE Audit_Renderer SHALL apply a distinct color to each section header (Landmark Structure, Heading Hierarchy, Interactive Elements, Summary Statistics, Accessibility Issues, Overall Assessment)
2. WHEN rendering an audit report to a TTY, THE Audit_Renderer SHALL color error-severity issues in red
3. WHEN rendering an audit report to a TTY, THE Audit_Renderer SHALL color warning-severity issues in yellow
4. WHEN rendering an audit report to a TTY, THE Audit_Renderer SHALL color info-severity issues in blue
5. WHEN rendering an audit report to a TTY, THE Audit_Renderer SHALL color success indicators (checkmarks, "Excellent" assessment) in green
6. WHEN rendering an audit report to a TTY, THE Audit_Renderer SHALL color the report title banner in bold white or bright cyan
7. WHEN rendering an audit report to a TTY, THE Audit_Renderer SHALL apply dim styling to secondary information (timestamps, role distribution counts)

### Requirement 4: Colorized Screen Reader Text Output

**User Story:** As a developer reviewing screen reader output in the terminal, I want subtle color cues for roles, names, and states, so that I can visually parse the announcement structure.

#### Acceptance Criteria

1. WHEN rendering screen reader text to a TTY, THE Screen_Reader_Renderer SHALL color element names in bold white
2. WHEN rendering screen reader text to a TTY, THE Screen_Reader_Renderer SHALL color role labels (e.g., "button", "heading level 2", "navigation landmark") in cyan
3. WHEN rendering screen reader text to a TTY, THE Screen_Reader_Renderer SHALL color state information (e.g., "checked", "expanded", "required") in yellow
4. WHEN rendering screen reader text to a TTY, THE Screen_Reader_Renderer SHALL color section headers (e.g., "=== NVDA ===") in bold bright text
5. WHEN rendering screen reader text to a TTY, THE Screen_Reader_Renderer SHALL color descriptions in dim text

### Requirement 5: Color Utility Module

**User Story:** As a maintainer, I want a single shared color utility module, so that all renderers use consistent color choices and TTY detection logic.

#### Acceptance Criteria

1. THE CLI SHALL provide a shared color utility module that centralizes all color function definitions
2. THE color utility module SHALL export a function or flag that indicates whether color output is currently enabled
3. THE color utility module SHALL determine color support based on `process.stdout.isTTY` and the color library's built-in detection
4. WHEN a renderer imports the color utility module, THE color utility module SHALL provide named color functions for each semantic purpose (e.g., `error`, `warning`, `info`, `success`, `heading`, `roleName`, `stateName`, `dim`)

### Requirement 6: Colorized Warning Output

**User Story:** As a CLI user, I want warnings printed to stderr to also be colorized when stderr is a TTY, so that warnings are visually distinct from normal output.

#### Acceptance Criteria

1. WHILE stderr is a TTY, THE Orchestrator SHALL color the "=== Warnings ===" header in yellow bold
2. WHILE stderr is a TTY, THE Orchestrator SHALL color each warning message prefix (⚠️) in yellow
3. WHILE stderr is not a TTY, THE Orchestrator SHALL emit plain-text warnings without ANSI escape codes

### Requirement 7: Landing Page Enterprise Section Image Replacement

**User Story:** As a site visitor, I want to see a crisp screenshot of real CLI output in the enterprise section, so that the product looks professional and authentic instead of showing a blurry stock image.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a Screenshot_Asset from the local `public/` directory in the Enterprise_Section instead of the external Google CDN image URL
2. THE Landing_Page SHALL reference the Screenshot_Asset using a Next.js-appropriate path (e.g., `/images/cli-audit-screenshot.png`)
3. THE Landing_Page SHALL provide a descriptive `alt` attribute on the Screenshot_Asset image that accurately describes the CLI audit output shown
4. THE Landing_Page SHALL preserve the existing aspect ratio, rounded corners, gradient overlay, and hover opacity transition on the image container
