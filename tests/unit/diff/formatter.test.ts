/**
 * Unit tests for diff formatting utilities.
 */

import { describe, it, expect } from 'vitest';
import { 
  formatDiffAsJSON, 
  formatDiffAsText, 
  formatDiffForCI,
  hasAccessibilityRegression 
} from '../../../src/diff/formatter.js';
import type { SemanticDiff, NodeChange } from '../../../src/diff/types.js';

describe('formatDiffAsJSON', () => {
  it('should format empty diff as JSON', () => {
    const diff: SemanticDiff = {
      changes: [],
      summary: {
        added: 0,
        removed: 0,
        changed: 0,
        total: 0,
      },
    };

    const json = formatDiffAsJSON(diff);
    const parsed = JSON.parse(json);

    expect(parsed).toEqual(diff);
  });

  it('should format diff with changes as pretty JSON', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'added',
          path: 'root.children[0]',
          node: {
            role: 'button',
            name: 'Click me',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
      ],
      summary: {
        added: 1,
        removed: 0,
        changed: 0,
        total: 1,
      },
    };

    const json = formatDiffAsJSON(diff);

    expect(json).toContain('"type": "added"');
    expect(json).toContain('"role": "button"');
    expect(json).toContain('"name": "Click me"');
    expect(json).toContain('  '); // Check for indentation
  });

  it('should produce valid JSON that can be parsed', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'changed',
          path: 'root',
          changes: [
            {
              property: 'name',
              oldValue: 'Old name',
              newValue: 'New name',
            },
          ],
        },
      ],
      summary: {
        added: 0,
        removed: 0,
        changed: 1,
        total: 1,
      },
    };

    const json = formatDiffAsJSON(diff);
    const parsed = JSON.parse(json);

    expect(parsed.changes[0].changes[0].oldValue).toBe('Old name');
    expect(parsed.changes[0].changes[0].newValue).toBe('New name');
  });
});

describe('formatDiffAsText', () => {
  it('should format empty diff with no changes message', () => {
    const diff: SemanticDiff = {
      changes: [],
      summary: {
        added: 0,
        removed: 0,
        changed: 0,
        total: 0,
      },
    };

    const text = formatDiffAsText(diff);

    expect(text).toContain('Total changes: 0');
    expect(text).toContain('No changes detected');
  });

  it('should format added nodes', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'added',
          path: 'root.children[0]',
          node: {
            role: 'button',
            name: 'Click me',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
      ],
      summary: {
        added: 1,
        removed: 0,
        changed: 0,
        total: 1,
      },
    };

    const text = formatDiffAsText(diff);

    expect(text).toContain('Added: 1');
    expect(text).toContain('--- Added Nodes ---');
    expect(text).toContain('+ root.children[0]');
    expect(text).toContain('Role: button');
    expect(text).toContain('Name: "Click me"');
  });

  it('should format removed nodes', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'removed',
          path: 'root.children[1]',
          node: {
            role: 'link',
            name: 'Home',
            description: 'Go to homepage',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
      ],
      summary: {
        added: 0,
        removed: 1,
        changed: 0,
        total: 1,
      },
    };

    const text = formatDiffAsText(diff);

    expect(text).toContain('Removed: 1');
    expect(text).toContain('--- Removed Nodes ---');
    expect(text).toContain('- root.children[1]');
    expect(text).toContain('Role: link');
    expect(text).toContain('Name: "Home"');
    expect(text).toContain('Description: "Go to homepage"');
  });

  it('should format changed nodes', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'changed',
          path: 'root',
          changes: [
            {
              property: 'name',
              oldValue: 'Submit',
              newValue: 'Send',
            },
            {
              property: 'state',
              oldValue: { disabled: false },
              newValue: { disabled: true },
            },
          ],
        },
      ],
      summary: {
        added: 0,
        removed: 0,
        changed: 1,
        total: 1,
      },
    };

    const text = formatDiffAsText(diff);

    expect(text).toContain('Changed: 1');
    expect(text).toContain('--- Changed Nodes ---');
    expect(text).toContain('~ root');
    expect(text).toContain('name: "Submit" → "Send"');
    expect(text).toContain('state:');
    expect(text).toContain('disabled');
  });

  it('should format mixed changes', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'added',
          path: 'root.children[0]',
          node: {
            role: 'button',
            name: 'New button',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
        {
          type: 'removed',
          path: 'root.children[1]',
          node: {
            role: 'link',
            name: 'Old link',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
        {
          type: 'changed',
          path: 'root',
          changes: [
            {
              property: 'name',
              oldValue: 'Old',
              newValue: 'New',
            },
          ],
        },
      ],
      summary: {
        added: 1,
        removed: 1,
        changed: 1,
        total: 3,
      },
    };

    const text = formatDiffAsText(diff);

    expect(text).toContain('Total changes: 3');
    expect(text).toContain('Added: 1');
    expect(text).toContain('Removed: 1');
    expect(text).toContain('Changed: 1');
    expect(text).toContain('--- Added Nodes ---');
    expect(text).toContain('--- Removed Nodes ---');
    expect(text).toContain('--- Changed Nodes ---');
  });

  it('should include summary header', () => {
    const diff: SemanticDiff = {
      changes: [],
      summary: {
        added: 0,
        removed: 0,
        changed: 0,
        total: 0,
      },
    };

    const text = formatDiffAsText(diff);

    expect(text).toContain('=== Accessibility Tree Diff ===');
    expect(text).toContain('Total changes: 0');
    expect(text).toContain('Added: 0');
    expect(text).toContain('Removed: 0');
    expect(text).toContain('Changed: 0');
  });
});

describe('formatDiffForCI', () => {
  it('should format empty diff for CI', () => {
    const diff: SemanticDiff = {
      changes: [],
      summary: {
        added: 0,
        removed: 0,
        changed: 0,
        total: 0,
      },
    };

    const text = formatDiffForCI(diff);

    expect(text).toContain('DIFF_SUMMARY: added=0 removed=0 changed=0 total=0');
  });

  it('should format added nodes for CI', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'added',
          path: 'root.children[0]',
          node: {
            role: 'button',
            name: 'Click me',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
      ],
      summary: {
        added: 1,
        removed: 0,
        changed: 0,
        total: 1,
      },
    };

    const text = formatDiffForCI(diff);

    expect(text).toContain('DIFF_SUMMARY: added=1 removed=0 changed=0 total=1');
    expect(text).toContain('ADDED: root.children[0] | role=button | name="Click me"');
  });

  it('should format removed nodes for CI', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'removed',
          path: 'root.children[1]',
          node: {
            role: 'link',
            name: 'Home',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
      ],
      summary: {
        added: 0,
        removed: 1,
        changed: 0,
        total: 1,
      },
    };

    const text = formatDiffForCI(diff);

    expect(text).toContain('REMOVED: root.children[1] | role=link | name="Home"');
  });

  it('should format changed nodes for CI', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'changed',
          path: 'root',
          changes: [
            {
              property: 'name',
              oldValue: 'Submit',
              newValue: 'Send',
            },
          ],
        },
      ],
      summary: {
        added: 0,
        removed: 0,
        changed: 1,
        total: 1,
      },
    };

    const text = formatDiffForCI(diff);

    expect(text).toContain('CHANGED: root | name:"Submit"->"Send"');
  });

  it('should be machine-parseable', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'added',
          path: 'root.children[0]',
          node: {
            role: 'button',
            name: 'Test',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
      ],
      summary: {
        added: 1,
        removed: 0,
        changed: 0,
        total: 1,
      },
    };

    const text = formatDiffForCI(diff);
    const lines = text.split('\n').filter(l => l.trim());

    // First line should be summary
    expect(lines[0]).toMatch(/^DIFF_SUMMARY:/);
    
    // Subsequent lines should be changes
    expect(lines[1]).toMatch(/^(ADDED|REMOVED|CHANGED):/);
  });
});

describe('hasAccessibilityRegression', () => {
  it('should detect removed important nodes as regression', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'removed',
          path: 'root.children[0]',
          node: {
            role: 'button',
            name: 'Submit',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
      ],
      summary: {
        added: 0,
        removed: 1,
        changed: 0,
        total: 1,
      },
    };

    expect(hasAccessibilityRegression(diff)).toBe(true);
  });

  it('should detect lost accessible name as regression', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'changed',
          path: 'root',
          changes: [
            {
              property: 'name',
              oldValue: 'Submit',
              newValue: '',
            },
          ],
        },
      ],
      summary: {
        added: 0,
        removed: 0,
        changed: 1,
        total: 1,
      },
    };

    expect(hasAccessibilityRegression(diff)).toBe(true);
  });

  it('should detect newly hidden nodes as regression', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'changed',
          path: 'root',
          changes: [
            {
              property: 'state',
              oldValue: { hidden: false },
              newValue: { hidden: true },
            },
          ],
        },
      ],
      summary: {
        added: 0,
        removed: 0,
        changed: 1,
        total: 1,
      },
    };

    expect(hasAccessibilityRegression(diff)).toBe(true);
  });

  it('should detect newly disabled nodes as regression', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'changed',
          path: 'root',
          changes: [
            {
              property: 'state',
              oldValue: { disabled: false },
              newValue: { disabled: true },
            },
          ],
        },
      ],
      summary: {
        added: 0,
        removed: 0,
        changed: 1,
        total: 1,
      },
    };

    expect(hasAccessibilityRegression(diff)).toBe(true);
  });

  it('should not detect added nodes as regression', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'added',
          path: 'root.children[0]',
          node: {
            role: 'button',
            name: 'New button',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        },
      ],
      summary: {
        added: 1,
        removed: 0,
        changed: 0,
        total: 1,
      },
    };

    expect(hasAccessibilityRegression(diff)).toBe(false);
  });

  it('should not detect removed generic nodes as regression', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'removed',
          path: 'root.children[0]',
          node: {
            role: 'generic',
            name: 'Container',
            state: {},
            focus: { focusable: false },
            children: [],
          },
        },
      ],
      summary: {
        added: 0,
        removed: 1,
        changed: 0,
        total: 1,
      },
    };

    expect(hasAccessibilityRegression(diff)).toBe(false);
  });

  it('should not detect improved names as regression', () => {
    const diff: SemanticDiff = {
      changes: [
        {
          type: 'changed',
          path: 'root',
          changes: [
            {
              property: 'name',
              oldValue: '',
              newValue: 'Submit',
            },
          ],
        },
      ],
      summary: {
        added: 0,
        removed: 0,
        changed: 1,
        total: 1,
      },
    };

    expect(hasAccessibilityRegression(diff)).toBe(false);
  });

  it('should not detect empty diff as regression', () => {
    const diff: SemanticDiff = {
      changes: [],
      summary: {
        added: 0,
        removed: 0,
        changed: 0,
        total: 0,
      },
    };

    expect(hasAccessibilityRegression(diff)).toBe(false);
  });
});
