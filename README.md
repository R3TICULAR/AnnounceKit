# Speakable

Simulate how NVDA, JAWS, and VoiceOver interpret your HTML — from a single CLI tool. Catch screen reader issues early, detect regressions in CI/CD, and reduce manual testing overhead.

Speakable bridges the gap between rule-based linting tools (like axe) and manual screen reader testing. It gives you scalable, automated insight into how assistive technologies will interpret your UI.

> Screen reader output is heuristic and may differ from actual behavior. Speakable complements manual testing — it doesn't replace it.

## Installation

```bash
npm install @reticular/speakable
```

Or install globally for CLI usage:

```bash
npm install -g @reticular/speakable
```

## Quick Start

```bash
# Analyze an HTML file (JSON output)
speakable page.html

# Get screen reader announcement text
speakable page.html -f text -s nvda

# Generate an accessibility audit report
speakable page.html -f audit

# Compare two versions for regressions
speakable new.html --diff old.html

# Pipe from stdin
cat page.html | speakable -
```

## CLI Reference

```
Usage: speakable [options] [input...]

Analyze HTML accessibility announcements and generate screen reader output

Arguments:
  input                         HTML file path(s) or "-" for stdin

Options:
  -v, --version                 Output the current version
  -o, --output <path>           Output file path (default: stdout)
  -f, --format <format>         Output format (default: "json")
  -s, --screen-reader <reader>  Screen reader to simulate (default: "nvda")
  --selector <selector>         CSS selector to filter elements
  --validate                    Validate round-trip serialization
  --diff <file>                 Compare with another HTML file
  --batch                       Process multiple files in batch mode
  -h, --help                    Display help for command
```

## Output Formats

| Format | Flag | Description |
|--------|------|-------------|
| JSON | `-f json` | Canonical accessibility model as JSON. Best for CI/CD and programmatic use. |
| Text | `-f text` | Screen reader announcement text. Human-readable output showing what each reader would say. |
| Audit | `-f audit` | Developer-friendly audit report with landmark structure, heading hierarchy, interactive elements, and issue detection. |
| Both | `-f both` | JSON and text output combined. |

## Screen Readers

| Reader | Flag | Platform |
|--------|------|----------|
| NVDA | `-s nvda` | Windows |
| JAWS | `-s jaws` | Windows |
| VoiceOver | `-s voiceover` | macOS |
| All | `-s all` | All three readers side by side |

Each renderer produces heuristic output approximating the real screen reader's behavior. Key differences are preserved — for example, NVDA says "navigation landmark" while JAWS says "navigation region" and VoiceOver says "navigation".

## Features

### Semantic Diff

Compare two HTML files and see exactly what changed in the accessibility tree:

```bash
speakable new-version.html --diff old-version.html
speakable new-version.html --diff old-version.html -f text
```

The diff identifies added, removed, and changed nodes with specific property-level details (name changes, role changes, state changes, focus changes).

### CSS Selector Filtering

Focus analysis on specific elements:

```bash
# Analyze only buttons
speakable page.html --selector "button"

# Analyze a specific component
speakable page.html --selector ".my-component"

# Analyze all interactive elements
speakable page.html --selector "button, a, input, select"
```

### Batch Processing

Analyze multiple files in a single run:

```bash
speakable --batch file1.html file2.html file3.html
```

Batch mode continues processing even if individual files fail, and reports a summary at the end.

### Audit Reports

Generate comprehensive accessibility reports:

```bash
speakable page.html -f audit
```

The audit report includes:
- Landmark structure analysis
- Heading hierarchy validation (detects skipped levels)
- Interactive element inventory with state tracking
- Missing accessible name detection
- Severity-coded issues (errors, warnings, info)
- Overall assessment with remediation suggestions

### Colorized Output

When outputting to a terminal, Speakable automatically colorizes human-readable formats:
- Section headers in cyan
- Errors in red, warnings in yellow, info in blue
- Success indicators in green
- Role names in cyan, element names in bold, states in yellow

Colors are automatically disabled when piping to files or other commands.

### Round-Trip Validation

Verify that the accessibility model serializes and deserializes consistently:

```bash
speakable page.html --validate
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Speakable
  run: npx @reticular/speakable page.html -f audit

- name: Check for regressions
  run: npx @reticular/speakable new.html --diff baseline.html -f text
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success — analysis completed, no issues |
| 1 | User error — invalid arguments or options |
| 2 | Content error — accessibility issues found, or diff detected changes |
| 3 | System error — file not found, I/O failure |

Use exit codes in CI to fail builds on regressions:

```bash
speakable new.html --diff baseline.html || echo "Accessibility regression detected"
```

## Programmatic API

Speakable can also be used as a library:

```typescript
import {
  parseHTML,
  buildAccessibilityTree,
  serializeModel,
  renderNVDA,
  renderJAWS,
  renderVoiceOver,
  renderAuditReport,
  diffAccessibilityTrees,
} from '@reticular/speakable';

const html = '<button aria-label="Submit">Pay</button>';
const doc = parseHTML(html);
const result = buildAccessibilityTree(doc.document.body);

// Screen reader output
console.log(renderNVDA(result.model));    // "Submit, button"
console.log(renderJAWS(result.model));    // "Submit, button"
console.log(renderVoiceOver(result.model)); // "button, Submit"

// JSON model
console.log(serializeModel(result.model));

// Audit report
console.log(renderAuditReport(result.model));
```

## How It Works

Speakable processes HTML through a four-stage pipeline:

1. **Parser** — Parses HTML into a DOM using jsdom with lenient error recovery
2. **Extractor** — Walks the DOM and builds a canonical accessibility tree following the ARIA spec (role computation, accessible name calculation, state extraction, focus detection)
3. **Model** — Produces a deterministic, serializable `AnnouncementModel` suitable for snapshot testing and diffing
4. **Renderers** — Transforms the model into screen reader-specific announcement text, applying each reader's unique patterns

## What Speakable Catches

- Missing accessible names on buttons, links, and form controls
- Heading hierarchy violations (skipped levels, wrong starting level)
- Unnamed landmarks that should have labels
- Duplicate landmarks without distinguishing names
- ARIA attribute issues and invalid values
- Changes in screen reader output between code versions (via diff)

## What Speakable Does Not Do

- Replace manual screen reader testing with real assistive technology
- Guarantee WCAG compliance
- Test dynamic/JavaScript-driven content (it analyzes static HTML)
- Perfectly replicate screen reader behavior (output is heuristic)

Use Speakable to catch issues early and reduce the manual testing burden — then validate critical flows with real screen readers.

## Best Practices

1. **Run in CI** — Add Speakable to your build pipeline to catch regressions on every PR
2. **Use semantic diff** — Compare before/after HTML to detect accessibility changes
3. **Focus with selectors** — Use `--selector` to analyze specific components rather than entire pages
4. **Check all readers** — Use `-s all` to see cross-platform differences
5. **Start with audit** — Use `-f audit` for a quick overview of accessibility health
6. **Save baselines** — Store JSON output as baselines for regression detection

## Requirements

- Node.js 18 or higher

## License

MIT
