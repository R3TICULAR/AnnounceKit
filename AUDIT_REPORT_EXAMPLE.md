# Audit Report Renderer - Example Output

This document shows what the developer-friendly audit report (Task 14.5) will produce.

## Example Input HTML

```html
<main>
  <h1>Welcome to Our Site</h1>
  <nav aria-label="Main navigation">
    <a href="/home">Home</a>
    <a href="/about" aria-current="page">About</a>
    <a href="/contact">Contact</a>
  </nav>
  <article>
    <h2>Latest News</h2>
    <p>Check out our updates...</p>
    <button aria-expanded="false" aria-controls="details">Read more</button>
  </article>
  <aside>
    <h3>Related Links</h3>
    <ul>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/docs">Documentation</a></li>
    </ul>
  </aside>
</main>
```

## Example Audit Report Output

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                      ACCESSIBILITY AUDIT REPORT                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Component: <main>
Analyzed: 2026-03-05T00:25:00.000Z

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 LANDMARK STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 3 landmarks found

main (unnamed)
├─ navigation "Main navigation"
└─ complementary (unnamed)

⚠ Issues:
  • Main landmark has no accessible name (consider adding aria-label)
  • Complementary landmark has no accessible name (consider adding aria-label)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📑 HEADING HIERARCHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 3 headings found (proper hierarchy)

h1 "Welcome to Our Site"
  h2 "Latest News"
    h3 "Related Links"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 INTERACTIVE ELEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 5 interactive elements found

Links (4):
  • "Home" [focusable]
  • "About" [focusable, current=page]
  • "Contact" [focusable]
  • "Blog" [focusable]
  • "Documentation" [focusable]

Buttons (1):
  • "Read more" [focusable, expanded=false]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total accessible elements: 13

Role distribution:
  • main: 1
  • navigation: 1
  • complementary: 1
  • article: 1
  • heading: 3
  • link: 4
  • button: 1
  • list: 1
  • listitem: 2

States in use:
  • expanded: 1
  • current: 1
  • level: 3

Focusable elements: 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ACCESSIBILITY ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ Warning (2):
  • Main landmark has no accessible name
    → Add aria-label="Main content" or similar
  • Complementary landmark has no accessible name
    → Add aria-label="Sidebar" or similar

ℹ Info (1):
  • Button "Read more" is collapsed (aria-expanded=false)
    → Ensure associated content is properly hidden

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ OVERALL ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Good structure with minor improvements needed:
  ✓ Proper heading hierarchy
  ✓ Semantic landmarks present
  ✓ Interactive elements are focusable
  ⚠ Some landmarks need accessible names
```

## Example with Issues

```html
<div>
  <h3>Welcome</h3>
  <button></button>
  <img src="logo.png">
  <input type="text">
  <h1>About</h1>
</div>
```

### Audit Report with Errors

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                      ACCESSIBILITY AUDIT REPORT                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Component: <div>
Analyzed: 2026-03-05T00:25:00.000Z

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 LANDMARK STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ No landmarks found

ℹ Consider adding semantic landmarks (main, nav, aside, etc.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📑 HEADING HIERARCHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ 2 headings found (HIERARCHY VIOLATION)

h3 "Welcome"  ← ERROR: Starts at h3 (should start at h1)
h1 "About"    ← ERROR: h1 appears after h3

⚠ Issues:
  • Heading hierarchy violation: First heading should be h1, not h3
  • Heading hierarchy violation: h1 appears after h3 (incorrect order)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 INTERACTIVE ELEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ 2 interactive elements found (ISSUES DETECTED)

Buttons (1):
  • (unnamed) [focusable] ← ERROR: Button has no accessible name

Form inputs (1):
  • (unnamed) [focusable] ← ERROR: Input has no label

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖼️  IMAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ 1 image found (MISSING ALT TEXT)

Images (1):
  • (no alt text) ← ERROR: Image missing alt attribute

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total accessible elements: 5

Role distribution:
  • generic: 1
  • heading: 2
  • button: 1
  • textbox: 1
  • img: 1

Focusable elements: 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ACCESSIBILITY ISSUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ Error (5):
  • Heading hierarchy violation: First heading is h3 (should be h1)
    → Change <h3> to <h1> or add h1 before it
  • Heading hierarchy violation: h1 appears after h3
    → Reorder headings to maintain proper hierarchy
  • Button has no accessible name
    → Add text content or aria-label to button
  • Input has no associated label
    → Add <label> element or aria-label attribute
  • Image missing alt attribute
    → Add alt="description" or alt="" for decorative images

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ OVERALL ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Critical accessibility issues found:
  ✗ No semantic landmarks
  ✗ Heading hierarchy violations
  ✗ Interactive elements missing names
  ✗ Images missing alt text

Recommendation: Address errors before deployment
```

## CLI Usage

Once implemented, developers will be able to use:

```bash
# Generate audit report
announcekit component.html --format audit

# Compare with JSON output
announcekit component.html --format json,audit

# Audit specific component
announcekit page.html --selector ".my-component" --format audit

# Save audit to file
announcekit component.html --format audit --output audit-report.txt
```

## Benefits

1. **Quick scanning**: Visual hierarchy makes issues obvious
2. **Actionable feedback**: Specific suggestions for fixes
3. **Developer-friendly**: Focuses on structure and common issues
4. **Complements screen reader output**: Shows what's wrong, not just what's announced
5. **CI-friendly**: Clear pass/fail indicators for automated checks
6. **Educational**: Helps developers learn accessibility patterns

## Implementation Notes

The audit report renderer will:
- Reuse the same tree traversal as NVDA/VoiceOver renderers
- Apply heuristic checks for common issues
- Format output with clear sections and visual hierarchy
- Support both terminal (with colors) and plain text output
- Be extensible for future checks (WCAG compliance, etc.)
