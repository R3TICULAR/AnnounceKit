# AnnounceKit Examples

This directory contains example HTML files demonstrating various accessibility patterns and their expected AnnounceKit output.

## Example Files

### button.html
Demonstrates various button patterns:
- Simple buttons
- Buttons with `aria-label`
- Buttons with `aria-expanded` (expandable sections)
- Buttons with `aria-pressed` (toggle buttons)
- Disabled buttons
- Buttons with descriptions (`aria-describedby`)
- Input buttons (submit, reset)
- Custom buttons with `role="button"`

**Try it:**
```bash
# Analyze all buttons
announcekit examples/button.html

# Analyze specific button
announcekit examples/button.html --selector 'button:first-of-type'

# Get NVDA announcements
announcekit examples/button.html --format text --screen-reader nvda

# Get audit report
announcekit examples/button.html --format audit
```

### form.html
Demonstrates form input patterns:
- Text inputs with labels
- Email inputs with validation states
- Password inputs
- Checkboxes
- Radio buttons
- Select dropdowns
- Textareas
- Required fields
- Invalid fields with error messages

**Try it:**
```bash
# Analyze entire form
announcekit examples/form.html

# Analyze only text inputs
announcekit examples/form.html --selector 'input[type="text"], input[type="email"]'

# Get VoiceOver announcements
announcekit examples/form.html --format text --screen-reader voiceover
```

### navigation.html
Demonstrates landmark and navigation patterns:
- Navigation landmarks with `aria-label`
- Main content landmark
- Article regions
- Aside regions
- Footer landmarks
- Multiple navigation regions
- Proper landmark labeling

**Try it:**
```bash
# Analyze landmarks
announcekit examples/navigation.html --selector 'nav, main, aside, footer'

# Get audit report showing landmark structure
announcekit examples/navigation.html --format audit
```

### headings.html
Demonstrates heading hierarchy patterns:
- Proper heading hierarchy (h1 → h2 → h3)
- Custom headings with `role="heading"` and `aria-level`
- Headings with `aria-label`
- Nested heading structures

**Try it:**
```bash
# Analyze heading structure
announcekit examples/headings.html --selector 'h1, h2, h3, h4, h5, h6, [role="heading"]'

# Get audit report showing heading hierarchy
announcekit examples/headings.html --format audit
```

### lists.html
Demonstrates list patterns:
- Unordered lists
- Ordered lists
- Nested lists
- Description lists
- Custom lists with ARIA roles

**Try it:**
```bash
# Analyze all lists
announcekit examples/lists.html

# Analyze only unordered lists
announcekit examples/lists.html --selector 'ul'

# Get JAWS announcements
announcekit examples/lists.html --format text --screen-reader jaws
```

## Expected Output Files

Files ending in `-expected.json` contain the expected output for specific commands. These can be used for:
- Understanding what output to expect
- Validating your own HTML
- Regression testing

Example:
```bash
# Generate output
announcekit examples/button.html --selector 'button:first-of-type' > output.json

# Compare with expected
diff output.json examples/button-expected.json
```

## Common Patterns

### Analyzing Specific Elements

Use CSS selectors to focus on specific elements:

```bash
# All buttons
announcekit page.html --selector 'button'

# Buttons with specific class
announcekit page.html --selector 'button.primary'

# Elements with aria-label
announcekit page.html --selector '[aria-label]'

# Interactive elements
announcekit page.html --selector 'button, a, input, select, textarea'
```

### Comparing Versions

Use semantic diff to see what changed:

```bash
# Compare old and new versions
announcekit new-button.html --diff old-button.html
```

### Batch Processing

Process multiple examples at once:

```bash
# Analyze all examples
announcekit examples/*.html

# Get audit reports for all
announcekit examples/*.html --format audit
```

### Output Formats

Try different output formats:

```bash
# JSON (default) - for CI and programmatic use
announcekit examples/button.html

# Text - for human-readable announcements
announcekit examples/button.html --format text

# Audit - for comprehensive analysis
announcekit examples/button.html --format audit

# Both - JSON + text
announcekit examples/button.html --format both
```

### Screen Reader Comparison

Compare how different screen readers announce the same content:

```bash
# All screen readers
announcekit examples/button.html --format text --screen-reader all

# Specific screen reader
announcekit examples/button.html --format text --screen-reader nvda
announcekit examples/button.html --format text --screen-reader jaws
announcekit examples/button.html --format text --screen-reader voiceover
```

## Creating Your Own Examples

When creating examples for testing:

1. **Use semantic HTML** - Start with native elements when possible
2. **Add ARIA when needed** - Use ARIA to enhance semantics, not replace HTML
3. **Include labels** - All interactive elements should have accessible names
4. **Test incrementally** - Start simple, add complexity gradually
5. **Document expected behavior** - Note what you expect screen readers to announce

Example template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Example</title>
</head>
<body>
  <!-- Your accessible HTML here -->
  <button aria-expanded="false">Toggle menu</button>
</body>
</html>
```

Then test:

```bash
announcekit your-example.html --format audit
```

## Tips

- Use `--format audit` to get a comprehensive overview
- Use `--selector` to focus on specific components
- Use `--screen-reader all` to see cross-platform differences
- Use `--diff` to track accessibility changes over time
- Save JSON output for snapshot testing in CI

## Further Reading

- [README.md](../README.md) - Full CLI documentation
- [API.md](../API.md) - Programmatic API documentation
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - W3C patterns and examples
