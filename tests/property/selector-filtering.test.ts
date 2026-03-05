/**
 * Property-based tests for CSS selector filtering.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { JSDOM } from 'jsdom';
import { buildAccessibilityTreeWithSelector, SelectorError } from '../../src/extractor/tree-builder.js';

describe('Selector Filtering Properties', () => {
  describe('selector matching correctness', () => {
    it('should match all and only elements that satisfy the selector', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 5 }),
          (numButtons, numLinks) => {
            const buttons = Array.from({ length: numButtons }, (_, i) => 
              `<button>Button ${i}</button>`
            ).join('');
            const links = Array.from({ length: numLinks }, (_, i) => 
              `<a href="/link${i}">Link ${i}</a>`
            ).join('');
            const html = `<div>${buttons}${links}</div>`;
            
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            // Select only buttons
            const results = buildAccessibilityTreeWithSelector(div, 'button');
            
            // Should match exactly numButtons elements
            expect(results).toHaveLength(numButtons);
            
            // All results should be buttons
            results.forEach(result => {
              expect(result.model.root.role).toBe('button');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not produce false positives', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (numButtons) => {
            const buttons = Array.from({ length: numButtons }, (_, i) => 
              `<button class="target">Button ${i}</button>`
            ).join('');
            const otherButtons = Array.from({ length: numButtons }, (_, i) => 
              `<button class="other">Other ${i}</button>`
            ).join('');
            const html = `<div>${buttons}${otherButtons}</div>`;
            
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            // Select only .target buttons
            const results = buildAccessibilityTreeWithSelector(div, '.target');
            
            // Should match exactly numButtons elements
            expect(results).toHaveLength(numButtons);
            
            // None should have "Other" in the name
            results.forEach(result => {
              expect(result.model.root.name).not.toContain('Other');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not produce false negatives', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (numButtons) => {
            const buttons = Array.from({ length: numButtons }, (_, i) => 
              `<button data-testid="btn-${i}">Button ${i}</button>`
            ).join('');
            const html = `<div>${buttons}</div>`;
            
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            // Select all buttons with data-testid
            const results = buildAccessibilityTreeWithSelector(div, '[data-testid]');
            
            // Should find all buttons
            expect(results).toHaveLength(numButtons);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('selector error handling', () => {
    it('should always throw error when no matches found', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('<div><button>Button</button></div>'),
            fc.constant('<div><a href="/">Link</a></div>'),
            fc.constant('<div><h1>Heading</h1></div>'),
          ),
          fc.oneof(
            fc.constant('input'),
            fc.constant('.nonexistent'),
            fc.constant('#missing'),
          ),
          (html, selector) => {
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            // Should throw SelectorError
            expect(() => {
              buildAccessibilityTreeWithSelector(div, selector);
            }).toThrow(SelectorError);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('result consistency', () => {
    it('should produce consistent results for same selector', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (numButtons) => {
            const buttons = Array.from({ length: numButtons }, (_, i) => 
              `<button>Button ${i}</button>`
            ).join('');
            const html = `<div>${buttons}</div>`;
            
            const dom1 = new JSDOM(html);
            const div1 = dom1.window.document.querySelector('div')!;
            const results1 = buildAccessibilityTreeWithSelector(div1, 'button');
            
            const dom2 = new JSDOM(html);
            const div2 = dom2.window.document.querySelector('div')!;
            const results2 = buildAccessibilityTreeWithSelector(div2, 'button');
            
            // Should have same number of results
            expect(results1.length).toBe(results2.length);
            
            // Each result should have same structure (ignoring timestamps)
            results1.forEach((result1, i) => {
              const result2 = results2[i];
              expect(result1.model.root.role).toBe(result2.model.root.role);
              expect(result1.model.root.name).toBe(result2.model.root.name);
              expect(result1.model.root.children.length).toBe(result2.model.root.children.length);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('nested structure preservation', () => {
    it('should preserve complete tree structure for matched elements', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 4 }),
          (numLinks) => {
            const links = Array.from({ length: numLinks }, (_, i) => 
              `<a href="/link${i}">Link ${i}</a>`
            ).join('');
            const html = `<div><nav aria-label="Test">${links}</nav></div>`;
            
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            // Select the nav element
            const results = buildAccessibilityTreeWithSelector(div, 'nav');
            
            // Should have one result
            expect(results).toHaveLength(1);
            
            // Should have all children
            expect(results[0].model.root.children).toHaveLength(numLinks);
            
            // All children should be links
            results[0].model.root.children.forEach(child => {
              expect(child.role).toBe('link');
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('multiple matches handling', () => {
    it('should return separate trees for each match', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 5 }),
          (numNavs) => {
            const navs = Array.from({ length: numNavs }, (_, i) => 
              `<nav aria-label="Nav ${i}"><a href="/">Link</a></nav>`
            ).join('');
            const html = `<div>${navs}</div>`;
            
            const dom = new JSDOM(html);
            const div = dom.window.document.querySelector('div')!;
            
            // Select all nav elements
            const results = buildAccessibilityTreeWithSelector(div, 'nav');
            
            // Should have one result per nav
            expect(results).toHaveLength(numNavs);
            
            // Each should be independent
            results.forEach((result, i) => {
              expect(result.model.root.role).toBe('navigation');
              expect(result.model.root.name).toBe(`Nav ${i}`);
              expect(result.model.root.children).toHaveLength(1);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
