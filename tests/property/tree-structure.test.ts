/**
 * Property-based tests for accessibility tree structure.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { buildAccessibilityTree } from '../../src/extractor/tree-builder.js';
import type { AccessibleNode } from '../../src/model/types.js';

describe('Tree Structure Properties', () => {
  describe('semantic model completeness', () => {
    it('should always produce valid model structure', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('<button>Click</button>'),
            fc.constant('<a href="/home">Home</a>'),
            fc.constant('<h1>Title</h1>'),
            fc.constant('<input type="text" value="test">'),
            fc.constant('<nav><a href="/">Link</a></nav>'),
            fc.constant('<ul><li>Item</li></ul>'),
          ),
          (html) => {
            const dom = new JSDOM(html);
            const element = dom.window.document.body.firstElementChild!;
            
            const result = buildAccessibilityTree(element);
            
            // Model must have required fields
            expect(result.model).toBeDefined();
            expect(result.model.version).toBeDefined();
            expect(result.model.version.major).toBeGreaterThan(0);
            expect(result.model.root).toBeDefined();
            expect(result.model.metadata).toBeDefined();
            expect(result.model.metadata.extractedAt).toBeDefined();
            
            // Root must have required fields
            expect(result.model.root.role).toBeDefined();
            expect(result.model.root.name).toBeDefined();
            expect(result.model.root.state).toBeDefined();
            expect(result.model.root.focus).toBeDefined();
            expect(result.model.root.children).toBeDefined();
            expect(Array.isArray(result.model.root.children)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce nodes with all required fields', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('<button>Click</button>'),
            fc.constant('<a href="/home">Home</a>'),
            fc.constant('<h2>Heading</h2>'),
            fc.constant('<input type="checkbox" checked>'),
            fc.constant('<nav aria-label="Main"><a href="/">Link</a></nav>'),
          ),
          (html) => {
            const dom = new JSDOM(html);
            const element = dom.window.document.body.firstElementChild!;
            
            const result = buildAccessibilityTree(element);
            
            // Validate all nodes in tree
            const validateNode = (node: AccessibleNode) => {
              expect(node.role).toBeDefined();
              expect(typeof node.name).toBe('string');
              expect(node.state).toBeDefined();
              expect(typeof node.state).toBe('object');
              expect(node.focus).toBeDefined();
              expect(typeof node.focus.focusable).toBe('boolean');
              expect(Array.isArray(node.children)).toBe(true);
              
              // Recursively validate children
              node.children.forEach(validateNode);
            };
            
            validateNode(result.model.root);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('hierarchical structure preservation', () => {
    it('should preserve parent-child relationships', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (numChildren) => {
            const links = Array.from({ length: numChildren }, (_, i) => 
              `<a href="/page${i}">Link ${i}</a>`
            ).join('');
            const html = `<nav>${links}</nav>`;
            
            const dom = new JSDOM(html);
            const nav = dom.window.document.querySelector('nav')!;
            
            const result = buildAccessibilityTree(nav);
            
            // Nav should have exactly numChildren link children
            expect(result.model.root.role).toBe('navigation');
            expect(result.model.root.children).toHaveLength(numChildren);
            
            // All children should be links
            result.model.root.children.forEach((child, i) => {
              expect(child.role).toBe('link');
              expect(child.name).toBe(`Link ${i}`);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve nesting depth', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 4 }),
          (depth) => {
            // Build nested structure: main > article > ... > button
            let html = '<button>Action</button>';
            for (let i = 0; i < depth; i++) {
              html = i % 2 === 0 
                ? `<article>${html}</article>`
                : `<main>${html}</main>`;
            }
            
            const dom = new JSDOM(html);
            const root = dom.window.document.body.firstElementChild!;
            
            const result = buildAccessibilityTree(root);
            
            // Count depth in accessibility tree (only counting non-staticText nodes)
            const countDepth = (node: AccessibleNode): number => {
              const nonTextChildren = node.children.filter(c => c.role !== 'staticText');
              if (nonTextChildren.length === 0) return 1;
              return 1 + Math.max(...nonTextChildren.map(countDepth));
            };
            
            const treeDepth = countDepth(result.model.root);
            
            // Tree depth should match nesting depth + 1 (for button)
            expect(treeDepth).toBe(depth + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain sibling order', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 6 }), { minLength: 2, maxLength: 6 }),
          (levels) => {
            const headings = levels.map(level => 
              `<h${level}>Heading ${level}</h${level}>`
            ).join('');
            const html = `<div>${headings}</div>`;
            
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            const result = buildAccessibilityTree(div);
            
            // Children should be in same order as input
            expect(result.model.root.children).toHaveLength(levels.length);
            result.model.root.children.forEach((child, i) => {
              expect(child.role).toBe('heading');
              expect(child.state.level).toBe(levels[i]);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('inaccessible element filtering', () => {
    it('should filter aria-hidden elements consistently', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }), // At least 2 buttons
          fc.integer({ min: 0, max: 3 }), // Hidden index within range
          (totalButtons, hiddenIndex) => {
            // Ensure hiddenIndex is within bounds
            const actualHiddenIndex = hiddenIndex % totalButtons;
            
            const buttons = Array.from({ length: totalButtons }, (_, i) => {
              const hidden = i === actualHiddenIndex ? ' aria-hidden="true"' : '';
              return `<button${hidden}>Button ${i}</button>`;
            }).join('');
            const html = `<div>${buttons}</div>`;
            
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            const result = buildAccessibilityTree(div);
            
            // Should have totalButtons - 1 children (one is hidden)
            expect(result.model.root.children).toHaveLength(totalButtons - 1);
            
            // Hidden button should not be in tree
            const names = result.model.root.children.map(c => c.name);
            expect(names).not.toContain(`Button ${actualHiddenIndex}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter role="presentation" elements consistently', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          (totalButtons) => {
            const buttons = Array.from({ length: totalButtons }, (_, i) => {
              const role = i === 0 ? ' role="presentation"' : '';
              return `<button${role}>Button ${i}</button>`;
            }).join('');
            const html = `<div>${buttons}</div>`;
            
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            const result = buildAccessibilityTree(div);
            
            // Buttons with roles should be present; presentation button's text
            // is promoted as staticText via transparent traversal
            const buttonChildren = result.model.root.children.filter(c => c.role === 'button');
            expect(buttonChildren).toHaveLength(totalButtons - 1);
            
            // First button should not be in tree as a button
            const buttonNames = buttonChildren.map(c => c.name);
            expect(buttonNames).not.toContain('Button 0');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should filter elements without accessible roles', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (numButtons) => {
            const buttons = Array.from({ length: numButtons }, (_, i) => 
              `<button>Button ${i}</button>`
            ).join('');
            const spans = Array.from({ length: numButtons }, (_, i) => 
              `<span>Span ${i}</span>`
            ).join('');
            const html = `<div>${buttons}${spans}</div>`;
            
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            const result = buildAccessibilityTree(div);
            
            // Should have buttons plus staticText nodes from spans (transparent traversal)
            const buttonChildren = result.model.root.children.filter(c => c.role === 'button');
            const textChildren = result.model.root.children.filter(c => c.role === 'staticText');
            expect(buttonChildren).toHaveLength(numButtons);
            buttonChildren.forEach((child, i) => {
              expect(child.role).toBe('button');
              expect(child.name).toBe(`Button ${i}`);
            });
            // Span text content promoted as staticText nodes
            expect(textChildren).toHaveLength(numButtons);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('deterministic output', () => {
    it('should produce identical trees for identical input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('<button>Click</button>'),
            fc.constant('<nav><a href="/">Home</a><a href="/about">About</a></nav>'),
            fc.constant('<h1>Title</h1>'),
            fc.constant('<ul><li>A</li><li>B</li></ul>'),
          ),
          (html) => {
            const dom1 = new JSDOM(html);
            const element1 = dom1.window.document.body.firstElementChild!;
            const result1 = buildAccessibilityTree(element1);
            
            const dom2 = new JSDOM(html);
            const element2 = dom2.window.document.body.firstElementChild!;
            const result2 = buildAccessibilityTree(element2);
            
            // Trees should be structurally identical (ignoring timestamps)
            const normalize = (node: AccessibleNode): any => ({
              role: node.role,
              name: node.name,
              description: node.description,
              value: node.value,
              state: node.state,
              focus: node.focus,
              children: node.children.map(normalize),
            });
            
            expect(normalize(result1.model.root)).toEqual(normalize(result2.model.root));
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
