/**
 * Speakable Extension — Analyzer Bridge
 *
 * This file bridges the popup with the analyzer engine.
 * In the full build, this would be a bundled version of web/src/analyzer.ts.
 *
 * For now, it implements a lightweight version of the analysis pipeline
 * using the browser's native DOMParser — the same approach as the web tool.
 */

// ---------------------------------------------------------------------------
// Browser HTML Parser (mirrors web/src/browser-parser.ts)
// ---------------------------------------------------------------------------

function parseHTML(html) {
  const warnings = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    warnings.push({ message: `Parser error: ${parserError.textContent?.trim() ?? 'unknown'}` });
  }
  if (!doc.body) {
    warnings.push({ message: 'Document has no body element.' });
  }

  return { document: doc, warnings };
}

// ---------------------------------------------------------------------------
// Simplified Accessibility Tree Builder
// ---------------------------------------------------------------------------

const IMPLICIT_ROLES = {
  button: 'button', a: 'link', input: 'textbox', textarea: 'textbox',
  select: 'listbox', h1: 'heading', h2: 'heading', h3: 'heading',
  h4: 'heading', h5: 'heading', h6: 'heading', nav: 'navigation',
  main: 'main', header: 'banner', footer: 'contentinfo', aside: 'complementary',
  form: 'form', section: 'region', ul: 'list', ol: 'list', li: 'listitem',
  img: 'img', article: 'article', table: 'table', tr: 'row', td: 'cell',
  th: 'columnheader', dialog: 'dialog', hr: 'separator',
  fieldset: 'group', p: 'paragraph',
};

const INPUT_ROLES = {
  button: 'button', submit: 'button', reset: 'button',
  checkbox: 'checkbox', radio: 'radio',
};

function getRole(el) {
  const explicit = el.getAttribute('role');
  if (explicit && explicit !== 'presentation' && explicit !== 'none') return explicit;
  if (explicit === 'presentation' || explicit === 'none') return null;

  const tag = el.tagName.toLowerCase();
  if (tag === 'input') return INPUT_ROLES[el.type?.toLowerCase()] || 'textbox';
  if (tag === 'a') return el.hasAttribute('href') ? 'link' : null;
  if (tag === 'section') return el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') ? 'region' : null;
  return IMPLICIT_ROLES[tag] || null;
}

function getName(el) {
  // aria-label
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel?.trim()) return ariaLabel.trim();

  // aria-labelledby
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const names = labelledBy.split(/\s+/).map(id => {
      const ref = el.ownerDocument.getElementById(id);
      return ref?.textContent?.trim() || '';
    }).filter(Boolean);
    if (names.length) return names.join(' ');
  }

  // Native label
  const tag = el.tagName.toLowerCase();
  if (['input', 'textarea', 'select'].includes(tag)) {
    const id = el.getAttribute('id');
    if (id) {
      const label = el.ownerDocument.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent?.trim() || '';
    }
    const parentLabel = el.closest('label');
    if (parentLabel) return parentLabel.textContent?.trim() || '';
  }

  // Alt for images
  if (tag === 'img') {
    const alt = el.getAttribute('alt');
    if (alt !== null) return alt.trim();
  }

  // Text content for buttons, links, headings
  if (['button', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'summary', 'legend', 'li'].includes(tag)) {
    return el.textContent?.trim() || '';
  }

  // Title fallback
  const title = el.getAttribute('title');
  if (title?.trim()) return title.trim();

  return '';
}

function getStates(el) {
  const s = {};
  const tag = el.tagName.toLowerCase();

  const boolAttr = (attr) => {
    const v = el.getAttribute(attr);
    if (v === 'true') return true;
    if (v === 'false') return false;
    return undefined;
  };

  const expanded = boolAttr('aria-expanded');
  if (expanded !== undefined) s.expanded = expanded;

  const checked = el.getAttribute('aria-checked');
  if (checked === 'true') s.checked = true;
  else if (checked === 'false') s.checked = false;
  else if (checked === 'mixed') s.checked = 'mixed';
  else if (tag === 'input' && (el.type === 'checkbox' || el.type === 'radio')) {
    s.checked = el.checked;
  }

  const disabled = boolAttr('aria-disabled');
  if (disabled) s.disabled = true;
  else if (el.disabled) s.disabled = true;

  const invalid = boolAttr('aria-invalid');
  if (invalid) s.invalid = true;

  const required = boolAttr('aria-required');
  if (required) s.required = true;
  else if (el.required) s.required = true;

  const busy = boolAttr('aria-busy');
  if (busy) s.busy = true;

  const current = el.getAttribute('aria-current');
  if (current && current !== 'false') s.current = current;

  // Heading level
  const match = tag.match(/^h([1-6])$/);
  if (match) s.level = parseInt(match[1]);
  const ariaLevel = el.getAttribute('aria-level');
  if (ariaLevel) s.level = parseInt(ariaLevel);

  return s;
}

function buildTree(el) {
  if (el.getAttribute('aria-hidden') === 'true') return null;

  // Skip non-visible/non-semantic elements
  const tag = el.tagName.toLowerCase();
  const SKIP_TAGS = ['script', 'style', 'noscript', 'template', 'svg', 'link', 'meta', 'head'];
  if (SKIP_TAGS.includes(tag)) return null;

  // Skip elements hidden via display:none or visibility:hidden
  if (el.offsetParent === null && tag !== 'body' && tag !== 'html' && !el.closest('[aria-hidden]')) {
    const style = window.getComputedStyle?.(el);
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return null;
  }

  const role = getRole(el);
  const children = [];

  for (const child of el.children) {
    const node = buildTree(child);
    if (node) children.push(node);
  }

  // Static text — only from visible, non-script elements
  if (!role && children.length === 0) {
    const text = getVisibleText(el);
    if (text) return { role: 'staticText', name: text, state: {}, children: [] };
    return null;
  }

  if (!role) {
    if (children.length === 1) return children[0];
    if (children.length > 1) return { role: 'generic', name: '', state: {}, children };
    return null;
  }

  return {
    role,
    name: getName(el),
    state: getStates(el),
    description: el.getAttribute('aria-describedby')
      ? el.getAttribute('aria-describedby').split(/\s+/).map(id => {
          const ref = el.ownerDocument.getElementById(id);
          return ref?.textContent?.trim() || '';
        }).filter(Boolean).join(' ')
      : '',
    children,
  };
}

/**
 * Gets visible text content, skipping script/style/hidden children.
 */
function getVisibleText(el) {
  let text = '';
  for (const node of el.childNodes) {
    if (node.nodeType === 3) { // TEXT_NODE
      text += node.textContent || '';
    } else if (node.nodeType === 1) { // ELEMENT_NODE
      const child = node;
      const childTag = child.tagName?.toLowerCase();
      if (['script', 'style', 'noscript', 'template', 'svg'].includes(childTag)) continue;
      if (child.getAttribute('aria-hidden') === 'true') continue;
      text += getVisibleText(child);
    }
  }
  return text.trim();
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------

function renderNode(node, renderer) {
  const parts = [];
  const { role, name, state } = node;

  if (renderer === 'nvda') {
    if (name) parts.push(name);
    parts.push(...nvdaRole(node));
    parts.push(...nvdaStates(state));
  } else if (renderer === 'jaws') {
    if (name) parts.push(name);
    parts.push(...jawsRole(node));
    parts.push(...jawsStates(state));
  } else {
    // VoiceOver — role first for some elements
    const roleFirst = ['heading', 'navigation', 'main', 'banner', 'contentinfo', 'complementary', 'region', 'form', 'dialog'].includes(role);
    if (roleFirst) {
      parts.push(...voRole(node));
      if (name) parts.push(name);
    } else {
      if (name) parts.push(name);
      parts.push(...voRole(node));
    }
    parts.push(...voStates(state));
  }

  if (node.description) parts.push(node.description);

  const line = parts.filter(Boolean).join(', ');
  const lines = line ? [line] : [];

  for (const child of node.children) {
    // Skip child if it would just repeat the parent's name with no new info.
    // This mimics how real screen readers collapse parent→child when the child
    // is the sole content provider (e.g., li > a > text all saying the same thing).
    if (child.name && child.name === name && node.children.length === 1) {
      // Still recurse into grandchildren in case there's deeper content
      for (const grandchild of child.children) {
        lines.push(...renderNode(grandchild, renderer));
      }
      continue;
    }
    lines.push(...renderNode(child, renderer));
  }
  return lines;
}

function nvdaRole(n) {
  const m = { button: 'button', link: 'link', textbox: 'edit', checkbox: 'checkbox', radio: 'radio button',
    combobox: 'combo box', listbox: 'list box', list: 'list', listitem: 'list item',
    navigation: 'navigation landmark', main: 'main landmark', banner: 'banner landmark',
    contentinfo: 'content information landmark', region: 'region landmark', complementary: 'complementary landmark',
    form: 'form landmark', img: 'graphic', table: 'table', dialog: 'dialog', separator: 'separator' };
  if (n.role === 'heading') return [`heading level ${n.state.level || 1}`];
  return m[n.role] ? [m[n.role]] : (n.role === 'staticText' || n.role === 'paragraph' || n.role === 'generic') ? [] : [n.role];
}

function jawsRole(n) {
  const m = { button: 'button', link: 'clickable', textbox: 'edit', checkbox: 'check box', radio: 'radio button',
    navigation: 'navigation region', main: 'main region', banner: 'banner region',
    contentinfo: 'content information region', region: 'region', img: 'graphic', dialog: 'dialog' };
  if (n.role === 'heading') return [`heading ${n.state.level || 1}`];
  return m[n.role] ? [m[n.role]] : (n.role === 'staticText' || n.role === 'paragraph' || n.role === 'generic') ? [] : [n.role];
}

function voRole(n) {
  const m = { button: 'button', link: 'link', textbox: 'edit text', checkbox: 'checkbox', radio: 'radio button',
    navigation: 'navigation', main: 'main', banner: 'banner', contentinfo: 'content information',
    region: 'region', complementary: 'complementary', form: 'form', img: 'image', dialog: 'web dialog',
    list: 'list', listitem: 'item' };
  if (n.role === 'heading') return [`heading level ${n.state.level || 1}`];
  return m[n.role] ? [m[n.role]] : (n.role === 'staticText' || n.role === 'paragraph' || n.role === 'generic') ? [] : [n.role];
}

function nvdaStates(s) {
  const r = [];
  if (s.expanded === true) r.push('expanded'); if (s.expanded === false) r.push('collapsed');
  if (s.checked === true) r.push('checked'); if (s.checked === false) r.push('not checked'); if (s.checked === 'mixed') r.push('half checked');
  if (s.disabled) r.push('unavailable');
  if (s.invalid) r.push('invalid entry');
  if (s.required) r.push('required');
  if (s.busy) r.push('busy');
  if (s.current && s.current !== 'false') r.push(`current ${s.current}`);
  return r;
}

function jawsStates(s) {
  const r = [];
  if (s.expanded === true) r.push('expanded'); if (s.expanded === false) r.push('collapsed');
  if (s.checked === true) r.push('checked'); if (s.checked === false) r.push('not checked'); if (s.checked === 'mixed') r.push('partially checked');
  if (s.disabled) r.push('unavailable');
  if (s.invalid) r.push('invalid entry');
  if (s.required) r.push('required');
  if (s.current && s.current !== 'false') r.push(`current ${s.current}`);
  return r;
}

function voStates(s) {
  const r = [];
  if (s.expanded === true) r.push('expanded'); if (s.expanded === false) r.push('collapsed');
  if (s.checked === true) r.push('checked'); if (s.checked === false) r.push('unchecked'); if (s.checked === 'mixed') r.push('mixed');
  if (s.disabled) r.push('dimmed');
  if (s.invalid) r.push('invalid data');
  if (s.required) r.push('required');
  if (s.busy) r.push('busy');
  if (s.current && s.current !== 'false') r.push(`current ${s.current}`);
  return r;
}

// ---------------------------------------------------------------------------
// Audit Report
// ---------------------------------------------------------------------------

function generateAudit(tree) {
  const landmarks = [];
  const headings = [];
  const interactive = [];
  const issues = [];
  let total = 0;

  function walk(node) {
    if (!node || node.role === 'generic' || node.role === 'staticText') {
      (node?.children || []).forEach(walk);
      return;
    }
    total++;
    const landmarkRoles = ['navigation', 'main', 'banner', 'contentinfo', 'region', 'complementary', 'form', 'search'];
    const interactiveRoles = ['button', 'link', 'textbox', 'checkbox', 'radio', 'combobox', 'listbox'];

    if (landmarkRoles.includes(node.role)) landmarks.push(node);
    if (node.role === 'heading') headings.push(node);
    if (interactiveRoles.includes(node.role)) interactive.push(node);

    // Issues
    if (interactiveRoles.includes(node.role) && !node.name) {
      issues.push({ severity: 'error', message: `${node.role} has no accessible name` });
    }
    if (landmarkRoles.includes(node.role) && !node.name && ['navigation', 'region', 'complementary', 'form'].includes(node.role)) {
      issues.push({ severity: 'warning', message: `${node.role} landmark has no accessible name` });
    }

    (node.children || []).forEach(walk);
  }
  walk(tree);

  // Heading hierarchy
  for (let i = 0; i < headings.length; i++) {
    if (i === 0 && headings[i].state.level !== 1) {
      issues.push({ severity: 'error', message: `First heading is h${headings[i].state.level} (should be h1)` });
    }
    if (i > 0) {
      const prev = headings[i - 1].state.level || 1;
      const curr = headings[i].state.level || 1;
      if (curr > prev + 1) {
        issues.push({ severity: 'error', message: `Heading hierarchy: h${prev} → h${curr} (skipped h${prev + 1})` });
      }
    }
  }

  const lines = [];
  lines.push('╔══════════════════════════════════════════════════════╗');
  lines.push('║          ACCESSIBILITY AUDIT REPORT                  ║');
  lines.push('╚══════════════════════════════════════════════════════╝');
  lines.push('');

  lines.push('━━ LANDMARKS ━━');
  if (landmarks.length === 0) lines.push('✗ No landmarks found');
  else {
    lines.push(`✓ ${landmarks.length} landmark(s)`);
    landmarks.forEach(l => lines.push(`  ${l.role} ${l.name ? `"${l.name}"` : '(unnamed)'}`));
  }
  lines.push('');

  lines.push('━━ HEADINGS ━━');
  if (headings.length === 0) lines.push('ℹ No headings found');
  else {
    headings.forEach(h => lines.push(`  ${'  '.repeat((h.state.level || 1) - 1)}h${h.state.level || 1} "${h.name}"`));
  }
  lines.push('');

  lines.push('━━ INTERACTIVE ━━');
  lines.push(`${interactive.length} interactive element(s)`);
  interactive.forEach(el => {
    const name = el.name ? `"${el.name}"` : '(unnamed)';
    lines.push(`  ${el.role}: ${name}`);
  });
  lines.push('');

  if (issues.length > 0) {
    lines.push('━━ ISSUES ━━');
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    if (errors.length) {
      lines.push(`✗ ${errors.length} error(s):`);
      errors.forEach(i => lines.push(`  • ${i.message}`));
    }
    if (warnings.length) {
      lines.push(`⚠ ${warnings.length} warning(s):`);
      warnings.forEach(i => lines.push(`  • ${i.message}`));
    }
    lines.push('');
  }

  lines.push(`━━ SUMMARY: ${total} elements, ${landmarks.length} landmarks, ${headings.length} headings, ${interactive.length} interactive ━━`);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Public API (used by popup.js)
// ---------------------------------------------------------------------------

window.SpeakableAnalyzer = {
  /**
   * Analyze HTML and return formatted output.
   * @param {string} html - Raw HTML string
   * @param {string} reader - 'nvda' | 'jaws' | 'voiceover' | 'all'
   * @param {string} format - 'text' | 'audit' | 'json'
   * @param {string|null} selector - Optional CSS selector
   * @returns {{ output: string, warnings: string[], elementCount: number }}
   */
  analyze(html, reader = 'nvda', format = 'text', selector = null) {
    const { document: doc, warnings: parseWarnings } = parseHTML(html);
    const warnings = parseWarnings.map(w => w.message);

    let root;
    let elementCount = 0;

    if (selector) {
      const elements = doc.querySelectorAll(selector);
      if (elements.length === 0) {
        return { output: `No elements match selector: "${selector}"`, warnings, elementCount: 0 };
      }
      // Wrap matched elements in a container for tree building
      const container = doc.createElement('div');
      elements.forEach(el => container.appendChild(el.cloneNode(true)));
      root = buildTree(container);
      elementCount = elements.length;
    } else {
      root = buildTree(doc.body);
    }

    if (!root) {
      return { output: 'No accessible elements found.', warnings, elementCount: 0 };
    }

    let output;

    if (format === 'audit') {
      output = generateAudit(root);
    } else if (format === 'json') {
      output = JSON.stringify(root, null, 2);
    } else {
      // Text format
      if (reader === 'all') {
        const nvda = renderNode(root, 'nvda').join('\n');
        const jaws = renderNode(root, 'jaws').join('\n');
        const vo = renderNode(root, 'voiceover').join('\n');
        output = `=== NVDA ===\n${nvda}\n\n=== JAWS ===\n${jaws}\n\n=== VoiceOver ===\n${vo}`;
      } else {
        output = renderNode(root, reader).join('\n');
      }
    }

    return { output, warnings, elementCount };
  }
};
