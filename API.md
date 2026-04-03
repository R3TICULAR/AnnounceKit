# AnnounceKit API Documentation

This document describes the programmatic API for using AnnounceKit as a library in your Node.js applications.

## Installation

```bash
npm install announcekit
```

## Quick Start

```typescript
import { parseHTML, buildAccessibilityTree, serializeModel } from 'announcekit';

const html = '<button>Click me</button>';
const doc = parseHTML(html);
const result = buildAccessibilityTree(doc.document.body);
const json = serializeModel(result.model);

console.log(json);
```

## Core Modules

### Parser Module

Parse HTML into a DOM representation.

```typescript
import { parseHTML } from 'announcekit/parser';
```

#### `parseHTML(html: string): ParseResult`

Parses HTML string into a DOM document with error recovery.

**Parameters:**
- `html` - HTML string to parse

**Returns:**
- `ParseResult` object with:
  - `document: Document` - jsdom Document object
  - `warnings: string[]` - Parsing warnings for malformed HTML

**Example:**

```typescript
const result = parseHTML('<button>Click me</button>');
console.log(result.document.body.innerHTML);
console.log(result.warnings); // []
```

### Extractor Module

Build accessibility trees from DOM elements.

```typescript
import { 
  buildAccessibilityTree,
  buildAccessibilityTreeWithSelector,
  computeAccessibleName,
  computeAccessibleDescription,
  computeRole
} from 'announcekit/extractor';
```

#### `buildAccessibilityTree(element: Element): TreeResult`

Builds an accessibility tree from a DOM element.

**Parameters:**
- `element` - Root DOM element to analyze

**Returns:**
- `TreeResult` object with:
  - `model: AnnouncementModel` - Canonical announcement model
  - `warnings: string[]` - Extraction warnings

**Example:**

```typescript
const doc = parseHTML('<button aria-expanded="false">Menu</button>');
const result = buildAccessibilityTree(doc.document.body);

console.log(result.model.root.role); // "button"
console.log(result.model.root.name); // "Menu"
console.log(result.model.root.state.expanded); // false
```

#### `buildAccessibilityTreeWithSelector(element: Element, selector: string): SelectorResult[]`

Builds accessibility trees for elements matching a CSS selector.

**Parameters:**
- `element` - Root DOM element to search within
- `selector` - CSS selector string

**Returns:**
- Array of `SelectorResult` objects, each with:
  - `model: AnnouncementModel` - Canonical announcement model
  - `element: Element` - Matching DOM element
  - `warnings: string[]` - Extraction warnings

**Example:**

```typescript
const html = `
  <button class="primary">Submit</button>
  <button class="secondary">Cancel</button>
`;
const doc = parseHTML(html);
const results = buildAccessibilityTreeWithSelector(doc.document.body, 'button.primary');

console.log(results.length); // 1
console.log(results[0].model.root.name); // "Submit"
```

#### `computeAccessibleName(element: Element): string`

Computes the accessible name for an element following the ARIA name computation algorithm.

**Parameters:**
- `element` - DOM element

**Returns:**
- Accessible name string

**Example:**

```typescript
const doc = parseHTML('<button aria-label="Close dialog">X</button>');
const button = doc.document.querySelector('button')!;
const name = computeAccessibleName(button);

console.log(name); // "Close dialog"
```

#### `computeAccessibleDescription(element: Element): string`

Computes the accessible description for an element.

**Parameters:**
- `element` - DOM element

**Returns:**
- Accessible description string

**Example:**

```typescript
const html = `
  <button aria-describedby="help">Submit</button>
  <div id="help">Click to submit the form</div>
`;
const doc = parseHTML(html);
const button = doc.document.querySelector('button')!;
const description = computeAccessibleDescription(button);

console.log(description); // "Click to submit the form"
```

#### `computeRole(element: Element): AccessibleRole | null`

Computes the accessible role for an element.

**Parameters:**
- `element` - DOM element

**Returns:**
- `AccessibleRole` string or `null` if element has no accessible role

**Example:**

```typescript
const doc = parseHTML('<button>Click me</button>');
const button = doc.document.querySelector('button')!;
const role = computeRole(button);

console.log(role); // "button"
```

### Model Module

Work with the canonical announcement model.

```typescript
import { 
  serializeModel,
  deserializeModel,
  validateModel
} from 'announcekit/model';
```

#### `serializeModel(model: AnnouncementModel): string`

Serializes a model to JSON with deterministic property ordering.

**Parameters:**
- `model` - Announcement model to serialize

**Returns:**
- JSON string

**Example:**

```typescript
const json = serializeModel(model);
console.log(json);
```

#### `deserializeModel(json: string): AnnouncementModel`

Deserializes JSON to an announcement model with validation.

**Parameters:**
- `json` - JSON string

**Returns:**
- `AnnouncementModel` object

**Throws:**
- Error if JSON is invalid or model validation fails

**Example:**

```typescript
const model = deserializeModel(json);
console.log(model.root.role);
```

#### `validateModel(model: AnnouncementModel): ValidationResult`

Validates model integrity.

**Parameters:**
- `model` - Announcement model to validate

**Returns:**
- `ValidationResult` object with:
  - `valid: boolean` - Whether model is valid
  - `errors: string[]` - Validation errors

**Example:**

```typescript
const result = validateModel(model);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### Renderer Module

Generate screen reader announcement text.

```typescript
import { 
  renderNVDA,
  renderJAWS,
  renderVoiceOver,
  renderAudit
} from 'announcekit/renderer';
```

#### `renderNVDA(model: AnnouncementModel): string`

Generates NVDA-style announcement text.

**Parameters:**
- `model` - Announcement model

**Returns:**
- Announcement text string

**Example:**

```typescript
const text = renderNVDA(model);
console.log(text); // "Submit, button"
```

#### `renderJAWS(model: AnnouncementModel): string`

Generates JAWS-style announcement text.

**Parameters:**
- `model` - Announcement model

**Returns:**
- Announcement text string

**Example:**

```typescript
const text = renderJAWS(model);
console.log(text); // "Submit, button"
```

#### `renderVoiceOver(model: AnnouncementModel): string`

Generates VoiceOver-style announcement text.

**Parameters:**
- `model` - Announcement model

**Returns:**
- Announcement text string

**Example:**

```typescript
const text = renderVoiceOver(model);
console.log(text); // "Submit, button"
```

#### `renderAudit(model: AnnouncementModel): string`

Generates a developer-friendly accessibility audit report.

**Parameters:**
- `model` - Announcement model

**Returns:**
- Formatted audit report string

**Example:**

```typescript
const report = renderAudit(model);
console.log(report);
// Outputs formatted report with landmarks, headings, issues, etc.
```

### Diff Module

Compare accessibility models.

```typescript
import { computeDiff, formatDiff } from 'announcekit/diff';
```

#### `computeDiff(oldModel: AnnouncementModel, newModel: AnnouncementModel): SemanticDiff`

Computes semantic differences between two models.

**Parameters:**
- `oldModel` - Original announcement model
- `newModel` - Updated announcement model

**Returns:**
- `SemanticDiff` object with:
  - `added: AccessibleNode[]` - Nodes added in new model
  - `removed: AccessibleNode[]` - Nodes removed from old model
  - `changed: NodeChange[]` - Nodes with changed properties

**Example:**

```typescript
const diff = computeDiff(oldModel, newModel);
console.log(`Added: ${diff.added.length}`);
console.log(`Removed: ${diff.removed.length}`);
console.log(`Changed: ${diff.changed.length}`);
```

#### `formatDiff(diff: SemanticDiff): string`

Formats a semantic diff as human-readable text.

**Parameters:**
- `diff` - Semantic diff object

**Returns:**
- Formatted diff string

**Example:**

```typescript
const formatted = formatDiff(diff);
console.log(formatted);
```

## Type Definitions

### Core Types

```typescript
/**
 * Model version for forward compatibility.
 */
interface ModelVersion {
  major: number;
  minor: number;
}

/**
 * Accessible role following ARIA specification.
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
  level?: number;
  posinset?: number;
  setsize?: number;
}

/**
 * Value for form controls and range widgets.
 */
interface AccessibleValue {
  current: string | number;
  min?: number;
  max?: number;
  text?: string;
}

/**
 * Focusability information.
 */
interface FocusInfo {
  focusable: boolean;
  tabindex?: number;
}

/**
 * Single node in the accessibility tree.
 */
interface AccessibleNode {
  role: AccessibleRole;
  name: string;
  description?: string;
  value?: AccessibleValue;
  state: AccessibleState;
  focus: FocusInfo;
  children: AccessibleNode[];
}

/**
 * Root of the canonical announcement model.
 */
interface AnnouncementModel {
  version: ModelVersion;
  root: AccessibleNode;
  metadata: {
    extractedAt: string;
    sourceHash?: string;
  };
}
```

### Result Types

```typescript
interface ParseResult {
  document: Document;
  warnings: string[];
}

interface TreeResult {
  model: AnnouncementModel;
  warnings: string[];
}

interface SelectorResult {
  model: AnnouncementModel;
  element: Element;
  warnings: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

### Diff Types

```typescript
interface SemanticDiff {
  added: AccessibleNode[];
  removed: AccessibleNode[];
  changed: NodeChange[];
}

interface NodeChange {
  path: string;
  property: string;
  oldValue: any;
  newValue: any;
}
```

## Complete Example

Here's a complete example showing how to use the API:

```typescript
import {
  parseHTML,
  buildAccessibilityTree,
  buildAccessibilityTreeWithSelector,
  serializeModel,
  renderNVDA,
  renderVoiceOver,
  renderAudit,
  computeDiff
} from 'announcekit';

// Parse HTML
const html = `
  <nav aria-label="Main navigation">
    <a href="/home">Home</a>
    <a href="/about">About</a>
  </nav>
  <main>
    <h1>Welcome</h1>
    <button aria-expanded="false">Show menu</button>
  </main>
`;

const doc = parseHTML(html);

// Build full accessibility tree
const fullResult = buildAccessibilityTree(doc.document.body);
console.log('Full tree:', serializeModel(fullResult.model));

// Build tree for specific elements
const buttonResults = buildAccessibilityTreeWithSelector(
  doc.document.body,
  'button'
);
console.log('Button count:', buttonResults.length);

// Generate screen reader output
const nvdaText = renderNVDA(fullResult.model);
console.log('NVDA:', nvdaText);

const voText = renderVoiceOver(fullResult.model);
console.log('VoiceOver:', voText);

// Generate audit report
const audit = renderAudit(fullResult.model);
console.log('Audit:\n', audit);

// Compare versions
const oldHTML = '<button>Old text</button>';
const newHTML = '<button aria-expanded="true">New text</button>';

const oldDoc = parseHTML(oldHTML);
const newDoc = parseHTML(newHTML);

const oldModel = buildAccessibilityTree(oldDoc.document.body).model;
const newModel = buildAccessibilityTree(newDoc.document.body).model;

const diff = computeDiff(oldModel, newModel);
console.log('Changes:', diff.changed);
```

## Error Handling

All API functions may throw errors. Wrap calls in try-catch blocks:

```typescript
try {
  const doc = parseHTML(html);
  const result = buildAccessibilityTree(doc.document.body);
  const json = serializeModel(result.model);
} catch (error) {
  console.error('Error:', error.message);
}
```

Common error scenarios:
- Invalid HTML (recoverable with warnings)
- Invalid ARIA attributes (warnings emitted, processing continues)
- Invalid model structure (validation errors)
- Serialization failures (rare)

## Best Practices

### 1. Check Warnings

Always check the warnings array for potential issues:

```typescript
const result = buildAccessibilityTree(element);
if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}
```

### 2. Validate Models

Validate models before serialization:

```typescript
import { validateModel } from 'announcekit/model';

const validation = validateModel(model);
if (!validation.valid) {
  throw new Error(`Invalid model: ${validation.errors.join(', ')}`);
}
```

### 3. Use Selectors for Performance

When analyzing large documents, use selectors to focus on specific elements:

```typescript
// Instead of building full tree
const fullTree = buildAccessibilityTree(document.body);

// Use selector for better performance
const buttons = buildAccessibilityTreeWithSelector(document.body, 'button');
```

### 4. Cache Parsed Documents

If analyzing the same HTML multiple times, cache the parsed document:

```typescript
const doc = parseHTML(html);

// Reuse doc for multiple analyses
const fullTree = buildAccessibilityTree(doc.document.body);
const buttons = buildAccessibilityTreeWithSelector(doc.document.body, 'button');
const links = buildAccessibilityTreeWithSelector(doc.document.body, 'a');
```

## TypeScript Support

AnnounceKit is written in TypeScript and includes full type definitions. Enable strict mode for best results:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

## Node.js Version

Requires Node.js 18 or higher.

## License

MIT
