/**
 * Tests for CSS selector filtering in tree builder.
 */

import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { buildAccessibilityTreeWithSelector, SelectorError } from '../../../src/extractor/tree-builder.js';

describe('buildAccessibilityTreeWithSelector', () => {
  describe('simple selectors', () => {
    it('should filter by element type', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button 1</button>
          <a href="/link">Link</a>
          <button>Button 2</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'button');
      
      expect(results).toHaveLength(2);
      expect(results[0].model.root.role).toBe('button');
      expect(results[0].model.root.name).toBe('Button 1');
      expect(results[1].model.root.role).toBe('button');
      expect(results[1].model.root.name).toBe('Button 2');
    });

    it('should filter by class', () => {
      const dom = new JSDOM(`
        <div>
          <button class="primary">Primary</button>
          <button class="secondary">Secondary</button>
          <button class="primary">Another Primary</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, '.primary');
      
      expect(results).toHaveLength(2);
      expect(results[0].model.root.name).toBe('Primary');
      expect(results[1].model.root.name).toBe('Another Primary');
    });

    it('should filter by id', () => {
      const dom = new JSDOM(`
        <div>
          <button id="submit">Submit</button>
          <button id="cancel">Cancel</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, '#submit');
      
      expect(results).toHaveLength(1);
      expect(results[0].model.root.name).toBe('Submit');
    });

    it('should filter by attribute', () => {
      const dom = new JSDOM(`
        <div>
          <button aria-label="Close">X</button>
          <button>Regular Button</button>
          <button aria-label="Delete">Trash</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, '[aria-label]');
      
      expect(results).toHaveLength(2);
      expect(results[0].model.root.name).toBe('Close');
      expect(results[1].model.root.name).toBe('Delete');
    });
  });

  describe('complex selectors', () => {
    it('should handle descendant combinator', () => {
      const dom = new JSDOM(`
        <div>
          <nav>
            <a href="/home">Home</a>
          </nav>
          <a href="/external">External</a>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'nav a');
      
      expect(results).toHaveLength(1);
      expect(results[0].model.root.name).toBe('Home');
    });

    it('should handle child combinator', () => {
      const dom = new JSDOM(`
        <div>
          <button>Direct Child</button>
          <section>
            <button>Nested Child</button>
          </section>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'div > button');
      
      expect(results).toHaveLength(1);
      expect(results[0].model.root.name).toBe('Direct Child');
    });

    it('should handle attribute value selector', () => {
      const dom = new JSDOM(`
        <div>
          <button type="submit">Submit</button>
          <button type="button">Button</button>
          <button type="reset">Reset</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'button[type="submit"]');
      
      expect(results).toHaveLength(1);
      expect(results[0].model.root.name).toBe('Submit');
    });

    it('should handle pseudo-class selector', () => {
      const dom = new JSDOM(`
        <ul>
          <li><a href="/first">First</a></li>
          <li><a href="/second">Second</a></li>
          <li><a href="/third">Third</a></li>
        </ul>
      `);
      const ul = dom.window.document.querySelector('ul')!;
      
      const results = buildAccessibilityTreeWithSelector(ul, 'li:first-child a');
      
      expect(results).toHaveLength(1);
      expect(results[0].model.root.name).toBe('First');
    });

    it('should handle multiple selectors', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button</button>
          <a href="/link">Link</a>
          <input type="text" aria-label="Input">
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'button, a');
      
      expect(results).toHaveLength(2);
      expect(results[0].model.root.role).toBe('button');
      expect(results[1].model.root.role).toBe('link');
    });
  });

  describe('root element matching', () => {
    it('should include root element if it matches selector', () => {
      const dom = new JSDOM(`<button class="primary">Click me</button>`);
      const button = dom.window.document.querySelector('button')!;
      
      const results = buildAccessibilityTreeWithSelector(button, '.primary');
      
      expect(results).toHaveLength(1);
      expect(results[0].model.root.role).toBe('button');
      expect(results[0].model.root.name).toBe('Click me');
    });

    it('should include root element if it matches element selector', () => {
      const dom = new JSDOM(`<button>Click me</button>`);
      const button = dom.window.document.querySelector('button')!;
      
      const results = buildAccessibilityTreeWithSelector(button, 'button');
      
      expect(results).toHaveLength(1);
      expect(results[0].model.root.name).toBe('Click me');
    });

    it('should search descendants if root does not match', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'button');
      
      expect(results).toHaveLength(2);
    });
  });

  describe('selector with aria-hidden elements', () => {
    it('should filter aria-hidden elements from results', () => {
      const dom = new JSDOM(`
        <div>
          <button>Visible</button>
          <button aria-hidden="true">Hidden</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'button');
      
      // Both buttons match selector, but hidden one has no accessible content
      expect(results).toHaveLength(2);
      expect(results[0].model.root.name).toBe('Visible');
      // Hidden button will have generic container with no children
      expect(results[1].model.root.role).toBe('generic');
      expect(results[1].model.root.children).toHaveLength(0);
    });

    it('should handle selector matching only aria-hidden elements', () => {
      const dom = new JSDOM(`
        <div>
          <button aria-hidden="true">Hidden 1</button>
          <button aria-hidden="true">Hidden 2</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'button');
      
      // Buttons match selector but are not accessible
      expect(results).toHaveLength(2);
      expect(results[0].model.root.role).toBe('generic');
      expect(results[1].model.root.role).toBe('generic');
    });
  });

  describe('nested structures', () => {
    it('should build complete tree for matched element', () => {
      const dom = new JSDOM(`
        <div>
          <nav aria-label="Main">
            <a href="/home">Home</a>
            <a href="/about">About</a>
          </nav>
          <nav aria-label="Footer">
            <a href="/contact">Contact</a>
          </nav>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'nav[aria-label="Main"]');
      
      expect(results).toHaveLength(1);
      expect(results[0].model.root.role).toBe('navigation');
      expect(results[0].model.root.name).toBe('Main');
      expect(results[0].model.root.children).toHaveLength(2);
      expect(results[0].model.root.children[0].name).toBe('Home');
      expect(results[0].model.root.children[1].name).toBe('About');
    });

    it('should handle multiple matches with nested structures', () => {
      const dom = new JSDOM(`
        <div>
          <article>
            <h2>Article 1</h2>
            <button>Read more</button>
          </article>
          <article>
            <h2>Article 2</h2>
            <button>Read more</button>
          </article>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'article');
      
      expect(results).toHaveLength(2);
      expect(results[0].model.root.role).toBe('article');
      expect(results[0].model.root.children).toHaveLength(2);
      expect(results[1].model.root.role).toBe('article');
      expect(results[1].model.root.children).toHaveLength(2);
    });
  });

  describe('error handling', () => {
    it('should throw error when no elements match', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      expect(() => {
        buildAccessibilityTreeWithSelector(div, 'a');
      }).toThrow(SelectorError);
      
      expect(() => {
        buildAccessibilityTreeWithSelector(div, 'a');
      }).toThrow('No elements match selector: "a"');
    });

    it('should throw error for invalid selector syntax', () => {
      const dom = new JSDOM(`<div><button>Button</button></div>`);
      const div = dom.window.document.querySelector('div')!;
      
      expect(() => {
        buildAccessibilityTreeWithSelector(div, 'button[invalid');
      }).toThrow(SelectorError);
      
      expect(() => {
        buildAccessibilityTreeWithSelector(div, 'button[invalid');
      }).toThrow(/Invalid CSS selector/);
    });

    it('should provide helpful error message for invalid selector', () => {
      const dom = new JSDOM(`<div><button>Button</button></div>`);
      const div = dom.window.document.querySelector('div')!;
      
      try {
        buildAccessibilityTreeWithSelector(div, ':::invalid');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(SelectorError);
        expect((error as Error).message).toContain('Invalid CSS selector');
        expect((error as Error).message).toContain(':::invalid');
      }
    });
  });

  describe('metadata preservation', () => {
    it('should include sourceHash in each result', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'button', 'hash123');
      
      expect(results).toHaveLength(2);
      expect(results[0].model.metadata.sourceHash).toBe('hash123');
      expect(results[1].model.metadata.sourceHash).toBe('hash123');
    });

    it('should include extractedAt timestamp in each result', () => {
      const dom = new JSDOM(`
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const before = new Date().toISOString();
      const results = buildAccessibilityTreeWithSelector(div, 'button');
      const after = new Date().toISOString();
      
      expect(results).toHaveLength(2);
      expect(results[0].model.metadata.extractedAt).toBeDefined();
      expect(results[0].model.metadata.extractedAt >= before).toBe(true);
      expect(results[0].model.metadata.extractedAt <= after).toBe(true);
      expect(results[1].model.metadata.extractedAt).toBeDefined();
    });
  });

  describe('warnings collection', () => {
    it('should collect warnings for each matched element', () => {
      const dom = new JSDOM(`
        <div>
          <button role="invalid1">Button 1</button>
          <button role="invalid2">Button 2</button>
        </div>
      `);
      const div = dom.window.document.querySelector('div')!;
      
      const results = buildAccessibilityTreeWithSelector(div, 'button');
      
      expect(results).toHaveLength(2);
      expect(results[0].warnings.length).toBeGreaterThan(0);
      expect(results[1].warnings.length).toBeGreaterThan(0);
    });
  });
});
