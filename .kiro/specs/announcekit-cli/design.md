# Design Document: AnnounceKit CLI

## Overview

AnnounceKit is a CLI tool that transforms static HTML into a normalized accessibility announcement model and generates approximate screen reader output. The system architecture separates semantic extraction (deterministic) from screen reader rendering (heuristic), enabling CI validation, semantic diffing, and cross-platform debugging without OS-specific dependencies.

The core innovation is the **Canonical Announcement Model** - a platform-agnostic, deterministic, serializable representation of accessibility semantics that serves as the contract between extraction and rendering layers.

### Design Principles

1. **Determinism**: Identical HTML produces identical semantic models
2. **Separation of Concerns**: Semantic extraction is independent of screen reader phrasing
3. **Testability**: All outputs are snapshot-testable and diff-friendly
4. **Extensibility**: Model versioning supports future expansion without breaking changes
5. **Pragmatism**: V1 focuses on common elements; complex widgets deferred to v2+

## Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLI Interface Layer                     │
│  - Argument parsing                                          │
│  - File I/O                                                  │
│  - Output formatting                                         │
│  - Error handling and user feedback                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Extraction Layer                          │
│  - HTML parsing (with error recovery)                        │
│  - Accessibility tree derivation                             │
│  - ARIA name computation                                     │
│  - Semantic model construction                               │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 Core Data Model Layer                        │
│  - Canonical Announcement Model (TypeScript interfaces)      │
│  - JSON serialization/deserialization                        │
│  - Model validation                                          │
│  - Version management                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                     Renderer Layer                           │
│  - NVDA renderer (heuristic phrasing)                        │
│  - VoiceOver renderer (heuristic phrasing)                   │
│  - Announcement text generation                              │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**CLI Interface Layer**
- Parse command-line arguments (input source, output format, screen reader selection, CSS selector)
- Read HTML from file or stdin
- Write output to file or stdout
- Format error messages for user consumption
- Provide help and version information
- Exit with appropriate status codes

**Extraction Layer**
- Parse HTML using lenient parser with error recovery
- Build DOM representation
- Traverse DOM to construct accessibility tree
- Apply ARIA specification rules (role computation, name computation, state/property extraction)
- Filter inaccessible nodes (aria-hidden, presentational roles, etc.)
- Construct Canonical Announcement Model instances
- Handle malformed ARIA with warnings

**Core Data Model Layer**
- Define TypeScript interfaces for Canonical Announcement Model
- Provide JSON serialization with deterministic property ordering
- Provide JSON deserialization with validation
- Enforce model versioning
- Validate model integrity (structural constraints, required fields)
- Expose immutable data structures

**Renderer Layer**
- Accept Canonical Announcement Model as input
- Generate announcement text following screen reader conventions
- Apply screen-reader-specific phrasing rules
- Format output with appropriate punctuation and pauses
- Document heuristic nature and known limitations

### Data Flow

```
HTML Input
    │
    ▼
HTML Parser (lenient, error recovery)
    │
    ▼
DOM Representation
    │
    ▼
Accessibility Tree Extractor
    │
    ▼
Canonical Announcement Model (JSON-serializable)
    │
    ├──────────────────┬──────────────────┐
    ▼                  ▼                  ▼
JSON Output    NVDA Renderer    VoiceOver Renderer
                    │                  │
                    ▼                  ▼
              Announcement Text   Announcement Text
```

## Components and Interfaces

### Core Data Model: Canonical Announcement Model

The Canonical Announcement Model is the foundational contract of AnnounceKit. It represents accessibility semantics in a normalized, deterministic format suitable for snapshot testing, semantic diffing, and cross-platform analysis.

#### Design Decisions

**Role Type Strategy: String Union**

We use TypeScript string literal unions for roles rather than free strings:

```typescript
type AccessibleRole = 
  | 'button'
  | 'link'
  | 'heading'
  | 'textbox'
  | 'checkbox'
  | 'radio'
  | 'combobox'
  | 'listbox'
  | 'option'
  | 'list'
  | 'listitem'
  | 'navigation'
  | 'main'
  | 'banner'
  | 'contentinfo'
  | 'region'
  | 'img'
  | 'article'
  | 'complementary'
  | 'form'
  | 'search'
  | 'generic';
```

**Rationale:**
- Type safety: Prevents typos and invalid roles at compile time
- Autocomplete: IDE support for valid role values
- Explicit scope: V1 role support is clearly defined
- Extensibility: New roles added in v2 are explicit breaking changes (intentional)
- Validation: Invalid roles caught during extraction, not rendering

**Tradeoff:** Custom ARIA roles (rare) are rejected rather than passed through. This is acceptable for v1 focus on standard roles.

**State Modeling Strategy: Flat Object with Optional Properties**

We use a flat object with optional boolean/string properties rather than discriminated unions:

```typescript
interface AccessibleState {
  expanded?: boolean;
  checked?: boolean | 'mixed';
  pressed?: boolean | 'mixed';
  selected?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  readonly?: boolean;
  busy?: boolean;
  current?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | false;
  grabbed?: boolean;
  hidden?: boolean;
  level?: number;        // For headings
  posinset?: number;     // Position in set (lists, tabs, etc.)
  setsize?: number;      // Size of set
}
```

**Rationale:**
- Simplicity: Easy to construct, serialize, and inspect
- Flexibility: States are independent; multiple states can coexist
- JSON-friendly: Direct mapping to JSON object
- Extensibility: New states added without structural changes
- Clarity: Presence of property indicates state is relevant; absence means not applicable

**Tradeoff:** No compile-time enforcement of role-specific state constraints (e.g., buttons shouldn't have `checked`). We accept this for simplicity; validation occurs during extraction.

#### TypeScript Interfaces

```typescript
/**
 * Canonical Announcement Model - Version 1
 * 
 * Platform-agnostic representation of accessibility semantics.
 * Deterministic, serializable, suitable for snapshot testing.
 */

/**
 * Model version for forward compatibility.
 * Breaking changes increment major version.
 */
interface ModelVersion {
  major: number;
  minor: number;
}

/**
 * Accessible role following ARIA specification.
 * V1 supports common interactive and structural roles.
 */
type AccessibleRole = 
  | 'button'
  | 'link'
  | 'heading'
  | 'textbox'
  | 'checkbox'
  | 'radio'
  | 'combobox'
  | 'listbox'
  | 'option'
  | 'list'
  | 'listitem'
  | 'navigation'
  | 'main'
  | 'banner'
  | 'contentinfo'
  | 'region'
  | 'img'
  | 'article'
  | 'complementary'
  | 'form'
  | 'search'
  | 'generic';

/**
 * Accessible states and properties.
 * Only includes properties relevant to the element's role.
 */
interface AccessibleState {
  expanded?: boolean;
  checked?: boolean | 'mixed';
  pressed?: boolean | 'mixed';
  selected?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  readonly?: boolean;
  busy?: boolean;
  current?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | false;
  grabbed?: boolean;
  hidden?: boolean;
  level?: number;        // For headings (1-6)
  posinset?: number;     // Position in set (1-indexed)
  setsize?: number;      // Total size of set
}

/**
 * Value for form controls and range widgets.
 */
interface AccessibleValue {
  current: string | number;
  min?: number;
  max?: number;
  text?: string;  // Textual representation (e.g., "50%")
}

/**
 * Focusability information.
 */
interface FocusInfo {
  focusable: boolean;
  tabindex?: number;  // Only present if explicitly set
}

/**
 * Single node in the accessibility tree.
 */
interface AccessibleNode {
  role: AccessibleRole;
  name: string;           // Accessible name (computed via ARIA name algorithm)
  description?: string;   // Accessible description (aria-describedby, title, etc.)
  value?: AccessibleValue;
  state: AccessibleState;
  focus: FocusInfo;
  children: AccessibleNode[];
}

/**
 * Root of the Canonical Announcement Model.
 */
interface AnnouncementModel {
  version: ModelVersion;
  root: AccessibleNode;
  metadata: {
    extractedAt: string;  // ISO 8601 timestamp
    sourceHash?: string;  // Optional hash of source HTML for change detection
  };
}
```

#### Example JSON Outputs

**Button with aria-expanded**

```json
{
  "version": { "major": 1, "minor": 0 },
  "root": {
    "role": "button",
    "name": "Show menu",
    "state": {
      "expanded": false
    },
    "focus": {
      "focusable": true
    },
    "children": []
  },
  "metadata": {
    "extractedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Checkbox (checked)**

```json
{
  "version": { "major": 1, "minor": 0 },
  "root": {
    "role": "checkbox",
    "name": "Accept terms and conditions",
    "state": {
      "checked": true
    },
    "focus": {
      "focusable": true
    },
    "children": []
  },
  "metadata": {
    "extractedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Text input (invalid, required)**

```json
{
  "version": { "major": 1, "minor": 0 },
  "root": {
    "role": "textbox",
    "name": "Email address",
    "description": "Enter a valid email address",
    "value": {
      "current": "invalid@",
      "text": "invalid@"
    },
    "state": {
      "invalid": true,
      "required": true
    },
    "focus": {
      "focusable": true
    },
    "children": []
  },
  "metadata": {
    "extractedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Heading level 2**

```json
{
  "version": { "major": 1, "minor": 0 },
  "root": {
    "role": "heading",
    "name": "Product Features",
    "state": {
      "level": 2
    },
    "focus": {
      "focusable": false
    },
    "children": []
  },
  "metadata": {
    "extractedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Design Tradeoffs

**Tradeoff 1: Hierarchical vs Flat Structure**

Decision: Hierarchical (children array)

Rationale:
- Preserves semantic relationships (e.g., list contains listitems)
- Enables structural validation (e.g., heading hierarchy)
- Supports future navigation simulation
- Matches accessibility tree mental model

Cost: More complex serialization; requires tree traversal for analysis

**Tradeoff 2: Explicit vs Implicit Defaults**

Decision: Omit properties with default values

Rationale:
- Smaller JSON output
- Clearer signal: presence indicates non-default state
- Easier diffing: only meaningful properties present

Cost: Requires documentation of defaults; deserialization must apply defaults

**Tradeoff 3: String Unions vs Enums**

Decision: String literal unions (not TypeScript enums)

Rationale:
- JSON-friendly: serializes as strings, not numbers
- Readable: JSON output is human-readable
- No runtime overhead: purely compile-time construct
- Avoids enum pitfalls (reverse mapping, const enum issues)

Cost: Slightly more verbose type definitions

**Tradeoff 4: Version Field Placement**

Decision: Top-level version field in AnnouncementModel

Rationale:
- Immediate version detection during deserialization
- Enables version-specific parsing logic
- Standard practice for versioned APIs

Cost: Adds 2 fields to every output

#### Fields Intentionally Deferred to V2

The following fields are explicitly excluded from V1 to limit scope:

1. **Live Region Announcements**: `aria-live`, `aria-atomic`, `aria-relevant`
   - Reason: Requires dynamic update simulation; V1 is static analysis only
   - V2: Add `liveRegion` property with politeness and atomicity

2. **Relationships**: `aria-owns`, `aria-controls`, `aria-flowto`
   - Reason: Complex graph relationships; V1 focuses on tree structure
   - V2: Add `relationships` object with typed relationship arrays

3. **Grid/Table Semantics**: Row/column indices, headers, spans
   - Reason: Complex structural analysis; limited V1 widget support
   - V2: Add `gridPosition` and `tableSemantics` properties

4. **Math and SVG**: MathML roles, SVG accessibility
   - Reason: Specialized domains; low priority for V1
   - V2: Add specialized role types and properties

5. **Keyboard Shortcuts**: `aria-keyshortcuts`
   - Reason: Not announced by most screen readers in browse mode
   - V2: Add `shortcuts` property if user research shows value

6. **Drag-and-Drop**: `aria-grabbed`, `aria-dropeffect`
   - Reason: Deprecated in ARIA 1.2; low usage
   - V2: Evaluate based on ARIA 1.3 direction

7. **Orientation**: `aria-orientation`
   - Reason: Rarely announced; low impact on V1 use cases
   - V2: Add to state object if needed

8. **Error Messages**: `aria-errormessage`
   - Reason: V1 captures `invalid` state; full error message support requires relationship handling
   - V2: Add `errorMessage` property with referenced content

## Data Models

### Extraction Layer Models

The extraction layer uses internal models to represent the DOM and intermediate accessibility tree before constructing the Canonical Announcement Model.

**HTML Element Representation**

```typescript
interface HTMLElementInfo {
  tagName: string;
  attributes: Map<string, string>;
  textContent: string;
  children: HTMLElementInfo[];
}
```

**Intermediate Accessibility Node**

```typescript
interface IntermediateAccessibleNode {
  element: HTMLElementInfo;
  computedRole: AccessibleRole | null;
  computedName: string;
  computedDescription: string;
  rawStates: Map<string, string | boolean>;
  rawProperties: Map<string, string | number>;
  isAccessible: boolean;  // False if aria-hidden or presentational
}
```

The extraction layer transforms `IntermediateAccessibleNode` instances into `AccessibleNode` instances by normalizing states and properties.

### Renderer Layer Models

Renderers consume the Canonical Announcement Model and produce announcement text. No additional models are required; renderers operate directly on `AnnouncementModel`.

**Renderer Interface**

```typescript
interface ScreenReaderRenderer {
  render(model: AnnouncementModel): string;
  renderNode(node: AccessibleNode): string;
}
```

### CLI Layer Models

**CLI Configuration**

```typescript
interface CLIConfig {
  inputSource: 'file' | 'stdin';
  inputPath?: string;
  outputFormat: 'json' | 'text' | 'both';
  outputPath?: string;
  screenReader: 'nvda' | 'voiceover';
  selector?: string;  // CSS selector for element filtering
  validate: boolean;  // Enable round-trip validation
  diff?: string;      // Path to second HTML file for semantic diff
}
```

**CLI Output**

```typescript
interface CLIOutput {
  success: boolean;
  model?: AnnouncementModel;
  announcement?: string;
  diff?: SemanticDiff;
  errors: string[];
  warnings: string[];
}

interface SemanticDiff {
  added: AccessibleNode[];
  removed: AccessibleNode[];
  changed: NodeChange[];
}

interface NodeChange {
  path: string;  // JSON path to node (e.g., "root.children[0]")
  property: string;
  oldValue: any;
  newValue: any;
}
```

## Recommended Tech Stack

### Language: TypeScript

**Rationale:**
- Strong typing for data model enforcement
- Excellent tooling (IDE support, refactoring)
- JSON serialization is first-class
- Large ecosystem for HTML parsing and CLI development
- Type safety prevents entire classes of bugs in accessibility logic

**Alternatives Considered:**
- Python: Weaker typing; accessibility libraries less mature
- Rust: Excellent performance but slower development; overkill for CLI tool
- Go: Good for CLI but weaker HTML/DOM ecosystem

### Runtime: Node.js (v18+)

**Rationale:**
- Native TypeScript support via ts-node or tsx
- Mature HTML parsing libraries (jsdom, parse5)
- Fast startup time for CLI usage
- Cross-platform (Windows, macOS, Linux)
- Large package ecosystem

**Alternatives Considered:**
- Deno: Cleaner runtime but smaller ecosystem; HTML parsing less mature
- Bun: Fast but less stable; risky for production tool

### Accessibility Extraction: jsdom + Custom Logic

**Rationale:**
- jsdom provides full DOM implementation with ARIA support
- Allows direct implementation of ARIA name computation algorithm
- No browser dependency; pure Node.js
- Deterministic (no browser quirks)
- Actively maintained

**Alternatives Considered:**
- Puppeteer/Playwright: Requires browser; non-deterministic; slow startup
- parse5: Lower-level; would require building full ARIA logic from scratch
- Axe-core: Focuses on violations, not semantic extraction

**Implementation Approach:**
- Use jsdom to parse HTML and create DOM
- Implement ARIA name computation following W3C specification
- Implement role computation following ARIA in HTML specification
- Build accessibility tree by traversing DOM and applying ARIA rules

### CLI Framework: Commander.js

**Rationale:**
- Industry standard for Node.js CLI tools
- Declarative API for arguments and options
- Automatic help generation
- Subcommand support for future expansion
- Lightweight

**Alternatives Considered:**
- Yargs: More features but heavier; overkill for V1
- oclif: Full framework; too opinionated for simple CLI
- Minimist: Too low-level; would require manual help text

### Testing Framework: Vitest

**Rationale:**
- Fast execution (native ESM, parallel tests)
- Built-in snapshot testing (critical for model validation)
- TypeScript support out of the box
- Compatible with Jest API (easy migration if needed)
- Excellent watch mode for development

**Property-Based Testing Library: fast-check**

**Rationale:**
- Mature TypeScript property-based testing library
- Integrates with Vitest
- Excellent arbitrary generators for complex data structures
- Shrinking support for minimal failing examples

**Testing Strategy:**
- Unit tests for specific examples and edge cases
- Property tests for model serialization, ARIA name computation, determinism
- Snapshot tests for full model outputs
- Integration tests for CLI end-to-end flows

### Build Tooling: tsup

**Rationale:**
- Zero-config TypeScript bundler
- Produces optimized single-file executable
- Fast builds
- Supports ESM and CJS output
- Minimal configuration

**Alternatives Considered:**
- esbuild: Lower-level; requires more configuration
- Rollup: More complex; overkill for CLI tool
- tsc: Slow; produces multiple files

### Package Manager: pnpm

**Rationale:**
- Fast installation
- Efficient disk usage (content-addressable store)
- Strict dependency resolution (prevents phantom dependencies)
- Workspace support for future monorepo structure

**Alternatives Considered:**
- npm: Slower; less strict
- yarn: Berry version is complex; classic version is deprecated

## V1 Implementation Scope

### In Scope for V1

**Supported Elements:**
- Buttons (button, input[type=button/submit/reset], role=button)
- Links (a[href], area[href], role=link)
- Headings (h1-h6, role=heading with aria-level)
- Form inputs (input, textarea, select, role=textbox/checkbox/radio/combobox)
- Landmarks (nav, main, header, footer, aside, form, role=navigation/main/banner/contentinfo/complementary/form/search)
- Lists (ul, ol, dl, role=list/listitem)
- Images (img[alt], role=img)
- Articles (article, role=article)
- Regions (section, role=region)
- Generic containers (div, span with explicit roles)

**Supported ARIA Attributes:**
- aria-label
- aria-labelledby
- aria-describedby
- aria-hidden
- aria-expanded
- aria-pressed
- aria-checked
- aria-disabled
- aria-invalid
- aria-required
- aria-readonly
- aria-selected
- aria-current
- aria-level (for headings)
- aria-posinset / aria-setsize (for lists)

**Supported Screen Readers:**
- NVDA (heuristic approximation)
- VoiceOver (heuristic approximation)

**Supported Output Formats:**
- JSON (semantic model)
- Plain text (announcement text)
- Both (combined output)

**Supported Input Sources:**
- File path
- stdin

**Supported Features:**
- Element filtering via CSS selector
- Semantic diff between two HTML inputs
- Round-trip validation
- Batch processing (multiple files)
- CI-friendly exit codes and output

### Out of Scope for V1

**Explicitly Excluded:**
- JAWS rendering (deferred to v2 based on user demand)
- Dynamic content updates (aria-live regions)
- Focus management and keyboard navigation simulation
- Complex widgets (grids, treegrids, trees with full semantics)
- MathML accessibility
- SVG accessibility
- Drag-and-drop (aria-grabbed, aria-dropeffect)
- Relationship attributes (aria-owns, aria-controls, aria-flowto)
- Error message content (aria-errormessage)
- Keyboard shortcuts (aria-keyshortcuts)
- Orientation (aria-orientation)

### Architecture Decisions for V1

**Decision 1: Static Analysis Only**

V1 analyzes static HTML snapshots. No JavaScript execution, no dynamic updates.

Rationale:
- Simplifies implementation (no browser automation)
- Deterministic output (no timing issues)
- Fast execution (suitable for CI)
- Covers primary use case (component testing)

Limitation: Cannot test dynamic ARIA updates or live regions

**Decision 2: Heuristic Screen Reader Rendering**

V1 renderers approximate screen reader behavior based on documentation and testing, not actual screen reader APIs.

Rationale:
- Cross-platform (no OS dependencies)
- Fast (no IPC with screen readers)
- Deterministic (no screen reader version variations)
- Good enough for debugging and CI validation

Limitation: Output may differ from actual screen readers in edge cases

**Decision 3: ARIA Name Computation in Extraction Layer**

V1 implements ARIA name computation algorithm in the extraction layer, not in renderers.

Rationale:
- Name computation is deterministic and platform-agnostic
- Belongs in semantic model, not rendering layer
- Enables validation of name computation independently
- Avoids duplication across renderers

Limitation: Must keep implementation synchronized with ARIA specification updates

**Decision 4: No Browser Dependency**

V1 uses jsdom (pure Node.js) rather than browser automation.

Rationale:
- Fast startup (no browser launch)
- Lightweight (no browser binary)
- Deterministic (no browser quirks)
- CI-friendly (no headless browser setup)

Limitation: Cannot test browser-specific accessibility tree computation

**Decision 5: Single-File Executable**

V1 builds to a single executable file for easy distribution.

Rationale:
- Simple installation (no npm install in target environment)
- Fast startup (bundled dependencies)
- Version isolation (no global package conflicts)

Limitation: Larger file size than unbundled package

## Future Expansion Considerations (V2+)

### V2 Potential Features

**Live Region Support**
- Add `liveRegion` property to AccessibleNode
- Simulate dynamic updates and announcement timing
- Support aria-atomic and aria-relevant

**Relationship Attributes**
- Add `relationships` object to AccessibleNode
- Support aria-owns, aria-controls, aria-flowto
- Enable graph-based navigation simulation

**JAWS Renderer**
- Add third renderer for JAWS-style output
- Research JAWS-specific phrasing conventions
- Document JAWS-specific limitations

**Complex Widget Support**
- Full grid/treegrid semantics (row/column navigation)
- Tree widget navigation
- Combobox with listbox popup
- Tab panels with roving tabindex

**Focus Management Simulation**
- Track focus order
- Simulate tab navigation
- Validate focus trap patterns

**Keyboard Navigation Simulation**
- Simulate arrow key navigation in widgets
- Validate keyboard shortcuts
- Test roving tabindex patterns

**MathML and SVG**
- Add specialized roles for math content
- Support SVG accessibility attributes
- Render math expressions in screen reader format

**Performance Optimization**
- Incremental parsing for large documents
- Parallel processing for batch mode
- Caching for repeated analysis

**Enhanced Diffing**
- Visual diff output (side-by-side comparison)
- Ignore whitespace-only changes
- Configurable diff sensitivity

**Browser Integration**
- Browser extension for live page analysis
- DevTools integration
- Real-time announcement preview

### V3+ Potential Features

**Machine Learning Enhancements**
- Train models on actual screen reader output
- Improve heuristic accuracy
- Detect common accessibility anti-patterns

**Accessibility Linting**
- Detect ARIA misuse
- Suggest improvements
- Integrate with existing linters (axe, eslint-plugin-jsx-a11y)

**Visual Regression Testing**
- Compare announcement changes across commits
- Integrate with visual regression tools
- Generate accessibility change reports

**Multi-Language Support**
- Localized screen reader output
- Language-specific announcement rules
- RTL language support

### Versioning Strategy

**Model Versioning:**
- Major version: Breaking changes to model structure
- Minor version: Additive changes (new optional properties)

**CLI Versioning:**
- Semantic versioning (semver)
- Major version: Breaking CLI changes or model major version bump
- Minor version: New features, model minor version bump
- Patch version: Bug fixes, no model changes

**Backward Compatibility:**
- V2 CLI can read V1 models (upgrade on load)
- V1 CLI rejects V2 models (version check)
- Provide migration tool for model upgrades


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system - essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Parser Robustness

For any HTML input (valid or malformed), the HTML parser should either successfully parse it into a DOM representation or fail with a clear error message, never crashing or hanging.

**Validates: Requirements 1.1, 1.3**

### Property 2: Semantic Model Completeness

For any accessible element in the parsed HTML, the semantic model should represent it with all required fields: role, name, state, and focus information.

**Validates: Requirements 2.2, 2.3, 2.5, 2.6, 3.1**

### Property 3: Accessible Description Extraction

For any element with aria-describedby or title attributes, the semantic model should include the computed accessible description.

**Validates: Requirements 2.4**

### Property 4: Inaccessible Element Filtering

For any element with aria-hidden="true" or a presentational role, the semantic model should omit it from the accessibility tree.

**Validates: Requirements 2.7**

### Property 5: Model Serialization Round Trip

For any semantic model, serializing to JSON and deserializing should produce an equivalent model with identical structure and values.

**Validates: Requirements 3.2, 11.1, 11.4**

### Property 6: Deterministic Output

For any HTML input, parsing it multiple times should produce byte-identical JSON output (same property ordering, same values, same structure).

**Validates: Requirements 3.3, 3.5**

### Property 7: Hierarchical Structure Preservation

For any HTML with nested accessible elements, the semantic model should preserve the parent-child relationships in the children array.

**Validates: Requirements 3.4**

### Property 8: CSS Selector Filtering

For any CSS selector and HTML document, the semantic model should contain exactly the accessible elements matching the selector (all matches, only matches).

**Validates: Requirements 8.1, 8.2**

### Property 9: Invalid ARIA Error Recovery

For any HTML with invalid ARIA attributes, the parser should emit warnings but continue processing and produce a semantic model for valid elements.

**Validates: Requirements 9.4**

### Property 10: Semantic Diff Completeness

For any two semantic models, the diff should identify all added nodes, all removed nodes, and all changed properties, with no false positives or false negatives.

**Validates: Requirements 13.3, 13.4, 13.5, 13.6**

## Error Handling

### Error Categories

**Input Errors (User-Facing)**
- File not found: Clear message with file path
- Invalid file format: Description of what's wrong
- Invalid command-line arguments: Usage information displayed
- No elements match selector: Error message with selector

**Parsing Errors (Recoverable)**
- Malformed HTML: Warning emitted, parsing continues with error recovery
- Invalid ARIA attributes: Warning emitted, attribute ignored, processing continues
- Missing required attributes: Warning emitted, default values used

**System Errors (Fatal)**
- File I/O failure: Error message with path and reason (permissions, disk full, etc.)
- Out of memory: Error message suggesting smaller input or batch processing
- JSON serialization failure: Error message with details (should be rare)

### Error Handling Strategy

**Principle: Fail Fast for User Errors, Recover for Content Errors**

User errors (wrong file path, invalid arguments) should fail immediately with clear guidance. Content errors (malformed HTML, invalid ARIA) should be handled gracefully with warnings, allowing analysis to continue.

**Exit Codes:**
- 0: Success
- 1: User error (invalid arguments, file not found)
- 2: Content error (parsing failed completely)
- 3: System error (I/O failure, out of memory)

**Error Message Format:**

```
Error: [Category] [Brief description]
Details: [Specific information]
Suggestion: [How to fix]
```

Example:
```
Error: File not found
Details: Cannot read file at path: /path/to/file.html
Suggestion: Check that the file exists and you have read permissions
```

**Warning Format:**

```
Warning: [Brief description]
Location: [Where in the input]
Impact: [What this means for the output]
```

Example:
```
Warning: Invalid ARIA attribute
Location: <div aria-invalid-attr="value"> at line 42
Impact: Attribute ignored, element processed normally
```

### Error Recovery Mechanisms

**HTML Parsing:**
- Use jsdom's lenient parsing mode
- Unclosed tags: Automatically closed at appropriate boundaries
- Invalid nesting: Restructured to valid DOM
- Unknown elements: Treated as generic containers

**ARIA Processing:**
- Invalid role: Warning emitted, implicit role used
- Invalid state value: Warning emitted, state ignored
- Circular aria-labelledby: Warning emitted, cycle broken
- Missing referenced ID: Warning emitted, reference ignored

**Model Construction:**
- Missing required field: Default value used, warning emitted
- Invalid enum value: Warning emitted, closest valid value used
- Circular tree structure: Error, processing halted (should never happen)

## Testing Strategy

### Dual Testing Approach

AnnounceKit requires both unit testing and property-based testing for comprehensive validation:

**Unit Tests** focus on:
- Specific examples of ARIA name computation (aria-label, aria-labelledby, text content, alt text)
- Specific screen reader output examples (button announcements, checkbox states, heading levels)
- Edge cases (empty input, deeply nested structures, circular references)
- Error conditions (file not found, invalid arguments, malformed HTML)
- CLI integration (argument parsing, file I/O, output formatting)

**Property Tests** focus on:
- Universal properties that hold for all inputs (determinism, round-trip serialization)
- Structural invariants (tree validity, no orphaned nodes)
- Extraction completeness (all accessible elements captured)
- Filtering correctness (CSS selectors, aria-hidden)
- Diff accuracy (all changes detected)

Together, unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library:** fast-check (TypeScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test (due to randomization)
- Shrinking enabled for minimal failing examples
- Seed logging for reproducibility

**Test Tagging:**
Each property test must reference its design document property with a comment:

```typescript
// Feature: announcekit-cli, Property 5: Model Serialization Round Trip
test('semantic model round trip', () => {
  fc.assert(
    fc.property(arbitrarySemanticModel(), (model) => {
      const json = JSON.stringify(model);
      const deserialized = JSON.parse(json);
      expect(deserialized).toEqual(model);
    }),
    { numRuns: 100 }
  );
});
```

### Test Organization

```
tests/
├── unit/
│   ├── parser/
│   │   ├── html-parsing.test.ts
│   │   └── aria-name-computation.test.ts
│   ├── extractor/
│   │   ├── role-extraction.test.ts
│   │   ├── state-extraction.test.ts
│   │   └── tree-building.test.ts
│   ├── model/
│   │   ├── serialization.test.ts
│   │   └── validation.test.ts
│   ├── renderers/
│   │   ├── nvda-renderer.test.ts
│   │   └── voiceover-renderer.test.ts
│   └── cli/
│       ├── argument-parsing.test.ts
│       ├── file-io.test.ts
│       └── output-formatting.test.ts
├── property/
│   ├── parser-robustness.test.ts
│   ├── model-completeness.test.ts
│   ├── determinism.test.ts
│   ├── round-trip.test.ts
│   ├── tree-structure.test.ts
│   ├── selector-filtering.test.ts
│   └── diff-accuracy.test.ts
├── integration/
│   ├── end-to-end.test.ts
│   ├── batch-processing.test.ts
│   └── diff-mode.test.ts
└── fixtures/
    ├── valid-html/
    ├── malformed-html/
    ├── aria-examples/
    └── expected-outputs/
```

### Snapshot Testing

Use Vitest's snapshot testing for:
- Full semantic model outputs (deterministic, easy to review)
- Screen reader announcement text (catch unintended phrasing changes)
- Diff outputs (validate structured format)

Snapshots should be reviewed carefully during PR review to catch regressions.

### Test Data Generation

**Arbitrary Generators for Property Tests:**

```typescript
// Generate random semantic models
const arbitrarySemanticModel = (): fc.Arbitrary<AnnouncementModel> => {
  return fc.record({
    version: fc.record({ major: fc.constant(1), minor: fc.constant(0) }),
    root: arbitraryAccessibleNode(),
    metadata: fc.record({
      extractedAt: fc.date().map(d => d.toISOString()),
    }),
  });
};

// Generate random accessible nodes
const arbitraryAccessibleNode = (): fc.Arbitrary<AccessibleNode> => {
  return fc.record({
    role: fc.constantFrom(...SUPPORTED_ROLES),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.option(fc.string({ maxLength: 200 })),
    value: fc.option(arbitraryAccessibleValue()),
    state: arbitraryAccessibleState(),
    focus: fc.record({
      focusable: fc.boolean(),
      tabindex: fc.option(fc.integer({ min: -1, max: 100 })),
    }),
    children: fc.array(fc.memo(n => arbitraryAccessibleNode()), { maxLength: 5 }),
  });
};

// Generate random HTML with accessible elements
const arbitraryAccessibleHTML = (): fc.Arbitrary<string> => {
  return fc.oneof(
    arbitraryButton(),
    arbitraryLink(),
    arbitraryHeading(),
    arbitraryInput(),
    arbitraryLandmark(),
  ).map(element => `<!DOCTYPE html><html><body>${element}</body></html>`);
};
```

### CI Integration

**Test Execution in CI:**
- Run all unit tests (fast feedback)
- Run all property tests with 100 iterations
- Run integration tests
- Generate coverage report (target: 80%+ coverage)
- Run snapshot tests and fail on changes (require explicit update)

**Performance Benchmarks:**
- Track execution time for typical component HTML (target: <5 seconds)
- Alert on regressions >20%

**Test Artifacts:**
- Coverage reports uploaded to CI
- Failed test outputs saved as artifacts
- Snapshot diffs saved for review
