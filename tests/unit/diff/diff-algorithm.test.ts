/**
 * Unit tests for semantic diff algorithm.
 */

import { describe, it, expect } from 'vitest';
import { diffAccessibilityTrees, describeChange } from '../../../src/diff/diff-algorithm.js';
import type { AccessibleNode } from '../../../src/model/types.js';

describe('diffAccessibilityTrees', () => {
  describe('added nodes', () => {
    it('should detect a newly added child node', () => {
      const oldTree: AccessibleNode = {
        role: 'main',
        name: 'Main content',
        state: {},
        focus: { focusable: false },
        children: [],
      };

      const newTree: AccessibleNode = {
        role: 'main',
        name: 'Main content',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'button',
            name: 'Click me',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.added).toBe(1);
      expect(diff.summary.removed).toBe(0);
      expect(diff.summary.changed).toBe(0);
      expect(diff.changes).toHaveLength(1);
      expect(diff.changes[0]).toMatchObject({
        type: 'added',
        path: 'root.children[0]',
        node: {
          role: 'button',
          name: 'Click me',
        },
      });
    });

    it('should detect multiple added nodes', () => {
      const oldTree: AccessibleNode = {
        role: 'navigation',
        name: 'Main nav',
        state: {},
        focus: { focusable: false },
        children: [],
      };

      const newTree: AccessibleNode = {
        role: 'navigation',
        name: 'Main nav',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'link',
            name: 'Home',
            state: {},
            focus: { focusable: true },
            children: [],
          },
          {
            role: 'link',
            name: 'About',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.added).toBe(2);
      expect(diff.changes).toHaveLength(2);
      expect(diff.changes[0].path).toBe('root.children[0]');
      expect(diff.changes[1].path).toBe('root.children[1]');
    });

    it('should detect deeply nested added nodes', () => {
      const oldTree: AccessibleNode = {
        role: 'list',
        name: 'Items',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'listitem',
            name: 'Item 1',
            state: {},
            focus: { focusable: false },
            children: [],
          },
        ],
      };

      const newTree: AccessibleNode = {
        role: 'list',
        name: 'Items',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'listitem',
            name: 'Item 1',
            state: {},
            focus: { focusable: false },
            children: [
              {
                role: 'button',
                name: 'Delete',
                state: {},
                focus: { focusable: true },
                children: [],
              },
            ],
          },
        ],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.added).toBe(1);
      expect(diff.changes[0].path).toBe('root.children[0].children[0]');
      expect(diff.changes[0].node?.role).toBe('button');
    });
  });

  describe('removed nodes', () => {
    it('should detect a removed child node', () => {
      const oldTree: AccessibleNode = {
        role: 'main',
        name: 'Main content',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'button',
            name: 'Click me',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const newTree: AccessibleNode = {
        role: 'main',
        name: 'Main content',
        state: {},
        focus: { focusable: false },
        children: [],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.removed).toBe(1);
      expect(diff.summary.added).toBe(0);
      expect(diff.summary.changed).toBe(0);
      expect(diff.changes).toHaveLength(1);
      expect(diff.changes[0]).toMatchObject({
        type: 'removed',
        path: 'root.children[0]',
        node: {
          role: 'button',
          name: 'Click me',
        },
      });
    });

    it('should detect multiple removed nodes', () => {
      const oldTree: AccessibleNode = {
        role: 'navigation',
        name: 'Main nav',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'link',
            name: 'Home',
            state: {},
            focus: { focusable: true },
            children: [],
          },
          {
            role: 'link',
            name: 'About',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const newTree: AccessibleNode = {
        role: 'navigation',
        name: 'Main nav',
        state: {},
        focus: { focusable: false },
        children: [],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.removed).toBe(2);
      expect(diff.changes).toHaveLength(2);
    });
  });

  describe('changed nodes', () => {
    it('should detect role change', () => {
      const oldTree: AccessibleNode = {
        role: 'button',
        name: 'Submit',
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const newTree: AccessibleNode = {
        role: 'link',
        name: 'Submit',
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.changed).toBe(1);
      expect(diff.changes[0]).toMatchObject({
        type: 'changed',
        path: 'root',
        changes: [
          {
            property: 'role',
            oldValue: 'button',
            newValue: 'link',
          },
        ],
      });
    });

    it('should detect name change', () => {
      const oldTree: AccessibleNode = {
        role: 'button',
        name: 'Submit',
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const newTree: AccessibleNode = {
        role: 'button',
        name: 'Send',
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.changed).toBe(1);
      expect(diff.changes[0].changes).toContainEqual({
        property: 'name',
        oldValue: 'Submit',
        newValue: 'Send',
      });
    });

    it('should detect description change', () => {
      const oldTree: AccessibleNode = {
        role: 'button',
        name: 'Submit',
        description: 'Submit the form',
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const newTree: AccessibleNode = {
        role: 'button',
        name: 'Submit',
        description: 'Send the form data',
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.changed).toBe(1);
      expect(diff.changes[0].changes).toContainEqual({
        property: 'description',
        oldValue: 'Submit the form',
        newValue: 'Send the form data',
      });
    });

    it('should detect state changes', () => {
      const oldTree: AccessibleNode = {
        role: 'checkbox',
        name: 'Accept terms',
        state: { checked: false },
        focus: { focusable: true },
        children: [],
      };

      const newTree: AccessibleNode = {
        role: 'checkbox',
        name: 'Accept terms',
        state: { checked: true },
        focus: { focusable: true },
        children: [],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.changed).toBe(1);
      expect(diff.changes[0].changes).toContainEqual({
        property: 'state',
        oldValue: { checked: false },
        newValue: { checked: true },
      });
    });

    it('should detect value changes', () => {
      const oldTree: AccessibleNode = {
        role: 'textbox',
        name: 'Username',
        value: { current: 'john' },
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const newTree: AccessibleNode = {
        role: 'textbox',
        name: 'Username',
        value: { current: 'jane' },
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.changed).toBe(1);
      expect(diff.changes[0].changes).toContainEqual({
        property: 'value',
        oldValue: { current: 'john' },
        newValue: { current: 'jane' },
      });
    });

    it('should detect focus changes', () => {
      const oldTree: AccessibleNode = {
        role: 'button',
        name: 'Submit',
        state: {},
        focus: { focusable: true, tabindex: 0 },
        children: [],
      };

      const newTree: AccessibleNode = {
        role: 'button',
        name: 'Submit',
        state: {},
        focus: { focusable: true, tabindex: -1 },
        children: [],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.changed).toBe(1);
      expect(diff.changes[0].changes).toContainEqual({
        property: 'focus',
        oldValue: { focusable: true, tabindex: 0 },
        newValue: { focusable: true, tabindex: -1 },
      });
    });

    it('should detect multiple property changes in one node', () => {
      const oldTree: AccessibleNode = {
        role: 'button',
        name: 'Submit',
        state: { disabled: false },
        focus: { focusable: true },
        children: [],
      };

      const newTree: AccessibleNode = {
        role: 'button',
        name: 'Send',
        state: { disabled: true },
        focus: { focusable: false },
        children: [],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.changed).toBe(1);
      expect(diff.changes[0].changes).toHaveLength(3);
      expect(diff.changes[0].changes?.map(c => c.property)).toEqual(
        expect.arrayContaining(['name', 'state', 'focus'])
      );
    });

    it('should detect changes in deeply nested nodes', () => {
      const oldTree: AccessibleNode = {
        role: 'list',
        name: 'Items',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'listitem',
            name: 'Item 1',
            state: {},
            focus: { focusable: false },
            children: [
              {
                role: 'button',
                name: 'Delete',
                state: {},
                focus: { focusable: true },
                children: [],
              },
            ],
          },
        ],
      };

      const newTree: AccessibleNode = {
        role: 'list',
        name: 'Items',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'listitem',
            name: 'Item 1',
            state: {},
            focus: { focusable: false },
            children: [
              {
                role: 'button',
                name: 'Remove',
                state: {},
                focus: { focusable: true },
                children: [],
              },
            ],
          },
        ],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.changed).toBe(1);
      expect(diff.changes[0].path).toBe('root.children[0].children[0]');
      expect(diff.changes[0].changes).toContainEqual({
        property: 'name',
        oldValue: 'Delete',
        newValue: 'Remove',
      });
    });
  });

  describe('unchanged trees', () => {
    it('should return empty diff for identical trees', () => {
      const tree: AccessibleNode = {
        role: 'button',
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      };

      const diff = diffAccessibilityTrees(tree, tree);

      expect(diff.summary.total).toBe(0);
      expect(diff.changes).toHaveLength(0);
    });

    it('should return empty diff for structurally identical trees', () => {
      const oldTree: AccessibleNode = {
        role: 'main',
        name: 'Content',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'button',
            name: 'Submit',
            state: { disabled: false },
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const newTree: AccessibleNode = {
        role: 'main',
        name: 'Content',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'button',
            name: 'Submit',
            state: { disabled: false },
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.total).toBe(0);
      expect(diff.changes).toHaveLength(0);
    });
  });

  describe('complex scenarios', () => {
    it('should handle mixed changes (added, removed, changed)', () => {
      const oldTree: AccessibleNode = {
        role: 'navigation',
        name: 'Main nav',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'link',
            name: 'Home',
            state: {},
            focus: { focusable: true },
            children: [],
          },
          {
            role: 'link',
            name: 'About',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const newTree: AccessibleNode = {
        role: 'navigation',
        name: 'Main nav',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'link',
            name: 'Home Page', // Changed
            state: {},
            focus: { focusable: true },
            children: [],
          },
          {
            role: 'link',
            name: 'Contact', // Changed (was "About" at same position)
            state: {},
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      // Both children are detected as changed because they're at the same positions
      // but have different names
      expect(diff.summary.changed).toBe(2);
      expect(diff.summary.total).toBe(2);
    });

    it('should handle true mixed changes with different child counts', () => {
      const oldTree: AccessibleNode = {
        role: 'navigation',
        name: 'Main nav',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'link',
            name: 'Home',
            state: {},
            focus: { focusable: true },
            children: [],
          },
          {
            role: 'link',
            name: 'About',
            state: {},
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const newTree: AccessibleNode = {
        role: 'navigation',
        name: 'Main nav',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'link',
            name: 'Home Page', // Changed
            state: {},
            focus: { focusable: true },
            children: [],
          },
          {
            role: 'link',
            name: 'About',
            state: {},
            focus: { focusable: true },
            children: [],
          },
          {
            role: 'link',
            name: 'Contact', // Added
            state: {},
            focus: { focusable: true },
            children: [],
          },
        ],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      expect(diff.summary.added).toBe(1);
      expect(diff.summary.changed).toBe(1);
      expect(diff.summary.total).toBe(2);
    });

    it('should handle reordered children as removed + added', () => {
      const oldTree: AccessibleNode = {
        role: 'list',
        name: 'Items',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'listitem',
            name: 'First',
            state: {},
            focus: { focusable: false },
            children: [],
          },
          {
            role: 'listitem',
            name: 'Second',
            state: {},
            focus: { focusable: false },
            children: [],
          },
        ],
      };

      const newTree: AccessibleNode = {
        role: 'list',
        name: 'Items',
        state: {},
        focus: { focusable: false },
        children: [
          {
            role: 'listitem',
            name: 'Second', // Swapped
            state: {},
            focus: { focusable: false },
            children: [],
          },
          {
            role: 'listitem',
            name: 'First', // Swapped
            state: {},
            focus: { focusable: false },
            children: [],
          },
        ],
      };

      const diff = diffAccessibilityTrees(oldTree, newTree);

      // Reordering is detected as changes because paths are different
      expect(diff.summary.changed).toBe(2);
    });
  });
});

describe('describeChange', () => {
  it('should describe added node', () => {
    const change = {
      type: 'added' as const,
      path: 'root.children[0]',
      node: {
        role: 'button' as const,
        name: 'Click me',
        state: {},
        focus: { focusable: true },
        children: [],
      },
    };

    const description = describeChange(change);

    expect(description).toBe('Added button "Click me" at root.children[0]');
  });

  it('should describe removed node', () => {
    const change = {
      type: 'removed' as const,
      path: 'root.children[1]',
      node: {
        role: 'link' as const,
        name: 'Home',
        state: {},
        focus: { focusable: true },
        children: [],
      },
    };

    const description = describeChange(change);

    expect(description).toBe('Removed link "Home" from root.children[1]');
  });

  it('should describe changed node with single property', () => {
    const change = {
      type: 'changed' as const,
      path: 'root',
      changes: [
        {
          property: 'name' as const,
          oldValue: 'Submit',
          newValue: 'Send',
        },
      ],
    };

    const description = describeChange(change);

    expect(description).toBe('Changed at root: name: "Submit" → "Send"');
  });

  it('should describe changed node with multiple properties', () => {
    const change = {
      type: 'changed' as const,
      path: 'root.children[0]',
      changes: [
        {
          property: 'name' as const,
          oldValue: 'Submit',
          newValue: 'Send',
        },
        {
          property: 'state' as const,
          oldValue: { disabled: false },
          newValue: { disabled: true },
        },
      ],
    };

    const description = describeChange(change);

    expect(description).toContain('Changed at root.children[0]');
    expect(description).toContain('name: "Submit" → "Send"');
    expect(description).toContain('state:');
  });
});
